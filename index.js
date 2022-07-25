const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const routes = require('./routes/routes')

dotenv.config()

const port  = process.env.PORT || 5000

const app = express();
const dburl = process.env.DB_URI

mongoose
    .connect(dburl)
    .then(() => {
        console.log('Connected to the Database successfully');
    })
    .catch( (err) => {
        console.log('Error connecting to database')
    });

// app.use(cors)
app.use(bodyParser.json())

app.use('', routes)

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})

module.exports = app