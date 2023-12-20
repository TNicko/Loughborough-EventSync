import '../global.css'
import { useState } from 'react'
import { getEvents } from '../scripts/scraper.js'
import { downloadFile, createICalObject } from '../scripts/ical.js'
import { Event, ScrapedEvent } from '../types'

function App() {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async () => {
    setErrorMessage('')
    setIsSuccess(false)
    try {
      const [tab] = await chrome.tabs.query({ active: true })

      if (!tab || !tab.id) {
        setErrorMessage('No active tab found.')
        return
      }

      const correctUrl = 'https://lucas.lboro.ac.uk/its_apx/f?p=250'
      if (!tab.url || !tab.url.startsWith(correctUrl)) {
        setErrorMessage(
          'Please navigate to the Loughborough calendar page and try again.',
        )
        return
      }

      const response = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getEvents,
      })

      if (!response[0]?.result) {
        setErrorMessage(
          'No response received. Make sure you are on the correct page and that events exist on your calender.',
        )
      }

      const events: [Event] = response[0]?.result?.map(
        (scraped_event: ScrapedEvent) => ({
          ...scraped_event,
          start: new Date(scraped_event.start),
          end: new Date(scraped_event.end),
        }),
      )
      const iCalObject = createICalObject(events)
      downloadFile(iCalObject)
      setIsSuccess(true)
    } catch (error) {
      setErrorMessage(`There was an error accessing tabs`)
    }
  }

  return (
    <>
      <div className='container'>
        <div className='header'>
          <img className='showcase-img' src={'/images/extension_icon.png'} />

          <div className='title'>Loughborough Event Sync</div>
        </div>
      </div>
      <div className='line-br'></div>
      <div className='container'>
        {isSuccess ? (
          <div id='loading'>
            <span className='icon-line line-tip'></span>
            <span className='icon-line line-long'></span>
            <div className='outer-shadow'></div>
            <div className='inner-shadow'></div>
            <div className='hold left'>
              <div className='fill'></div>
            </div>
            <div className='hold right'>
              <div className='fill'></div>
            </div>
          </div>
        ) : (
          <button className='download-btn' onClick={handleSubmit}>
            Download Calendar
          </button>
        )}
        {errorMessage && <div className='error-message'>{errorMessage}</div>}
      </div>
    </>
  )
}

export default App
