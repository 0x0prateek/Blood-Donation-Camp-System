require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const campRoutes = require('./routes/camps');
const registrationRoutes = require('./routes/registrations');
const financeRoutes = require('./routes/finance');
const staffRoutes = require('./routes/staff');
const templateRoutes = require('./routes/templates');
const settingRoutes = require('./routes/settings');
const messageRoutes = require('./routes/messages');
const reportRoutes = require('./routes/reports');
const publicRoutes = require('./routes/public');
const bloodRequestRoutes = require('./routes/bloodRequests');

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// The root Railway image can serve the built SPA and API from one service.
const frontendDist = path.resolve(__dirname, '../public');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Last-resort error handler: never leak stack traces to the client.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (process.env.APP_DEBUG === 'true') {
    return res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
