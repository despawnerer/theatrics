import Event from '../models/event';


export default class EventView {
  constructor(data) {
    this.event = new Event(data);
  }

  getTitle() {
    return this.event.data.title;
  }

  getHTML() {
    return `
      <div class="event-view" data-view="EventView">
        <script type="application/json" class="view-data">
          ${this.event.stringify()}
        </script>
        <h1>${this.event.data.title}</h1>
        <p>
          This is an event.
        </p>
        <p>
          This event's place is
          <a href="/place/${this.event.data.place.id}/">
            ${this.event.data.place.title}
          </a>
        </p>
      </div>
    `
  }

  mount(element) {
    this.element = element;
    const text = document.createElement('p');
    text.textContent = `This event data is dynamic, yay: ${this.event.data.id}`;
    element.appendChild(text);
  }
}
