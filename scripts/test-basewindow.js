const { app, BaseWindow, WebContentsView } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BaseWindow({
    width: 1200,
    height: 800,
    frame: false
  });

  // 1. UI View (Top Bar: 84px height)
  const uiView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, '../dist/preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.contentView.addChildView(uiView);
  uiView.setBounds({ x: 0, y: 0, width: 1200, height: 84 });
  uiView.webContents.loadFile(path.join(__dirname, '../dist/renderer/index.html'));

  // 2. Tab WebContentsView (Web page: remaining height)
  const tabView = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.contentView.addChildView(tabView);
  tabView.setBounds({ x: 0, y: 84, width: 1200, height: 800 - 84 });
  await tabView.webContents.loadURL('https://example.com');

  await new Promise((r) => setTimeout(r, 2000));

  const img = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, '../screenshots/test-basewindow-example.png'), img.toPNG());
  console.log('Saved test-basewindow-example.png successfully!');
  app.quit();
});
