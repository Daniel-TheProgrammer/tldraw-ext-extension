let tabCount = 0;
let allTabs: ext.tabs.Tab[] = [];
let allWindows: ext.windows.Window[] = [];
let webviews: ext.webviews.Webview[] = [];
let websessions: ext.websessions.Websession[] = [];
const getPlatformDarkMode = ext.windows.getPlatformDarkMode;
const onUpdatedDarkMode = ext.windows.onUpdatedDarkMode;

ext.runtime.onExtensionClick.addListener(async () => {
  tabCount++;

  const newTab = await ext.tabs.create({
    text: `TLDraw - #${tabCount}`,
  });
  allTabs.push(newTab);

  const newWindow = await ext.windows.create({
    title: `Window - #${tabCount}`,
  });
  allWindows.push(newWindow);

  // Websessions
  const newWebsession = await ext.websessions.create({
    partition: `Extension${tabCount}`,
    persistent: true,
    global: false,
    cache: true,
  });
  websessions.push(newWebsession);

  const newWindowSize = await ext.windows.getSize(newWindow.id);
  const newWebview = await ext.webviews.create({
    window: newWindow,
    websession: newWebsession,
    bounds: {
      x: 0,
      y: 0,
      width: newWindowSize.width,
      height: newWindowSize.height,
    },
    autoResize: { width: true, height: true },
  });
  webviews.push(newWebview);

  await ext.webviews.executeJavaScript(
    newWebview.id,
    `var element = document.querySelector('.tldraw__editor'); element.style.paddingBottom = '50px'; element.style.paddingRight = '50px';`
  );

  //Dark Mode
  getPlatformDarkMode();
  onUpdatedDarkMode.addListener((event, details) => {
    details.enabled && console.log('Dark Mode');
  });
});

ext.tabs.onClickedClose.addListener(async (event, tab) => {
  tabCount--;

  allTabs = allTabs.filter((t) => t.id !== tab.id);
  allWindows = allWindows.filter((w) => w.id !== tab.id);
  webviews = webviews.filter((w) => w.id !== tab.id);
  websessions = websessions.filter((w) => w.id !== tab.id);

  console.log(allWindows, allTabs, webviews);
  await ext.tabs.remove(tab.id);
  await ext.windows.remove(tab.id);
});

ext.windows.onClosed.addListener(async (event) => {
  tabCount--;

  allTabs = allTabs.filter((t) => t.id !== event.id);
  allWindows = allWindows.filter((w) => w.id !== event.id);
  webviews = webviews.filter((w) => w.id !== event.id);
  websessions = websessions.filter((w) => w.id !== event.id);

  console.log(allWindows, allTabs, webviews);
  await ext.tabs.remove(event.id);
  await ext.windows.remove(event.id);
});

ext.webviews.onCreated.addListener(async (info, webview) => {
  await ext.webviews.loadURL(webview.id, 'https://www.tldraw.com/');
});
