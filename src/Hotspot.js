import React, { Component } from 'react';

class Hotspot extends Component {
  render() {
    return (
      <div class="lds-css ng-scope" style={{
        width: 100,
        height: 100
      }}>
        <div style={{
        width: '100%',
        height: '100%'
        }} class="lds-ripple">
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
}

export default Hotspot;
