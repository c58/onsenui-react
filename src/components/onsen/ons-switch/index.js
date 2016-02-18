import React from 'react';
import classNames from 'classnames';
import { applyModifiers } from '../modifier-util';
import GestureDetector from '../gesture-detector';


const scheme = {
  'switch': 'switch--*',
  'switch__input': 'switch--*__input',
  'switch__handle': 'switch--*__handle',
  'switch__toggle': 'switch--*__toggle'
};

const locations = {
  ios: [1, 21],
  material: [0, 16]
};

export default class OnsSwitch extends React.Component {
  state = {
    active: false,
  };

  get disabled() {
    return !!this.props.disabled;
  }

  get checked() {
    return this._checkbox.checked;
  }

  set checked(value) {
    if (!!value !== this._checkbox.checked) {
      this._checkbox.click();
      this._checkbox.checked = !!value;
    }
  }

  componentDidMount() {
    this._gestureDetector = new GestureDetector(this._dom, {dragMinDistance: 1,
      holdTimeout: 251});
    this._checkbox.addEventListener('change', this._onChange);
    this._dom.addEventListener('dragstart', this._onDragStart);
    this._dom.addEventListener('hold', this._onHold);
    this._dom.addEventListener('tap', this._onClick);
    this._locations = locations['ios'];
  }

  componentWillUnmount() {
    this._checkbox.removeEventListener('change', this._onChange);
    this._dom.removeEventListener('dragstart', this._onDragStart);
    this._dom.removeEventListener('hold', this._onHold);
    this._dom.removeEventListener('tap', this._onClick);
    this._gestureDetector.dispose();
  }

  _onClick = () => {
    if (!this.disabled) {
      this.checked = !this.checked;
    }
  }

  _onHold = (e) => {
    if (!this.disabled) {
      this.setState({ active: true });
      document.addEventListener('release', this._onRelease);
    }
  };

  _onDragStart = (e) => {
    if (this.disabled || ['left', 'right'].indexOf(e.gesture.direction) === -1) {
      this.setState({ active: false });
      return;
    }
    e.stopPropagation();
    this.setState({ active: true });
    this._startX = this._locations[this.checked ? 1 : 0]; // - e.gesture.deltaX;
    this._gestureDetector.on('drag dragleft dragright', this._onDrag);
    document.addEventListener('release', this._onRelease);
  };

  _onDrag = (e) => {
    e.stopPropagation();
    e.gesture.srcEvent.preventDefault();
    var l = this._locations;
    var position = Math.min(l[1], Math.max(l[0], this._startX + e.gesture.deltaX));
    this._handle.style.left = position + 'px';
    this.checked = position >= (l[0] + l[1]) / 2;
  };

  _onRelease = (e) => {
    this._gestureDetector.off('dragleft dragright', this._onDrag);
    document.removeEventListener('release', this._onRelease);
    this._handle.style.left = '';
    this.setState({ active: false });
  };

  render() {
    const className = classNames({
      'switch': true,
      'switch--active': this.state.active
    });
    return applyModifiers(this.props, scheme, 3,
      <ons-switch {...this.props} class={className} onClick={this._onClick}
        ref={(d) => this._dom = d}>
        <input type="checkbox" className="switch__input"
          checked={this.props.checked} onChange={this.props.onChange}
          disabled={this.props.disabled} ref={(d) => this._checkbox = d} />
        <div className="switch__toggle">
          <div className="switch__handle" ref={(d) => this._handle = d}>
            <div className="switch__touch"></div>
          </div>
        </div>
      </ons-switch>
    );
  }
}
