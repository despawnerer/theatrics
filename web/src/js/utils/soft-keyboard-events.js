import {trigger} from './browser';


const SOFT_KEYBOARD_MIN_HEIGHT = 100;


export default function attach(win) {
  const doc = win.document;

  let width = win.innerWidth;
  let height = win.innerHeight;

  win.addEventListener('resize', event => {
    if (win.innerWidth == width) {
      if (height - win.innerHeight > SOFT_KEYBOARD_MIN_HEIGHT && doesElementAcceptKeyboardInput(doc.activeElement)) {
        const keyboardHeight = height - win.innerHeight;
        trigger(win, 'openkeyboard', {height: keyboardHeight});
      } else if (win.innerHeight - height > SOFT_KEYBOARD_MIN_HEIGHT) {
        trigger(win, 'closekeyboard');
      }
    }
    width = win.innerWidth;
    height = win.innerHeight;
  });
}


function doesElementAcceptKeyboardInput(element) {
  return element.tagName == 'INPUT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
}
