const mysql = require('mysql2')

const databaseConnectionInfo = {
    host: 'mysql',
    user: 'root',
    password: 'example'
}
const databasePool = mysql.createPool(databaseConnectionInfo)
const databasePoolPromise = databasePool.promise()

const tasteBudsConnectionInfo = {
    host: 'mysql',
    user: 'root',
    password: 'example',
    database: 'tastebuds'
}
const tasteBudsPool = mysql.createPool(tasteBudsConnectionInfo)
const tasteBudsPoolPromise = tasteBudsPool.promise()

module.exports = { databasePoolPromise, tasteBudsPoolPromise }