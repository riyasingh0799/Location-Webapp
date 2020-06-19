import React from 'react';
import axios from 'axios';
import './App.css';

class App extends React.Component {

  constructor() {
    super();

    this.state = {
      proof: null,
      zkurl: "http://localhost:3000/",
      verifyURL: null,
      inputs: null
    };
  }

  addlocations(lat, lon) {
    var dateTime = new Date()
    var d1 = dateTime.getSeconds()
    var newArr = []
    // var oldItems = JSON.parse(localStorage.getItem('itemsArray')) || [];
    var oldItems = newArr || [];

    let newItem, i
    for(i=0; i<10; i++) {
        newItem = {
            'latitude': ((Math.floor(lat*10000000)+i*100)/10000000),
            'longitude': (Math.floor(lon*10000000)+i*100)/10000000,
            'timestamp': d1
         }
    oldItems.push(newItem)
    localStorage.setItem('itemsArray', JSON.stringify(oldItems))
    }
    console.log(oldItems)
 }

 verifyLoc = async(lat, lon) => {
    let zkURL, i
    var locItems = JSON.parse(localStorage.getItem('itemsArray'))
    // console.log(locItems)
    for(i=0; i<10; i++) {
      console.log(locItems[i])
      zkURL = this.state.zkurl + "loc/proof?x="+lat+"&y="+lon+"&xr="+(locItems[i]["latitude"]).toString()+"&yr="+(locItems[i]["longitude"]).toString()
      console.log(zkURL)

      await axios.get(zkURL).then(res => {
        console.log(res.data)
        this.setState({ proof: res.data.proof,                                                                //JSON object
          verifyURL: "http://localhost:3000/loc/verify?location_proof=" + encodeURI(JSON.stringify(res.data))});       //loc_proof["proof", "inputs"]     
        console.log(this.state.proof)

        document.getElementById('verification').innerHTML = JSON.stringify(this.state.proof)
    })
    console.log((this.state.verifyURL))

    await axios.get(this.state.verifyURL).then(res => {
      console.log(res.data)
      document.getElementById('verification').innerHTML = JSON.stringify(res.data)

    }).catch((e) => {
      console.log(e)
    })
    }
 }

 findLoc = async() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition( async (position) => {
      let lat = position.coords.latitude.toFixed(7)
      let lon = position.coords.longitude.toFixed(7)

      this.addlocations(lat, lon)
      this.verifyLoc(lat, lon)

    })
  }
  else {
    document.getElementById('verification').innerHTML = "Geolocation is not supported by this browser.";
  }
 }
 

  verify = async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition( async (position) => {
      let lat = position.coords.latitude.toFixed(7)
      let lon = position.coords.longitude.toFixed(7)
      // let zkURL = this.state.zkurl + "loc/proof?x="+lat+"&y="+lon+"&xr=0&yr=0"
      let zkURL = this.state.zkurl + "loc/proof?x="+lat+"&y="+lon+"&xr="+lat+"&yr="+lon
      // let zkURL = zkurl + "loc/proof?x=5&y=5&xr=0&yr=0"
      console.log(zkURL)

      await axios.get(zkURL).then(res => {
          this.setState({ proof: res.data.proof,                                                                //JSON object
            verifyURL: "http://localhost:3000/loc/verify?location_proof=" + encodeURI(JSON.stringify(res.data))});       //loc_proof["proof", "inputs"]     
          console.log(this.state.proof)
          console.log((this.state.verifyURL))

          document.getElementById('verification').innerHTML = JSON.stringify(this.state.proof)
      })
      console.log((this.state.verifyURL))

      axios.get(this.state.verifyURL).then(res => {
        console.log(res.data)
        document.getElementById('verification').innerHTML = JSON.stringify(res.data)

      }).catch((e) => {
        console.log(e)
      })
    })
  } else {
      document.getElementById('verification').innerHTML = "Geolocation is not supported by this browser.";
    }
  }

  render() {
    return (
      <div className="App">
      <header className="App-header">
        {/* <button id = "verify-location" onClick={this.verify}>Verify Location</button>         */}
        <button id = "verify-location" onClick={this.findLoc}>Verify Location</button>        

        <p id="verification"></p>
        </header>
    </div>
    )
  }
}

export default App;