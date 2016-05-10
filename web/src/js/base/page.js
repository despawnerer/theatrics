import View from './view';


export default class Page extends View {
  getTitle() {
    throw new Error("Pages must implement getTitle()");
  }

  getLocation() {
    return this.app.settings.get('location');
  }

  canTransitionFrom(other) {
    return false;
  }
}
