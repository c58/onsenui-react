import React from 'react';
import { applyModifiers } from '../modifier-util';


const scheme = {
  'carousel-item': 'carousel-item--*'
};

export default class OnsCarouselItem extends React.Component {
  render() {
    return applyModifiers(this.props, scheme, 0,
      <ons-carousel-item {...this.props} class="carousel-item">
        {this.props.children}
      </ons-carousel-item>
    );
  }
}
