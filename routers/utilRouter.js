const express = require('express')
const { response, request } = require('express')
const { createDatabase, deleteDatabase, createTables, deleteTables } = require('../data/utilDb')

const utilRouter = express.Router()

utilRouter.get('/', (request, response) => {
    console.log('Running /util')
    response.send('Util router home ...')
})

utilRouter.get('/createdb', (request, response) => {
    console.log('Running /createdb')
    try {
        createDatabase()
        response.send('Database created!')
    } catch (error) {
        response.status(400).send(error)
    }
})

utilRouter.get('/createtables', (request, response) => {
    console.log('Running /createtables')
    try {
        createTables()
        response.send('Tables created!')
    } catch (error) {
        response.status(400).send(error)
    }
})

utilRouter.get('/deletedb', (request, response) => {
    console.log('Running /deletedb')
    try {
        deleteDatabase()
        response.send('Database deleted!')
    } catch (error) {
        response.status(400).send(error)
    }
})

utilRouter.get('/deletetables', (request, response) => {
    console.log('Running /deletetables')
    try {
        deleteTables()
        response.send('Tables deleted!')
    } catch (error) {
        response.status(400).send(error)
    }
})

function runDbOperationWithTryCatch(response,message,dbOperationFn) {
    try {
        dbOperationFn()
        response.send(`${message}`)
    } catch (error) {
        response.status(400).send(error)
    }
}

utilRouter.get('/setupdb', (request, response) => {
    console.log('Running /setupdb')
    runDbOperationWithTryCatch(response,'Database setup successfully!', async () => {
        await createDatabase()
        await createTables()
    })
})

utilRouter.get('/teardowndb', (request, response) => {
    console.log('Running /teardowndb')
    runDbOperationWithTryCatch(response,'Database teardown successfully!', async () => {
        await deleteTables()
        await deleteDatabase()
    })
})

module.exports = { utilRouter }