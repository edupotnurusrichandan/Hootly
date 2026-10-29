const { app, WebContentsView, BrowserView } = require('electron');
console.log('ELECTRON VERSIONS:', process.versions);
console.log('WebContentsView:', typeof WebContentsView);
console.log('BrowserView:', typeof BrowserView);
app.quit();
