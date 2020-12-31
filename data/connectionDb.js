const mysql = require('mysql2')

const HOST = process.env.SQL_HOST
const USER = process.env.SQL_USER
const PASSWORD = process.env.SQL_PASSWORD
const DATABASE = process.env.SQL_DATABASE

const databaseConnectionInfo = {
    host: HOST,
    user: USER,
    password: PASSWORD
}
console.log('databaseConnectionInfo:')
console.log(databaseConnectionInfo)

const databasePool = mysql.createPool(databaseConnectionInfo)
const databasePoolPromise = databasePool.promise()

const tasteBudsConnectionInfo = {
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE
}
console.log('tasteBudsConnectionInfo:')
console.log(tasteBudsConnectionInfo)

const tasteBudsPool = mysql.createPool(tasteBudsConnectionInfo)
const tasteBudsPoolPromise = tasteBudsPool.promise()

module.exports = { databasePoolPromise, tasteBudsPoolPromise }