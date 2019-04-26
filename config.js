const Store = require('electron-store');
const store = new Store();

exports.save = function(property, config) {
	store.set(property, JSON.stringify(config, null, 4));	
}

exports.read = function(property) {
	return store.get(property, {});
}

