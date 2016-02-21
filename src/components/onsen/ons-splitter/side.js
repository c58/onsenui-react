import React from 'react';


export default class OnsSplitterSide extends React.Component {
  render() {
    return (
      <ons-splitter-side {...this.props}>
        {this.props.children}
      </ons-splitter-side>
    );
  }
}
