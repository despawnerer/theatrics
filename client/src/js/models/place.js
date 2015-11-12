import axios from 'axios';

import Model from '../base/model';
import {buildAPIURL} from '../utils';


export default class Place extends Model {
  fetch() {
    return axios
      .get(
        buildAPIURL(`/places/${this.get('id')}/`),
        {
          params: {
            fields: 'location,title,images,address,subway,timetable,coords,phone,site_url,description,body_text,foreign_url',
            expand: 'images,location',
          }
        })
      .then(this.onFetched.bind(this));
  }

  onFetched(response) {
    this.replace(response.data);
  }

  isFetched() {
    return this.has('title');
  }
}
