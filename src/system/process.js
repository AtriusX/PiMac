const activeWin      = require('active-win');
const processWindows = require('node-process-windows');

// TODO Mac support later?

var pid = 0;

exports.set = function() {
    pid = activeWin.sync().owner.processId; 
}   

exports.focus = function() {
    if (pid == process.pid) return;
    processWindows.focusWindow(pid);
}
