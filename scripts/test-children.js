const { app, BrowserWindow, WebContentsView } = require('electron');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  console.log('win.contentView:', win.contentView);
  console.log('win.contentView.children:', win.contentView.children);
  
  const view1 = new WebContentsView();
  win.contentView.addChildView(view1);
  console.log('After adding view1, children:', win.contentView.children.length);

  app.quit();
});
