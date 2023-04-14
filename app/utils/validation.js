function requestParser(error, request, response, next){
  if (error) {
      return response.status(400).send({'success':false, 'message': 'Could not parse request payload'})    
  } 
  else {
    next()
  }
}

function incorrectURIorMethod(request, response){
    return response.status(400).send({'success':false, 'message': 'Incorrect API URI or method'})        
}

function validateForSchemaMatch(schema, data){
  
  const validation_result = {
    success: true,
    error: ''
  }

  if (!Object.keys(data).length) {
     validation_result.success = false
     validation_result.error = 'Empty payload passed'    
     return validation_result
  }
  
  for (let key in data) {
      if (!Object.keys(schema).includes(key)) {
        validation_result.success = false
        validation_result.error = `Invalid key ${key} passed`
        return validation_result
      }
  }

  for (let key in schema) {
    
    if ( (schema[key].required) && !(key in data) ) {
      validation_result.success = false
      validation_result.error = `${key} key missing`
      return validation_result
    }

    if ((schema[key].required) && (typeof data[key] !== schema[key].type)) {
      validation_result.success = false
      validation_result.error = `Value of key ${key} should be ${schema[key].type} type`
      return validation_result
    }
    
    if (typeof data[key] === 'string') {
        if (data[key].length < schema[key].min_length || data[key].length > schema[key].max_length) {
            validation_result.success = false
            validation_result.error = `Length of ${key} should be > ${schema[key].min_length-1} and < ${schema[key].max_length+1}`
            return validation_result
        }
        
        if (schema[key].enum_values && !schema[key].enum_values.includes(data[key])) {
            validation_result.success = false
            validation_result.error = `Value of ${key} should be in ${schema[key].enum_values.join(', ')}`
            return validation_result
        } 
        
        if (schema[key].regex && !schema[key].regex.test(data[key])) {
            validation_result.success = false
            validation_result.error = `Value of ${key} mush statify regular expression ${schema[key].regex}`
            return validation_result
        }
     }     
     
     if (typeof data[key] === 'number') {
        if (data[key] < schema[key].minimum_value || data[key] > schema[key].maximum_value) {
            validation_result.success = false
            validation_result.error = `Value of key ${key} should be > ${schema[key].minimum_value-1} and < ${schema[key].maximum_value+1}`
            return validation_result
        }
     } 
  }
  
  return validation_result    
}


module.exports = {
  requestParser: requestParser,
  incorrectURIorMethod: incorrectURIorMethod,
  validateForSchemaMatch: validateForSchemaMatch
}