import React from 'react';
import ReactDOM from 'react-dom';
import DoorLock from '../doorlock';
import AnimatorFactory from '../animator-factory';
import {AlertDialogAnimator, IOSAlertDialogAnimator, AndroidAlertDialogAnimator} from './animator';
import deviceBackButtonDispatcher from '../device-back-button-dispatcher';
import { applyModifiers } from '../modifier-util';
import platform from '../platform';


// Internals
let _alertsContainer = null;
let _alertShowed = false;
const _showQueue = [];
const _animatorDict = {
  'default': platform.isAndroid() ? AndroidAlertDialogAnimator : IOSAlertDialogAnimator,
  'fade': platform.isAndroid() ? AndroidAlertDialogAnimator : IOSAlertDialogAnimator,
  'none': AlertDialogAnimator
};

const scheme = {
  'alert-dialog': 'alert-dialog--*',
  'alert-dialog-container': 'alert-dialog-container--*',
  'alert-dialog-title': 'alert-dialog-title--*',
  'alert-dialog-content': 'alert-dialog-content--*',
  'alert-dialog-footer': 'alert-dialog-footer--*',
  'alert-dialog-button': 'alert-dialog-button--*',
  'alert-dialog-footer--one': 'alert-dialog-footer--one--*',
  'alert-dialog-button--one': 'alert-dialog-button--one--*',
  'alert-dialog-button--primal': 'alert-dialog-button--primal--*'
};

export function _initAlertsContainer() {
  if (_alertsContainer === null) {
    _alertsContainer = document.createElement("div");
    document.body.appendChild(_alertsContainer);
  }
}

export function _processShowQueue(forceShowNext) {
  const shower = _showQueue.shift();
  if (shower) {
    shower();
  }
}


export default class OnsAlertDialog extends React.Component {
  static defaultProps = {
    animation: 'fade',
  };

  static show(AlertComponent, props = {}) {
    _initAlertsContainer();
    _showQueue.push(() => {
      _alertShowed = true;
      ReactDOM.render(<AlertComponent {...props} />, _alertsContainer);
    });
    if (!_alertShowed) {
      _processShowQueue();
    }
  }

  constructor(props, context) {
    super(props, context);
    this.closed = false;
    this.state = { showed: false };
    this._animatorFactory = new AnimatorFactory({
      animators: _animatorDict,
      baseClass: AlertDialogAnimator,
      baseClassName: 'AlertDialogAnimator',
      defaultAnimation: props.animation,
    });
  }

  componentDidMount() {
    this.setState({ showed: true }, () => {
      const animator = this._animatorFactory.newAnimator();
      animator.show(this);
    });
  }

  close = () => {
    if (!this.closed) {
      this.closed = true;
      const animator = this._animatorFactory.newAnimator();
      animator.hide(this, () => {
        ReactDOM.unmountComponentAtNode(_alertsContainer);
        _alertShowed = false;
        _processShowQueue(true);
      });
    }
  };

  renderContent() {
  }

  render() {
    return applyModifiers(this.props, scheme, 5,
      <div style={{display: this.state ? 'block' : 'none'}}
        ref={(r) => this._root = r}>
        <div className="alert-dialog-mask"
          style={{zIndex: 20000}} ref={(m) => this._mask = m}
          onClick={this.close} />
        <div className="alert-dialog" style={{zIndex: 20001}} ref={(d) => this._dialog = d}>
          <div className="alert-dialog-container">
            {this.renderContent() || this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
