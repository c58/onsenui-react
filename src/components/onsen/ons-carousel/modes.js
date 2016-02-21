import DoorLock from '../doorlock';
import animit from '../animit';
import util from '../util';


class BasicScrollMode {
  constructor(carObj) {
    this._doorLock = new DoorLock();
    this._scroll = 0;
    this._carObj = carObj;
    this._lastActiveIndex = null;
  }

  getActiveCarouselItemIndex() {
    const scroll = this._scroll;
    const count = this._carObj.itemsCount;
    const size = this._carObj.getItemSize();

    if (scroll < 0) {
      return 0;
    }

    let i;
    for (i = 0; i < count; i++) {
      if (size * i <= scroll && size * (i + 1) > scroll) {
        return i;
      }
    }

    return i - 1;
  }

  setActiveCarouselItemIndex(index, options = {}) {
    if (options && typeof options != 'object') {
      throw new Error('options must be an object. You supplied ' + options);
    }

    options.animationOptions = util.extend({
      duration: 0.3,
      timing: 'cubic-bezier(.1, .7, .1, 1)'
    }, options.animationOptions || {});

    index = Math.max(0, Math.min(index, this._carObj.itemsCount - 1));
    const scroll = this._carObj.getItemSize() * index;
    const max = this._calculateMaxScroll();

    this._scroll = Math.max(0, Math.min(max, scroll));
    return this._scrollTo(this._scroll, options).then(() => {
      this._tryFirePostChangeEvent();
      return this;
    });
  }

  refresh() {
    this._currentElementSize = undefined;
    if (this._carObj.itemsCount > 0 && this._carObj.getItemSize() > 0) {
      this._layoutCarouselItems();

      if (this._lastActiveIndex === null) {
        this._setupInitialIndex();
      } else if (this._carObj.isAutoScrollEnabled) {
        this.setActiveCarouselItemIndex(this._lastActiveIndex,
          {withoutAnimation: true});
      }

      if (this._carObj.isFullscreen) {
        this._showOnlyNeighbourhoods();
      }
    }
  }

  handleGesture(event) {
    if (event.type === 'dragend') {
      this._onDragEnd(event);
    } else {
      this._onDrag(event);
    }
  }

  _onDrag(event) {
    const direction = event.gesture.direction;

    if (
      !this._carObj.isSwipeable ||
      (this._carObj.isVertical && (direction === 'left' || direction === 'right')) ||
      (!this._carObj._isVertical && (direction === 'up' || direction === 'down')) ||
      !this._isStartEventAcceptable(event.gesture.startEvent)
    ) {
      return;
    }

    event.stopPropagation();
    this._lastDragEvent = event;
    const scroll = this._scroll - this._getScrollDelta(event);
    this._scrollTo(scroll);
    event.gesture.preventDefault();
  }

  _onDragEnd(event) {
    this._currentElementSize = undefined;

    if (this._carObj.isSwipeable && this._lastDragEvent) {
      this._scroll = this._scroll - this._getScrollDelta(event);

      if (this._getScrollDelta(event) !== 0) {
        event.stopPropagation();
      }

      if (this._isOverScroll(this._scroll)) {
        this._scrollToKillOverScroll();
      } else {
        this._startMomentumScroll();
      }

      this._lastDragEvent = null;
      event.gesture.preventDefault();
      this._tryFirePostChangeEvent();
    }
  }

  _setupInitialIndex() {
    this._scroll = this._carObj.getItemSize() * this._carObj.initialIndex;
    this._lastActiveIndex = this._carObj.initialIndex;
    this._scrollTo(this._scroll, {withoutAnimation: true});
  }

  /**
   * @param {Number} scroll
   * @param {Object} [options]
   * @return {Promise} Resolves to the carousel element
   */
  _scrollTo(scroll, options = {}) {
    const isOverscrollable = this._carObj.isOverscrollable;

    const normalizeScroll = (scroll) => {
      const ratio = 0.35;
      if (scroll < 0) {
        return isOverscrollable ? Math.round(scroll * ratio) : 0;
      }
      const maxScroll = this._calculateMaxScroll();
      if (maxScroll < scroll) {
        return isOverscrollable ? maxScroll + Math.round((scroll - maxScroll) * ratio) : maxScroll;
      }
      return scroll;
    };

    if (options.withoutAnimation) {
      return new Promise(resolve => {
        this._carObj.getItemElements().forEach(item => {
          const transition = item.style.transition;
          item.style.transition = '';
          item.style.transform = this._generateScrollTransform(normalizeScroll(scroll));
          setTimeout(() => {
            item.style.transition = transition;
            resolve();
          }, 0);
        });
      });
    } else {
      return new Promise(resolve => {
        animit(this._carObj.getItemElements())
          .queue({
            transform: this._generateScrollTransform(normalizeScroll(scroll))
          })
          .play(() => {
            if (options.callback instanceof Function) {
              options.callback();
            }
            resolve();
          });
      });
    }
  }

