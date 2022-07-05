import React from "react";
import "./preloadingIcon.css";

class PreloadingIcon extends React.Component {

    render(){
        return(
            <div className="preloading-container" style={{display: (this.props.preloading)}}>
            <div className="preloading-icon"></div>
            <div className="preloading-text">Ładowanie...</div>
            </div>
        ) 
    }
}

export default PreloadingIcon
      