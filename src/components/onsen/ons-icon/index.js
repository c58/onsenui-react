import React from 'react';
import classNames from 'classnames';


export function _buildClassAndStyle(iconName = '', size = '', basicStyle) {
  const classList = ['ons-icon'];
  const style = basicStyle;

  // icon
  if (iconName.indexOf('ion-') === 0) {
    classList.push(iconName);
    classList.push('ons-icon--ion');
  } else if (iconName.indexOf('fa-') === 0) {
    classList.push(iconName);
    classList.push('fa');
  } else if(iconName.indexOf('md-') === 0)  {
    classList.push('zmdi');
    classList.push('zmdi-' + iconName.split(/\-(.+)?/)[1]);
  } else {
    classList.push('fa');
    classList.push('fa-' + iconName);
  }

  // size
  size = '' + size;
  if (size.match(/^[1-5]x|lg$/)) {
    classList.push('fa-' + size);
    delete style.fontSize;
  } else {
    style.fontSize = size;
  }

  return classList;
}

export default class OnsIcon extends React.Component {
  render() {
    const { icon, size, style, className } = this.props;
    const changedStyle = style || {};
    const classList = _buildClassAndStyle(icon, size, changedStyle);
    if (className) {
      classList.push(className);
    }

    return (
      <ons-icon {...this.props} style={changedStyle}
        class={classNames.apply(null, classList)}>
        {this.props.children}
      </ons-icon>
    );
  }
}
