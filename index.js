const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const PORT = 8000

const { tasteBudsRouter } = require('./routers/tasteBudsRouter')
const { utilRouter } = require('./routers/utilRouter')


app.get('/', (request, response) => {
    response.send('Hello tasty buddies');
})

app.use('/util',utilRouter)
app.use('/tastebuds',tasteBudsRouter)

app.listen(PORT, () => {
    console.log(`Server listning on port ${PORT}`)
})