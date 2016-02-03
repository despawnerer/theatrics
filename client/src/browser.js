import 'whatwg-fetch';

import TheatricsAPI from './core/api';
import Resolver from './core/resolver';
import Router from './core/router';
import Context from './core/context';

import MainView from './views/main';

const context = new Context({
  api: new TheatricsAPI('/api', window.fetch),
  resolver: new Resolver,
})

const router = new Router(context);

const mainView = new MainView(context);
mainView.mount();

history.replaceState(
  window.location.pathname,
  document.title,
  window.location.pathname
);


window.addEventListener('popstate', event => {
  if (event.state === null) {
    return;
  }

  handlePath(window.location.pathname);
});


document.addEventListener('click', event => {
  const isLeftClick = event.button == 0;
  const isModified = event.ctrlKey || event.shiftKey || event.metaKey;
  if (!isLeftClick || isModified) {
    return;
  }

  const element = event.target;
  const isLink = element.tagName.toLowerCase() == 'a';
  const isLocal = element.origin == window.location.origin;
  if (!isLink || !isLocal) {
    return;
  }

  event.preventDefault();

  const path = element.pathname;
  history.pushState(path, null, path);
  handlePath(path);
});


function handlePath(path) {
  router
    .handle(path)
    .then(page => {
      mainView.setPage(page);
    })
    .catch(error => {
      console.log(error);
    });
}
