import { useState, useSyncExternalStore } from 'react'
import { chaos, type ChaosEffect, type ChaosTarget } from './chaos'

const TARGETS: { target: ChaosTarget; label: string }[] = [
  { target: 'products', label: 'Next products request' },
  { target: 'sales', label: 'Next sale (POST)' },
]

const EFFECTS: { effect: ChaosEffect; label: string }[] = [
  { effect: '500', label: '500' },
  { effect: '429', label: '429' },
  { effect: 'network', label: 'No network' },
  { effect: 'slow', label: 'Slow (2 s)' },
]

// Development only: makes the fake API misbehave on purpose, once, so you
// can see every error state your app has to handle.
export function ChaosPanel() {
  const [open, setOpen] = useState(false)
  const state = useSyncExternalStore(chaos.subscribe, chaos.get)
  const armed = Object.values(state).some((effect) => effect !== null)

  return (
    <aside
      aria-label="Chaos panel"
      className="fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 max-w-[calc(100vw-1.5rem)] rounded-xl border border-dashed border-amber-600 bg-background p-2 text-sm shadow-lg"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-md px-2 py-1 font-medium text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-950"
      >
        Chaos {armed ? '(armed)' : ''} {open ? '▾' : '▸'}
      </button>
      {open && (
        <div className="mt-2 space-y-3 p-1">
          {TARGETS.map(({ target, label }) => (
            <fieldset key={target} className="space-y-1">
              <legend className="text-xs text-muted-foreground">{label}</legend>
              <div className="flex flex-wrap gap-1">
                {EFFECTS.map(({ effect, label: effectLabel }) => {
                  const active = state[target] === effect
                  return (
                    <button
                      key={effect}
                      type="button"
                      aria-pressed={active}
                      onClick={() => chaos.arm(target, active ? null : effect)}
                      className={
                        'rounded-md border px-2 py-0.5 text-xs ' +
                        (active ? 'border-amber-600 bg-amber-600 text-white' : 'border-border hover:bg-muted')
                      }
                    >
                      {effectLabel}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}
          <p className="max-w-56 text-xs text-muted-foreground">
            Armed for one request, then off again. Reload the page to restock the shop.
          </p>
        </div>
      )}
    </aside>
  )
}