  _calculateMaxScroll() {
    const max = this._carObj.itemsCount * this._carObj.getItemSize() - this._getElementSize();
    return Math.ceil(max < 0 ? 0 : max); // Need to return an integer value.
  }

  _isOverScroll(scroll) {
    if (scroll < 0 || scroll > this._calculateMaxScroll()) {
      return true;
    }
    return false;
  }

  _getOverScrollDirection() {
    if (this._carObj.isVertical) {
      if (this._scroll <= 0) {
        return 'up';
      }
      else {
        return 'down';
      }
    } else {
      if (this._scroll <= 0) {
        return 'left';
      }
      else {
        return 'right';
      }
    }
  }

  _scrollToKillOverScroll() {
    const duration = 0.4;

    if (this._scroll < 0) {
      animit(this._carObj.getItemElements())
        .queue({
          transform: this._generateScrollTransform(0)
        }, {
          duration: duration,
          timing: 'cubic-bezier(.1, .4, .1, 1)'
        })
        .queue((done) => {
          this._tryFirePostChangeEvent();
          done();
        })
        .play();
      this._scroll = 0;
      return;
    }

    const maxScroll = this._calculateMaxScroll();

    if (maxScroll < this._scroll) {
      animit(this._carObj.getItemElements())
        .queue({
          transform: this._generateScrollTransform(maxScroll)
        }, {
          duration: duration,
          timing: 'cubic-bezier(.1, .4, .1, 1)'
        })
        .queue((done) => {
          this._tryFirePostChangeEvent();
          done();
        })
        .play();
      this._scroll = maxScroll;
      return;
    }

    return;
  }

  _startMomentumScroll() {
    if (this._lastDragEvent) {
      const velocity = this._getScrollVelocity(this._lastDragEvent);
      const duration = 0.3;
      const scrollDelta = duration * 100 * velocity;
      const scroll = this._normalizeScrollPosition(
        this._scroll + (this._getScrollDelta(this._lastDragEvent) > 0 ? -scrollDelta : scrollDelta)
      );

      this._scroll = scroll;

      animit(this._carObj.getItemElements())
        .queue({
          transform: this._generateScrollTransform(this._scroll)
        }, {
          duration: duration,
          timing: 'cubic-bezier(.1, .7, .1, 1)'
        })
        .queue(function(done) {
          this._tryFirePostChangeEvent();
          done();
        }.bind(this))
        .play();
    }
  }

  _normalizeScrollPosition(scroll) {
    const max = this._calculateMaxScroll();

    if (this._carObj.isAutoScrollEnabled) {
      let arr = [];
      const size = this._carObj.getItemSize();
      const nbrOfItems = this._carObj.itemsCount;

      for (let i = 0; i < nbrOfItems; i++) {
        if (max >= i * size) {
          arr.push(i * size);
        }
      }
      arr.push(max);

      arr.sort(function(left, right) {
        left = Math.abs(left - scroll);
        right = Math.abs(right - scroll);
        return left - right;
      });

      arr = arr.filter(function(item, pos) {
        return !pos || item != arr[pos - 1];
      });

      const lastScroll = this._lastActiveIndex * size;
      const scrollRatio = Math.abs(scroll - lastScroll) / size;

      if (scrollRatio <= this._carObj.autoScrollRatio) {
        return lastScroll;
      } else if (scrollRatio > this._carObj.autoScrollRatio && scrollRatio < 1.0) {
        if (arr[0] === lastScroll && arr.length > 1) {
          return arr[1];
        }
      }

      return arr[0];
    } else {
      return Math.max(0, Math.min(max, scroll));
    }
  }

