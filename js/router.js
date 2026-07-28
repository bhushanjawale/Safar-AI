class Router {
  constructor() {
    this.routes = {};
    window.addEventListener('popstate', () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path, replace = false) {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    if (this.routes[path]) {
      this.routes[path]();
      return;
    }

    for (const route in this.routes) {
      const routeParts = route.split('/').filter(Boolean);
      if (routeParts.length === pathParts.length) {
        const params = {};
        let match = true;
        
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            params[routeParts[i].slice(1)] = pathParts[i];
          } else if (routeParts[i] !== pathParts[i]) {
            match = false;
            break;
          }
        }
        
        if (match) {
          this.routes[route](params);
          return;
        }
      }
    }

    if (this.routes['*']) {
      this.routes['*']();
    }
  }

  getCurrentPath() {
    return window.location.pathname;
  }
}

export const router = new Router();
