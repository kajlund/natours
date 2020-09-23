const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/ctrlErrors');

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000, // per hour
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   consola.info('Middleware says hi! 👋');
//   next();
// });

// Routes
app.use('/api/v1/tours', require('./routes/routesTour'));
app.use('/api/v1/users', require('./routes/routesUser'));

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `${req.originalUrl} not found`,
  // });
  next(new AppError('Some Error', 404));
});

app.use(globalErrorHandler);

module.exports = app;
