import React, { Component } from 'react';
import './static/css/style.css';
import one from './1.png'
import Hotspot from './Hotspot'
import Chart from './Chart'
import two from './2.png'
import ripple from './ripple.gif'
import three from './3.png'
import hotel from './hotel.png'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="wrap">
          <div className="inwrap">
            <div>
            <h1 className="tow">
                <span className="red">triv</span><span className="two">astma</span><span className="third">go</span> insights™
            </h1>
              <p>Hei, Petter Stordalen! Her har du en oversikt over ditt hotell</p>
              <div
                style={{
                  position:'relative'
                }}
              >
                <img src={hotel} />
                <img src={ripple} style={{
                  position: 'absolute',
                  width: '100px',
                  left: 180,
                  top: 170
                }} />
                <img src={ripple} style={{
                  position: 'absolute',
                  width: '100px',
                  left: 380,
                  top: 170
                }} />
                <img src={ripple} style={{
                  position: 'absolute',
                  width: '100px',
                  left: 420,
                  top: 150
                }} />

                <img src={ripple} style={{
                  position: 'absolute',
                  width: '100px',
                  left: 460,
                  top: 130
                }} />
                <img src={ripple} style={{
                  position: 'absolute',
                  width: '100px',
                  left: 600,
                  top: 80
                }} />
              </div>
              <Chart />
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default App;
