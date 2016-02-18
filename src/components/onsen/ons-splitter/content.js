import React from 'react';


export default class OnsSplitterContent extends React.Component {
  render() {
    return (
      <ons-splitter-content {...this.props}>
        {this.props.children}
      </ons-splitter-content>
    );
  }
}
