const express = require('express')
const { response } = require('express')

const tasteBudsRouter = express.Router()

tasteBudsRouter.get('/',(request,response) => {
    console.log('Running /tastebuds')
    response.send('Tastebuds router home ...')
})

module.exports = { tasteBudsRouter }