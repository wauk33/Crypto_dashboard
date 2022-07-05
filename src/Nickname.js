import React from "react";
import './nickname.css'

class Nickname extends React.Component{
    constructor(props){
        super(props);
            this.state = {
                // input: null,
                // changeHandle: false
            }
        }
// componentDidMount(){
//     this.intervalID = setInterval(() => this.applyInput(), 1000)
// }
// componentWillUnmount(){
//     clearInterval(this.intervalID)
// }

// applyInput(){
//     console.log(this.props.input + " 1")
//     if ((this.props.changeHandle) != (false)){
//         this.setState({changeHandle: true, input: (this.props.input)})
//         console.log(this.props.input + " - props input")
//         console.log(this.state.input + " - state input")
//         console.log(this.state.changeHandle + " - Change")

//     } else
//         this.setState({changeHandle: false})
        
// }
render(){
    console.dir(this.props.inputValue + " - props.input")
    return(
        <div className="nickname" style={{ visibility: (this.props.visibility), display: (this.props.afterLoginHide)}}><p><b>{this.props.inputValue}</b></p></div>
    )
}
}
export default Nickname