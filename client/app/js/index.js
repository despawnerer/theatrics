import polyfill from 'babelify/polyfill';
import App from './core/app';

document.addEventListener('DOMContentLoaded', (event) => {
  const app = new App();
  app.run();
});
