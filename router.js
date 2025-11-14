// router.js - tiny hash based router
const Router = (function(){
  const routes = [];

  function on(hashPattern, handler){
    routes.push({ pattern: hashPattern, handler });
  }

  function matchRoute(hash){
    for(const r of routes){
      const m = hash.match(r.pattern);
      if(m) return { handler: r.handler, match: m };
    }
    return null;
  }

  function start(){
    function run(){
      const raw = location.hash.slice(1) || '/';
      const matched = matchRoute(raw);
      if(matched) matched.handler(matched.match);
      else console.warn('no route', raw);
    }
    window.addEventListener('hashchange', run);
    run();
  }

  return { on, start };
})();
