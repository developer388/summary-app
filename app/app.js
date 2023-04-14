const express = require('express')
const app = express()
const port = 8080

const validation = require('./utils/validation')
const employee = require('./controller/employee')
const user = require('./controller/user')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(validation.requestParser)

app.use('/api', employee)
app.use('/api', user)
app.use('*', validation.incorrectURIorMethod)

app.listen(port, function(){ 
  console.log(`[INFO] Server started at ${port} port`)
})