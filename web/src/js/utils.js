import escape from 'lodash.escape';
import punycode from 'punycode';


/* Browser and window tools */

export function isiOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}


export function getURL(location) {
  return location.pathname + location.search;
}


export function trigger(target, name, detail) {
  const event = detail ? new CustomEvent(name, {detail}) : new Event(name);
  target.dispatchEvent(event);
}


/* HTML */

export function bigLoader(progress=0.25) {
  return `<div class="big-loader-container">${loader(progress)}</div>`;
}


export function loader(progress=0.25) {
  const dashOffset = 565.48 * (1 - progress);
  return `
    <svg class="loader" viewBox="0 0 200 200" preserveAspectRatio="xMinYMin">
      <circle r="90" cx="100" cy="100" fill="transparent"
              stroke-dasharray="565.48" stroke-dashoffset="0"
              style="stroke-dashoffset: ${dashOffset}px;">
      </circle>
    </svg>
  `
}


export function preventBreakingRanges(string) {
  return string.replace(/(\d[:.\d]*\s?[\-–]\s?[:.\d]*\d)/g, unbreakable('$1'));
}


export function unbreakable(string) {
  return `<span class="unbreakable">${escape(string)}</span>`;
}


/* Element manipulations */

export function clear(element) {
  element.innerHTML = '';
}


export function toggleClass(element, className, condition=undefined) {
  /* This shim is used because older Safari and IE don't support
     the second arg to classList.toggle */
  if (condition === undefined) {
    condition = element.classList.contains(className);
  }

  if (condition) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}


export function toggle(element, condition=undefined) {
  if (condition === undefined) {
    condition = element.hasAttribute('hidden');
  }

  if (condition) {
    show(element);
  } else {
    hide(element);
  }
}

export function show(element) {
  element.removeAttribute('hidden');
}


export function hide(element) {
  element.setAttribute('hidden', 'hidden');
}


/* URLs */

export function niceURL(s) {
  s = trim(s, '/');
  s = unprefix(s, 'http://');
  s = unprefix(s, 'https://');
  return punycode.toUnicode(s);
}


export function makeAbsoluteURL(url) {
  return url.startsWith('http://') ? url : 'http://theatrics.ru' + url;
}


/* Strings */

export function capfirst(s) {
  if (!s) return s;
  return s.slice(0, 1).toUpperCase() + s.slice(1);
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
  while (s.startsWith(char)) s = s.slice(1);
  return s;
}

export function trimEnd(s, char=' ') {
  while (s.endsWith(char)) s = s.slice(0, -1);
  return s;
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


/* Arrays */

export function range(bound) {
  const range = [];
  for (let n = 0; n <= bound; n++) {
    range.push(n);
  }
  return range;
}


export function rotateLeft(array, n) {
  return array.slice(n).concat(array.slice(0, n));
}


export function groupArray(array, name, callback, equal=(a, b) => a == b) {
  const groups = [];
  let lastGroup = null;
  array.forEach(item => {
    const groupValue = callback(item);
    if (lastGroup && equal(lastGroup[name], groupValue)) {
      lastGroup.items.push(item);
    } else {
      lastGroup = {items: [item]};
      lastGroup[name] = groupValue;
      groups.push(lastGroup);
    }
  });
  return groups;
}


/* Objects */

export function zipIntoObject(keys, values) {
  const obj = {}
  for (let x = 0; x < values.length; x++) {
    obj[keys[x]] = values[x];
  }
  return obj;
}


export function merge(...objects) {
  return Object.assign({}, ...objects);
}


/* Formatting */

export function formatPriceRange(lower, upper, currency) {
  if (lower == null && upper == null) {
    return '—';
  } else if (lower == 0 && upper == 0){
    return 'бесплатно';
  } else if (lower == upper) {
    return formatCurrency(lower, currency);
  } else if (upper && !lower) {
    return `до ${formatCurrency(upper, currency)}`;
  } else if (!upper && lower) {
    return `от ${formatCurrency(lower, currency)}`;
  } else {
    return formatCurrency(
      `${formatNumber(lower)}–${formatNumber(upper)}`,
      currency
    );
  }
}


export function formatCurrency(value, currency, useGrouping=false) {
  const format = getCurrencyFormat(currency);
  if (typeof value == 'number') value = formatNumber(value, useGrouping);
  return format.replace('{value}', value);
}


export function getCurrencyFormat(currency) {
  const sentinel = 1234;
  const localized = sentinel.toLocaleString('ru', {
    currency,
    useGrouping: false,
    style: 'currency',
    minimumFractionDigits: 0,
  });
  return localized.replace(String(sentinel), '{value}');
}


export function formatNumber(n, useGrouping=false) {
  return n.toLocaleString('ru', {
    useGrouping,
    style: 'decimal',
    minimumFractionDigits: 0,
  });
}


export function formatPhoneNumber(number, region) {
  return number
    .replace(/\+7 (\d\d\d) (\d\d\d-\d\d-\d\d)/, '+7 ($1) $2')
    .replace(/-/g, '‒');
}


export function formatDuration(duration) {
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const parts = [];
  if (days) parts.push(pluralize.days(days));
  if (hours) parts.push(pluralize.hours(hours));
  if (minutes) parts.push(pluralize.minutes(minutes));
  return parts.join(' ');
}


export function pluralize(forms, n) {
  // this is a pluralization function for Russian language
  const form = (
    (n % 10 === 1 && n % 100 !== 11)
    ? forms[0]
    : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    ? forms[1]
    : forms[2]
  );
  return `${n} ${form}`;
}

pluralize.days = n => pluralize(['день', 'дня', 'дней'], n);
pluralize.hours = n => pluralize(['час', 'часа', 'часов'], n);
pluralize.minutes = n => pluralize(['минута', 'минуты', 'минут'], n);


/* Misc */

export function getMapURL(title, address, location, isiOS) {
  if (isiOS) {
    return `//maps.apple.com/?q=${title}&address=${address}, ${location}`;
  } else {
    return `//maps.google.com/?q=${title}, ${address}, ${location}`;
  }
}
