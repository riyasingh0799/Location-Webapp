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

  verify = async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition( async (position) => {
      let lat = position.coords.latitude.toFixed(7)
      let lon = position.coords.longitude.toFixed(7)
      let verifyURL
      // let zkURL = zkurl + "loc/proof?x="+lat+"&y="+lon+"&xr=0&yr=0"
      let zkURL = this.state.zkurl + "loc/proof?x="+lat+"&y="+lon+"&xr="+lat+"&yr="+lon
      // let zkURL = zkurl + "loc/proof?x=5&y=5&xr=0&yr=0"
      console.log(zkURL)

      await axios.get(zkURL).then(res => {
          this.setState({ proof: res.data.proof,                                                                //JSON object
            verifyURL: "http://localhost:3000/loc/verify?location_proof=" + encodeURI(JSON.stringify(res.data))});       //loc_proof["proof", "inputs"]     
          console.log(this.state.proof)
          console.log((this.state.verifyURL))

          // verifyURL= "http://localhost:3000/loc/verify?proof=" + JSON.stringify(this.state.proof)
          // console.log((verifyURL))
          document.getElementById('verification').innerHTML = JSON.stringify(this.state.proof)
      })
      console.log((this.state.verifyURL))

      axios.get(this.state.verifyURL).then(res => {
        console.log(res)
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
        <button id = "verify-location" onClick={this.verify}>Verify Location</button>        
        <p id="verification"></p>
        </header>
    </div>
    )
  }
}

export default App;