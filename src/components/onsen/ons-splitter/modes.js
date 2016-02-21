import DoorLock from '../doorlock';
import ReactDOM from 'react-dom';
import OverlaySplitterAnimator from './overlay-animator';


export const MODES = {
  SPLIT: 'split',
  COLLAPSE: 'collapse',
};

class BaseMode {
  isOpen() {
    return false;
  }
  openMenu() {
    return false;
  }
  closeMenu() {
    return false;
  }
  enterMode() {}
  exitMode() {}
  handleGesture() {}
}

/**
 * Split-screen mode.
 * Display left(right)-side menu and content at the same time.
 */
export class SplitMode extends BaseMode {
  constructor(sideObj) {
    super();
    this._element = sideObj;
  }

  isOpen() {
    return false;
  }

  openMenu() {
    return Promise.reject('Not possible in Split Mode');
  }
  closeMenu() {
    return Promise.reject('Not possible in Split Mode');
  }

  /**
   * @param {Element} element
   */
  layout() {
    const element = this._element.element;
    element.style.width = this._element.getWidth();

    if (this._element.isLeft) {
      element.style.left = '0';
      element.style.right = 'auto';
    } else {
      element.style.left = 'auto';
      element.style.right = '0';
    }
  }

  enterMode() {
    this.layout();
  }

  exitMode() {
    const element = this._element.element;

    element.style.left = '';
    element.style.right = '';
    element.style.width = '';
    element.style.zIndex = '';
  }
}


/**
 * Side collapsable mode.
 * Displays side above the content.
 */
export class CollapseMode extends BaseMode {

  static get CLOSED_STATE() {
    return 'closed';
  }

  static get OPEN_STATE() {
    return 'open';
  }

  static get CHANGING_STATE() {
    return 'changing';
  }

  constructor(sideObj) {
    super();
    this._state = CollapseMode.CLOSED_STATE;
    this._distance = 0;
    this._element = sideObj;
    this._lock = new DoorLock();
    this._animator = new OverlaySplitterAnimator()
  }

  _isLocked() {
    return this._lock.isLocked();
  }

  isOpen() {
    return this._state !== CollapseMode.CLOSED_STATE;
  }

  isClosed() {
    return this._state === CollapseMode.CLOSED_STATE;
  }

  handleGesture(event) {
    if (this._isLocked()) {
      return;
    }
    if (this._element.isOpenOtherSide()) {
      return;
    }
    if (event.type === 'dragstart') {
      this._onDragStart(event);
    } else if (event.type === 'dragleft' || event.type === 'dragright') {
      if (!this._ignoreDrag) {
        this._onDrag(event);
      }
    } else if (event.type === 'dragend') {
      if (!this._ignoreDrag) {
        this._onDragEnd(event);
      }
    } else {
      throw new Error('Invalid state');
    }
  }

  _onDragStart(event) {
    this._ignoreDrag = ['left', 'right'].indexOf(event.gesture.direction) === -1;

    if (!this.isOpen() && this._element.isOpenOtherSide()) {
      this._ignoreDrag = true;
    } else if (this._element.swipeTargetWidth > 0) {
      const distance = this._element.isLeft
        ? event.gesture.center.clientX
        : window.innerWidth - event.gesture.center.clientX;
      if (distance > this._element.swipeTargetWidth) {
        this._ignoreDrag = true;
      }
    }
  }

  _onDrag(event) {
    event.gesture.preventDefault();

    const deltaX = event.gesture.deltaX;
    const deltaDistance = this._element.isLeft ? deltaX : -deltaX;
    const widthInPixel = this._element.getWidthInPixel();
    const startEvent = event.gesture.startEvent;

    if (!('isOpen' in startEvent)) {
      startEvent.isOpen = this.isOpen();
      startEvent.distance = startEvent.isOpen ? widthInPixel : 0;
      startEvent.width = widthInPixel;
    }

    const width = widthInPixel;
    if (deltaDistance < 0 && startEvent.distance <= 0) {
      return;
    }
    if (deltaDistance > 0 && startEvent.distance >= width) {
      return;
    }

    const distance = startEvent.isOpen ? deltaDistance + width : deltaDistance;
    const normalizedDistance = Math.max(0, Math.min(width, distance));
    startEvent.distance = normalizedDistance;

    this._state = CollapseMode.CHANGING_STATE;
    this._animator.translate(normalizedDistance);
  }

