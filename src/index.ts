import 'colors';
import { BotService } from './services/bot.service';

const startBot = () => {
  try {
    new BotService();
    console.info('Bot started successfully');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.info('Received SIGINT. Bot stopping...');
  process.exit();
});

process.on('SIGTERM', () => {
  console.info('Received SIGTERM. Bot stopping...');
  process.exit();
});

startBot();
