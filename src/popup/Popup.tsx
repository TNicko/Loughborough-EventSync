import '../global.css'
import { useState } from 'react'
import { getEvents } from '../scripts/scraper.js'

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

      setIsSuccess(true)

      console.log(response[0]?.result ?? 'No response received.')
    } catch (error) {
      setErrorMessage(`There was an error accessing tabs`)
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
        <div className='subtext'>Export your events</div>
        <ol className='instructions'>
          <li>
            Open your Loughborough calendar located at{' '}
            <a
              href='https://lucas.lboro.ac.uk/its_apx/f?p=250'
              target='_blank'
            >
              https://lucas.lboro.ac.uk/its_apx/f?p=250
            </a>
          </li>
          <li>Sign in and complete the authorization process.</li>
          <li>
            Once the calendar is open and visible, click the "Download Calendar
            iCal" button below.
          </li>
        </ol>
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
            Download Calendar iCal
          </button>
        )}
        {errorMessage && <div className='error-message'>{errorMessage}</div>}
      </div>
    </>
  )
}

export default App
