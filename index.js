const { getIpAddress } = require('./utils')
const ipAddress = getIpAddress()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const PORT = 8000

const { tasteBudsRouter } = require('./routers/tasteBudsRouter')
const { adminDbRouter } = require('./routers/adminDbRouter')


app.get('/', (request, response) => {
    console.log(`TasteBudsBack: REST API on IP address ${ipAddress} - GET / ...`)
    response.send(`TasteBudsBack: REST API on IP address ${ipAddress} - GET /`)
})

app.use('/admindb', adminDbRouter)
app.use('/tastebuds', tasteBudsRouter)

app.listen(PORT, () => {
    console.log(`TasteBuds backend, running on address ${ipAddress}, listning on port ${PORT}`)
})