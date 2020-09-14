const express = require('express');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   consola.info('Middleware says hi! 👋');
//   next();
// });

// Routes
app.use('/api/v1/tours', require('./routes/routesTour'));
app.use('/api/v1/users', require('./routes/routesUser'));

module.exports = app;
