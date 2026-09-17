require('dotenv').config();
const express = require('express');
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

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
