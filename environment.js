import dotenv from 'dotenv';

dotenv.config();

const env = {
  session_secret: process.env.SESSION_SECRET,
  pi_api_key: process.env.PI_API_KEY,
  platform_api_url: process.env.PLATFORM_API_URL || '',
  mongo_db: process.env.MONGO_URI,
  frontend_url: process.env.FRONTEND_URL,
  node_env: process.env.NODE_ENV || 'development',
};

export default env;
