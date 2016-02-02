import 'whatwg-fetch';

import TheatricsAPI from './core/api';
import Handler from './core/handler';
import MainView from './views/main';


const api = new TheatricsAPI('/api', window.fetch);
const handler = new Handler(api);
const mainView = new MainView;

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
  handler
    .handle(path)
    .then(view => {
      mainView.setPageView(view);
    })
    .catch(error => {
      console.log(error);
    });
}
