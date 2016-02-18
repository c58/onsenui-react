import React from 'react';
import { applyModifiers } from '../modifier-util';


const scheme = {
  'button': 'button--*'
};

export default class OnsButton extends React.Component {
  render() {
    return applyModifiers(this.props, scheme, 0,
      <ons-button {...this.props} class="button">
        {this.props.children}
      </ons-button>
    );
  }
}
