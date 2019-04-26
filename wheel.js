const nav 	  = require('wheelnav')
const Raphael = require('raphael')

const EDGE_BUFFER = 200;

function loadMenu(options, point, display) {
	const { ipcRenderer } = require('electron');
	try {
		var piemenu = new wheelnav('piemenu');
		piemenu.initPercent = 1;	
		piemenu.animatetime = 0;
		piemenu.selectedNavItemIndex = null;	
		piemenu.wheelRadius = piemenu.wheelRadius * 1.1;	
		// Set menu angle
		var angle = sliceAngle(point, display, options.length);
		if (angle != 0) {	
			piemenu.navItemsContinuous = true;
			piemenu.sliceAngle = angle;
			piemenu.titleRotateAngle = 0;
			piemenu.navAngle = angle / 2 + rotation(point, display, options.length);
		} 
		// piemenu.navAngle = rotation(point, display, options.length);
		piemenu.createWheel(options);
	} 			
	// Prevent random error spam from Raphael
	catch(err) {}		

	piemenu.navItems.forEach(n => {
		n.navigateFunction = () => {	
			unloadMenu(piemenu);		
			ipcRenderer.send('window:hidden');
		}
	});	

	var {x, y} = point
	var d = document.getElementById('piemenu');
	d.style.position = "absolute";
	// Some funky display math, makes sure the wheel is always centered properly on the cursor
	d.style.top = (y < 0 ? y + display.bounds.height : y) - display.bounds.y - 200 + "px";
	d.style.left = x - display.bounds.x - 200 + "px";							
};

function unloadMenu() {
	// It's stupid that this works without error
	document.getElementById("piemenu").innerHTML = "";
}

function sliceAngle(point, display, itemCount) {
	var { x, y } = point;
	var { height, width } = display.bounds;
	var angle = 0, atEdge;
	// Check if the cursor is near the left or right edge
	if (x < display.bounds.x + EDGE_BUFFER || x > display.bounds.x + width - EDGE_BUFFER) {
		angle = 180 / itemCount;
		atEdge = true;
	}
	// Calculate top/bottom edge/corner values
	if (y < display.bounds.y + EDGE_BUFFER || y > display.bounds.y + height - EDGE_BUFFER) 
		angle = (atEdge ? 90 : 180) / itemCount;

	return angle;
}

function rotation(point, display) {
	var { x, y } = point;
	var { height, width } = display.bounds;
	var boundX = display.bounds.x;
	var boundY = display.bounds.y;
	var { atLeft, atRight, atTop, atBottom } = false;
		
	if (x < boundX + EDGE_BUFFER) 		   atLeft = true;
	if (x > boundX + width - EDGE_BUFFER)  atRight = true;
	if (y < boundY + EDGE_BUFFER) 		   atTop = true;
	if (y > boundY + height - EDGE_BUFFER) atBottom = true;

	if (atTop)    return atRight ? 90 : 0;
	if (atLeft)   return 270;
	if (atBottom) return 180;
	if (atRight)  return 90;
}	