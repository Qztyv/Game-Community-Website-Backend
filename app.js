const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const postVoteRouter = require('./routes/postVoteRoutes');
const commentRouter = require('./routes/commentRoutes');
const commentVoteRouter = require('./routes/commentVoteRoutes');
const followingRouter = require('./routes/followingRoutes');
const followersRouter = require('./routes/followersRoutes');

const app = express();

// this will set x-forwarded-proto req header properly when using
// heroku, due to proxies. This can be seen in the
// createAndSendToken in authController
app.enable('trust proxy');

// Global middlewares

// Using cors
//app.use(cors()); // this will add a few headers to the response

// Could make a deployed conditional here, so localhost requests arent
// allowed on deployed server - would be more secure
app.use(
  cors({
    origin: [
      'https://localhost:8080',
      'https://127.0.0.1:8080',
      'https://game-community-website-frontend.netlify.app'
    ],
    credentials: true
  })
);

// we need to enable non-simple requests such as put patch delete that trigger
// a preflight, we need to respond to preflight with allow origin
app.options('*', cors());

// Set Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
// we allow 100000 requests by the same ip per hour
const limiter = rateLimit({
  // adapt to max to the application depending on how it is used.
  max: 100000,
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

// parse cookies coming in
app.use(cookieParser());

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

// Preventing parameter pollution - we could whitelist parameters we allow duplicates of, if needed.
app.use(hpp());

// middleware just for testing stuff
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// mount routes, they essentially become middleware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/postVotes', postVoteRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/commentVotes', commentVoteRouter);
app.use('/api/v1/following', followingRouter);
app.use('/api/v1/followers', followersRouter);

// global error handling - includes handling errors such as /api/v1/rkrk
app.all('*', (req, res, next) => {
  // If any variable is passed into next, then it will skip all
  // middlewares and go straight to error.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
