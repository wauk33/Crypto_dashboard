import React from "react";
import './clock.css'



class Clock extends React.Component {
    constructor(props){
      super(props);
        this.state = { 
            time: null,
        }
      }
      
    componentDidMount(){
      this.IDinterval = setInterval(() => this.tick(), 1000)
    }
    componentWillUnmount(){
      clearInterval(this.IDinterval)
    }
    
    tick(){
      this.setState({
        time: new Date().toLocaleString()
      })
    }

    render(){  
        return(
        <div className="text-time" style={{ visibility: (this.props.visibility), height: (this.props.timeHeight)}}>
            <div className="text-time-bg"><p>{this.state.time}</p></div>
        </div>
        )
      }
  } 

  export default Clock