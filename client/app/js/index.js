import 'core-js/es6/promise';
import App from './core/app';

document.addEventListener('DOMContentLoaded', (event) => {
  const app = new App();
  app.run();
});
