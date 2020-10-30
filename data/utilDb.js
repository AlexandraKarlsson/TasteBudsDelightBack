const mysql = require('mysql2')
const {databasePoolPromise, tasteBudsPoolPromise} = require('./connectionDb')

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
    await createInstructionTable()
    await createImageTable()

}

const createTable = async function (tableName, createTableQuery) {
    try {
        await tasteBudsPoolPromise.query(createTableQuery)
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
        portions int NOT NULL,
        isvegan boolean NOT NULL,
        isvegetarian boolean NOT NULL,
        isglutenfree boolean NOT NULL,
        islactosefree boolean NOT NULL
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
        CONSTRAINT fk_ingredient_recipe FOREIGN KEY (recipeid) REFERENCES recipe(id)
    )`
    await createTable('ingredient', createTableQuery)
}

const createInstructionTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS instruction (
        id int primary key auto_increment,
        ordernumber int NOT NULL,
        description varchar(1000) NOT NULL,
        recipeid int NOT NULL,
        CONSTRAINT fk_instruction_recipe FOREIGN KEY (recipeid) REFERENCES recipe(id)
    )`
    await createTable('instruction', createTableQuery)
}

const createImageTable = async function () {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS image (
        id int primary key auto_increment,
        ordernumber int NOT NULL,
        name varchar(100) NOT NULL,
        recipeid int NOT NULL,
        CONSTRAINT fk_image_recipe FOREIGN KEY (recipeid) REFERENCES recipe(id)
    )`
    await createTable('image', createTableQuery)
}


const deleteTables = async function () {
    await deleteTable('image')
    await deleteTable('instruction')
    await deleteTable('ingredient')
    await deleteTable('recipe')
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

module.exports = {
    createDatabase,
    deleteDatabase,
    createTables,
    deleteTables
}