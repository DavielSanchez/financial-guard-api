// server.js
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
  🛡️  Financial Guard API iniciada
  🚀 Puerto: ${PORT}
  📡 Entorno: ${process.env.NODE_ENV || 'development'}
  ---------------------------------------------------
  `);
});