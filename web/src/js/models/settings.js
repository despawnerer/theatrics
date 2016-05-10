import extend from 'xtend';

import Model from '../base/model';


export default class Settings extends Model {
  constructor() {
    const defaults = Settings.getDefaults();
    const local = Settings.getLocal();
    super(extend(defaults, local));
  }

  _change() {
    super._change();
    try {
      window.localStorage.setItem('settings', JSON.stringify(this._data));
    } catch(e) {
      // Safari raises QuotaExceededError when trying to save to
      // localStorage in private mode, so ignore it
      return;
    }
  }

  static getLocal() {
    const string = window.localStorage.getItem('settings');
    if (string) {
      try {
        return JSON.parse(string);
      } catch (err) {
        return {};
      }
    }
    return {};
  }

  static getDefaults() {
    return {
      location: 'spb',
    }
  }
}
