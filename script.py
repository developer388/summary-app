import http.client
import json

employee_list = [
   {
      "name":"Abhishek",
      "salary":145000,
      "currency":"USD",
      "department":"Engineering",
      "sub_department":"Platform"
   },
   {
      "name":"Anurag",
      "salary":90000,
      "currency":"USD",
      "department":"Banking",
      "on_contract":True,
      "sub_department":"Loan"
   },
   {
      "name":"Himani",
      "salary":240000,
      "currency":"USD",
      "department":"Engineering",
      "sub_department":"Platform"
   },
   {
      "name":"Yatendra",
      "salary":30,
      "currency":"USD",
      "department":"Operations",
      "sub_department":"CustomerOnboarding"
   },
   {
      "name":"Ragini",
      "salary":30,
      "currency":"USD",
      "department":"Engineering",
      "sub_department":"Platform"
   },
   {
      "name":"Nikhil",
      "salary":110000,
      "currency":"USD",
      "on_contract":True,
      "department":"Engineering",
      "sub_department":"Platform"
   },
   {
      "name":"Guljit",
      "salary":30,
      "currency":"USD",
      "department":"Administration",
      "sub_department":"Agriculture"
   },
   {
      "name":"Himanshu",
      "salary":70000,
      "currency":"EUR",
      "department":"Operations",
      "sub_department":"CustomerOnboarding"
   },
   {
      "name":"Anupam",
      "salary":200000000,
      "currency":"INR",
      "department":"Engineering",
      "sub_department":"Platform"
   }
]

conn = http.client.HTTPConnection("localhost", 8080)

headers = {'Content-Type': 'application/json'}

user = {
  "username":"administrator",
  "password":"admin12345"
}

new_user_created = False

auth_token = False

def createFirstUser():
  print('Create user in DB...')
  conn.request("POST", "/api/user", json.dumps(user), headers)
  res = conn.getresponse()
  data = res.read()
  response = json.loads(data.decode("utf-8"))  
  if response.get('success'):
    print('User created successfully...')
    print('User: ', user)
    return True
  else:    
    return False



def fetchAuthToken():    
  conn.request("POST", "/api/user/login", json.dumps(user), headers)
  res = conn.getresponse()
  data = res.read()  
  response = json.loads(data.decode("utf-8"))

  print('Auth token fetched successfully :',response.get('token'))
  
  if response.get('success'):
    return response.get('token')
  else:
    print('Error occured while fetching user token', response)
    return False


new_user_created = createFirstUser()

if new_user_created:  
  auth_token = fetchAuthToken()

  headers['Authorization'] = auth_token

  if auth_token:
    for employee in employee_list:
      conn.request("POST", "/api/employee", json.dumps(employee), headers)
      res = conn.getresponse()
      data = res.read()
      response = json.loads(data.decode("utf-8"))
      if response.get('success'):
        print('Employee creation success...')
      else:
        print('Error creation failed, error', response)      
  print('Scrip completed')
else:
  print('Skip scrip execution, old user')



