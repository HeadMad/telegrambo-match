export { default } from './src/setMatch.js';
export { default as text } from './src/plugins/text.js';
export { default as allany } from './src/plugins/allany.js';
export { default as command } from './src/plugins/command.js';
export { default as entity } from './src/plugins/entity.js';
export { default as chat } from './src/plugins/chat.js';
export { default as similarity } from './src/plugins/similarity.js';
export { default as media } from './src/plugins/media.js';
export { default as callbackQuery } from './src/plugins/callbackQuery.js';
export { default as mention } from './src/plugins/mention.js';
export { default as hashtag } from './src/plugins/hashtag.js';
export { default as chatMember } from './src/plugins/chatMember.js';

import allanyFactory from './src/plugins/allany.js';
export const all = allanyFactory('ALL');
export const any = allanyFactory('ANY');