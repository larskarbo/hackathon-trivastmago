import React, { Component } from 'react';
import Chart from 'chart.js';
import moment from 'moment'
const AWSMqtt = require('aws-mqtt-client').default
const API = require('./api.class.js').default
const myApi = new API('oy0yDJfZdQkQ52LLCugD6IQNiC8l1Xcacm89kg44')

// Insert variables
const IOT_ENDPOINT = 'a3k7odshaiipe8-ats.iot.eu-west-1.amazonaws.com'
const AWS_REGION = 'eu-west-1'
const USERNAME = 'elsyshack'
const PASSWORD = '12ElsyShacK!'


let hahaha = 0


class loldrit extends Component {
  componentDidMount() {
    var ctx = this.c.getContext('2d');
    this.chartman = new Chart(ctx, {
      type: 'line',
      cubicInterpolationMode: 'monotone',
      data: {
        labels: [],
        datasets: [{
          label: 'Rom 312',
          data: [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
    // Invoke our program
    this.main()

   


  }

  addData = (data, timestamp) => {
    if (this.chartman.data.labels.length > 30) {
      console.log('this.chartman.data.labels.length: ', this.chartman.data.labels.length);
      this.chartman.data.labels.shift()
      this.chartman.data.datasets[0].data.shift()
      // this.chartman.data.datasets[1].data.shift()
    }
    this.chartman.data.labels.push(moment(timestamp).locale('no-nb').format('LT'));
    this.chartman.data.datasets.forEach((dataset, i) => {
      if (i == 0) {
        dataset.data.push(data);
      } else {
        if (hahaha === 0) {
          dataset.data.push(data);
          
        } else {

          dataset.data.push(dataset.data[dataset.data.length - 1]);
        }
        hahaha += 1
        if (hahaha > 4) {
          hahaha = 0
        }
      }
    });
    this.chartman.update();
  }

  main = async () => {
    try {
      await myApi.init() // Init API (fetch Manifest)
      await myApi.login({
        username: USERNAME,
        password: PASSWORD
      })

      // Create a Cognito Identity before authorizing MQTT client
      const cognitoIdentity = await myApi.createCognitoIdentity(myApi.credentials.token)

      var oneHourAgo = new Date();

      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      let result = await myApi.invoke({
        method: 'post',
        url: '/observations/find',
        data: {
          query: {
            size: 100,
            query: {
              bool: {
                filter: [
                  {
                    range: {
                      timestamp: {
                        gte: oneHourAgo,
                        lte: new Date()
                      }
                    }
                  },
                  {
                    term: {
                      thingName: '00001648' // Replace 00001570 with your Thing Type ID
                    }
                  }
                ]
              }
            }
          }
        }
      })
      console.log(result.data.hits.hits)

      result.data.hits.hits.forEach(r => {
        const dust = r._source.state.dust
        const timestamp = r._source.state.timestamp

        this.addData(dust, timestamp)
      })



      // Instantiate a new MQTT client with configurations
      let MQTTClient = new AWSMqtt({
        region: AWS_REGION,
        accessKeyId: cognitoIdentity.accessKeyId,
        secretAccessKey: cognitoIdentity.secretAccessKey,
        sessionToken: cognitoIdentity.sessionToken,
        endpointAddress: IOT_ENDPOINT,
        maximumReconnectTimeMs: 8000,
        protocol: 'wss'
      })
      // If an error occurs
      MQTTClient.on('error', e => {
        console.error('MQTT error:', e)
      })

      // If a reconnect happens
      MQTTClient.on('reconnect', () => {
        console.error('MQTT reconnect, check topic')
      })

      // Incoming message
      MQTTClient.on('message', (topic, message) => {
        const mesh = JSON.parse(message.toString('utf-8'))
        console.log('mesh: ', mesh);
        // this.addData(mesh.state.reported.dust, mesh.state.reported.timestamp)
      })

      setInterval(() => {
        this.addData((Math.random() * 700) + 300, new Date())
      }, 6000)

      setTimeout(() => {
        this.addData((Math.random() * 400) + 400, new Date())
      }, 3000)

      // Subscribe to a topic after connect
      MQTTClient.on('connect', () => {
        console.log('connect')
        MQTTClient.subscribe('thing-update/elsyshack/00001648')
      })
    } catch (e) {
      console.error('An error occured:', e)
    }


  }


  render() {
    return (
      <div>
        <canvas ref={(c) => { this.c = c }} width="400" height="400"></canvas>
      </div>
    );
  }
}

export default loldrit;
