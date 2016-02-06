import View from './view';


export default class Page extends View {
  constructor(context, args, data) {
    this.context = context;
    this.args = args;
    this.data = data;
  }

  getTitle() {
    throw new Error("Page must implement getTitle()")
  }
}
