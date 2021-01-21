var migrate = require('../index').migrate;
var path = require('path');

var mConfig = {
	directory: path.join(__dirname, 'migrations'),
	configFile: path.join(__dirname, 'config.json'),
	dataFile: path.join(__dirname, 'migrationData.json'),
	env: 'dev'
};

migrate(mConfig, null, function(err, data) {
	if (err) {
		throw err;
	}

	console.log(data);

	if (data.length === 0) {
		console.log('No migrations required');
	} else {
		console.log('Migrations run');
	}
});