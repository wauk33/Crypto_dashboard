import React from "react";
import ReactDOM from "react-dom/client";
import 'animate.css';

import './index.css';
import reportWebVitals from './reportWebVitals';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Clock from './Clock';
import Nickname from './Nickname';
import PreloadingIcon from './preloadingIcon';
import DashboardContainer from './dashboardContainer';

const root = ReactDOM.createRoot(document.getElementById('root'));


class Wrapper extends React.Component {
  render(){
    return(
    <div className="wrapper">
      <Portal />
      <App />
    </div>
    );
  }
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      expanded: false,
      height: "200px",
      width: "400px",
      visibility: "hidden",
      inputValue: "Anonymous",
      changeHandle: false,
      logInHide: "flex",
      preloading: "none",
      afterLoginHide: "block",
      openedApp: "none",
      name: "Anonymous",
      timeHeight: "100%"
    }

    this.expand = this.expand.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.logIn = this.logIn.bind(this)
    this.handleKeypress = this.handleKeypress.bind(this)

  }
  expand(){
    if ((this.state.expanded) === false){
    this.setState({expanded: true, height: "700px", visibility: "visible", logInHide: "flex"})
    }

    else{
    this.setState({expanded: false, height: "200px", visibility: "hidden", logInHide: "none"})
    }
  }
  handleInput(e){
    let input = e.currentTarget.value
    if ((input) != this.state.inputValue) {
      console.log("Zmiana.") 
      console.log(this.state.inputValue)
      this.setState({inputValue: input, changeHandle: true, name: input})
    } 
  }
  handleKeypress(e){
    console.log(e.key)
    if ((e.key === 'Enter') & (this.state.openedApp === 'none'))
    {
      this.logIn()
    }
  }
  preloadingHandle(e){

  }
  logIn(){
    if ((this.state.expanded) === (true)){
    setTimeout(() => this.setState({afterLoginHide: "none", logInHide: "none", preloading: "flex"}), 600)
    }
      setTimeout(() => this.openApp(), 5000)
  }
  openApp(name){
    if ((this.state.preloading) === 'flex'){
    console.log("app opened" + this.state.height + "height." + this.state.width + "width." + " Name: " + {name})
    this.setState({height: '95vh', width: '95%'})
    setTimeout(() => this.setState({preloading: "none"}), 1100)
    setTimeout(() => this.appOpened(), 200)

    }
  } 
  appOpened(){
    if ((this.state.preloading) === 'none'){
    this.setState({ openedApp: "flex", timeHeight: "auto"})
    }
    else {
    this.setState({ openedApp: "none", timeHeight: "100%"})
    this.openApp()
    }
  }
  render(){
    return(
      <div className="main" style={{ height: (this.state.height), width: (this.state.width)}} onKeyPress={this.handleKeypress}>
        <PreloadingIcon preloading={this.state.preloading} />

        <div className="logo-container"  style={{ display: (this.state.afterLoginHide)}}>
        <div className="logo" onClick={this.expand}></div>
        </div>
 
        <Nickname visibility={this.state.visibility} inputValue={this.state.inputValue} changeHandle={this.state.changeHandle} afterLoginHide={this.state.afterLoginHide}/> 
         
        <div className="head" style={{ visibility: (this.state.visibility), display: (this.state.logInHide)}}>
          <TextField id="outlined-search" onChange={this.handleInput} label="Wpisz swoją nazwę.." color="primary" type="search"/>
          <Button onClick={this.logIn} variant="contained" color="primary">Przejdź</Button>
        </div>
        <Dashboard openedApp={this.state.openedApp} height={this.state.height} name={this.state.name}/>
        
        {/* <Clock visibility={this.state.visibility} timeHeight={this.state.timeHeight}/> */}

        </div>
    ); 
  }
}


class Portal extends React.Component {
  render(){
    return(
      <div className="portal-container">
        <div className="portal"></div>
      </div>
    );
  }
}

root.render(
    <Wrapper />
  );


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
