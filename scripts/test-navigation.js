const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, '../dist/renderer/index.html'));

  await new Promise((r) => setTimeout(r, 1000));

  // Create WebContentsView for example.com
  const view = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.contentView.addChildView(view);
  const [w, h] = win.getContentSize();
  view.setBounds({
    x: 0,
    y: 84,
    width: w,
    height: h - 84
  });

  await view.webContents.loadURL('https://example.com');
  await new Promise((r) => setTimeout(r, 2000));

  const img = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, '../screenshots/test-view-example.png'), img.toPNG());
  console.log('Captured test-view-example.png successfully!');
  console.log('Rendering engine user-agent:', await view.webContents.executeJavaScript('navigator.userAgent'));
  app.quit();
});
