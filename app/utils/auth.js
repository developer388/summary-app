const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_SECRET = '3secure_system88'

async function generatePasswordHash(password) {
	let hash = await bcrypt.hash(password, 5)
	return hash
}

async function comparePasswordHash(password, hash) {
	let result = await bcrypt.compare(password, hash)
	return result
}

function generateJwtToken(data) {
	let token = jwt.sign(data, JWT_SECRET, { expiresIn: '1h' })
	return token
}

function verifyJwtToken(token) {

	let result = {
		'isSuccess': false
	}
		
	try {
		let data = jwt.verify(token, '3secure_system88')
		result.isSuccess = true
		result.username = data.username
		return result
	}
	catch (exception) {
		if (exception.name === 'JsonWebTokenError') {			
			result.error = 'Auth token incorrect'
			return result
		}
		
		if (exception.name === 'TokenExpiredError') {
			result.error = 'Auth token expired'		
			return result
		}
		
		result.error='Auth error, please contact tech team'
		console.log('[ERROR] Auth error: ', exception)
		return result	
	}

}

function authenticationMiddleware(request, response, next){
	
	console.log(`[INFO] Request ${request.method} ${request.url} @ ${new Date().toLocaleString()} UTC`)
	
	// Bypass token validation for Login and Create user APIs
	if ((request.method === 'POST') && (request.url === '/user/login' || request.url === '/user')) {
		return next()
	}
	
	// Return 401 if auth token not passed
	if ('authorization' in request.headers === false) {
		return response.status(401).send({'success': false, 'error': 'auth token missing'})
	}

	// Validate auth token passed in headers
	let user_validation = verifyJwtToken(request.headers['authorization'])
	
	// Return error if auth token passed is incorrect or expired
	if (user_validation.isSuccess === false) {
		return response.status(401).send({'success': false, 'error': user_validation.error})
	}

	next()
}

module.exports = {
	generatePasswordHash: generatePasswordHash,
	comparePasswordHash: comparePasswordHash,
	generateJwtToken: generateJwtToken,
	verifyJwtToken: verifyJwtToken,
	authenticationMiddleware: authenticationMiddleware
}