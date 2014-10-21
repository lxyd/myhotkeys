const Cc = Components.classes;
const Ci = Components.interfaces;

const handlers = [
    { hotkey: parseHotkey('a-k'), handle: function nextTab(window) {
        window.gBrowser.tabContainer.advanceSelectedTab(1, true);
    }},
    { hotkey: parseHotkey('a-j'), handle: function prevTab(window) {
        window.gBrowser.tabContainer.advanceSelectedTab(-1, true);
    }}
];

function parseHotkey(str) {
    let m = /^(?:([acsm]+)-)?(.)$/.exec(str),
        mods = m[1] || "",
        keyName = m[2].toUpperCase();

    return {
        keyName:  keyName,
        altKey:   mods.contains('a'),
        metaKey:  mods.contains('m'),
        shiftKey: mods.contains('s'),
        ctrlKey:  mods.contains('c'),
    }
}

function handleKeyEvent(ev) {
    let window = this;
    handlers.forEach(function(h) {
        if (matches(ev, h.hotkey)) {
            h.handle(window);
            ev.preventDefault();
        }
    });
}

function matches(ev, hotkey) {
    return (ev.altKey || ev.metaKey) == (hotkey.altKey || hotkey.metaKey) &&
           ev.shiftKey == hotkey.shiftKey &&
           ev.ctrlKey == hotkey.ctrlKey &&
           ev["DOM_VK_" + hotkey.keyName] == ev.keyCode;
}

// template from here: http://www.oxymoronical.com/blog/2011/01/Playing-with-windows-in-restartless-bootstrapped-extensions

var WindowListener = {
  setupBrowserUI: function(window) {
    window.addEventListener('keydown', handleKeyEvent, true);
  },

  tearDownBrowserUI: function(window) {
    window.removeEventListener('keydown', handleKeyEvent, true);
  },

  // nsIWindowMediatorListener functions
  onOpenWindow: function(xulWindow) {
    // A new window has opened
    let domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                             .getInterface(Ci.nsIDOMWindow);

    // Wait for it to finish loading
    domWindow.addEventListener("load", function listener() {
      domWindow.removeEventListener("load", listener, false);

      // If this is a browser window then setup its UI
      if (domWindow.document.documentElement.getAttribute("windowtype") == "navigator:browser")
        WindowListener.setupBrowserUI(domWindow);
    }, false);
  },

  onCloseWindow: function(xulWindow) {
  },

  onWindowTitleChange: function(xulWindow, newTitle) {
  }
};

function startup(data, reason) {
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
           getService(Ci.nsIWindowMediator);

  // Get the list of browser windows already open
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);

    WindowListener.setupBrowserUI(domWindow);
  }

  // Wait for any new browser windows to open
  wm.addListener(WindowListener);
}

function shutdown(data, reason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (reason == APP_SHUTDOWN)
    return;

  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
           getService(Ci.nsIWindowMediator);

  // Get the list of browser windows already open
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);

    WindowListener.tearDownBrowserUI(domWindow);
  }

  // Stop listening for any new browser windows to open
  wm.removeListener(WindowListener);
}

function install(data, reason) {
    // ignored
}

function uninstall(data, reason) {
    // ignored
}
