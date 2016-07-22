export function getMapURL(title, address, location, isiOS) {
  if (isiOS) {
    return `//maps.apple.com/?q=${title}&address=${address}, ${location}`;
  } else {
    return `//maps.google.com/?q=${title}, ${address}, ${location}`;
  }
}
