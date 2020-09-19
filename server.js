require('dotenv').config();

const consola = require('consola');
const mongoose = require('mongoose');

const app = require('./app');
let server;

const start = async () => {
  try {
    consola.info(`Running app in "${app.get('env')}" environment`);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    consola.info('MongoDB is connected');

    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => {
      consola.info(`App running on port ${PORT}`);
    });
  } catch (err) {
    consola.error(err);
    process.exit(1);
  }
};

// Async catch-all error handler
process.on('unhandledRejection', (err) => {
  consola.error('UNHANDLED REJECTION');
  consola.error(err.name, err.message);
  if (server) {
    consola.error('Shutting down server and exiting');
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Sync catch-all error handler
process.on('uncaughtException', (err) => {
  consola.error('UNCAUGHT EXCEPTION');
  consola.error(err.name, err.message);
  process.exit(1);
});

start();
