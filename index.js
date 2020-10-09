const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const PORT = 8000

app.get('/', (request, response) => {
    response.send('Hello tasty buddies');
})



app.listen(PORT, () => {
    console.log(`Server listning on port ${PORT}`)
})