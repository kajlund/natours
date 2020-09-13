const consola = require('consola');

const app = require('./app');

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  consola.info(`App running on port ${PORT}`);
});
