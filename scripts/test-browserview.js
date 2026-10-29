const { app, BrowserWindow, BrowserView } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false
  });

  win.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  await new Promise((r) => setTimeout(r, 1000));

  const view = new BrowserView();
  win.setBrowserView(view);
  view.setBounds({ x: 0, y: 84, width: 1200, height: 800 - 84 });
  await view.webContents.loadURL('https://example.com');
  await new Promise((r) => setTimeout(r, 2000));

  const img = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, '../screenshots/test-browserview-example.png'), img.toPNG());
  console.log('Saved test-browserview-example.png');
  app.quit();
});
