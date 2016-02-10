import Model from '../base/model';
import {capfirst} from '../utils';


export default class Place extends Model {
  onFetched(response) {
    this.replace(response.data);
  }

  getTitle() {
    return capfirst(this.data.title);
  }

  getPresentFields(...fields) {
    return fields.filter(f => Boolean(this.data[f]))
  }
}
