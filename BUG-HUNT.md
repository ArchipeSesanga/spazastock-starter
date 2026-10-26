# Bug hunt (10 minutes)

Each snippet has at least one bug from Week 7. Under each one, write:

- **What breaks, and for whom:** one line.
- **The fix:** one line.

## 1

```tsx
{sales.map((sale, index) => <SaleRow key={index} sale={sale} />)}
```

- What breaks, and for whom: i believe the Key must be equal to sale.id
- The fix: key={sale.id}

## 2

```tsx
useEffect(() => {
  const id = setInterval(() => setNow(Date.now()), 1000)
}, [])
```

- What breaks, and for whom: the state needs to be cleared at some point 
- The fix: return => clearinterval(id)

## 3

```ts
const body = await (await fetch(`${API}/api/v1/auth/login`, { method: 'POST', body: json })).json()
localStorage.setItem('token', body.accessToken)
```

- What breaks, and for whom:
- The fix:

## 4

```ts
useQuery({ queryKey: ['products'], queryFn: () => getProducts(categoryId) })
```

- What breaks, and for whom: the categoryId is ignored

- The fix:  queryKey: ['products', CategoryId]

## 5

```ts
// SpazaStock's products endpoint
const hasMore = page.nextPageToken !== ''
```

- What breaks, and for whom:
- The fix:

## 6

```ts
const cents = parseFloat(form.price) * 100
```

- What breaks, and for whom:
- The fix:

## 7

```tsx
const save = useMutation({ mutationFn: createSale })
<Button onClick={() => save.mutate(values)}>Save</Button>
```

- What breaks, and for whom: idempotency problem i believe
- The fix:

## 8

```tsx
<span className="text-red-600">●</span>
```

- What breaks, and for whom:
- The fix:
