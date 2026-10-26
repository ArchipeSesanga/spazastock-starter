// The fake SpazaStock API. It behaves like the APIs you've built: paging
// with an opaque token, problem+json errors with a correlationId, 400s with
// an errors map, 404, 409, 422 and (from the chaos panel) 429 and 500.
//
// It follows openapi.json. Work from that, not from this file.

import { delay, http, HttpResponse } from 'msw'
import type { components } from '@/api/schema'
import { formatCents } from '@/lib/money'
import { chaos, type ChaosTarget } from './chaos'
import { categories, findProduct, shop } from './data'

type Sale = components['schemas']['Sale']

const LATENCY_MS = 350
const SLOW_MS = 2000
const RETRY_AFTER_SECONDS = 15

const correlationId = () => crypto.randomUUID().replaceAll('-', '')

function problem(
  status: number,
  title: string,
  detail?: string,
  extra: { errors?: Record<string, string[]>; headers?: Record<string, string> } = {},
) {
  const body = {
    type: `https://spazastock.example/problems/${status}`,
    title,
    status,
    ...(detail === undefined ? {} : { detail }),
    ...(extra.errors === undefined ? {} : { errors: extra.errors }),
    correlationId: correlationId(),
  }
  return new HttpResponse(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/problem+json', ...extra.headers },
  })
}

// The armed chaos effect for this target, if any. Returns a response to send
// instead, or null to carry on normally.
async function applyChaos(target: ChaosTarget) {
  const effect = chaos.take(target)
  if (effect === 'slow') {
    await delay(SLOW_MS)
    return null
  }
  await delay(LATENCY_MS)
  switch (effect) {
    case 'network':
      return HttpResponse.error()
    case '500':
      return problem(500, 'Internal Server Error', 'Something went wrong on our side.')
    case '429':
      return problem(429, 'Too Many Requests', `Too many requests. Try again in ${RETRY_AFTER_SECONDS} seconds.`, {
        headers: { 'Retry-After': String(RETRY_AFTER_SECONDS) },
      })
    default:
      return null
  }
}

type PageToken = { category: string; offset: number }
const encodeToken = (token: PageToken) => btoa(JSON.stringify(token))
function decodeToken(raw: string): PageToken | null {
  try {
    const token = JSON.parse(atob(raw)) as Partial<PageToken>
    return typeof token.category === 'string' && Number.isInteger(token.offset) ? (token as PageToken) : null
  } catch {
    return null
  }
}

// Idempotency-Key → the request it was first used with, and the answer.
const idempotency = new Map<string, { request: string; status: number; body: Sale }>()

export const handlers = [
  http.get('/api/v1/categories', async () => {
    await delay(LATENCY_MS)
    return HttpResponse.json(categories)
  }),

  http.get('/api/v1/categories/:id/products', async ({ params, request }) => {
    const chaotic = await applyChaos('products')
    if (chaotic) return chaotic

    const id = String(params.id)
    const products = shop.products.get(id)
    if (products === undefined) {
      return problem(404, 'Not Found', `Category ${id} was not found.`)
    }

    const url = new URL(request.url)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 6)
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 20) {
      return problem(400, 'Bad Request', 'One or more fields are invalid.', {
        errors: { pageSize: ['Page size must be a whole number from 1 to 20.'] },
      })
    }

    let offset = 0
    const rawToken = url.searchParams.get('pageToken')
    if (rawToken !== null && rawToken !== '') {
      const token = decodeToken(rawToken)
      if (token === null || token.category !== id) {
        return problem(400, 'Bad Request', "That page token isn't valid for this category.")
      }
      offset = token.offset
    }

    const items = products.slice(offset, offset + pageSize)
    const next = offset + pageSize
    return HttpResponse.json({
      items,
      // null, not "": there are no more pages.
      nextPageToken: next < products.length ? encodeToken({ category: id, offset: next }) : null,
    })
  }),

  http.post('/api/v1/sales', async ({ request }) => {
    const chaotic = await applyChaos('sales')
    if (chaotic) return chaotic

    let body: Record<string, unknown>
    try {
      const parsed: unknown = await request.json()
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('not an object')
      body = parsed as Record<string, unknown>
    } catch {
      return problem(400, 'Bad Request', "The request body isn't valid JSON.")
    }

    // A replayed Idempotency-Key gets the first answer again, untouched.
    const key = request.headers.get('Idempotency-Key')
    const fingerprint = JSON.stringify([body.productId, body.quantity, body.unitPriceInCents])
    if (key !== null) {
      const seen = idempotency.get(key)
      if (seen !== undefined) {
        if (seen.request !== fingerprint) {
          return problem(422, 'Unprocessable Entity', 'This Idempotency-Key was already used for a different sale.')
        }
        return HttpResponse.json(seen.body, { status: seen.status, headers: { 'Idempotent-Replayed': 'true' } })
      }
    }

    const remember = (status: number, responseBody: Sale) => {
      if (key !== null) idempotency.set(key, { request: fingerprint, status, body: responseBody })
    }

    // Shape first: the same order as FluentValidation, all errors at once.
    const errors: Record<string, string[]> = {}
    const product = typeof body.productId === 'string' ? findProduct(body.productId) : undefined
    if (typeof body.productId !== 'string' || body.productId === '') {
      errors.productId = ['Choose a product.']
    } else if (product === undefined) {
      errors.productId = ["That product isn't on the shelves."]
    }

    const quantity = body.quantity
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
      errors.quantity = ['Enter a whole number of 1 or more.']
    } else if (quantity > 20) {
      // A rule the form doesn't know about.
      errors.quantity = ['No more than 20 of one item in a single sale.']
    }

    const price = body.unitPriceInCents
    if (typeof price !== 'number' || !Number.isInteger(price)) {
      errors.unitPriceInCents = ['Send the price as a whole number of cents.']
    } else if (price < 1) {
      errors.unitPriceInCents = ['Enter a price above R0.']
    } else if (product !== undefined) {
      // A rule the form doesn't know about either: at most 20% off.
      const lowest = Math.ceil((product.priceInCents * 8) / 10)
      if (price < lowest) {
        errors.unitPriceInCents = [`That's more than 20% off the shelf price. The lowest is ${formatCents(lowest)}.`]
      }
    }

    if (Object.keys(errors).length > 0) {
      return problem(400, 'Bad Request', 'One or more fields are invalid.', { errors })
    }

    // Then the rule that needs the shelf: you can't sell what isn't there.
    const item = product!
    const qty = quantity as number
    if (qty > item.stock) {
      const detail = item.stock === 0 ? `${item.name} is out of stock.` : `Only ${item.stock} left of ${item.name}.`
      return problem(409, 'Conflict', detail)
    }

    item.stock -= qty
    item.updatedAt = new Date().toISOString()
    const sale: Sale = {
      id: crypto.randomUUID(),
      productId: item.id,
      productName: item.name,
      quantity: qty,
      unitPriceInCents: price as number,
      totalInCents: qty * (price as number),
      soldAt: new Date().toISOString(),
    }
    shop.sales.push(sale)
    remember(201, sale)
    return HttpResponse.json(sale, { status: 201 })
  }),

  http.get('/api/v1/sales/today', async () => {
    await delay(LATENCY_MS)
    return HttpResponse.json({
      count: shop.sales.length,
      totalInCents: shop.sales.reduce((total, sale) => total + sale.totalInCents, 0),
    })
  }),
]
