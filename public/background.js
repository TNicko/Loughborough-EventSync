chrome.action.onClicked.addListener(function (tab) {
  let url = 'https://lucas.lboro.ac.uk/its_apx/f?p=250'

  // Function to set the popup
  function setPopup(tabId) {
    chrome.action.setPopup({ tabId: tabId, popup: 'popup/index.html' })
  }

  if (!tab.url.startsWith(url)) {
    // Create a new tab and set the popup after the tab is created
    chrome.tabs.create({ url: url }, function (newTab) {
      // Wait for the new tab to finish loading
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          setPopup(tabId)
          // Remove the listener once we've set the popup
          chrome.tabs.onUpdated.removeListener(listener)
        }
      })
    })
  } else {
    // If the current tab is already at the target URL, set the popup immediately
    setPopup(tab.id)
  }
})
