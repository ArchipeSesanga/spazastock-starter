// The chaos panel's switches. Each one is armed for ONE request to its
// target, then switches itself off.

export type ChaosTarget = 'products' | 'sales'
export type ChaosEffect = '500' | '429' | 'network' | 'slow'

type ChaosState = Record<ChaosTarget, ChaosEffect | null>

let state: ChaosState = { products: null, sales: null }
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export const chaos = {
  get: (): ChaosState => state,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  arm(target: ChaosTarget, effect: ChaosEffect | null) {
    state = { ...state, [target]: effect }
    emit()
  },
  // Called by the fake API: returns the armed effect and disarms it.
  take(target: ChaosTarget): ChaosEffect | null {
    const effect = state[target]
    if (effect !== null) {
      state = { ...state, [target]: null }
      emit()
    }
    return effect
  },
}
