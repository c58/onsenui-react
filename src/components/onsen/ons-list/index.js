import React from 'react';
import { applyModifiers } from '../modifier-util';


// Internals
const scheme = {
  'list': 'list--*'
};

export default class OnsList extends React.Component {
  render() {
    return applyModifiers(this.props, scheme, 0,
      <ons-list {...this.props} class="list">
        {this.props.children}
      </ons-list>
    );
  }
}
