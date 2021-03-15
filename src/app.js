require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./error-handler')
const { NODE_ENV } = require('./config');
const {CLIENT_ORIGIN} = require('./config');
const peopleRouter = require('./people/people-router')
const giftsRouter = require('./gifts/gifts-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors(
    {origin: CLIENT_ORIGIN}  
  )
)

app.use(peopleRouter)
app.use(giftsRouter)

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.use(errorHandler)

module.exports = app