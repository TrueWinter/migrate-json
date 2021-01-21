function NotExistError(property) {
	var error = new Error();

	error.code = this.constructor.name;
	error.message = 'Property does not exist';

	if (property) {
		error.message += `. The property is: ${property}`;
	}

	return error;
}

function NotAString() {
	var error = new Error();

	error.code = this.constructor.name;
	error.message = 'Property value is not a string';

	return error;
}

function InvalidType(property) {
	var error = new Error();

	error.code = this.constructor.name;
	error.message = 'Property value has invalid type. Supported types: object, array, string, number, boolean, null';

	if (property) {
		error.message += `. The property is: ${property}`;
	}

	return error;
}

function IncompleteParameters() {
	var error = new Error();

	error.code = this.constructor.name;
	error.message = 'A required parameter is missing';

	return error;
}

function DirNotExists(dir) {
	var error = new Error();

	error.code = this.constructor.name;
	error.message = 'Directory does not exist';

	if (dir) {
		error.message += `. The directory is: ${dir}`;
	}

	return error;
}

function FileNotExists(file) {
	var error = new Error();

	error.code = this.constructor.name;
	error.message = 'File does not exist';

	if (file) {
		error.message += `. The file is: ${file}`;
	}

	return error;
}

module.exports.NotExistError = NotExistError;
module.exports.NotAString = NotAString;
module.exports.InvalidType = InvalidType;
module.exports.IncompleteParameters = IncompleteParameters;
module.exports.DirNotExists = DirNotExists;
module.exports.FileNotExists = FileNotExists;