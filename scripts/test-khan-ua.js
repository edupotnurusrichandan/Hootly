const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  // Clean default user agent: remove Electron/X.Y.Z
  const rawUA = app.userAgentFallback;
  const cleanUA = rawUA.replace(/Electron\/[0-9\.]+\s?/, '');
  console.log('Original UA:', rawUA);
  console.log('Cleaned Chrome UA:', cleanUA);

  app.userAgentFallback = cleanUA;

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false
  });

  const view = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  view.webContents.setUserAgent(cleanUA);

  // Also sanitize request headers to remove Electron from sec-ch-ua
  view.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    const requestHeaders = { ...details.requestHeaders };
    if (requestHeaders['User-Agent']) {
      requestHeaders['User-Agent'] = requestHeaders['User-Agent'].replace(/Electron\/[0-9\.]+\s?/, '');
    }
    if (requestHeaders['sec-ch-ua']) {
      requestHeaders['sec-ch-ua'] = '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"';
    }
    callback({ requestHeaders });
  });

  win.contentView.addChildView(view);
  view.setBounds({ x: 0, y: 0, width: 1200, height: 800 });

  console.log('Loading Khan Academy with cleaned Chrome UA...');
  await view.webContents.loadURL('https://www.khanacademy.org');
  await new Promise((r) => setTimeout(r, 4000));

  const pageTitle = view.webContents.getTitle();
  const pageUrl = view.webContents.getURL();
  console.log('Loaded URL:', pageUrl);
  console.log('Page Title:', pageTitle);

  const img = await view.webContents.capturePage();
  fs.writeFileSync(path.join(__dirname, '../screenshots/khan-academy-loaded.png'), img.toPNG());
  console.log('Saved khan-academy-loaded.png successfully!');

  app.quit();
});
