import Place from '../models/place';


export default class PlaceView {
  constructor(context, data) {
    this.context = context;
    this.place = new Place(data);
  }

  getTitle() {
    return this.place.data.title;
  }

  getHTML() {
    return `
      <div class="place-view" data-view="PlaceView">
        <script type="application/json" class="view-data">
          ${this.place.stringify()}
        </script>
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
