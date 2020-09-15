const consola = require('consola');
const mongoose = require('mongoose');

require('dotenv').config();

const Tour = require('../../models/tour');
const tours = require('./tours-simple.json');

const importData = async () => {
  try {
    consola.info(`Importing ${tours.length} Tours`);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    await Tour.create(tours);
    consola.info('Tours imported successfully');
    process.exit();
  } catch (err) {
    consola.error(err);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    await Tour.deleteMany({});
    consola.info('Tours deleted successfully');
    process.exit();
  } catch (err) {
    consola.error(err);
    process.exit(1);
  }
};

const cmd = process.argv[2];
if (cmd === '--import') {
  importData();
} else if (cmd === '--delete') {
  deleteData();
} else {
  consola.info('Process needs param --import or --delete');
}
