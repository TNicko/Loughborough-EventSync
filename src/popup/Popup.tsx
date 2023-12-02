import '../global.css'
import browser from 'webextension-polyfill'

function App() {
  const handleSubmit = async () => {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      const activeTab = tabs[0]
      console.log(activeTab.url)
      if (
        activeTab.url &&
        activeTab.url.startsWith('https://lucas.lboro.ac.uk/its_apx/f?p=250')
      ) {
        console.log('Scraping tab: ', activeTab.id)

        // Sending the message and waiting for a response
        if (activeTab.id !== undefined) {
          browser.tabs
            .sendMessage(activeTab.id, { action: 'runContentScript' })
            .then((response) => {
              console.log('Received response:', response)
            })
            .catch(reportError)
        } else {
          console.log('Tab is not fully initialised: ID undefined.')
        }
      } else {
        console.log('Not currently on correct url!')
      }
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
