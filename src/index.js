require('dotenv').config();
const express = require('express');
const errorHandler = require('./utils/errorHandler');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server draait op poort ${PORT}`);
    });
  } catch (error) {
    console.error('Server start mislukt:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;