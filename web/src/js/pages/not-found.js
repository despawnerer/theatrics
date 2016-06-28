import Page from '../base/page';

import template from '../../templates/pages/not-found.ejs';


export default class NotFoundPage extends Page {
  getHTML() {
    return this.app.renderTemplate(template);
  }

  getTitle() {
    return "404";
  }
}
