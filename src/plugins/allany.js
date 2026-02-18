export default (type = 'ALL') => ({
  events: [],
  plugin(ctx, eventName, plugins) {
    function checkItem(item) {
      const [[pluginName, pattern]] = Object.entries(item);
      
        if (!(pluginName in plugins))
          return false;

        const {events = null, plugin: pluginHandler} = plugins[pluginName];

        if (events && (events?.length && !events.includes(eventName)))
          return false;
        
        const check = pluginHandler(ctx, eventName, plugins);

        
        if (typeof check !== 'function')
          return false;

        return check(pattern, () => true) === true;        
    }
    
    // [{text: "hello"}, {all: [{...}]}]
    return (items, handler) => {
      if (type === 'ALL' && items.every(checkItem))
        return handler(ctx, eventName);

      else if (type === 'ANY' && items.some(checkItem))
        return handler(ctx, eventName);
    }
  }
});


