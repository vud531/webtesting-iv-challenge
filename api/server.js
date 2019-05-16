const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const configureRoutes = require('../config/routes.js');

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());

configureRoutes(server);

server.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json(err.message)
  })

module.exports = server;
