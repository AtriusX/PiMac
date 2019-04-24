const nav = require('wheelnav')
const Raphael = require('raphael')

function loadMenu(options, point) {
	const { ipcRenderer } = require('electron');
	var piemenu = new wheelnav('piemenu');
	// piemenu.sliceInitPathFunction = piemenu.slicePathFunction;
	piemenu.initPercent = 0.1;
	piemenu.wheelRadius = piemenu.wheelRadius * 0.83;
	piemenu.createWheel(options);
	for (i = 0; i < piemenu.navItems.length; i++) {
		piemenu.navItems[i].navigateFunction = () => {
			unloadMenu(piemenu);
			ipcRenderer.send('window:hidden');
		}
	}
	var {x, y} = point
	var d = document.getElementById('piemenu');
	d.style.position = "absolute";
	d.style.top = y - 200 + "px";
	d.style.left = x - 200 + "px";
};

function unloadMenu() {
	// It's stupid that this works without error
	document.getElementById("piemenu").innerHTML = "";
}
