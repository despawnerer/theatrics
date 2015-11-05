import Model from '../base/model';


export default class Settings extends Model {
  constructor() {
    super(Settings.getDefaults());
  }

  static getDefaults() {
    return {
      location: 'spb',
    }
  }
}
