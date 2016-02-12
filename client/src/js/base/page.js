import View from './view';


export default class Page extends View {
  getTitle() {
    throw new Error("Pages must implement getTitle()");
  }

  isDynamic() {
    return false;
  }
}
