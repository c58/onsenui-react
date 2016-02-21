import React from 'react';
import OnsToolbar from '../ons-toolbar';
import platform from '../platform';
import { applyModifiers } from '../modifier-util';
import ons from '../ons';


// Internals
const scheme = {
  'page': 'page--*',
  'page__content': 'page--*__content',
  'page__background': 'page--*__background'
};

export function _shouldFillStatusBar(element) {
  const checkStatusBar = () => {
    if (platform.isWebView() && platform.isIOS7above()) {
      if (!(element instanceof HTMLElement)) {
        throw new Error('element must be an instance of HTMLElement');
      }

      for (;;) {
        if (element.hasAttribute('no-status-bar-fill')) {
          return false;
        }

        element = element.parentNode;
        if (!element || !element.hasAttribute) {
          return true;
        }
      }
    }
    return false;
  };

  return new Promise(function(resolve, reject) {
    if (typeof device === 'object') {
      document.addEventListener('deviceready', () => {
        resolve(checkStatusBar());
      });
    } else {
      ons.ready(() => {
        resolve(checkStatusBar());
      })
    }
  });
};

/**
 * Abstract ons-page component.
 * You need to extend it and implement `renderContent` method.
 * Optionally you might implement `renderToolbar` and `renderBottomToolbar`
 * methods.
 */
export default class OnsPage extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object,
    location: React.PropTypes.object,
  };

  _getToolbarElement() {
    return this.refs.toolbar;
  }

  _getBottomToolbarElement() {
    return this.refs.bottomToolbar;
  }

  _getContentElement() {
    return this.refs.content;
  }

  _getBackgroundElement() {
    return this.refs.background;
  }

  _canAnimateToolbar() {
    return !!this._getToolbarElement();
  }

  componentDidMount() {
    if (this._isNeedToFillStatus === undefined) {
      _shouldFillStatusBar(this._pageDOM).then((res) => {
        this._isNeedToFillStatus = res;
        this.forceUpdate();
      })
    }
  }

  renderBottomToolbar() {
    // do nothing by default
  }

  renderToolbar() {
    // do nothing by default
  }

  renderContent() {
    // do nothing by default
  }

  renderStatusFill() {
    return this._isNeedToFillStatus && (
      <div className="page__status-bar-fill" style={{width: 0, height: 0}} />
    );
  }

  render() {
    const content = this.renderContent() || this.props.children;

    let topToolbar = this.renderToolbar();
    topToolbar = topToolbar && React.cloneElement(topToolbar,
      { ref: 'toolbar' });

    let bottomToolbar = this.renderBottomToolbar();
    bottomToolbar = bottomToolbar && React.cloneElement(bottomToolbar,
      { ref: 'bottomToolbar' });

    return applyModifiers(this.props, scheme, 1,
      <ons-page class="page" style={this.props.style}
        ref={(d) => this._pageDOM = d}>
        {this.renderStatusFill()}
        {topToolbar}
        <div className="page__background" ref="background"></div>
        <div className="page__content" ref="content">{content}</div>
        {bottomToolbar}
      </ons-page>
    );
  }
}
