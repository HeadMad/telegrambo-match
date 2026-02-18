import telegrambo from 'telegrambo';
import polling from 'telegrambo-polling';
import setMatch, {
  text,
  allany,
  command,
  entity,
  chat,
  similarity,
  callbackQuery
} from './index.js';

const bot = telegrambo(process.env.BOT_TOKEN);


bot.polling = polling;

const match = setMatch({
  text,
  all: allany('ALL'),
  any: allany('ANY'),
  chat,
  entity,
  command,
  callbackQuery,
  similarity: similarity({ threshold: 0.10, caseInsensitive: true })
})(bot);

match.similarity({ caseInsensitive: false , value: 'hello' }, (ctx, text, score) => {
  ctx.sendMessage({
    text: `Matched "hello" with ${(score * 100).toFixed(1)}% similarity`
  });
})
// .similarity('help me', (ctx, text, score) => {
//   ctx.sendMessage({
//     text: `Need help? Matched with ${(score * 100).toFixed(1)}% similarity`
//   });
// });

// match.command('/start', (ctx, ...values) => {
//   ctx.sendMessage({
//     text: 'Добро пожаловать! ' + values.join(', ')
//   });
// });

// match.text(/hello/i, (ctx, value) => {
//   ctx.sendMessage({
//     text: 'Привет, как дела?'
//   });
// });

// match.all([
//   {any: [{text: /hello/i}, {text: /hi/i}]},
//   {any: [{text: /павел/i}, {text: /виктор/i}]}
// ], (ctx) => {
//   ctx.sendMessage({text: 'ALL SUPPPER!'})
// });

// match.any([{text: /hello/i}, {text: /hi/i}], (ctx) => {
//   ctx.sendMessage({text: 'ANY SUPPPER!'})
// });

// match.chat(227295372, async (ctx, eventName) => {
//   await ctx.sendMessage({
//     text: eventName
//   });
// });


// match.text(/hi/, (ctx, value) => {
//   ctx.sendMessage({
//     text: 'Привет, как дела?!'
//   });
// })
// .text('btn', (ctx) => {
//   ctx.sendMessage({
//     text: 'Нажми кнопку',
//     reply_markup: {
//       inline_keyboard: [
//         [{ text: 'Кнопка 1', callback_data: 'btn1' + JSON.stringify(['hello', true, ctx.from.id]) }],
//         [{ text: 'Кнопка 2', callback_data: 'btn2 ' + JSON.stringify(['hi', false, ctx.chat.type]) }],
//         [{ text: 'мой ID', callback_data: 'myId' }]
//       ]
//     }
//   });
// })
// .callbackQuery('btn1', (ctx, ...params) => {
//   ctx.answerCallbackQuery({
//     text: 'Обрабатываем ответ 1'
//   });
//   ctx.sendMessage({
//     text: 'Вы нажали кнопку 1 ' + JSON.stringify(params)
//   });
// })
// .callbackQuery('btn2', (ctx, ...params) => {
//   ctx.answerCallbackQuery({
//     text: 'Обрабатываем ответ 2 '
//   });
//   ctx.sendMessage({
//     text: 'Вы нажали кнопку 2 ' + JSON.stringify(params)
//   });
// })
// .callbackQuery('myId', (ctx, id) => {
   
//   ctx.answerCallbackQuery({
//     text: `Ваш ID: ` + ctx.from.id,
//     parse_mode: 'HTML',
//     show_alert: true
//   });
// })


// match.entity('bot_command', (ctx, type, value) => {
//   ctx.sendMessage({
//     text: `Bot command: ${value}`
//   });
// })
// .entity('mention', (ctx, type, value) => {
//   ctx.sendMessage({
//     text: `Mentioned: ${value}`
//   });
// })
// .entity('hashtag', (ctx, type, value) => {
//   ctx.sendMessage({
//     text: `Hashtag: ${value}`
//   });
// });





bot.polling({ timeout: 20 });