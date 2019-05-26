const path 	     = require('path');
const process    = require('./system/process');
const ioHook     = require('iohook');
const trayWindow = require('electron-tray-window');
const { app, BrowserWindow, ipcMain, Tray } = require('electron')

const TRIGGER_KEY = 15;

let wheelWindow, settingWindow;

app.on('ready', () => {
	process.set();
	// Initialize the window
	wheelWindow = initWindow("render/wheel/wheel.html", {
		transparent: true, frame: false, skipTaskbar: true,
		alwaysOnTop: true, ignoreEvents: true
	});

	wheelWindow.webContents.on('dom-ready', () => {
		const { screen } = require('electron');

		var active = false;
		// Show window when key is pressed
		ioHook.on('keydown', (event) => {
			if (event.keycode != TRIGGER_KEY || active) return;
			process.set();
			// Move window to active screen	if screen has changed
			var point   = screen.getCursorScreenPoint();
			var display = screen.getDisplayNearestPoint(point);
			if (screen.getDisplayMatching(wheelWindow.getBounds())) {
				var { x, y } = display.workArea;
				wheelWindow.setPosition(x, y);
				wheelWindow.maximize();
			}
			wheelWindow.focus();
			// Send the wheel data to the UI
			wheelWindow.webContents.send(
				"window:show", ["Option 1", "Option 2", "Option 3", "Option 4"], point, display
			);
			// Refocus window
			// Keep the wheel from refreshing when the key is held down
			active = ignoreEvents(wheelWindow, false);
		});
		// Hide the screen after the key is released
		ioHook.on('keyup', (event) => {
			if (event.keycode != TRIGGER_KEY) return;
			wheelWindow.webContents.send("window:hide");
			// Return to the original window
			active = ignoreEvents(wheelWindow, true);
			process.focus();
		});
		// Triggered when a window is hidden from the UI side
		ipcMain.on('window:hidden', () => {
			ignoreEvents(wheelWindow, true);
			process.focus();
			robot.keyTap('backspace');
		});

		ioHook.start();
	});

	settingWindow = initWindow("render/settings/settings.html", {
		frame: false, skipTaskbar: true, alwaysOnTop: true, 
		resizable: false, icon: "resources/icon.png", height: 700, 
		width: 800, parent: wheelWindow, tray: true
	});

	// wheelWindow.webContents.openDevTools();
});

function initWindow(file, options) {
	var win = new BrowserWindow(options);
	win.loadURL(path.join(__dirname, file));
	// Initialize as a tray window
	if (options.tray != undefined && options.tray) {
		trayWindow.setOptions({
			tray: new Tray(path.join(__dirname, options.icon)), 
			window: win, margin_x: 10, margin_y: 10
		});
	}
	// Initialize with no mouse events enabled
	if (options.ignoreEvents != undefined)
		ignoreEvents(win, options.ignoreEvents);
	return win;
}

function ignoreEvents(win, ignore) {
	if (ignore) win.setIgnoreMouseEvents(true, false);
	else 		win.setIgnoreMouseEvents(false);
	return 		!ignore;
}

// TODO Detecting the last hovered element and executing the command associated to it
// TODO Program detection and keybind/macro config
// TODO Settings window
// TODO show application specific pie menu with macros
// TODO prevent text input spam when window is visible (fixed mostly)
// TODO Sub-menu support?