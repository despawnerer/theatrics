export function makeAbsoluteURL(url) {
  return url.startsWith('http://') ? url : 'http://theatrics.ru' + url;
}
