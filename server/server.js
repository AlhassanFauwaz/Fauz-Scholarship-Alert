import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import opportunityRoutes from './routes/opportunities.js';
import matchingRoutes from './routes/matching.js';
import savedOpportunityRoutes from './routes/savedOpportunities.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import feedbackRoutes from './routes/feedback.js';
import subscriptionRoutes from './routes/subscriptions.js';
import { startDeadlineScheduler } from './jobs/deadlineScheduler.js';


connectDB();

connectDB().then(() => {
  startDeadlineScheduler();
});
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('SOAS API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/saved-opportunities', savedOpportunityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/subscriptions', subscriptionRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)});