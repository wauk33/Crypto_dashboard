import React from "react";
import './dashboardContainer.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import { VscSearch } from 'react-icons/vsc/';
import { RiRefreshLine } from 'react-icons/ri/';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chart from './Chart';

// class NFT extends React.Component {
//     render(){  
//         return(
//         <div className="nft">       
//             <div className="nft-header"><p>Najlepsze</p></div>   
//             <div className="nft-image"><img src="./nft1.png"></img></div> 
//             <div className="nft-collection"><p><a href="https://opensea.io/collection/bluesnft">Blues NFT</a></p></div>
//             <div className="nft-info">
//                 <div className="nft-name"><p>Blues</p>
//                 <div className="nft-id">
//                     <p>#2451</p> 
//                 </div>  
//                 </div>
//                 <div className="nft-price"><img className="etherIcon" src="./ether.svg"/><p> 0.3</p></div>
//             </div>
//             <Button variant="contained">OpenSea</Button>
//         </div>
//         )
//     }  
    
// }     
const options = {method: 'GET'};

// fetch('https://testnets-api.opensea.io/api/v1/collections?offset=0&limit=300', options)
//   .then(response => response.json())
//   .then(response => console.log(response))
//   .catch(err => console.error(err));
// const offsetValue = () => {
//     for (let i; i<5; i++){
//         offset = i
// }
let offset = 0
let y = 0
let isNull = true


class Dashboard extends React.Component {
    constructor(){
        super();
        this.state = {
            pointStop: "-10px",
            pointValue: "Home",
            data: '',
            assetName: '',
            assetCollectionName: '',
            assetImgUrl: null,
            assetImgUrlBackup: '',
            assetCollectionUrl: '',
            assetHash: '',
            isAutoRefreshing: false,
            isNull: true, 
            intervalSearch: false,
            refreshButtonDisabled: false
        }

        this.autoRefresh = this.autoRefresh.bind(this)
        this.refresh = this.refresh.bind(this)
        this.refreshOnClick = this.refreshOnClick.bind(this)
     

    }


    fetchData = () => {      

        fetch('https://testnets-api.opensea.io/api/v1/assets?order_direction=desc&offset=' + offset + '&limit=50&include_orders=false', options)
        .then(res => res.json())
        .then((respond) => {
                console.log("FETCH, offset: " + offset)
                console.log("Y = " + y)
                console.log("Name?: " + respond.assets[y].name)
                console.log("Img?: " + respond.assets[y].image_original_url)

                if((respond.assets[y].image_original_url === null) || (respond.assets[y].image_url === null) || (respond.assets[y].name === null)){
                    console.dir("NO NAME OR IMG URL")
                    this.setState({isNull: true, data: respond.assets[y]})
                    isNull = true
                    this.refreshPlaceholder()
                }
                else {

                    this.setState({ 
                        data: respond.assets[y], 
                        assetName: respond.assets[y].name,
                        assetCollectionName: respond.assets[y].collection.name,
                        assetImgUrl: respond.assets[y].image_original_url,
                        assetImgUrl2: respond.assets[y].image_url,
                        assetImgUrlBackup: respond.assets[y].image_original_url,
                        assetCollectionUrl: respond.assets[y].permalink,
                        assetHash: respond.assets[y].token_id,
                        isLoaded: null,
                        isNull: false
                    })

                    clearInterval(this.interval2ID)
                    this.setState({intervalSearch: false}) 

                    isNull = false
                    console.log("Przypisano odpowiedź do stanu.")
                }
                
                console.log("isNull?:" + isNull)
                console.log(respond.assets[y])
                console.log("")
                y++

                if (y > 49){
                    y = 0
                    offset = offset + 50 
                } 
                if (offset > 9999)
                    offset = 0
            },
            (error) => {
                this.setState({
                  isLoaded: true,
                  error})
                }
        )
    }

    componentDidMount (){
        this.refresh()
        // this.interval2ID = setInterval(this.intervalSearch, 50)

        // if (this.state.isAutoRefreshing === true)
        // this.intervalID = setInterval(this.fetchData, 3000)
        // this.fetchData()

    }

    componentWillUnmount (){


    }
    intervalSearch = () => {
            if ((isNull === true) && (this.state.data !== null )){
                this.setState({intervalSearch: true, data: null })
                console.log("----- NULL! ----- Y:" + y)
                console.log(this.state.isNull)
                console.log("Searching..")
                console.log("")
                this.fetchData()
            }
            if ((isNull === false) && (this.state.data === null )){
                this.setState({intervalSearch: false})
                console.log("----- NOT NULL ----- Y:" + y)
                console.log("")
                clearInterval(this.interval2ID)
            }
        
    }
    refreshOnClick(){


        if((this.state.refreshButtonDisabled === false) && (this.state.intervalSearch === false)){
            this.refresh();
        }
        if(this.state.refreshButtonDisabled === true){
        }
        console.log("IntervalSearch?: " + this.state.intervalSearch)
        console.log("AutoRefreshing?: " + this.state.isAutoRefreshing)
        console.log("refreshButtonDisabledForAutoRefresh?: " + this.state.refreshButtonDisabled)
    }


