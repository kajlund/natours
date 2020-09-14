require('dotenv').config();

const consola = require('consola');
const mongoose = require('mongoose');

const app = require('./app');

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
    app.listen(PORT, () => {
      consola.info(`App running on port ${PORT}`);
    });
  } catch (err) {
    consola.log(err.message);
    process.exit(1);
  }
};

start();
