const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '../dist/preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  await new Promise((r) => setTimeout(r, 1000));

  // Create a tab WebContentsView
  const tabView = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.contentView.addChildView(tabView);
  const [w, h] = win.getContentSize();
  tabView.setBounds({ x: 0, y: 84, width: w, height: h - 84 });
  await tabView.webContents.loadURL('https://example.com');
  await new Promise((r) => setTimeout(r, 2000));

  // Capture tabView's contents
  const tabImg = await tabView.webContents.capturePage();
  fs.writeFileSync(path.join(__dirname, '../screenshots/test-tabview-only.png'), tabImg.toPNG());
  console.log('Saved test-tabview-only.png, size:', tabImg.getSize());

  // Also test what user agent it has
  const ua = await tabView.webContents.executeJavaScript('navigator.userAgent');
  console.log('User Agent:', ua);

  // Check window layout
  console.log('win.contentView.children.length:', win.contentView.children.length);

  app.quit();
});
