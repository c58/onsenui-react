import React from 'react';
import OnsCarouselItem from './item';
import GestureDetector from '../gesture-detector';
import { applyModifiers } from '../modifier-util';
import * as Modes from './modes';


// Internals
const scheme = {
  'carousel': 'carousel--*'
};

export function _getCarouselItemSize(carObj) {
  const sizeInfo = carObj.itemSizeDecomposed;

  if (sizeInfo.unit === '%') {
    const elementSize = carObj.mode._getElementSize();
    return Math.round(sizeInfo.number / 100 * elementSize);
  } else if (sizeInfo.unit === 'px') {
    return sizeInfo.number;
  } else {
    throw new Error('Invalid state');
  }
}

export function _getCarouselItemSizeAttr(props, isVertical) {
  const attrName = 'item' + (isVertical ? 'Height' : 'Width');
  const itemSizeAttr = ('' + props[attrName]).trim();
  return itemSizeAttr.match(/^\d+(px|%)$/) ? itemSizeAttr : '100%';
}

export function _decomposeSizeString(size) {
  const matches = size.match(/^(\d+)(px|%)/);
  return {
    number: parseInt(matches[1], 10),
    unit: matches[2],
  };
}

export function _getInitialIndex(props, itemsCount) {
  const index = parseInt(props.initialIndex, 10);
  if (typeof index === 'number' && !isNaN(index)) {
    return Math.max(Math.min(index, itemsCount - 1), 0);
  } else {
    return 0;
  }
}

export function _getAutoScrollRatio(props) {
  const attr = props.autoScrollRatio;
  if (!attr) {
    return 0.5;
  }
  const scrollRatio = parseFloat(attr);
  if (scrollRatio < 0.0 || scrollRatio > 1.0) {
    throw new Error('Invalid ratio.');
  }
  return isNaN(scrollRatio) ? 0.5 : scrollRatio;
}

export function _getItemsArray(props) {
  const items = [];
  React.Children.map(props.children, (x, i) => {
    if (x.type === OnsCarouselItem) {
      items.push(React.cloneElement(x, { key: i }));
    }
  });
  return items;
}


/**
 * Carousel onsen element
 */
export default class OnsCarousel extends React.Component {

  _resetCarouselObject(props) {
    const carObj = this._carObj || {};
    const oldIsVertical = carObj.isVertical;
    this._carObj = carObj;

    carObj.isVertical = props.direction === 'vertical';
    carObj.isSwipeable = !!props.swipeable;
    carObj.isAutoScrollEnabled = !!props.autoScroll;
    carObj.isDisabled = !!props.disabled;
    carObj.isOverscrollable = !!props.overscrollable;
    carObj.isFullscreen = !!props.fullscreen;
    carObj.autoScrollRatio = _getAutoScrollRatio(props);
    carObj.itemSizeAttr = _getCarouselItemSizeAttr(props, carObj.isVertical);
    carObj.itemSizeDecomposed = _decomposeSizeString(carObj.itemSizeAttr);
    carObj.getItemSize = () => _getCarouselItemSize(carObj);
    carObj.getCarouselElement = () => this._carouselDOM;
    carObj.getItemElements = () => Array.from(this._carouselDOM.children);
    carObj.itemsCount = _getItemsArray(props).length;
    carObj.initialIndex = _getInitialIndex(props, carObj.itemsCount);

    if (oldIsVertical !== carObj.isVertical) {
      carObj.mode = carObj.isVertical
        ? new Modes.VerticalScrollMode(carObj)
        : new Modes.HorizontalScollMode(carObj);
    }
  }

  _handleGesture = (event) => {
    this._carObj.mode.handleGesture(event);
  }

  _handleWindowResize = () => {
    this._resetCarouselObject(this.props);
    this._carObj.mode.refresh();
  }

  componentWillMount() {
    this._resetCarouselObject(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._resetCarouselObject(nextProps);
  }

  componentDidUpdate() {
    this._carObj.mode.refresh();
  }

  componentDidMount() {
    this._gestureDetector = new GestureDetector(this._carouselDOM,
      {dragMinDistance: 1});
    this._gestureDetector.on('drag dragleft dragright dragup dragdown swipe ' +
      'swipeleft swiperight swipeup swipedown dragend', this._handleGesture);
    window.addEventListener('resize', this._handleWindowResize, true);
    this._carObj.mode.refresh();
  }

  componentWillUnmount() {
    this._gestureDetector.off('drag dragleft dragright dragup dragdown swipe ' +
      'swipeleft swiperight swipeup swipedown dragend', this._handleGesture);
    this._gestureDetector.dispose();
    window.removeEventListener('resize', this._handleWindowResize, true);
  }

  render() {
    const items = _getItemsArray(this.props);
    const overflowDirection = this._carObj.isVertical ? 'X' : 'Y';
    let carouselStyle = { ['overflow' + overflowDirection]: 'auto' };
    if (this.props.style) {
      carouselStyle = Object.assign({}, this.props.style, carouselStyle);
    }

    return applyModifiers(this.props, scheme, 0,
      <ons-carousel {...this.props} class="carousel" style={carouselStyle}
        ref={(c) => this._carouselDOM = c}>
        {items}
      </ons-carousel>
    );
  }
}
