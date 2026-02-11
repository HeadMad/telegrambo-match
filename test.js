import telegrambo from 'telegrambo';
import polling from 'telegrambo-polling';
import {setLogger} from './index.js';

const bot = telegrambo(process.env.BOT_TOKEN);

bot.polling = polling;
bot.polling({timeout: 20});


const options = {
  chatId: process.env.ADMIN_ID
};
bot.log = setLogger(options);

bot.log({
  type: 'info',
  message: 'Bot is running'
});

bot.on(async(ctx) => {
  const response = await ctx.someErrorMethod({
    text: 'hi'
  });

  if (!response.ok)
      throw new Error(response.description);

}).catch((err, ctx, eventName) => {
  bot.log({
    type: 'error',
    message: `Error in event ${eventName.toUpperCase()}`,
    error: err.message
  });
});

