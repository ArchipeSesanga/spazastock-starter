// Shown when the fake API isn't answering, which happens when the browser
// skips the service worker it runs in.
export function FakeApiWarning() {
  return (
    <div role="alert" className="border-b border-amber-600 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
      <p className="mx-auto max-w-6xl">
        <strong>The fake API isn't answering.</strong> A hard reload (Ctrl+Shift+R) skips it. Do a normal reload (F5).
        If that doesn't help, open DevTools → Application → Service workers and untick "Bypass for network".
      </p>
    </div>
  )
}
