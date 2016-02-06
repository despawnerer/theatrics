import View from '../base/view';
import pages from '../pages/all';


export default class MainView extends View {
  constructor(context, page) {
    super(context);
    this.page = page;
  }

  getHTML() {
    return `
      <title>${this.getTitle()}</title>
      <script src="/static/index.js" async></script>
      <script type="application/json" id="page-state">
        ${JSON.stringify(this.serializePageState())}
      </script>
      <div id="container">
        ${this.page.getHTML()}
      </div>
    `
  }

  getTitle() {
    return `${this.page.getTitle()} — Theatrics`;
  }

  serializePageState() {
    return {
      page: this.page.constructor.name,
      args: this.page.args,
      data: this.page.data,
    }
  }

  mount() {
    this.container = document.querySelector('#container');
    this.bootstrapPageFromHTML();
  }

  setPage(page) {
    document.title = this.getTitle();
    this.container.innerHTML = page.getHTML();
    page.mount(this.container.children[0]);
    this.page = page;
  }

  bootstrapPageFromHTML() {
    const state = this.getPageStateFromHTML();
    const Page = pages[state.page];
    const page = new Page(this.context, state.args, state.data);
    page.mount(this.container.children[0]);
    this.page = page;
  }

  getPageStateFromHTML() {
    const element = document.querySelector('#page-state');
    const state = JSON.parse(element.innerHTML);
    element.parentNode.removeChild(element);
    return state;
  }
}
