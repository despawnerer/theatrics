import EventView from './event';
import PlaceView from './place';


const pages = {
  EventView: EventView,
  PlaceView: PlaceView,
}


export default class MainView {
  constructor(context, pageView) {
    this.context = context;
    this.pageView = pageView;
  }

  getHTML() {
    return `
      <title>${this.pageView.getTitle()}</title>
      <script src="/static/index.js" async></script>
      <div id="container">
        ${this.pageView.getHTML()}
      </div>
    `
  }

  mount() {
    this.container = document.querySelector('#container');
    this.autoMountView(this.container.children[0]);
  }

  autoMountView(element) {
    const name = element.getAttribute('data-view');
    const data = element.querySelector('.view-data').innerHTML;
    const view = new pages[name](this.context, JSON.parse(data));
    view.mount(element);
  }

  setPageView(view) {
    this.pageView = view;
    this.container.innerHTML = view.getHTML();
    document.title = view.getTitle();
    view.mount(this.container.children[0]);
  }
}
