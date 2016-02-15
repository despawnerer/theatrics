import Page from '../base/page';

import template from '../../templates/not-found.ejs';


export default class NotFoundPage extends Page {
  getHTML() {
    return template();
  }

  getTitle() {
    return "404";
  }
}
