var fs = require('fs');

function runMigration(configFile, cb) {
	var config = require(configFile);

	config.test = 'test';
	config.password = 'correcthorsebatterystaple';

	fs.writeFileSync(configFile, JSON.stringify(config));

	cb(null, true);
}

var migrationConfig = {
	env: 'dev',
	run: true
};

module.exports.run = runMigration;
module.exports.config = migrationConfig;