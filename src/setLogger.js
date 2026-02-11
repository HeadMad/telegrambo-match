
/**
 * Set a logger for the bot.
 * 
 * @param {Object} options - Options for the logger.
 * @param {number} options.chatId - The chat ID to send logs to.
 * @returns {(data: any, newChatId?: number) => void} - A function that sends logs to the bot.
 * 
 * The returned function takes two arguments: `data` and `newChatId`.
 * `data` is the data to be logged, and `newChatId` is the chat ID to send the logs to.
 * If `newChatId` is not provided, it defaults to the `chatId` provided in the options.
 */
export default ({ chatId }) => (bot) => {
  /**
   * Send logs to the bot.
   * 
   * @param {any} data - The data to be logged.
   * @param {number} [newChatId] - The chat ID to send logs to.
   */
  return (data, newChatId) => {
    bot.sendMessage({
      chat_id: newChatId ?? chatId,
      text: `<pre>${JSON.stringify(data, null, 2)}</pre>`,
      parse_mode: 'HTML'
    });
  };
};