  _onDragEnd(event) {
    const deltaX = event.gesture.deltaX;
    const deltaDistance = this._element.isLeft ? deltaX : -deltaX;
    const width = event.gesture.startEvent.width;
    const distance = event.gesture.startEvent.isOpen ? deltaDistance + width : deltaDistance;
    const direction = event.gesture.interimDirection;
    const shouldOpen =
      (this._element.isLeft && direction === 'right' && distance > width * this._element.thresholdRatioShouldOpen) ||
      (!this._element.isLeft && direction === 'left' && distance > width * this._element.thresholdRatioShouldOpen);

    if (shouldOpen) {
      this._openMenu();
    } else {
      this._closeMenu();
    }
  }

  layout() {
    if (this._state === CollapseMode.CHANGING_STATE) {
      return;
    }
    if (this._state === CollapseMode.CLOSED_STATE) {
      if (this._animator.isActivated()) {
        this._animator.layoutOnClose();
      }
    } else if (this._state === CollapseMode.OPEN_STATE) {
      if (this._animator.isActivated()) {
        this._animator.layoutOnOpen();
      }
    } else {
      throw new Error('Invalid state');
    }
  }

  enterMode() {
    this._animator.activate(this._element);
    this.layout();
  }

  exitMode() {
    this._animator.inactivate();
  }

  /**
   * @param {Object} [options]
   * @param {Function} [options.callback]
   * @param {Boolean} [options.withoutAnimation]
   * @return {Promise} Resolves to the splitter side element
   */
  openMenu(options = {}) {
    if (this._state !== CollapseMode.CLOSED_STATE) {
      return Promise.reject('Not in Collapse Mode.');
    }
    return this._openMenu(options);
  }

  /**
   * @param {Object} [options]
   * @param {Function} [options.callback]
   * @param {Boolean} [options.withoutAnimation]
   * @return {Promise} Resolves to the splitter side element
   */
  _openMenu(options = {}) {
    if (this._isLocked()) {
      return Promise.reject('Splitter side is locked.');
    }
    if (this._element.isOpenOtherSide()) {
      return Promise.reject('Another menu is already open.');
    }

    options.callback = options.callback instanceof Function ? options.callback : () => {};

    const unlock = this._lock.lock();
    const done = () => {
      unlock();
      options.callback();
    };

    if (options.withoutAnimation) {
      this._state = CollapseMode.OPEN_STATE;
      this.layout();
      done();
      return Promise.resolve(this._element);
    } else {
      this._state = CollapseMode.CHANGING_STATE;
      return new Promise(resolve => {
        this._animator.open(() => {
          this._state = CollapseMode.OPEN_STATE;
          this.layout();
          done();
          resolve(this._element);
        });
      });
    }
  }

  /**
   * @param {Object} [options]
   * @return {Promise} Resolves to the splitter side element
   */
  closeMenu(options = {}) {
    if (this._state !== CollapseMode.OPEN_STATE) {
      return Promise.reject('Not in Collapse Mode.');
    }
    return this._closeMenu(options);
  }

  /**
   * @param {Object} [options]
   * @return {Promise} Resolves to the splitter side element
   */
  _closeMenu(options = {}) {
    if (this._isLocked()) {
      return Promise.reject('Splitter side is locked.');
    }

    options.callback = options.callback instanceof Function ? options.callback : () => {};

    const unlock = this._lock.lock();
    const done = () => {
      unlock();
      setImmediate(options.callback);
    };

    if (options.withoutAnimation) {
      this._state = CollapseMode.CLOSED_STATE;
      this.layout();
      done();
      return Promise.resolve(this._element);
    } else {
      this._state = CollapseMode.CHANGING_STATE;
      return new Promise(resolve => {
        this._animator.close(() => {
          this._state = CollapseMode.CLOSED_STATE;
          this.layout();
          done();
          resolve(this._element);
        });
      });
    }
  }
}
