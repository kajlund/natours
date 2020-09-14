const consola = require('consola');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');

consola.info(`Running in "${app.get('env')}" environment`);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  consola.info(`App running on port ${PORT}`);
});
