const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// this will set x-forwarded-proto req header properly when using 
// heroku, due to proxies. This can be seen in the 
// createAndSendToken in authController
app.enable('trust proxy');

// Global middlewares

// Set Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
// we allow 100 requests by the same ip per hour
const limiter = rateLimit({
  // adapt to max to the application depending on how it is used.
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour...'
});
app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(
  express.json({
    // limit how much data can be sent in body
    limit: '10kb'
  })
);

// Data sanitization against NoSQL query injection.
// mongoSanitize will check request body, query string and params, and filter characters
// like dollar signs and dots. This stops mongo operators from working
app.use(mongoSanitize());

// Data sanitization against XSS attacks.
// This cleans the input from any malicious html code with javascript
// attached to it. If we inject this html into our html site,
// serious damage can happen. xss() converts html symbols to prevent this.
// Mongoose itself already provides good protection against xss because of
// the schema - so ensure that the validation is added on schema.
// This should protect from xss atleast on server-side
app.use(xss());

// Preventing parameter pollution - we whitelist parameters we allow duplicates of
app.use(
  hpp({
    // as the application grows, it might be better getting fieldnames
    // from the models
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
// Serving static files
app.use(express.static(`${__dirname}/public`));

// middleware just for testing stuff
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// mount routes, they essentially become middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// global error handling - includes handling errors such as /api/v1/rkrk
app.all('*', (req, res, next) => {
  // If any variable is passed into next, then it will skip all
  // middlewares and go straight to error.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
