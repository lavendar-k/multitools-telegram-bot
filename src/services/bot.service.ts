import TelegramBot from 'node-telegram-bot-api';
import { PhoneService } from './phone.service';
import config from '../config';

export class BotService {
  private bot: TelegramBot;
  private phoneService: PhoneService;

  constructor() {
    this.bot = new TelegramBot(config.telegramToken, { polling: true });
    this.phoneService = new PhoneService();
    this.initializeBot();
  }

  private initializeBot(): void {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage =
        '👋 Welcome to the Enhanced Phone Number Detector Bot!\n\n' +
        'I can recognize phone numbers in various formats:\n' +
        '• International format: +1 234 567 8900\n' +
        '• National format: (234) 567-8900\n' +
        '• Numbers with spaces, dashes or dots\n' +
        '• Numbers starting with 00 or 0\n\n' +
        'Available commands:\n' +
        '/start - Show this welcome message\n' +
        '/help - Show detailed examples and help\n' +
        '/formats - Show accepted number formats\n' +
        '/phone <number> - Analyze a phone number';

      this.bot.sendMessage(chatId, welcomeMessage);
    });

    // Handle /help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      const helpMessage =
        '📱 How to use this bot:\n\n' +
        'Send me any phone number and I will:\n' +
        '• Detect the country\n' +
        '• Validate the number\n' +
        '• Show local and international formats\n' +
        '• Identify the number type (mobile, landline, etc.)\n\n' +
        'Example formats I understand:\n' +
        '+1 234 567 8900 (International)\n' +
        '00 44 7911 123456 (International with 00)\n' +
        '(03) 9123 4567 (Australian)\n' +
        '01234 567890 (UK)\n' +
        '234-567-8900 (US/Canada)\n\n' +
        'Use /formats for more format examples';

      this.bot.sendMessage(chatId, helpMessage);
    });

    // Handle /formats command
    this.bot.onText(/\/formats/, (msg) => {
      const chatId = msg.chat.id;
      const formatsMessage =
        '📞 Accepted Phone Number Formats:\n\n' +
        '1. International Format:\n' +
        '   • +1 234 567 8900\n' +
        '   • 001 234 567 8900\n' +
        '   • +44.7911.123456\n\n' +
        '2. National Format:\n' +
        '   • (234) 567-8900\n' +
        '   • 234.567.8900\n' +
        '   • 2345678900\n\n' +
        '3. Special Formats:\n' +
        '   • 00441234567890\n' +
        '   • 01234 567890 (UK)\n' +
        '   • 0412 345 678 (AU)\n\n' +
        'The bot will try to detect the country automatically!';

      this.bot.sendMessage(chatId, formatsMessage);
    });

    // Handle /phone command
    this.bot.onText(/\/phone(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const phoneNumber = match?.[1]?.trim();

      if (!phoneNumber) {
        await this.bot.sendMessage(
          chatId,
          '📱 Please provide a phone number after the command.\n' +
            'Example: /phone +1 234 567 8900\n\n' +
            'Type /formats to see accepted number formats.'
        );
        return;
      }

      await this.processPhoneNumber(chatId, phoneNumber);
    });

    // Handle phone numbers (any message that's not a command)
    this.bot.on('message', async (msg) => {
      if (!msg.text || msg.text.startsWith('/')) {
        return;
      }

      await this.processPhoneNumber(msg.chat.id, msg.text.trim());
    });

    // Error handling
    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error);
    });

    this.bot.on('error', (error) => {
      console.error('Bot error:', error);
    });

    console.info('Bot initialized successfully');
  }

  private async processPhoneNumber(chatId: number, phoneNumber: string): Promise<void> {
    try {
      // Send "typing" action while processing
      await this.bot.sendChatAction(chatId, 'typing');

      if (!this.phoneService.isValidPhoneNumber(phoneNumber)) {
        const errorMessage =
          "❌ This doesn't seem to be a valid phone number.\n\n" +
          'Try these formats:\n' +
          '• Add country code: +1, +44, etc.\n' +
          '• Remove special characters\n' +
          '• Check the number length\n\n' +
          'Type /formats to see all accepted formats.';

        await this.bot.sendMessage(chatId, errorMessage);
        return;
      }

      const phoneInfo = this.phoneService.getPhoneInfo(phoneNumber);

      const response =
        `📱 Phone Number Analysis:\n\n` +
        `🌍 Country: ${phoneInfo.country}\n` +
        `🔢 Country Code: ${phoneInfo.countryCode}\n` +
        `✨ Type: ${phoneInfo.type}\n` +
        `📞 Local Format: ${phoneInfo.nationalFormat}\n` +
        `🌐 International: ${phoneInfo.internationalFormat}\n` +
        `✅ Validation: ${phoneInfo.isValid ? 'Valid number' : 'Invalid number'}`;

      await this.bot.sendMessage(chatId, response);
    } catch (error) {
      console.error('Error processing message:', error);

      const errorMessage =
        '❌ Sorry, I had trouble processing that number.\n\n' +
        'Common issues:\n' +
        '• Missing country code\n' +
        '• Invalid format\n' +
        '• Unsupported region\n\n' +
        'Type /help to see example formats.';

      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  public stopBot(): void {
    this.bot.stopPolling();
  }
}
