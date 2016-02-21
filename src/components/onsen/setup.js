import './fastclick-patched';
import './viewport';
import './modernizr-custom.js'
import GestureDetector from './gesture-detector';
import DeviceBackButtonDispatcher from './device-back-button-dispatcher';
import ons from './ons';


// fastclick
window.addEventListener('load', () => FastClick.attach(document.body), false);

// ons._defaultDeviceBackButtonHandler
window.addEventListener('DOMContentLoaded', () => {
  DeviceBackButtonDispatcher.enable();
  ons._defaultDeviceBackButtonHandler =
    DeviceBackButtonDispatcher.createHandler(window.document.body, () => {
      navigator.app.exitApp();
    });
  document.body._gestureDetector = new GestureDetector(document.body);
}, false);

// viewport.j
new Viewport().setup();

// modernize
const overscrollableTest = '#modernizr { -webkit-overflow-scrolling:touch }';
Modernizr.testStyles(overscrollableTest, (elem, rule) => {
  const webkitScrolling = window.getComputedStyle(elem)
    .getPropertyValue('-webkit-overflow-scrolling');
  const isOverflowtouch = window.getComputedStyle && webkitScrolling == 'touch';
  Modernizr.addTest('overflowtouch', isOverflowtouch);
});
