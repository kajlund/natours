const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const xssClean = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/ctrlErrors');

const app = express();

// Middleware
// Set security HTTP Headers
app.use(helmet());

// Development Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit API requests from same IP
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000, // per hour
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit input data size

// Data sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xssClean());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serve static files from public folder
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
