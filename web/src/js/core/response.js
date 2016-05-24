export function redirect(value) {
  return new Response(Response.Redirect, value);
}

export function render(value) {
  return new Response(Response.Render, value);
}

export function notFound(value) {
  return new Response(Response.NotFound, value);
}

export default class Response {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

Response.Redirect = Symbol('redirect');
Response.Render = Symbol('render');
Response.NotFound = Symbol('not-found');
