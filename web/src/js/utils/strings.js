export function capfirst(s) {
  if (!s) return s;
  const [firstLetterMatch] = /^(?:<.*?>)?./.exec(s);
  const firstLetterIndex = firstLetterMatch.length - 1;
  return (
    s.slice(0, firstLetterIndex) +
    s.slice(firstLetterIndex, firstLetterIndex + 1).toUpperCase() +
    s.slice(firstLetterIndex + 1)
  );
}


export function unprefix(s, prefix) {
  return s.startsWith(prefix) ? s.slice(prefix.length) : s;
}


export function trim(s, char=' ') {
  s = trimStart(s, char);
  s = trimEnd(s, char);
  return s;
}


export function trimStart(s, char=' ') {
  let i = 0;
  while (s.charAt(i) == char) i++;
  return s.slice(i);
}

export function trimEnd(s, char=' ') {
  let i = s.length - 1;
  while (s.charAt(i) == char) i--;
  return s.slice(0, i+1);
}


export function regexpEscape(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


export function uuid() {
  // this is not a real UUID, but we don't really need a real one
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
