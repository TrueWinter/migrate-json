/* eslint-disable no-unused-vars */
var fs = require('fs');
var async = require('async');
var path = require('path');

var errors = require('./errors');

/**
 * Represents a property value
 * @constructor
 * @private
 * @param {*} property The property value
 */
function Property(property) {
	var acceptedTypes = ['object', 'number', 'boolean', 'string'];

	if (!acceptedTypes.includes(typeof property)) {
		throw new errors.InvalidType();
	}

	this.property = property;
}

/**
 * Returns true if the property value is a string
 * @returns {boolean} boolean
 */
Property.prototype.isString = function() {
	return typeof this.property === 'string';
};

/**
 * Returns the property value if it is a string, throws error otherwise
 * @returns {string} string
 */
Property.prototype.toString = function() {
	if (this.isString()) {
		return this.property;
	} else {
		throw new errors.NotAString();
	}
};

/**
 * Returns true if the property value is an array
 * @returns {boolean} boolean
 */
Property.prototype.isArray = function() {
	return Array.isArray(this.property);
};

/**
 * Returns true if the property value is an object
 * @returns {boolean} boolean
 */
Property.prototype.isObject = function() {
	return Array.isArray(this.property) ? false : typeof this.property === 'object';
};

/**
 * Returns true if the property value is null
 * @returns {boolean} boolean
 */
Property.prototype.isNull = function() {
	return this.property === null;
};

/**
 * Returns true if the property value is a number
 * @returns {boolean} boolean
 */
Property.prototype.isNumber = function() {
	return typeof this.property === 'number';
};

/**
 * Returns true if the property value is a boolean
 * @returns {boolean} boolean
 */
Property.prototype.isBoolean = function() {
	return typeof this.property === 'boolean';
};

/**
 * Gets a property value
 * @param {object} object The object to use
 * @param {string} property The value to get from the object
 * @returns {Property} Property
 */

function getProperty(object, property) {
	var propertyConfig = {};

	if (property.includes('.')) {
		propertyConfig.splitPropertyFirst = property.split('.')[0];
		var tmpObject = property.split('.');
		tmpObject.shift();
		propertyConfig.splitPropertyRest = tmpObject.join('.');
	}

	if (!Object.prototype.hasOwnProperty.call(object, propertyConfig.splitPropertyFirst || property)) {
		throw new errors.NotExistError(propertyConfig.splitPropertyFirst || property);
	}

	if (!propertyConfig.splitPropertyFirst) {
		return new Property(object[property]);
	} else {
		return getProperty(object[propertyConfig.splitPropertyFirst], propertyConfig.splitPropertyRest);
	}
}

/*var property = getProperty(config, 'number');

console.log(property.property);
console.log(`String: ${property.isString()}`);
console.log(`Array: ${property.isArray()}`);
console.log(`Object: ${property.isObject()}`);
console.log(`Number: ${property.isNumber()}`);
console.log(`Boolean: ${property.isBoolean()}`);
console.log(`Null: ${property.isNull()}`);*/

/**
 * Runs the migration
 * @private
 * @param {string} migration The path to the migration file
 * @param {Object} config The migrations config object
 * @param {function(Error, string)} cb The function that will be called when the migration has completed
 * @returns {callback} Callback
 */
function runMigration(migration, config, cb) {
	console.log(`Runnning ${migration}`);
	var migrationFile = require(migration);

	if (migrationFile.config.env !== config.env) {
		return cb(null, `Skipping ${migration} as environments don't match`);
	}

	if (migrationFile.config.run === false) {
		return cb(null, `Skipping ${migration} as it is disabled`);
	}

	migrationFile.run(config.configFile, function (err, data) {
		if (err) {
			//return cb(err, null);
			throw err;
		}

		var migrationData = require(config.dataFile);
		migrationData.lastMigration = migration.split(path.sep)[migration.split(path.sep).length - 1].split('-')[0];
		fs.writeFileSync(config.dataFile, JSON.stringify(migrationData));

		return cb(null, `Migration ${migration} completed`);
	});
}

/**
 * This function is used to validate migration config
 * @param {Object} config The config that needs to be validated
 * @param {Object} validation The validation rules. Valid rules are: string, array, oject, boolean, number, null. More than one rule can be used by separating them with a pipe (|)
 * @returns {boolean} If all rules passed, returns true
 */
function validateConfig(config, validation) {
	var numberOfRules = Object.keys(validation).length;
	var rulesPassed = [];

	for (var prop in validation) {
		var property = getProperty(config, prop);

		var rules = validation[prop].split('|');

		if (rules.length === 0) {
			throw new errors.IncompleteParameters();
		}

		var trueRule = false;

		var ruleConfig = {
			string: property.isString(),
			array: property.isArray(),
			object: property.isObject(),
			boolean: property.isBoolean(),
			number: property.isNumber(),
			null: property.isNull()
		};

		for (var i = 0; i < rules.length; i++) {
			var tmp = ruleConfig[rules[i]];
			//console.log(`${rules[i]}: ${tmp}`);
			if (tmp) {
				trueRule = true;
			}
		}

		if (trueRule) {
			rulesPassed.push(prop);
		}
	}

	if (rulesPassed.length === numberOfRules) {
		return true;
	}

	return false;
}

/**
 * This starts the migrations
 * @param {Object} config The migrations config
 * @param {string} config.directory The absolute path to the directory containing migrations
 * @param {string} config.config The absolute path to the config file you wish to modify
 * @param {string} config.dataFile The absolute path to the migrations data file
 * @param {string} config.env The environment
 * @param {string|null} currentVersion The current migration version, or null for the first migration
 * @param {function(Error, string):void} cb The function that will be called when all migrations have completed
 * @returns {callback} Callback
 */
function migrate(config, currentVersion, cb) {
	var configValidation = {
		directory: 'string',
		configFile: 'string',
		dataFile: 'string',
		env: 'string',
		_m_currentVersion: 'string|null'
	};

	var tmpConfig = Object.assign(config, {});
	tmpConfig._m_currentVersion = currentVersion;

	if (validateConfig(tmpConfig, configValidation)) {
		if (!fs.existsSync(config.directory)) {
			throw new errors.DirNotExists(config.directory);
		}

		if (!fs.existsSync(config.configFile)) {
			throw new errors.FileNotExists(config.configFile);
		}

		if (!fs.existsSync(config.dataFile)) {
			fs.writeFileSync(config.dataFile, JSON.stringify({}));
		}

		var migrationData = require(config.dataFile);

		var migrations = fs.readdirSync(config.directory);

		if (migrations.length === 0) {
			return cb(null, 'No migrations exist');
		}

		var migrationsArray = [];

		for (var i = 0; i < migrations.length; i++) {
			if (migrations[i].split('.')[migrations[i].split('.').length - 1] === 'js') {
				if (migrations[i].split('-')[0] > (migrationData.lastMigration || 0)) {
					let n = i;
					// eslint-disable-next-line no-inner-declarations
					function fn (callback) {
						var migration = runMigration(path.join(config.directory, migrations[n]), config, function (err, data) {
							if (err) {
								console.log(`Migration: ${migrations[n]} failed`);
								throw err;
							}

							console.log(data);
							callback(null, data);
						});
					}

					migrationsArray.push(fn);
				}
			}
		}

		async.series(migrationsArray, cb);
	} else {
		throw new errors.InvalidType();
	}
}

module.exports.migrate = migrate;