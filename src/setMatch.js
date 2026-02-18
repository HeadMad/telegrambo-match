export default function (plugins) {
  if (!plugins)
    throw new Error('No match types provided');

  const pluginsProxy = new Proxy(plugins, { get: (target, key) => target[key] });

  return function (bot) {
    const PATTERNS = new Map();
    const PLUGINS = new Map();

    for (let [pluginName, { events = [null], plugin }] of Object.entries(plugins)) {
      PATTERNS.set(pluginName, new Map());
      if (!events || !events.length)
        getMap(PLUGINS, null).set(pluginName, plugin);

      for (let eventName of events)
        getMap(PLUGINS, eventName).set(pluginName, plugin);
    }

    bot.on((ctx, eventName) => {

      const runEvent = (eventTrigger) => {

        if (!PLUGINS.has(eventTrigger))
          return;
        for (let [pluginName, pluginHandler] of PLUGINS.get(eventTrigger)) {
          if (!PATTERNS.get(pluginName).size)
            continue;

          try {
            
            const check = pluginHandler(ctx, eventName, pluginsProxy); 
            if (typeof check !== 'function')
              continue;
            
            for (const [pattern, patternHandler] of PATTERNS.get(pluginName)){
              check(pattern, patternHandler);
            }

          } catch (err) {
            console.error(err);
          }
        }
      };

      runEvent(eventName);
      runEvent(null);
    });

    const self = new Proxy({}, {
      get: (_, pluginName) => {
        if (!PATTERNS.has(pluginName))
          throw new Error('Unknown match plugin: ' + plugin);

        return (pattern, handler) => {
          PATTERNS.get(pluginName).set(pattern, handler);
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