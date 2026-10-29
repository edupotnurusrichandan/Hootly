const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1240,
    height: 820,
    frame: false,
    show: true,
    backgroundColor: '#070b14',
    webPreferences: {
      preload: path.join(__dirname, '../dist/preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, '../dist/renderer/index.html'));

  // The splash appears immediately upon renderer load
  await new Promise((r) => setTimeout(r, 650));

  const img = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, '../screenshots/opera-startup-splash.png'), img.toPNG());
  console.log('Saved opera-startup-splash.png successfully!');

  // Wait 2 seconds for splash to finish and capture the Hootly browser
  await new Promise((r) => setTimeout(r, 1800));
  const mainImg = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, '../screenshots/hootly-browser-main.png'), mainImg.toPNG());
  console.log('Saved hootly-browser-main.png successfully!');

  app.quit();
});
