const express = require('express')
const { response } = require('express')
const {createRecipe, getRecipes} = require('../data/tasteBudsDb')

const tasteBudsRouter = express.Router()

tasteBudsRouter.post('/', async (request,response) => {
    const body = request.body
    console.log(body)
    try {
        const result = await createRecipe(body)
        response.send({result})
    } catch(error) {
        response.status(400).send(error)
    }
})

tasteBudsRouter.get('/',(request,response) => {
    try {
        getRecipes()
        response.send('fetch list of recipes')
    } catch(error) {
        response.status(400).send(error)
    }
})



module.exports = { tasteBudsRouter }