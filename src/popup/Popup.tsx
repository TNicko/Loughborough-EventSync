import '../global.css'
import { getEvents } from '../scripts/scraper.js'

function App() {
  const handleSubmit = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true })

      if (!tab || !tab.id) {
        console.log('No active tab found.')
        return
      }

      console.log('>> Current tab: ', tab)

      const correctUrl = 'https://lucas.lboro.ac.uk/its_apx/f?p=250'
      if (!tab.url || !tab.url.startsWith(correctUrl)) {
        console.log('Not currently on correct url!')
        return
      }

      console.log('>> Scraping tab: ', tab.id)
      const response = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getEvents,
      })

      console.log(response[0]?.result ?? 'No response received.')
    } catch (error) {
      console.error('Error accessing tabs: ', error)
    }
  }

  return (
    <>
      <div className='container'>
        <div className='header'>
          Loughborough
          <br />
          Event Sync
        </div>
        <div className='subtext'>Export or Sync your events</div>
        <button className='download-btn' onClick={handleSubmit}>
          Download Calender iCal
        </button>
      </div>
    </>
  )
}

export default App
