const mongodb = require('mongodb')
const ObjectId = require('mongodb').ObjectID

const db = {
	client: require('../utils/db'),
	collection: null
}

const employee_schema = {
  name: { type: 'string', required: true, min_length: 2, max_length: 20, regex: new RegExp("^[a-zA-Z]+(([' ][a-zA-Z ])?[a-zA-Z]*)*$")},
  salary: { type: 'number', required: true, minimum_value: 0, maximum_value: 1000000000},
  currency: { type: 'string', required: true, enum_values: ['ALL','AFN', 'ARS', 'AWG', 'AUD', 'AZN', 'BSD', 'BBD', 'BYN', 'BZD', 'BMD', 'BOB', 'BAM', 'BWP', 'BGN', 'BRL', 'BND', 'KHR', 'CAD', 'KYD', 'CLP', 'CNY', 'COP', 'CRC', 'HRK', 'CUP', 'CZK', 'DKK', 'DOP', 'XCD', 'EGP', 'SVC', 'EUR', 'FKP', 'FJD', 'GHS', 'GIP', 'GTQ', 'GGP', 'GYD', 'HNL', 'HKD', 'HUF', 'ISK', 'INR', 'IDR', 'IRR', 'IMP', 'ILS', 'JMD', 'JPY', 'JEP', 'KZT', 'KPW', 'KRW', 'KGS', 'LAK', 'LBP', 'LRD', 'MKD', 'MYR', 'MUR', 'MXN', 'MNT', 'MNT', 'MZN', 'NAD', 'NPR', 'ANG', 'NZD', 'NIO', 'NGN', 'NOK', 'OMR', 'PKR', 'PAB', 'PYG', 'PEN', 'PHP', 'PLN', 'QAR', 'RON', 'RUB', 'SHP', 'SAR', 'RSD', 'SCR', 'SGD', 'SBD', 'SOS', 'KRW', 'ZAR', 'LKR', 'SEK', 'CHF', 'SRD', 'SYP', 'TWD', 'THB', 'TTD', 'TRY', 'TVD', 'UAH', 'AED', 'GBP', 'USD', 'UYU', 'UZS', 'VEF', 'VND', 'YER', 'ZWD']},
  department: { type: 'string', required: true, min_length: 2, max_length: 20, regex: new RegExp("^[a-zA-Z ]*$")},
  on_contract: { type: 'boolean', required: false},    
  sub_department: { type: 'string',required: true, min_length: 2, max_length: 20, regex: new RegExp("^[a-zA-Z ]*$")}
}

const user_schema = {
  username: { type: 'string', required: true, min_length: 5, max_length: 20, regex: new RegExp("^[A-Za-z][A-Za-z0-9]{1,19}$")},
  password: { type: 'string', required: true, min_length: 5, max_length: 20}  
}

async function initializeDatabaseConnection(){
	const database = await db.client
	const database_connection = database.connection	
	db.collection = function (collection_name) {
		return database_connection.collection(collection_name)
	}
	console.log('[INFO] Connection with database successfully established')
}

async function getEmployee(query) {
	try {	
		
		let result
		
		if (query.aggregation){
			result = await db.collection('employee').aggregate(query.object).toArray()
		}
		else {
			result = await db.collection('employee').find({}).toArray()
		}
	    return result
	}
	catch (exception) {
		throw new Error(exception)
	}
}

async function getEmployeeById(id) {
	try {
		const result = await db.collection('employee').find({'_id': new ObjectId(id)}).toArray()
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}

async function getEmployeeDepartments() {
	try {
		const result = await db.collection('employee').distinct('department')
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}



async function createEmployee(data) {
	try {
		const result = await db.collection('employee').insertOne(data)
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}

async function deleteEmployeeById(id) {
	try {
		const result = await db.collection('employee').deleteOne({'_id': new ObjectId(id)})
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}

async function getUsers(query) {
	try {
		const result = await db.collection('users').find(query).project({'password':0}).toArray()
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}

async function getUserById(id) {
	try {
		const result = await db.collection('users').find({'_id': new ObjectId(id)}).project({'password':0}).toArray()
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}

async function getUserByUsername(username) {
	try {
		const result = await db.collection('users').find({'username': username}).project({'password':0}).toArray()
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}

async function getUserPasswordByUsername(username) {
	try {
		const result = await db.collection('users').find({'username': username}).toArray()
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}

async function createUser(data) {
	try {
		const result = await db.collection('users').insertOne(data)
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}

async function deleteUser(id) {
	try {
		const result = await db.collection('users').deleteOne({'_id': new ObjectId(id)})
    	return result
    }
    catch (exception) {
    	throw new Error(exception)
    }
}

initializeDatabaseConnection()

module.exports = {
	employee_schema: employee_schema,
	user_schema: user_schema,
	getEmployee: getEmployee,
	getEmployeeById: getEmployeeById,
	getEmployeeDepartments: getEmployeeDepartments,
	createEmployee: createEmployee,
	deleteEmployeeById: deleteEmployeeById,
	getUsers: getUsers,
	getUserById: getUserById,
	getUserByUsername: getUserByUsername,
	getUserPasswordByUsername: getUserPasswordByUsername,
	createUser: createUser,
	deleteUser: deleteUser
}