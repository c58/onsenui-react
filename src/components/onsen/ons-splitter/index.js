import React from 'react';
import ReactDOM from 'react-dom';
import GestureDetector from '../gesture-detector';
import * as CollapseStrategies from './collapse-strategy';
import * as ShowModes from './modes';
import OnsSplitterMask from './mask';
import OnsSplitterSide from './side';
import OnsSplitterContent from './content';


// Internals
export function _decomposeChildren(props) {
  const sides = {};
  let content = null;
  React.Children.map(props.children, (x) => {
    if (x.type === OnsSplitterSide) {
      const sideName = x.props.side === 'right' ? 'right' : 'left';
      sides[sideName] = React.cloneElement(x, { ref: sideName });
    } else if (x.type === OnsSplitterContent) {
      content = React.cloneElement(x, { ref: 'content' });
    }
  });

  return { content, sides };
}

export function _getCollapseStartegy(sideElem) {
  const collapse = sideElem.props.collapse;
  if (collapse === true) {
    return new CollapseStrategies.StaticCollapseDetection();
  } else if (collapse === 'portrait' || collapse === 'landscape') {
    return new CollapseStrategies.OrientationCollapseDetection(collapse);
  } else if (collapse) {
    return new CollapseStrategies.MediaQueryCollapseDetection(collapse);
  } else {
    return new CollapseStrategies.StaticSplitDetection();
  }
}

export function _getSideWidth(sideElemt) {
  let { width } = sideElemt.props;
  if (width) {
    width = width.trim();
    if (width.match(/^\d+(px|%)$/)) {
      return width;
    }
  }
  return '80%';
}

export function _getSideWidthInPixel(sideElemt, splitterDom) {
  const width = _getSideWidth(sideElemt);
  const [, num, unit] = width.match(/^(\d+)(px|%)$/);

  if (unit === 'px') {
    return parseInt(num, 10);
  }
  if (unit === '%') {
    const percent = parseInt(num, 10);
    return Math.round(splitterDom.offsetWidth * percent / 100);
  }

  throw new Error('Invalid state');
}

export function _createModeByName(modeName, sideObj) {
  if (modeName === ShowModes.MODES.COLLAPSE) {
    return new ShowModes.CollapseMode(sideObj);
  } else if (modeName === ShowModes.MODES.SPLIT) {
    return new ShowModes.SplitMode(sideObj);
  }
}


/**
 * OnsSplitter component for creating responsive sidebar
 */
export default class OnsSplitter extends React.Component {

  _getContentElement() {
    return this.refs.content;
  }

  _getMaskElement() {
    return this.refs.mask;
  }

  _isOpenOtherSide(callerSideName) {
    return callerSideName === 'left'
      ? this.sides.right && this.sides.right.mode.isOpen()
      : this.sides.left && this.sides.left.mode.isOpen();
  }

  _createSideObject(sideName, sideElem) {
    const sideObj = {};
    sideObj.isLeft = sideName === 'left';
    sideObj.element = null;
    sideObj.swipeable = !!sideElem.props.swipeable;
    sideObj.isOpenOtherSide = () => this._isOpenOtherSide(sideName);
    sideObj.getWidth = () => _getSideWidth(sideElem);
    sideObj.getWidthInPixel = () => _getSideWidthInPixel(sideElem, this._splitterDOM);
    sideObj.getContentElement = () => ReactDOM.findDOMNode(this.refs.content);
    sideObj.getMaskElement = () => ReactDOM.findDOMNode(this.refs.mask);
    sideObj.swipeTargetWidth = sideElem.props.swipeTargetWidth
      ? Math.max(0, parseInt(sideElem.props.swipeTargetWidth, 10))
      : -1;
    sideObj.thresholdRatioShouldOpen = sideElem.props.thresholdRatioShouldOpen
      ? Math.max(0.0, Math.min(1.0, parseFloat(sideElem.props.thresholdRatioShouldOpen)))
      : 0.3;
    sideObj.collapseStrategy = _getCollapseStartegy(sideElem);
    sideObj.collapseStrategy.activate({
      _updateMode: (newModeName) => {
        const oldMode = sideObj.mode;
        sideObj.modeName = newModeName;
        sideObj.mode = _createModeByName(newModeName, sideObj);

        if (oldMode) {
          oldMode.exitMode();
          this.forceUpdate();
        }
      },
    });

    return sideObj;
  }

  _initSides() {
    const { sides, content } = _decomposeChildren(this.props);
    this.sides = sides;
    this.content = content;

    for (let k in this.sides) {
      this.sides[k] = this._createSideObject(k, this.sides[k]);
    }
  }

  _handleGesture = (event) => {
    for (let k in this.sides) {
      if (this.sides[k].swipeable) {
        this.sides[k].mode.handleGesture(event);
      }
    }
  };

  _handleClickMask = () => {
    for (let k in this.sides) {
      if (this.sides[k].mode.isOpen()) {
        this.sides[k].mode.closeMenu();
      }
    }
  }

  _enterSideModes() {
    for (let k in this.sides) {
      this.sides[k].element = ReactDOM.findDOMNode(this.refs[k]);
      this.sides[k].mode.enterMode();
    }
  }

  componentDidMount() {
    this._gestureDetector = new GestureDetector(this._splitterDOM,
      {dragMinDistance: 1});
    this._gestureDetector.on('dragstart dragleft dragright dragend',
      this._handleGesture);
    this._enterSideModes();
  }

  componentDidUpdate() {
    this._enterSideModes();
  }

  componentWillUnmount() {
    this._gestureDetector.off('dragstart dragleft dragright dragend',
      this._handleGesture);
    this._gestureDetector.dispose();
  }

  componentWillMount(props) {
    this._initSides();
  }

  componentWillReceiveProps() {
    // TODO update sides (remove not existing and update dom elements)
  }

  render() {
    const { sides, content } = _decomposeChildren(this.props);
    const contentStyle = { left: 0, right: 0 };
    for (let k in this.sides) {
      if (this.sides[k].modeName === ShowModes.MODES.SPLIT) {
        contentStyle[k] = this.sides[k].getWidth();
      }
    }

    return (
      <ons-splitter ref={(c) => this._splitterDOM = c}>
        {React.cloneElement(content, { style: contentStyle })}
        {sides.left}
        {sides.right}
        <OnsSplitterMask ref="mask" onClick={this._handleClickMask} />
      </ons-splitter>
    );
  }
}
