const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const missing = ['MONGO_URI', 'JWT_SECRET'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing required env vars: ' + missing.join(', '));
  console.error('Copy .env.example to .env and fill in the values');
  process.exit(1);
}

const connectDB = require('./config/db');
connectDB();

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000',' https://sports-j348.vercel.app'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, _res, next) => {
  console.log(req.method + ' ' + req.path);
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/search', require('./routes/search'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'SportsMatch API is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = parseInt(process.env.PORT, 10) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('SportsMatch backend running on http://localhost:' + PORT);
  console.log('Health: http://localhost:' + PORT + '/api/health');
});

module.exports = app;