  _tryFirePostChangeEvent() {
    const currentIndex = this.getActiveCarouselItemIndex();
    if (this._lastActiveIndex !== currentIndex) {
      const lastActiveIndex = this._lastActiveIndex;
      this._lastActiveIndex = currentIndex;
      if (this._carObj.isFullscreen) {
        this._showOnlyNeighbourhoods();
      }
    }
  }

  _showOnlyNeighbourhoods() {
    let activeIndex = this.getActiveCarouselItemIndex();
    let children = this._carObj.getItemElements();

    for (let i = 0; i < children.length; i++)
    {
      children[i].style.visibility = 'hidden';
      children[i].style.display = 'none';
    }

    children[activeIndex].style.visibility = 'visible';
    children[activeIndex].style.display = 'block';

    if (activeIndex < children.length - 1) {
      children[activeIndex + 1].style.visibility = 'visible';
      children[activeIndex + 1].style.display = 'block';
    }
    if (activeIndex > 0) {
      children[activeIndex - 1].style.visibility = 'visible';
      children[activeIndex - 1].style.display = 'block';
    }
  }
}

export class HorizontalScollMode extends BasicScrollMode {
  _isStartEventAcceptable(startEvent) {
    this._getElementSize();
    const elemRect = this._currentElementSize;
    const leftBound = elemRect.left + 20;
    const rightBound = elemRect.left + elemRect.width - 20;
    const pageX = startEvent.center.pageX;
    return pageX > leftBound && pageX < rightBound;
  }

  _getScrollDelta(event) {
    return event.gesture.deltaX;
  }

  _getScrollVelocity(event) {
    return event.gesture.velocityX;
  }

  _generateScrollTransform(scroll) {
    return 'translate3d(' + -scroll + 'px, 0px, 0px)';
  }

  _getElementSize() {
    if (!this._currentElementSize) {
      this._currentElementSize = this._carObj.getCarouselElement()
        .getBoundingClientRect();
    }
    return this._currentElementSize.width;
  }

  _layoutCarouselItems() {
    const children = this._carObj.getItemElements();
    const sizeAttr = this._carObj.itemSizeAttr;
    const sizeInfo = this._carObj.itemSizeDecomposed;
    const carElem = this._carObj.getCarouselElement();

    const computedStyle = window.getComputedStyle(carElem);
    const totalHeight = carElem.getBoundingClientRect().height || 0;
    const finalHeight = totalHeight - parseInt(computedStyle.paddingTop, 10) - parseInt(computedStyle.paddingBottom, 10);

    for (let i = 0; i < children.length; i++) {
      children[i].style.position = 'absolute';
      children[i].style.height = finalHeight + 'px';
      children[i].style.width = sizeAttr;
      children[i].style.visibility = 'visible';
      children[i].style.left = (i * sizeInfo.number) + sizeInfo.unit;
    }
  }
}

export class VerticalScrollMode extends BasicScrollMode {
  _isStartEventAcceptable() {
    return true;
  }

  _getScrollDelta(event) {
    return event.gesture.deltaY;
  }

  _getScrollVelocity(event) {
    return event.gesture.velocityY;
  }

  _generateScrollTransform(scroll) {
    return 'translate3d(0px, ' + -scroll + 'px, 0px)';
  }

  _getElementSize() {
    if (!this._currentElementSize) {
      this._currentElementSize = this._carObj.getCarouselElement()
        .getBoundingClientRect().height;
    }
    return this._currentElementSize;
  }

  _layoutCarouselItems() {
    const children = this._carObj.getItemElements();
    const sizeAttr = this._carObj.itemSizeAttr;
    const sizeInfo = this._carObj.itemSizeDecomposed;
    const carElem = this._carObj.getCarouselElement();

    const computedStyle = window.getComputedStyle(carElem);
    const totalWidth = carElem.getBoundingClientRect().width || 0;
    const finalWidth = totalWidth - parseInt(computedStyle.paddingLeft, 10) - parseInt(computedStyle.paddingRight, 10);

    for (let i = 0; i < children.length; i++) {
      children[i].style.position = 'absolute';
      children[i].style.height = sizeAttr;
      children[i].style.width = finalWidth + 'px';
      children[i].style.visibility = 'visible';
      children[i].style.top = (i * sizeInfo.number) + sizeInfo.unit;
    }
  }
}
