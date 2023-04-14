const express = require('express')
const router = express.Router()
const model = require('../model/model')
const auth = require('../utils/auth')
const validation = require('../utils/validation')

router.use(auth.authenticationMiddleware)

router
.route('/employee')
.get(async function(request, response){
	try {
		
		const query = {
			aggregation: false,
			aggregation_type:{},
			match: {},
			group:{},
			object: []
		}

		const api_response = {}
		
		if ((request.query) && ('on_contract' in request.query)) {
			query.match.on_contract = true
			query.aggregation = true
		}

		if ((request.query) && ('department' in request.query)) {
			query.match.department = request.query.department
			query.aggregation = true
		}

		if ((request.query) && ('sub_department' in request.query)) {
			query.match.sub_department = request.query.sub_department
			query.aggregation = true
		}


		if ((request.query) && ('salary' in request.query === true)) {
		    
			if (!['max','min','avg','mean'].includes(request.query.salary)) {
				return response.status(400).send({'success': false, 'message': `Aggregation not supported for ${request.query.salary}(salary) function`})
			}

			request.query.salary = (request.query.salary === 'mean')? 'avg': request.query.salary
			query.aggregation_type = request.query.salary
			const aggregation_object = {}
			
			query.group._id = null
			aggregation_object['$'+query.aggregation_type] = "$salary"
			query.group.salary = aggregation_object
			query.aggregation = true
		}

		if (Object.keys(query.match).length) {
			query.object.push({'$match': query.match})
		}

		if (Object.keys(query.group).length) {
			query.object.push({'$group': query.group})
		}

		const result = await model.getEmployee(query)

		api_response.success = true
		api_response.data = result
		api_response.count = result.length

		if (Object.keys(query.match).length) {
			api_response.filter = query.match
		}

		if (Object.keys(query.aggregation_type).length) {
			api_response.aggregation = query.aggregation_type
		}
		
   	    return response.send(api_response)
   	}
   	catch(error) {
   		console.log('[ERROR] Error occured while fetching employee list\n', error)
   		return response.status(500).send({'success': false, 'message': 'Service unavailable'})
   	}
})
.post(async function(request, response){
    try {	
		
		console.log('[INFO] Create new employee\n', request.body)

		// Schema validation
    	let validation_result = validation.validateForSchemaMatch(model.employee_schema, request.body)

    	if (!validation_result.success) {
    		return response.status(400).send({'success': false, 'message': validation_result.error})
    	}

    	// Store in database
		let result = await model.createEmployee(request.body)

		// Return success response
		return response.send({'success': true, 'data': result, 'count': result.length})
	}
	catch (error) {
		console.log('[ERROR] Error occured while creating new user \n', error)
		response.status(500).send({'success': false, 'message': 'Error occured while employee creation'})
	}
})


router
.route('/employee/department')
.get(async function(request, response){
	try {		
		const result = await model.getEmployeeDepartments()
   	    return response.send({'success': true, 'data': result, 'count': result.length})
   	}
   	catch(error) {
   		console.log('[ERROR] Error occured while fetching employee list\n', error)
   		return response.status(500).send({'success': false, 'message': 'Service unavailable'})
   	}
})

router
.route('/employee/department/:department')
.get(async function(request, response){
	try {
		
		const query = {
			aggregation: true,
			aggregation_type:{},
			match: {'department': ''},
			group:{},
			object: []
		}

		const api_response = {}
		
		if (request.params.department) {
			query.match.department = request.params.department
		}

		if ((request.query) && ('sub_department' in request.query)) {
			query.match.sub_department = request.query.sub_department
		}

		if ((request.query) && ('on_contract' in request.query)) {
			query.match.on_contract = true
		}

		if ((request.query) && ('salary' in request.query === true)) {
		    
			if (!['max','min','avg','mean'].includes(request.query.salary)) {
				return response.status(400).send({'success': false, 'message': `Aggregation not supported for ${request.query.salary}(salary) function`})
			}

			request.query.salary = (request.query.salary === 'mean')? 'avg': request.query.salary
		    query.aggregation_type = request.query.salary
			const aggregation_object = {}
			
			query.group._id = "$department"
			aggregation_object['$'+query.aggregation_type] = "$salary"
			query.group.salary = aggregation_object

			if (request.query.sub_department) {
				query.group._id = "$sub_department"
				delete query.match.sub_department
			}

			query.aggregation = true
		}
		
		if (Object.keys(query.match).length && Object.keys(query.group).length === 0) {
			query.object.push({'$match': query.match})
		}

		if (Object.keys(query.group).length) {
			query.object.push({'$group': query.group})
		}

		const result = await model.getEmployee(query)

		api_response.success = true
		api_response.data = result
		api_response.count = result.length

		if (Object.keys(query.match).length) {
			api_response.filter = query.match
		}

		if (Object.keys(query.aggregation_type).length) {
			api_response.aggregation = query.aggregation_type
		}
		
   	    return response.send(api_response)
   	}
   	catch(error) {
   		console.log('[ERROR] Error occured while fetching employee list\n', error)
   		return response.status(500).send({'success': false, 'message': 'Service unavailable'})
   	}
})

router
.route('/employee/:id')
.get(async function(request, response){
	try {	
		let result = await model.getEmployeeById(request.params.id)
    	return response.send({'success': true, 'data': result, 'count': result.length})
    }
    catch (error) {
    	console.log('[ERROR] Error while fetching employee by id\n', error)
		response.status(500).send({'success': false, 'message': 'Could not fetch employee by provided employee id'})
    }
   
})
.delete(async function(request, response){
	try {
		if (!request.params.id){
			return response.send({'success': false})
		}

		console.log('delete ', request.params.id)

		let result = await model.deleteEmployeeById(request.params.id)
	    return response.send({'success': true, 'data': result, 'count': result.length})
	}
	catch (error) {
		console.log('[ERROR] Error while employee deletion\n', error)
		response.status(500).send({'success': false, 'message': 'Could not delete employee by provided employee id'})
	}
})

module.exports = router