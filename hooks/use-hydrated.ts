import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** False during the server render and hydration, true on the client after that. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
