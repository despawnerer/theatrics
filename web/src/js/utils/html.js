import escape from 'lodash.escape';


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


export function preventBreakingOrdinals(string) {
  return string.replace(/(\d+?-[хейя])/g, unbreakable('$1'));
}


export function unbreakable(string) {
  return `<span class="unbreakable">${escape(string)}</span>`;
}
