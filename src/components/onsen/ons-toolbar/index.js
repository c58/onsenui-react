import React from 'react';
import classNames from 'classnames';
import { applyModifiers } from '../modifier-util';


const scheme = {
  'navigation-bar': 'navigation-bar--*',
  'navigation-bar__left': 'navigation-bar--*__left',
  'navigation-bar__center': 'navigation-bar--*__center',
  'navigation-bar__right': 'navigation-bar--*__right'
};

export default class OnsToolbar extends React.Component {

  _getToolbarCenterItemsElement() {
    return this.refs.center;
  }

  _getToolbarLeftItemsElement() {
    return this.refs.left;
  }

  _getToolbarRightItemsElement() {
    return this.refs.right;
  }

  _ensureToolbarPart(container, name, additional) {
    const newClassName = classNames(container.props.className,
      `navigation-bar__${name}`, additional);
    return React.cloneElement(container, {
      className: newClassName,
      ref: name,
    })
  }

  render() {
    // Process inline prop
    const notInlineStile = this.props.style || {};
    if (!this.props.inline) {
      notInlineStile.position = 'absolute';
      notInlineStile.zIndex = '10000';
      notInlineStile.left = '0px';
      notInlineStile.right = '0px';
      notInlineStile.top = '0px';
    }

    // Map children with propper classes
    let children;
    if (!this.props.raw) {
      let leftItem, centerItem, rightItem;
      React.Children.map(this.props.children, (x) => {
        if (x && x.props && x.props.className) {
          const classes = x.props.className.split(' ');
          if (classes[0] === 'left') {
            leftItem = this._ensureToolbarPart(x, 'left');
          } else if (classes[0] === 'right') {
            rightItem = this._ensureToolbarPart(x, 'right');
          } else if (classes[0] === 'center') {
            centerItem = this._ensureToolbarPart(x, 'center',
              'navigation-bar__title');
          }
        }
      });
      children = [
        leftItem || <div className="left navigation-bar__left" />,
        centerItem || <div className="left navigation-bar__center" />,
        rightItem || <div className="right navigation-bar__right" />,
      ];
    } else {
      children = this.props.children;
    }

    return applyModifiers(this.props, scheme, 1,
      <ons-toolbar {...this.props} class="navigation-bar" style={notInlineStile}>
        {children}
      </ons-toolbar>
    );
  }
}
