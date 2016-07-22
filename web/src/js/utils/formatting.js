import punycode from 'punycode';

import {trim, unprefix} from './strings';


export function formatURL(s) {
  s = trim(s, '/');
  s = unprefix(s, 'http://');
  s = unprefix(s, 'https://');
  return punycode.toUnicode(s);
}


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
