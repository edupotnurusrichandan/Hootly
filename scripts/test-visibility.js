const { app, BrowserWindow, WebContentsView } = require('electron');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: true
  });

  win.loadFile('dist/renderer/index.html');
  await new Promise((r) => setTimeout(r, 500));

  const view = new WebContentsView();
  win.contentView.addChildView(view);
  view.setBounds({ x: 50, y: 50, width: 400, height: 400 });
  await view.webContents.loadURL('https://example.com');

  console.log('view.webContents.getURL():', view.webContents.getURL());
  console.log('view.getBounds():', view.getBounds());
  console.log('win.contentView.children.length:', win.contentView.children.length);
  
  app.quit();
});
