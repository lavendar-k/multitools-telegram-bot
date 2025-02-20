import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

console.log(process.env.TELEGRAM_TOKEN);

const config: Config = {
  telegramToken: process.env.TELEGRAM_TOKEN || '',
  environment: process.env.NODE_ENV || 'development',
};

if (!config.telegramToken) {
  throw new Error('TELEGRAM_TOKEN is required');
}

export default config;
