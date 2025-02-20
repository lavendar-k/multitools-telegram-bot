import 'colors';
import express from 'express';
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

const app = express();

app.get('/', (req, res) => res.send('Express on Vercel'));

app.listen(3000, () => console.log('Server ready on port 3000.'));

startBot();
