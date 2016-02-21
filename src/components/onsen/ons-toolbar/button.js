import React from 'react';
import { applyModifiers } from '../modifier-util';


const scheme = {
  'toolbar-button': 'toolbar-button--*'
};

export default class OnsToolbarButton extends React.Component {
  render() {
    return applyModifiers(this.props, scheme, 0,
      <ons-toolbar-button {...this.props} class="toolbar-button">
        {this.props.children}
      </ons-toolbar-button>
    );
  }
}
