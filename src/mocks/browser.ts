import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// The service worker (public/mockServiceWorker.js) catches every request to
// /api/v1/* and hands it to the handlers, which run here, in the page.
export const worker = setupWorker(...handlers)
