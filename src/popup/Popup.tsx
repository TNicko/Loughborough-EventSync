import '../global.css'
import { useEffect, useState } from 'react'
import { getEvents } from '../scripts/scraper.js'
import { downloadFile, createICalObject } from '../scripts/ical.js'
import { Event, ScrapedEvent, EventResponse } from '../types'

function App() {
  const [semester, setSemester] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null)
  const correctUrl = 'https://lucas.lboro.ac.uk/its_apx/f?p=250'

  useEffect(() => {
    const fetchTab = async () => {
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
      setTab(currentTab)
    }
    fetchTab()
  }, [])

  const goToSubmit = () => {
    chrome.tabs.create({ url: correctUrl })
  }

  const handleSubmit = async () => {
    setErrorMessage('')
    setIsSuccess(false)
    if (!semester) {
      setErrorMessage('Please select a semester.')
      return
    }
    try {
      if (!tab || !tab.id) {
        setErrorMessage('No active tab found.')
        return
      }

      if (!tab.url || !tab.url.startsWith(correctUrl)) {
        setErrorMessage(
          'Please navigate to the Loughborough calendar page and try again.',
        )
        return
      }

      const response = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getEvents,
        args: [semester],
      })
      const scriptResult: EventResponse = response[0].result
      if (scriptResult.error) {
        setErrorMessage(scriptResult.error)
        return
      }
      if (!scriptResult.events) {
        setErrorMessage(
          'No response received. Make sure you are on the correct page and that events exist on your calender.',
        )
        return
      }

      const events: Event[] = scriptResult.events.map(
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
      setErrorMessage(`An error occured. Please try again.`)
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
        ) : tab && (!tab.url || !tab.url.startsWith(correctUrl)) ? (
          <>
            <div className='instruction-text'>
              <div className='instruction-step'>
                <span className='step-number'>1</span>
                <p>Navigate to your timetable using the button below.</p>
              </div>
              <div className='instruction-step'>
                <span className='step-number'>2</span>
                <p>
                  <strong>Re-open this extension</strong> once your timetable
                  is open.
                </p>
              </div>
            </div>
            <button className='btn goto-btn' onClick={goToSubmit}>
              Go To Calender
            </button>
          </>
        ) : (
          <>
            <select
              className='dropdown'
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value=''>Select Semester</option>
              <option value='sem1'>Semester 1</option>
              <option value='sem2'>Semester 2</option>
            </select>

            <button className='btn download-btn' onClick={handleSubmit}>
              Download Calendar
            </button>
          </>
        )}
        {errorMessage && <div className='error-message'>{errorMessage}</div>}
      </div>
    </>
  )
}

export default App
