import Place from '../models/place';


export default class PlacePage {
  constructor(context, args, data) {
    this.context = context;
    this.args = args;
    this.data = data;

    this.place = new Place(data);
  }

  getTitle() {
    return this.place.data.title;
  }

  getHTML() {
    return `
      <div class="place-view">
        <h1>${this.place.data.title}</h1>
        <p>
          This is a place.
        </p>
      </div>
    `
  }

  mount(element) {
    this.element = element;

    const text = document.createElement('p');
    text.textContent = `This place data is dynamic, yay: ${this.place.data.id}`;
    element.appendChild(text);
  }
}
