import View from '../base/view';


export default class NotFound extends View {
  createElement() {
    const element = document.createElement('div');
    element.setAttribute('class', 'not-found-view');
    return element;
  }

  render() {
    this.element.innerHTML = `
    <div class="not-found-message">
      <h2>
        404 <span class="tagline">Здесь нет такой страницы</span>
      </h2>
      <p>
        Но вообще есть замечательные <a href="/">спектакли</a>
      </p>
    </div>
    `;

    this.app.setTitle("404");
    this.app.resetSourceURL();
  }
}
