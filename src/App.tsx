import { ModeToggle } from '@/components/ModeToggle'
import { Card, CardHeader } from './components/ui/card'
import { ProductCard } from './components/ProductCard'


// Start here. Round 1 builds the shelf from src/data/sample.ts, Round 2
// replaces it with the API, and Round 3 adds the "Record a sale" form.
export default function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-lg font-semibold">SpazaStock</h1>
          <ModeToggle />
         
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-6">
        <p className="text-muted-foreground">Thandeka's shelves go here.</p>

         <ProductCard/>


      </main>
    </div>
  )
}
