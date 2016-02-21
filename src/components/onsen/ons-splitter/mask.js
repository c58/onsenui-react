import React from 'react';


export default class OnsSplitterMask extends React.Component {
  render() {
    return (
      <ons-splitter-mask {...this.props}>
        {this.props.children}
      </ons-splitter-mask>
    );
  }
}
