import './App.css'
import browser from "webextension-polyfill"

function App() {
  
  const handleSubmit = async () => {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true})
      const currentTab = tabs[0];

      if (currentTab && currentTab.url?.startsWith('https://lucas.lboro.ac.uk/its_apx/f?p=250')) {
        console.log("already on url");
      } else {
        await browser.tabs.create({url: 'https://lucas.lboro.ac.uk/its_apx/f?p=250'})
        console.log("opened calender url");
      }
    } catch (error) {
      console.error("Error accessing tabs: ", error);
    } 
  }

  return (
    <>
      <div className="container">
        <div className="header">
          Loughborough<br/>Event Sync
        </div>
        <div className="subtext">
          Export or Sync your events
        </div>
        <button className="download-btn" onClick={handleSubmit}>Download Calender iCal</button>
      </div>
    </>
  )
}

export default App
