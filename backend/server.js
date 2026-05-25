const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: frontendUrl }));
app.use('/auth', require('./routes/authRoutes'));
app.use('/player', require('./routes/playerRoutes'));

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
  console.log(`Login: http://localhost:${port}/auth/login`);
  console.log(`Frontend: ${frontendUrl}`);
});
