# Telegrambo Extension Name

Description of Telegrambo Extension

<br>

## Installation

<br>You can install Telegrambo using npm:

```
npm install telegrambo-extension-name
```
<br>

## Usage
<br>

```js
// bot.js

import telegrambo from 'telegrambo';
import extensionName  from 'telegrambo-extension-name';

const bot = telegrambo(process.env.YOU_BOT_TOKEN);

// Initialize new method for bot
bot.extensionName = extensionName;

// And for event context
bot.event.extensionName = extensionName
```

**Returns:**

- `function`: A new method that get arguments:
  - `firstArgument` (string, required) - Description of firstArgument.
  - `secondArgument` (object, optional) - Description of secondArgument.

<br>Example of using in bot:

```js
bot.extensionName(`firstArgument`, {
  secondArgument: true
});
```

<br>Or using in event context:

```js
bot.on('message', (event) => {
  event.extensionName(firstArgument);
});
```