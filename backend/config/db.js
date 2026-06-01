const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌  MONGO_URI is not set in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`🗄️   MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\n❌  MongoDB connection failed!');
    console.error('   Error:', error.message);
    if (uri.includes('localhost')) {
      console.error('   👉  Make sure MongoDB is running:');
      console.error('       Windows : net start MongoDB');
      console.error('       Mac     : brew services start mongodb-community');
      console.error('       Linux   : sudo systemctl start mongod');
      console.error('   👉  Or use a free Atlas cloud DB instead:');
      console.error('       https://www.mongodb.com/atlas\n');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
