import React from 'react';
import { applyModifiers } from '../modifier-util';


const scheme = {
  'list__header': 'list__header--*'
};

export default class OnsListHeader extends React.Component {
  render() {
    return applyModifiers(this.props, scheme, 0,
      <ons-list-header {...this.props} class="list__header">
        {this.props.children}
      </ons-list-header>
    );
  }
}
