// Importing the necessary type and namespace from the polyfill library
import browser from 'webextension-polyfill'

// Guard variable
if ((window as any).hasRun) {
  throw new Error('Script is already running on this page.')
}
;(window as any).hasRun = true

function scrapePage() {
  // ... (your scraping logic here)
  console.log('WORKS!!!!')
  return { data: 'Scraped data would be here.' }
}

// The message parameter is typically any because it's a custom object that depends on your application.
// You could define a more specific type based on what kind of messages you're expecting.
browser.runtime.onMessage.addListener(
  (
    message: any,
    _sender: browser.Runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) => {
    if (message.command === 'scrapePage') {
      const result = scrapePage()
      sendResponse(result)
    }
    // Indicating this is an async response, and the listener will stay alive until `sendResponse` is invoked.
    return true
  },
)
