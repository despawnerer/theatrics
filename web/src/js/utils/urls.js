import punycode from 'punycode';


export function niceURL(s) {
  s = trim(s, '/');
  s = unprefix(s, 'http://');
  s = unprefix(s, 'https://');
  return punycode.toUnicode(s);
}


export function makeAbsoluteURL(url) {
  return url.startsWith('http://') ? url : 'http://theatrics.ru' + url;
}
