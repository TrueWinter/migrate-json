var migrateJSON = require('../index');
var path = require('path');
var fs = require('fs');

var mConfig = {
	directory: path.join(__dirname, 'migrations'),
	configFile: path.join(__dirname, 'config.json'),
	dataFile: path.join(__dirname, 'migrationData.json'),
	env: 'dev'
};

if (!fs.existsSync(mConfig.dataFile)) {
	// This can be used to set the `lastMigration` property in the migration data file to the install date
	// to prevent previous migrations from being run. The `formatDate` function can be used to help with the
	// date format
	migrateJSON.setTimestamp(mConfig, '202101010000');
}

migrateJSON.migrate(mConfig, null, function(err, data) {
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