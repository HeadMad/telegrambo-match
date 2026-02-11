export default function (plugins) {
  if (!plugins)
    throw new Error('No match types provided');

  return function (bot) {
    const PATTERNS = new Map();
    const PLUGINS = new Map();

    for (let [pluginName, { events, plugin }] of Object.entries(plugins)) {
      const checker = createChecker();
      PATTERNS.set(pluginName, new Map());

      for (let eventName of events)
        getMap(PLUGINS, eventName).set(pluginName, plugin);
    }

    bot.on((ctx, eventName) => {
      if (!PLUGINS.has(eventName))
        return;

      try {
        for (const [pluginName, plugin] of PLUGINS.get(eventName)) {
          if (!PATTERNS.get(pluginName).size)
            continue;

          const checker = createChecker(PATTERNS.get(pluginName));
          plugin(ctx, checker, eventName);
        }

      } catch (err) {
        console.error(err);
      }
    });

    const self = new Proxy({}, {
      get: (_, pluginName) => {
        if (!PATTERNS.has(pluginName))
          throw new Error('Unknown match plugin: ' + plugin);

        return (pattern, handler) => {
          if (pattern.constructor.name === 'RegExp')
            getMap(PATTERNS.get(pluginName), 'regex').set(pattern, handler);
          else
            getMap(PATTERNS.get(pluginName), 'other').set(pattern, handler);

          return self;
        }
      }
    });

    return self;
  };
}

function getMap(parent, name) {
  if (!parent.has(name))
    parent.set(name, new Map());
  return parent.get(name);
}

function createChecker(patterns) {
  const self = function (value) {
    const filteredHandlers = [];
    if (patterns.has('other') && patterns.get('other').has(value))
      filteredHandlers.push(patterns.get('other').get(value));

    if (patterns.has('regex'))
      for (let [pattern, handler] of patterns.get('regex'))
        if (pattern.test(value))
          filteredHandlers.push(handler);


    return (...args) => {
      for (const handler of filteredHandlers)
        handler(...args);
    }
  };

  self.each = (handler) => {
    for (const [pattern, patternHandler] of [...patterns.get('other') ?? [], ...patterns.get('regex') ?? []])
      handler(pattern, patternHandler);
  };
  return self;
}
