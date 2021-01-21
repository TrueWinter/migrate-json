# Migrate-JSON

Many projects use JSON to store their config as this allows for easy access to configuration data. But this also comes with the added challenge of keeping this file up to date with the latest additions to the configuration options. Migrate-JSON aims to help with that by providing a migration system similar to database migrations.

**Note that Migrate-JSON is still in development so there may be bugs. If you find any, please open an issue.**

## Usage

Require Migrate-JSON in your project, like so:

```js
var migrate = require('../index').migrate; // Update this as needed
var path = require('path');

// These must be absolute paths
var mConfig = {
	directory: path.join(__dirname, 'migrations'), // The directory that your migrations are in
	configFile: path.join(__dirname, 'config.json'), // The config file that should be updated
	dataFile: path.join(__dirname, 'migrationData.json'), // A file used by Migrate-JSON to store migration data (will be created automatically if it doesn't exist)
	env: 'dev' // Only the migrations matching this environment will run
};

migrate(mConfig, null, function(err, data) { // the callback will be called when all required migrations are complete
	if (err) {
		throw err;
	}

	if (data.length === 0) { // data is an array of the completed migrations
		console.log('No migrations required');
	} else {
		console.log('Migrations run');
	}
});
```

Then create migrations, taking note of the following:

- The file name must be in the format of `{date+time}-migrationName.js`. It has been tested with the date format `YYYYMMDDHHMM` so may not work with other date formats.
- The migration files need to export a `run` function and `config` object with the migration config. The run function should have two parameters, one for the config file path, and the other for a callback. The migration config should have two properties, one for the environment and the other for `run`, a boolean that states whether this migration should be run.
- You must call the callback after completing the migration tasks to allow for the next migrations to run and for the `migrate` callback to be called, even if you only have one migration.

The following is an example from `example/migration/202101211619-addOptions.js`:

```js
var fs = require('fs');

function runMigration(configFile, cb) {
	var config = require(configFile); // Load the data from the config file

	// Add data
	config.test = 'test';
	config.password = 'correcthorsebatterystaple';

	// Save data
	fs.writeFileSync(configFile, JSON.stringify(config));

	// Call callback function to allow for migrations to complete
	cb(null, true);
}

var migrationConfig = {
	env: 'dev',
	run: true
};

module.exports.run = runMigration;
module.exports.config = migrationConfig;
```

## License

Licensed under the MIT license. See `LICENSE` for more information.