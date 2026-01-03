require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀  IFITB MULTIDOMAIN Platform                             ║
║                                                              ║
║   Server running at: http://localhost:${PORT}                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
