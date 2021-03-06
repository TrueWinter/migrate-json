var fs = require('fs');

function runMigration(configFile, cb) {
	var config = require(configFile);

	config.test = 'test';
	config.password = 'correcthorsebatterystaple';

	// eslint-disable-next-line quotes
	fs.writeFileSync(configFile, JSON.stringify(config, null, "\t"));

	cb(null, true);
}

var migrationConfig = {
	env: 'dev',
	run: true
};

module.exports.run = runMigration;
module.exports.config = migrationConfig;