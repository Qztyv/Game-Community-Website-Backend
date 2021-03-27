const mongoose = require('mongoose');
const dotenv = require('dotenv');

// We really need to crash the application after uncaught exceptions
// as the node application is in an unclean state. (its optional for unhandled rejections)
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  // Synchronous code bug, dont have to wait to close
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is now running on port ${port}...`);
});

// Handling unhandled rejections
// Event handlers - can subscribe to the 'process' event, so whenever it happens
// we can intercept it
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  // Below gives time for server to finish request etc, before finally stopping
  server.close(() => {
    process.exit(1);
  });
});
