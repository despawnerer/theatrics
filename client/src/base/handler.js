export default class Handler {
  constructor(context, args) {
    this.context = context;
    this.args = args;
  }

  prepareDynamic() {
    return this.prepare();
  }

  prepare() {
    throw new Error("Handlers must implement prepare()");
  }
}
