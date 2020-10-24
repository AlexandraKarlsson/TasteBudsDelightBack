const express = require('express')
const { response } = require('express')
const {createRecipe, getRecipes} = require('../data/tasteBudsDb')

const tasteBudsRouter = express.Router()

tasteBudsRouter.post('/recipe', async (request,response) => {
    const body = request.body
    console.log(body)
    try {
        const insertInfo = await createRecipe(body)
        response.send({insertInfo})
    } catch(error) {
        response.status(400).send(error)
    }
})

tasteBudsRouter.get('/recipe', async (request,response) => {
    try {
        const recipes = await getRecipes()
        response.send({recipes})
    } catch(error) {
        response.status(400).send(error)
    }
})



module.exports = { tasteBudsRouter }