    refresh(){
        console.log("IntervalSearch?: " + this.state.intervalSearch)
        console.log("AutoRefreshing?: " + this.state.isAutoRefreshing)
        console.log("refreshButtonDisabledForAutoRefresh?: " + this.state.refreshButtonDisabled)
        if(this.state.intervalSearch === false) {
            this.refreshPlaceholder()
            this.fetchData()
            console.log(">> Refreshing..")
            this.setState({intervalSearch: true})
            this.interval2ID = setInterval(this.intervalSearch, 30)

        }
    }
    autoRefresh(){
        
        if (this.state.isAutoRefreshing === false){
            this.setState({isAutoRefreshing: true, refreshButtonDisabled: true})
            this.refresh()
                this.intervalID = setInterval(this.refresh, 4000)
            console.log("Auto-refresh: true")
        }

        else {  if(this.state.isAutoRefreshing === true){
                    this.setState({isAutoRefreshing: false, assetImgUrl: this.state.assetImgUrlBackup, refreshButtonDisabled: false})
                    clearInterval(this.intervalID)
                    console.log("Auto-refresh: false")}}

    }
    
    refreshPlaceholder(){
        if ((!this.state.isLoaded)) {
            this.setState({ 
            assetImgUrl: './preload.gif',
            assetName: 'Pobieranie..',
            assetCollectionName: " -",
            assetCollectionUrl: "",
            assetHash: " -"
            })
        }
    }


