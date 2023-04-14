const mongodb = require('mongodb')
const mongo_client =  mongodb.MongoClient

const DATABASE_CONNECTION_STRING = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`

const client = new mongo_client(DATABASE_CONNECTION_STRING)

async function getDatabaseConnection(){
  await client.connect()
  const db = client.db(process.env.MONGODB_DATABASE)  
  return {
    'connection': db
  }
}

module.exports = getDatabaseConnection()
