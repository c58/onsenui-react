import React from 'react';
import GestureDetector from '../gesture-detector';
import { applyModifiers } from '../modifier-util';
import classNames from 'classnames';


const scheme = {
  'list__item': 'list__item--*',
  'list__item__left': 'list__item--*__left',
  'list__item__center': 'list__item--*__center',
  'list__item__right': 'list__item--*__right',
  'list__item__label': 'list__item--*__label',
  'list__item__title': 'list__item--*__title',
  'list__item__subtitle': 'list__item--*__subtitle',
  'list__item__thumbnail': 'list__item--*__thumbnail',
  'list__item__icon': 'list__item--*__icon'
};

export default class OnsListItem extends React.Component {

  static defaultProps = {
    highlighOutDelay: 200,
    highlighInDelay: 175,
  };
  get _tappable() {
    return this.props.tappable;
  }
  get _tapColor() {
    if (this.props.tappable && typeof this.props.tappable === 'string') {
      return this.props.tappable;
    } else {
      return '#d9d9d9';
    }
  }

  componentDidMount() {
    this._gestureDetector = new GestureDetector(this._itemDOM,
      {dragMinDistance: 1});
    this._gestureDetector.on('touchstart mousedown', this._handleTapStart);
    this._gestureDetector.on('click tap', this._handleStoppedClick);
    this._gestureDetector.on('drag dragleft dragright dragup dragdown swipe ' +
      'swipeleft swiperight swipeup swipedown dragend mouseup touchend ' +
      'touchcancel', this._handleTapEnd);
  }

  componentWillUnmount() {
    this._gestureDetector.off('touchstart mousedown', this._handleTapStart);
    this._gestureDetector.off('click tap', this._handleStoppedClick);
    this._gestureDetector.off('drag dragleft dragright dragup dragdown swipe ' +
      'swipeleft swiperight swipeup swipedown dragend mouseup touchend click ' +
      'touchcancel tap', this._handleTapEnd);
    this._gestureDetector.dispose();
  }

  _handleTapStart = (e) => {
    this._tapCanceled = false;
    clearTimeout(this._untapTimer);
    this._tapTimer = setTimeout(this._enableTapHighlight,
      this.props.highlighInDelay);
    this._startEvent = e;
  }

  _handleTapEnd = (e) => {
    if (this._startEvent) {
      if (!e.gesture && !this._tapCanceled) {
        this._startEvent = null;
        this._enableTapHighlight();
        clearTimeout(this._tapTimer);
        this._untapTimer = setTimeout(this._disableTapHighlight,
          this.props.highlighOutDelay);
      } else if (e.gesture) {
        if (e.gesture.distance > 7) {
          this._startEvent = null;
          this._tapCanceled = true;
          this._disableTapHighlight();
          clearTimeout(this._tapTimer);
        }
      }
    }
  }

  _handleStoppedClick = (e) => {
    if(this._tapCanceled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  _enableTapHighlight = () => {
    this._disableTapHighlight();
    if (this._tappable) {
      if (this._itemDOM.style.backgroundColor) {
        this._originalBackgroundColor = this._itemDOM.style.backgroundColor;
      }
      this._itemDOM.style.backgroundColor = this._tapColor;
    }
  };

  _disableTapHighlight = () => {
    this._itemDOM.style.backgroundColor = this._originalBackgroundColor || '';
  };

  _ensureListPart(el, name) {
    const newClassName = classNames(el.props.className, `list__item__${name}`);
    return React.cloneElement(el, { className: newClassName, key: name })
  }

  _prepareChildren() {
    let leftItem, centerItem, rightItem;

    React.Children.map(this.props.children, (x, i) => {
      if (x && x.props && x.props.className) {
        const classes = x.props.className.split(' ');
        if (classes[0] === 'left') {
          leftItem = this._ensureListPart(x, 'left');
        } else if (classes[0] === 'right') {
          rightItem = this._ensureListPart(x, 'right');
        } else if (classes[0] === 'center') {
          centerItem = this._ensureListPart(x, 'center');
        }
      }
    });

    if (!centerItem) {
      centerItem = (
        <div key="center" className="center list__item__center">
          {this.props.children}
        </div>
      );
    }

    if ((centerItem || leftItem || rightItem) && !this.props.noAutofill) {
      leftItem = leftItem || <div key="left" className="left list__item__left" />;
      centerItem = centerItem || <div key="center" className="center list__item__center" />;
      rightItem = rightItem || <div key="right" className="right list__item__right" />;
    }

    return [leftItem, centerItem, rightItem];
  }

  render() {
    return applyModifiers(this.props, scheme, 2,
      <ons-list-item {...this.props} class="list__item"
        ref={(d) => this._itemDOM = d}>
        {this._prepareChildren()}
      </ons-list-item>
    );
  }
}
