import React from "react";
import axios from "axios";
import { Map, View } from "ol";
import {Tile as TileLayer, Image as ImageLayer} from "ol/layer";
import {OSM} from "ol/source";
import {transform, fromLonLat} from 'ol/proj'
import * as moment from 'moment';

import "./App.css";

class App extends React.Component {
  constructor() {
    super();
    var s = moment().toISOString().slice(0, 16);
    console.log(s)
    this.state = {
      proof: null,
      zkurl: "http://localhost:3000/",
      verifyURL: null,
      timestamp: s,
      map: null,
      LocationsArray: [],
      mousePositionControl: null,
      showTimestampForm: 'hidden',
      coordinates: null
    };
  }

  componentDidMount() {

    var lat, lon, centerCoords
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
         lat = position.coords.latitude.toFixed(7);
         lon = position.coords.longitude.toFixed(7);
         console.log(lat)
         centerCoords = [lon, lat]
        console.log(centerCoords)
        var map = new Map({
          target: "map",
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
            // new ImageLayer({
            //   source: new ImageArcGISRest({
            //     ratio: 1,
            //     params: {},
            //     url: url
            //   })
            // })
          ],
          view: new View({
            center: fromLonLat(centerCoords),
            zoom: 2
          }),
        })
    
        this.setState({map: map})
        this.getCoord = this.getCoord.bind(this);
        this.handleChangeTS = this.handleChangeTS.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    
      })
    }
    else {
      // centerCoords = [0, 0]
    }


    
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleChangeTS(event) {
    console.log(event.target.value)
    var s = event.target.value;
    // moment.parseZone(s, 'yyyy-MM-ddThh:mm').utcOffset()

    this.setState({timestamp: s });
  }

  handleSubmit(event) {
    event.preventDefault()
    var loc_data = this.state.LocationsArray || []
    var newLocationInfo = {
      metadata: "f7a78fb4f95e569c9d8c85cef69e869f3bec33a8",
      latitude: this.state.coordinates[0].toFixed(7),
      longitude: this.state.coordinates[1].toFixed(7),
      timestamp: this.state.timestamp,
    }
    loc_data.push(newLocationInfo)
    this.setState({LocationsArray: loc_data, showTimestampForm: 'hidden'})
    console.log(this.state.LocationsArray)
    this.setState({coordinates: null, timestamp: moment().toISOString().slice(0, 16)})
  }

  // setPrimaryLocation() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(async (position) => {
  //       let lat = position.coords.latitude.toFixed(7);
  //       let lon = position.coords.longitude.toFixed(7);
        
  //       var map = this.state.map 
  //       map.view = new View({
  //         center: [lat, lon],
  //         zoom: 4
  //       })

  //       this.setState({map: map})
  //     })
  //   }
  // }

  addInfectionData(lat, lon) {
    var newArr = [];
    let newItem, i;
    for (i = 0; i < 10; i++) {
      newItem = {
        metadata: "243b39889c7263a5d27ce4f5c452a45c726ad3c1",
        latitude: (Math.floor(lat * 10000000) + i * 1000000000) / 10000000,
        longitude: (Math.floor(lon * 10000000) + i * 100) / 10000000,
        timestamp: this.state.timestamp - i * 60,
      };
      newArr.push(newItem);
      localStorage.setItem("infectionData", JSON.stringify(newArr));
    }
    console.log(newArr);
  }

  addlocations(lat, lon) {
    // var oldItems = JSON.parse(localStorage.getItem('itemsArray')) || [];
    var newArr = [];

    let newItem, i;
    for (i = 0; i < 10; i++) {
      newItem = {
        metadata: "f7a78fb4f95e569c9d8c85cef69e869f3bec33a8",
        latitude: Math.floor(lat * 10000000) / 10000000,
        longitude: Math.floor(lon * 10000000) / 10000000,
        timestamp: this.state.timestamp - i * 60,
      };
      newArr.push(newItem);
      localStorage.setItem("staticLocations", JSON.stringify(newArr));
    }
    console.log(newArr);
  }

  verifyLoc = async () => {
    let zkURL, i, checkData;
    var infectionData = JSON.parse(localStorage.getItem("infectionData"));
    var staticLocations = JSON.parse(localStorage.getItem("staticLocations"));
    console.log(infectionData[1]);
    for (i = 0; i <= 9; i++) {
      checkData = staticLocations.filter(
        (loc) => loc["timestamp"] === infectionData[i]["timestamp"]
      );
      zkURL =
        this.state.zkurl +
        "loc/proof?x=" +
        checkData[0]["latitude"].toString() +
        "&y=" +
        checkData[0]["longitude"].toString() +
        "&xr=" +
        infectionData[i]["latitude"].toString() +
        "&yr=" +
        infectionData[i]["longitude"].toString();
      console.log(zkURL);

      await axios.get(zkURL).then((res) => {
        console.log(res.data);
        this.setState({
          proof: res.data.proof, //JSON object
          verifyURL:
            "http://localhost:3000/loc/verify?location_proof=" +
            encodeURI(JSON.stringify(res.data)),
        }); //loc_proof["proof", "inputs"]
        console.log(this.state.proof);

        document.getElementById("verification").innerHTML = JSON.stringify(
          this.state.proof
        );
      });
      console.log(this.state.verifyURL);

      await axios
        .get(this.state.verifyURL)
        .then((res) => {
          console.log(res.data);
          document.getElementById("verification").innerHTML = JSON.stringify(
            res.data
          );
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  getCoord(event){
    var coordinate = this.state.map.getEventCoordinate(event);
    var coordinate2 = transform(coordinate, 'EPSG:3857', 'EPSG:4326')
    console.log(coordinate2)
    this.setState({coordinates: coordinate2, showTimestampForm : 'visible'})
 }

  findLoc = async () => {
    await this.setState({ timestamp: Math.floor(Date.now() / 1000) }); //get timestamp
    console.log(this.state.timestamp);

    //get coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        let lat = position.coords.latitude.toFixed(7);
        let lon = position.coords.longitude.toFixed(7);

        this.addInfectionData(lat, lon); //add dummy data for infected persons
        this.addlocations(lat, lon); //add static locations for check
        this.verifyLoc(); //
      });
    } else {
      document.getElementById("verification").innerHTML =
        "Geolocation is not supported by this browser.";
    }
  };

  verify = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        let lat = position.coords.latitude.toFixed(7);
        let lon = position.coords.longitude.toFixed(7);
        // let zkURL = this.state.zkurl + "loc/proof?x="+lat+"&y="+lon+"&xr=0&yr=0"
        let zkURL =
          this.state.zkurl +
          "loc/proof?x=" +
          lat +
          "&y=" +
          lon +
          "&xr=" +
          lat +
          "&yr=" +
          lon;
        // let zkURL = zkurl + "loc/proof?x=5&y=5&xr=0&yr=0"
        console.log(zkURL);

        await axios.get(zkURL).then((res) => {
          this.setState({
            proof: res.data.proof, //JSON object
            verifyURL:
              "http://localhost:3000/loc/verify?location_proof=" +
              encodeURI(JSON.stringify(res.data)),
          }); //loc_proof["proof", "inputs"]
          console.log(this.state.proof);
          console.log(this.state.verifyURL);

          document.getElementById("verification").innerHTML = JSON.stringify(
            this.state.proof
          );
        });
        console.log(this.state.verifyURL);

        axios
          .get(this.state.verifyURL)
          .then((res) => {
            console.log(res.data);
            document.getElementById("verification").innerHTML = JSON.stringify(
              res.data
            );
          })
          .catch((e) => {
            console.log(e);
          });
      });
    } else {
      document.getElementById("verification").innerHTML =
        "Geolocation is not supported by this browser.";
    }
  };

  render() {
    return (
      <div className="App">
          {/* <button id="showMapButton" onClick={async() => await this.showMap}>
            Show Map
          </button> */}
          <div id="map" className="map" style={{height: "400px", width: "100%"}} onChange={this.handleChange} onClick={(event) => {
            this.getCoord(event)
          }} value={this.state.map}></div>
            <div>
          <form style={{visibility: this.state.showTimestampForm}} onSubmit={this.handleSubmit}>
            <label htmlFor="timestamp">Pick a date and time</label>&emsp;
            <input id="timestamp" type="datetime-local" value="this.state.timestamp" onChange={this.handleChangeTS}></input>
            <input type="submit" value="Submit Location Info"></input>
          </form>
          </div>
         
          <button id="verify-location" onClick={this.findLoc}>
            Verify Location
          </button>

          <p id="verification"></p>
      </div>
    );
  }
}

export default App;
