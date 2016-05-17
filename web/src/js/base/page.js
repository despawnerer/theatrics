import View from './view';


export default class Page extends View {
  getTitle() {
    throw new Error("Pages must implement getTitle()");
  }

  canTransitionFrom(other) {
    return false;
  }
}
