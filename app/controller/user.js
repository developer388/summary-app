const express = require('express')
const router = express.Router()
const model = require('../model/model')
const auth = require('../utils/auth')
const validation = require('../utils/validation')

router.use(auth.authenticationMiddleware)

router
.route('/user')
.get(async function(request, response){
	try {
		let result = await model.getUsers({})
	    response.send({'success': true, 'data': result, 'count': result.length})
	}
	catch(error) {
		console.log('[ERROR] Error while fetching user list\n', error)
   		response.status(500).send({'success': false, 'message': 'Service unavailable'})
   	}
   
})
.post(async function(request, response){
   	try {

   		// Schema validation
   		console.log('[INFO] Create new user\n', request.body)

		let validation_result = validation.validateForSchemaMatch(model.user_schema, request.body)

    	if (!validation_result.success) {
    		return response.status(400).send({'success': false, 'message': validation_result.error})
    	}

		// Check if user already exists with provided username
		let user = await model.getUserByUsername(request.body.username)

		if (user.length) {
			return response.status(400).send({'success': false, 'message': 'Username already in use'})
		}

		// Encrypt password string before storing in database
		request.body.password = await auth.generatePasswordHash(request.body.password)

		// Create user object in database
		let result = await model.createUser({"username": request.body.username, "password": request.body.password})
		
		// Return success response for user creation
		response.status(400).send({'success': true, 'data': result, 'count': result.length})
	}
	catch(error) {
		console.log('[ERROR] Error while user creation\n', error)
   		response.status(500).send({'success': false, 'message': 'Service unavailable'})
   	}
})

router
.route('/user/:id')
.get(async function(request, response){
	try {
		
		if (!request.params.id){
			return response.send({'success': false})
		}

		let result = await model.getUserById(request.params.id)
	    response.send({'success': true, 'data': result, 'count': result.length})
	}
	catch(error) {		 		   		
   		console.log('[ERROR] Error while fetching user by id\n', error)  
   		response.status(500).send({'success': false, 'message': 'Could not fetch user by provided user id'})
   	}
   
})
.delete(async function(request, response){
	try {

		if (!request.params.id){
			return response.send({'success': false})
		}

		let result = await model.deleteUser(request.params.id)
	    response.send({'success': true, 'data': result, 'count': result.length})
	}
	catch(error) {
   		console.log('[ERROR] Error occured while deleting user\n', error)
   		response.status(500).send({'success': false, 'message': 'Could not delete user by provided user id'})
   	}
})

router
.route('/user/login')
.post(async function(request, response){
	try {

		if ('username' in request.body === false || 'password' in request.body === false) {
			return response.send({'success': false, 'message' : 'insufficient arguments'})
		}

	    let user = await model.getUserPasswordByUsername(request.body.username)
	    
	    let password_hash

	    if (!user.length) {
	    	return response.send({'success': false, 'message' : 'user not found'})
	    }

	    password_hash = user[0].password

	    let valid = await auth.comparePasswordHash(request.body.password, password_hash)    

	    let login_response = {
	    	'success': valid,
	    	'message': (valid?'login success':'incorrect password')
	    }

	    if (valid) {
	    	let auth_token = auth.generateJwtToken({'username':request.body.username})
	    	login_response.token = auth_token
	    }

		response.send(login_response)
	}
	catch(error) {
		console.log('[ERROR] Error occured while user login\n', error)
   		response.status(500).send({'success': false, 'message': 'service unavailable'})
   	}
})

module.exports = router