import React from 'react';
import { applyModifiers } from '../modifier-util';


const scheme = {
  'back-button': 'back-button--*',
  'back-button__icon': 'back-button--*__icon',
  'back-button__label': 'back-button--*__label'
};

export default class OnsBackButton extends React.Component {
  static contextTypes = {
    location: React.PropTypes.object,
    router: React.PropTypes.object,
  };

  _handleBackClick = (event) => {
    const { location, router } = this.context;
    if (location && router) {
      router.push(location.prevPath);
    }
    if (this.props.onClick) {
      this.props.onClick(event)
    }
  };

  render() {
    return applyModifiers(this.props, scheme, 1,
      <ons-back-button {...this.props} class="back-button"
        onClick={this._handleBackClick}>
        <div className="back-button__icon"></div>
        <div className="back-button__label">{this.props.children}</div>
      </ons-back-button>
    );
  }
}
