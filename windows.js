const activeWin      = require('active-win');
const processWindows = require('node-process-windows');

var pid = 0;

exports.setProgram = function() {
    pid = activeWin.sync().owner.processId; 
}   

exports.setTop = function() {
    if (pid == process.pid) return;
    processWindows.focusWindow(pid);
}
