const { databasePoolPromise, tasteBudsPoolPromise } = require('./connectionDb')
const { createUser } = require('./tasteBudsDb')
const {PASSWORD} = require('../security/secret')

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
    await createUserTable()
    await createTokenTable()
    await createRecipeTable()
    await createIngredientTable()
    await createInstructionTable()
    await createImageTable()
}

const createTable = async function (tableName, createTableQuery) {
    try {
        await tasteBudsPoolPromise.query(createTableQuery)
        console.log(`Table ${tableName} created!`)
    } catch (error) {
        console.log(`Table ${tableName} creation failed!`)
        console.log(`error = ${error}!`)
    }
}

const deleteTables = async function () {
    await deleteTable('image')
    await deleteTable('instruction')
    await deleteTable('ingredient')
    await deleteTable('recipe')
    await deleteTable('token')
    await deleteTable('user')
}

const deleteTable = async function (tableName) {
    try {
        const deleteQuery = `DROP TABLE ${tableName}`
        await tasteBudsPoolPromise.query(deleteQuery)
        console.log(`Table ${tableName} deleted`)
    } catch (error) {
        console.log(`Table ${tableName} deletion failed`)
    }
}

const createRecipeTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS recipe (
        id int primary key auto_increment,
        title varchar(100) NOT NULL,
        description varchar(1000) NOT NULL,
        time int NOT NULL,
        portions int NOT NULL,
        isvegan boolean NOT NULL,
        isvegetarian boolean NOT NULL,
        isglutenfree boolean NOT NULL,
        islactosefree boolean NOT NULL,
        userid int NOT NULL,
        CONSTRAINT fk_recipe_user FOREIGN KEY (userid) REFERENCES user(id) ON DELETE CASCADE 
    )`

    await createTable('recipe', createTableQuery)

}

const createIngredientTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ingredient (
        id int primary key auto_increment,
        ordernumber int NOT NULL,
        name varchar(50) NOT NULL,
        unit varchar(10) NOT NULL,
        amount int NOT NULL,
        recipeid int NOT NULL,
        CONSTRAINT fk_ingredient_recipe FOREIGN KEY (recipeid) REFERENCES recipe(id) ON DELETE CASCADE 
    )`
    await createTable('ingredient', createTableQuery)
}

const createInstructionTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS instruction (
        id int primary key auto_increment,
        ordernumber int NOT NULL,
        description varchar(1000) NOT NULL,
        recipeid int NOT NULL,
        CONSTRAINT fk_instruction_recipe FOREIGN KEY (recipeid) REFERENCES recipe(id) ON DELETE CASCADE 
    )`
    await createTable('instruction', createTableQuery)
}

const createImageTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS image (
        id int primary key auto_increment,
        ordernumber int NOT NULL,
        name varchar(100) NOT NULL,
        recipeid int NOT NULL,
        CONSTRAINT fk_image_recipe FOREIGN KEY (recipeid) REFERENCES recipe(id) ON DELETE CASCADE 
    )`
    await createTable('image', createTableQuery)
}

/*---------- USER ACCOUNT TABLES ---------*/

const createUserTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS user (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(32) NOT NULL UNIQUE,
        password VARCHAR(256) NOT NULL,
        email VARCHAR(64) NOT NULL UNIQUE
    )`
    await createTable('user', createTableQuery)
}

const createTokenTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS token (
        id INT PRIMARY KEY AUTO_INCREMENT,
        access VARCHAR(32) NOT NULL,
        token VARCHAR(256) NOT NULL,
        userid INT NOT NULL,
        CONSTRAINT fk_token_user FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE 
    )`
    await createTable('token', createTableQuery)
}

/*------------ setupData() ------------*/

const setupData = async function () {
    try {
        const username = 'admin'
        const email = 'admin@tastbudsdelight.com'

        const user = await createUser(username, PASSWORD, email)
        console.log(user)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    createDatabase,
    deleteDatabase,
    createTables,
    deleteTables,
    setupData,
}