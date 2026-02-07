/**
 * Project GREEN - Background Service Worker
 * Handles tab capture and saves items to chrome.storage.local
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_TAB') {
    handleCaptureTab(sender.tab?.id)
      .then((dataUrl) => sendResponse({ success: true, dataUrl }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function handleCaptureTab(tabId) {
  if (!tabId) throw new Error('No tab id');
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    return dataUrl;
  } catch (err) {
    throw new Error('Screenshot failed: ' + (err.message || 'unknown'));
  }
}
