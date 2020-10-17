const mysql = require('mysql2')

const databaseConnectionInfo = {
    host: 'mysql',
    user: 'root',
    password: 'example'
}
const databasePool = mysql.createPool(databaseConnectionInfo)
const databasePoolPromise = databasePool.promise()

// TODO: Export for use in toRdbm module
const homeFinderConnectionInfo = {
    host: 'mysql',
    user: 'root',
    password: 'example',
    database: 'tastebuds'
}
const tastBudsPool = mysql.createPool(homeFinderConnectionInfo)
const tastBudsPoolPromise = tastBudsPool.promise()


const createDatabase = async function () {
    try {
        await databasePoolPromise.query("CREATE DATABASE IF NOT EXISTS tastebuds")
        console.log("Database tastebuds created")
    } catch (error) {
        console.log("Database tastebuds creation failed")
    }
}

const deleteDatabase = async function () {
    try {
        await databasePoolPromise.query("DROP DATABASE IF EXISTS tastebuds")
        console.log('Database tastebuds deleted')
    } catch (error) {
        console.log('Database tastebuds deletion failed')
    }
}

const createTables = async function () {
    await createRecipeTable()
    await createIngredientTable()

}

const createTable = async function (tableName, createTableQuery) {
    try {
        await tastBudsPoolPromise.query(createTableQuery)
        console.log(`Table ${tableName} created!`)
    } catch (error) {
        console.log(`Table ${tableName} creation failed!`)
    }
}

const createRecipeTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS recipe (
        id int primary key auto_increment,
        title varchar(100) NOT NULL,
        description varchar(1000) NOT NULL,
        time int NOT NULL,
        isvegan boolean NOT NULL,
        isvegetarian boolean NOT NULL,
        isglutenFree boolean NOT NULL,
        islactoseFree boolean NOT NULL
    )`
    await createTable('recipe', createTableQuery)
}

const createIngredientTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ingredient (
        id int primary key auto_increment,
        name varchar(50) NOT NULL,
        unit varchar(10) NOT NULL,
        amount int NOT NULL,
        recipeid int NOT NULL,
        CONSTRAINT fk_ingredient_recipe FOREIGN KEY (recipeid) REFERENCES recipe(id)
    )`
    await createTable('ingredient', createTableQuery)
}


const deleteTables = async function () {
    await deleteTable('ingredient')
    await deleteTable('recipe')
}

const deleteTable = async function (tableName) {
    try {
        const deleteQuery = `DROP TABLE ${tableName}`
        await tastBudsPoolPromise.query(deleteQuery)
        console.log(`Table ${tableName} deleted`)
    } catch (error) {
        console.log(`Table ${tableName} deletion failed`)
    }
}

module.exports = {
    databasePoolPromise,
    tastBudsPoolPromise,
    createDatabase,
    deleteDatabase,
    createTables,
    deleteTables
}