    handleScroll = e => {
        let element = e.target
        let scrollHeight = element.scrollTop
        if ((scrollHeight) < 550){ 
            this.setState({pointStop: "-10px", pointValue: "Home"})
        }
        if ((scrollHeight) > 550){ 
            this.setState({pointStop: "950px", pointValue: "Kolekcje"})
        }
        if ((scrollHeight) > 1300){ 
            this.setState({pointStop: "1700px", pointValue: "-5px"})
        }
        if ((scrollHeight) > 2500){ 
            this.setState({pointStop: "2500px", pointValue: "-10px"})
        }
    }
    render(){  
        const { 
                error,
                isLoaded,
                data,
                assetCollectionName,
                assetCollectionUrl,
                assetImgUrl,
                assetName 
        } = this.state;
        
        // console.dir(data)
        // console.dir(assetCollectionName)
        // console.dir(assetCollectionUrl) 
        // console.dir(assetImgUrl)
        // console.dir(assetName)
        
        if (error) return <div>Błąd API</div>
        // else if (!isLoaded) return <div>Ładowanie..</div>

        // mapItems = () => { 
        //     items.map((item) => ({item.collections}))
        //     console.log(items)
        //     console.log(item)
        //     console.log(collections) 
        // } 
          
        return( 
            <div className="dashboard-container" onScroll={this.handleScroll} style={{ display: (this.props.openedApp)}}>
                <div className="timeline animate__animated animate__fadeInUp"> 
                        <div className="point" style={{ marginTop: (this.state.pointStop)}}><p>{this.state.pointValue}</p></div>
                        </div> 
 
                <div className="dashboard">   
 
                <div className="dashboard-box">

                <TextField size="small" className="search-field animate__animated animate__fadeIn" label="Szukaj" color="primary"
                InputProps={{ 
                    startAdornment: (
                        <InputAdornment position="start">
                        { <VscSearch />}
                        </InputAdornment>),
                    }}/> 

                <div className="welcome-header"><p className="animate__animated animate__fadeInDown">Witaj, {this.props.name}!</p></div>
                <div className="home">
                    <Chart />
                </div>
                <div className="headline animate__animated animate__fadeIn"><p>Wybrane kolekcje NFT</p></div>
               
                <div className="refresh-container">
                    <div className="refresh-buttons">
                    <div className="button-re" onClick={this.refreshOnClick}><RiRefreshLine fontSize={'30px'}/></div>
                    <div className="button-re-auto"><p>Auto</p><Switch onClick={this.autoRefresh}/></div>
                    </div> 
                </div>

                <div className="nft-header-container animate__animated animate__fadeIn">
                    <div className="nft-header"><p>Top</p></div> 
                    <div className="nft-header trending"><p>Trendujące</p></div>
                    <div className="nft-header"><p>Najnowsze</p></div> 
                    <div className="nft-header"><p>Ostatnio sprzedane</p></div>
                    <div className="nft-header"><p>Landy</p></div>
                    <div className="nft-header"><p>Losowe</p></div>
                </div> 

                <div className="nft-container animate__animated animate__fadeIn animate__delay-1s">  
                <div className="nft">       
                    <div className="nft-image"><img src="./public/nft1.png"></img></div> 
                    <div className="nft-collection"><p><a href="https://opensea.io/collection/bluesnft" target="_blank" >Blues NFT</a></p></div>
                    <div className="nft-info">
                        <div className="nft-name"><p>Blues</p>
                        <div className="nft-id">
                            <p>#2451</p> 
                        </div> 
                        </div>
                        <div className="nft-price">
                            <Tooltip title="ETH" arrow>
                            <img className="etherIcon" src="./ether.svg"/>
                            </Tooltip>
                            <p> 0.3</p></div>
                    </div>
                    <Button className="openSeaButton" variant="contained"><a href="https://opensea.io/assets/ethereum/0x427ce6c9e2a504aeb22dc3839fbc4f4b6ebd75bb/159" target="_blank" >OpenSea</a></Button>
                </div>
                <div className="nft">
                    <div className="nft-image"><img src="./nft2.png"></img></div>
                    <div className="nft-collection"><p><a href="https://opensea.io/collection/akumu-dragonz" target="_blank" >Akumu Dragonz</a></p></div>
                    <div className="nft-info">
                        <div className="nft-name"><p>Akumu</p>
                        <div className="nft-id">
                            <p>#4323</p>
                        </div>
                        </div>
                        <div className="nft-price">
                            <Tooltip title="ETH" arrow>
                            <img className="etherIcon" src="./ether.svg"/>
                            </Tooltip>
                            <p> 0.6</p></div>
                    </div>
                    <Button className="openSeaButton" variant="contained"><a href="https://opensea.io/assets/ethereum/0xc1ad47aeb274157e24a5f01b5857830aef962843/4323" target="_blank" >OpenSea</a></Button>

                </div>
                <div className="nft">
                    <div className="nft-image"><img src="./nft3.png"></img></div>
                    <div className="nft-collection"><p><a href="https://opensea.io/collection/world-of-women-nft" target="_blank" >World of Women</a></p></div>
                    <div className="nft-info">
                        <div className="nft-name">
                            <p>Woman</p>
                        <div className="nft-id">
                            <p>#2332</p>
                        </div>
                        </div>
                        <div className="nft-price">
                            <Tooltip title="ETH" arrow>
                                <img className="etherIcon" src="./ether.svg"/>
                            </Tooltip>
                                <p> 2.3</p></div>
                            
                    </div>
                    <Button className="openSeaButton" variant="contained"><a href="https://opensea.io/assets/ethereum/0xe785e82358879f061bc3dcac6f0444462d4b5330/6776" target="_blank" >OpenSea</a></Button>

                    </div>  
                <div className="nft"> 
                    <div className="nft-image"><img src="./nft4.png"></img></div>
                    <div className="nft-collection"><p><a href="https://opensea.io/collection/okay-bears" target="_blank" >Okay Bears</a></p></div>
                    <div className="nft-info"> 
                        <div className="nft-name"><p>Okay Bear</p>
                        <div className="nft-id"><p>#1839</p></div>
                        </div>
                        <div className="nft-price">
                            <Tooltip title="SOL" arrow>
                                <img className="solanaIcon" src="./solana.svg"/>
                            </Tooltip>
                            <p> 106</p></div>
                    </div>
                    <Button className="openSeaButton" variant="contained"><a href="https://opensea.io/assets/solana/DHVo187SfTRRiCBw7Fj37gWboEWRD5WQLnfE1jwP5bPc" target="_blank" >OpenSea</a></Button>

                </div>
                <div className="nft">       
                    <div className="nft-image"><img src="./land.png"></img></div> 
                    <div className="nft-collection"><p><a href="https://opensea.io/collection/arcade-land" target="_blank" >Arcade Land</a></p></div>
                    <div className="nft-info">
                        <div className="nft-name"><p>Arcade Land Mega</p>
                        <div className="nft-id">
                            <p>#92</p> 
                        </div> 
                        </div>
                        <div className="nft-price">
                            <Tooltip title="ETH" arrow>
                            <img className="etherIcon" src="./ether.svg"/>
                            </Tooltip>
                            <p> 3.5</p></div>
                    </div>
                    <Button className="openSeaButton" variant="contained"><a href="https://opensea.io/assets/ethereum/0x4a8c9d751eeabc5521a68fb080dd7e72e46462af/6898" target="_blank" >OpenSea</a></Button>
                </div>
                <div className="nft">       
                    <div className="nft-image" >
                        <img src={this.state.assetImgUrl}>
                        </img>
                    </div> 
                    <div className="nft-collection"><p><a href={this.state.assetCollectionUrl} target="_blank" >{this.state.assetCollectionName}</a></p></div>
                    <div className="nft-info">
                        <div className="nft-name"><p>{this.state.assetName}</p>
                        <div className="nft-id">
                            <p>#{this.state.assetHash}</p> 
                        </div> 
                        </div>
                        <div className="nft-price">
                            <Tooltip title="ETH" arrow>
                            <img className="etherIcon" src="./ether.svg"/>
                            </Tooltip>
                            <p> 0.3</p></div>
                    </div>
                    <Button className="openSeaButton" variant="contained"><a href={this.state.assetCollectionUrl} target="_blank" >OpenSea</a></Button>
                </div>
                </div>
                </div>

                </div>

            </div>
        )
    }
}

export default Dashboard