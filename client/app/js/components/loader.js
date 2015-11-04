const ARC_LENGTH = 565.48;


export default class Loader {
  constructor({progress=0, element=null}) {
    if (element) {
      this.element = element;
      this.circle = element.querySelector('circle');
    } else {
      this.circle = this.buildCircle();
      this.element = this.buildElement();
      this.element.appendChild(this.circle);
    }

    this.setProgress(progress);
  }

  setProgress(fraction) {
    var offset = ARC_LENGTH - ARC_LENGTH * fraction;
    this.circle.style['stroke-dashoffset'] = offset;
  }

  buildCircle() {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    element.setAttribute('r', 90);
    element.setAttribute('cx', 100);
    element.setAttribute('cy', 100);
    element.setAttribute('fill', 'transparent');
    element.setAttribute('stroke-dasharray', ARC_LENGTH);
    element.setAttribute('stroke-dashoffset', 0);
    return element;
  }

  buildElement() {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    element.setAttribute('class', 'loader');
    element.setAttribute('viewBox', '0 0 200 200');
    element.setAttribute('preserveAspectRatio', 'xMinYMin');
    return element;
  }
}
