import Model from '../base/model';
import {capfirst} from '../utils';


export default class Place extends Model {
  isStub() {
    return this.data.is_stub;
  }

  getTitle() {
    return capfirst(this.data.title);
  }

  getPresentFields(...fields) {
    return fields.filter(f => Boolean(this.data[f]))
  }
}
