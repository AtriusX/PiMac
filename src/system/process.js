const activeWin      = require('active-win');
const processWindows = require('node-process-windows');

// TODO Mac support later?

var pid = 0;

exports.set = function() {
    var proc = activeWin.sync().owner.processId; 
    pid = proc != process.pid ? proc : pid;    
}   

exports.focus = function() {
    processWindows.focusWindow(pid);
}
