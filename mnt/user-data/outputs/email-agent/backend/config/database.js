const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/email-agent';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (err) {
    logger.error('❌ MongoDB connection failed', { error: err.message });
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
