// The shop's data, held in memory in the browser. Reloading the page
// restocks the shelves and clears today's sales.
//
// You don't need to read or change anything in src/mocks/ for the
// challenge. Treat it like a backend you can't see: work from openapi.json.

import type { components } from '@/api/schema'

type Product = components['schemas']['Product']
type Category = components['schemas']['Category']
type Sale = components['schemas']['Sale']

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

// [id, name, priceInCents, stock, reorderLevel, updated minutes ago]
type Row = [string, string, number, number, number, number]
const product = ([id, name, priceInCents, stock, reorderLevel, updated]: Row): Product => ({
  id,
  name,
  priceInCents,
  stock,
  reorderLevel,
  updatedAt: minutesAgo(updated),
})

export const categories: Category[] = [
  { id: 'cold-drinks', name: 'Cold drinks' },
  { id: 'bread', name: 'Bread' },
  { id: 'groceries', name: 'Groceries' },
  { id: 'snacks', name: 'Snacks and sweets' },
  { id: 'airtime', name: 'Airtime and data' },
  // Still in the category list, but deleted: its products are a 404.
  { id: 'discontinued', name: 'Discontinued' },
]

function seed(): Map<string, Product[]> {
  return new Map<string, Product[]>([
    ['cold-drinks', ([
      ['cola-2l', 'Cola 2L', 2999, 14, 6, 3],
      ['lemon-2l', 'Lemonade 2L', 2799, 4, 6, 12],
      ['ginger-beer-2l', 'Ginger beer 2L', 2799, 0, 4, 45],
      ['orange-squash-2l', 'Orange squash 2L', 4599, 7, 3, 80],
      ['iced-tea-1-5l', 'Iced tea 1.5L', 2499, 9, 4, 6],
      ['water-1-5l', 'Still water 1.5L', 1299, 22, 8, 2],
      ['energy-250ml', 'Energy drink 250ml', 2899, 3, 5, 30],
      ['cola-can', 'Cola can 330ml', 1299, 30, 12, 1],
      ['amahewu-1l', 'Amahewu 1L', 1899, 6, 4, 25],
    ] satisfies Row[]).map(product)],
    ['bread', ([
      ['white-bread', 'White bread 700g', 1899, 11, 5, 4],
      ['brown-bread', 'Brown bread 700g', 1799, 2, 5, 9],
      ['vetkoek', 'Vetkoek (4)', 2000, 8, 4, 15],
      ['rolls', 'Bread rolls (6)', 2499, 0, 3, 60],
    ] satisfies Row[]).map(product)],
    ['groceries', ([
      ['maize-meal-5kg', 'Maize meal 5kg', 6499, 9, 4, 20],
      ['sugar-2-5kg', 'Sugar 2.5kg', 5499, 5, 4, 35],
      ['oil-2l', 'Sunflower oil 2L', 6999, 3, 3, 50],
      ['rice-2kg', 'Rice 2kg', 4299, 10, 4, 18],
      ['tea-100', 'Rooibos tea (100)', 4499, 6, 2, 90],
      ['milk-1l', 'Long-life milk 1L', 1899, 18, 6, 7],
      ['eggs-6', 'Eggs (6)', 2699, 0, 4, 120],
      ['beans-410g', 'Baked beans 410g', 1699, 13, 5, 26],
      ['pilchards-400g', 'Pilchards 400g', 3299, 7, 4, 40],
      ['salt-1kg', 'Salt 1kg', 1299, 15, 3, 200],
      ['noodles-5', 'Instant noodles (5)', 2499, 4, 5, 11],
      ['peanut-butter', 'Peanut butter 400g', 3999, 5, 2, 75],
      ['apricot-jam', 'Apricot jam 450g', 2999, 6, 2, 63],
      ['candles-6', 'Candles (6)', 2299, 12, 4, 300],
    ] satisfies Row[]).map(product)],
    ['snacks', ([
      ['chips-salt-vinegar', 'Chips, salt and vinegar 120g', 2199, 10, 6, 5],
      ['chocolate-bar', 'Chocolate bar 80g', 1499, 2, 6, 14],
      ['lollipop', 'Lollipop', 200, 60, 20, 33],
      ['biscuits', 'Tea biscuits 200g', 1999, 8, 3, 70],
      ['popcorn', 'Popcorn 100g', 1299, 0, 4, 140],
      ['peanuts', 'Salted peanuts 100g', 1599, 9, 3, 22],
      ['chewing-gum', 'Chewing gum', 500, 25, 10, 48],
    ] satisfies Row[]).map(product)],
    ['airtime', []],
  ])
}

export const shop = {
  products: seed(),
  sales: [] as Sale[],
}

export function findProduct(id: string): Product | undefined {
  for (const list of shop.products.values()) {
    const found = list.find((p) => p.id === id)
    if (found) return found
  }
  return undefined
}
