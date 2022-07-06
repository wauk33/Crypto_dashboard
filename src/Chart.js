import React from "react";
import "./chart.css"
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { TbMathFunction } from 'react-icons/tb/';
import { ImStatsBars2 } from 'react-icons/im/';
import { FaPencilRuler } from 'react-icons/fa/';
import { MdOutlineAddAlert } from 'react-icons/md/';
import { MdVisibility } from 'react-icons/md/';

import Fab from '@mui/material/Fab';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ListSubheader from '@mui/material/ListSubheader';






let category_group_style = {
    color: '#2376f1',
    lineHeight: '24px',
    textAlign: 'center',
    fontSize: '14px',
    userSelect: 'none',
}
let item_group_style = {
    fontSize: '13px',
    color: 'black',
    fontFamily: '"Saira", sans-serif',
    textAlign: 'center',
    fontWeight: 'bold'
}


let priceOpenTimeTable = new Array([2013, 100], [2016, 17000], [2020, 46000], [2021, 76000], [2026, 89000])
const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

let myDateFormat = '%d %b. %y';

let startPos, deltaXpos, prevdeltaXpos
let day, month, year, dayCounter
let multiplier = 30
let moveCounter = 0

let xAxisCalcMax = (priceOpenTimeTable[priceOpenTimeTable.length - 1][0])
let xAxisCalcMin = priceOpenTimeTable[0][0]
let xAxisAbsoluteMax = Date.UTC(2025, 1, 1)
let xAxisAbsoluteMin = priceOpenTimeTable[0][0]

let yAxisAbsoluteMinLog = 0.01
let yAxisAbsoluteMinLin = 0

let yAxisAbsoluteMaxLog = 1000000
let yAxisAbsoluteMaxLin = 100000

let yAxisDefaultMinLog = 0.01
let yAxisDefaultMinLin = 0


let newMax = xAxisCalcMax




Highcharts.setOptions({
    lang: {
        numericSymbols: null //otherwise by default ['k', 'M', 'G', 'T', 'P', 'E'],
    }
})

const foptions = {
    method: 'GET', 
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'

    }, 
}

class Chart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        deltaXpos: 0,
        startPos: 0,
        scaling: null,
        scroll: 0,
        isSwitched: true,
        switchLabel: 'Log',
        ohlcData: undefined,
        exchange: 'bitstamp',
        pair: 'btcusd',
        marketPairs: {
            btcusd: 'flex',
            ethusd: 'flex',
            maticusd: 'flex',
            adausd: 'flex',
            dogeusd: 'none',
            
            btcusdt: 'none',
            ethusdt: 'none',
            maticusdt: 'none',
            adausdt: 'none',
            dogeusdt: 'none',
        },
        options: {
            chart: {
                width: 1350,
                height: 600,
                zoomType: 'xy',
                panning: true,
                panKey: 'shift',
            },
            title: { 
                align: 'left',
                text: '',
                style: { 
                    fontSize: '20px'
                }
            },
            subtitle: {
                style: {
                    color: '#2376f1',
                },
                align: 'center',
                text: 'BTC/USD'
            },
            yAxis: {
                type: 'logarithmic',
                opposite: true,
                title: {
                    text: '(USD)'
                }
            },
            xAxis: {
                type: 'datetime',
                accessibility: {
                    rangeDescription: 'Range: 2013 - 2030'
                },
                // max: xAxisCalcMax
                // min: xAxisCalcMin

                dateTimeLabelFormats: {
                    // millisecond: myDateFormat,
                    // second: myDateFormat,
                    // minute: myDateFormat,
                    // hour: myDateFormat,
                    // day: myDateFormat,
                    // week: myDateFormat,
                    // month: myDateFormat,
                    year: myDateFormat
                },
                // tickInterval: 24 * 3600 * 1000000, //years

            },
            legend: {
                margin: 25,
                layout: 'vertical',
                align: 'center',
                verticalAlign: 'bottom',
                symbolWidth: 15,
            }, 
            tooltip: {
                // valueSuffix: ' (USD)',
                valuePrefix: '$'
            },
            plotOptions: {
                line: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    // pointStart: 2010
                }
            },
            series: [{
                name: 'Bitcoin',
                data: priceOpenTimeTable
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 1300
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
          }
        }
        this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this)
        this.mouseMoveHandlerScaling = this.mouseMoveHandlerScaling.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
        this.scaleSwitch = this.scaleSwitch.bind(this)
        this.setTimeframe = this.setTimeframe.bind(this)
        this.clickHandle = this.clickHandle.bind(this)
        this.chooseExchange = this.chooseExchange.bind(this)
        this.choosePair = this.choosePair.bind(this)

    }
        componentDidMount(){
            this.fetchAPI()

            setTimeout(() => this.setTimeframe(), 3000)
        }

        mouseDownHandler(e){
            startPos = e.clientX
            this.setState({startPos: startPos, deltaXpos: 0, scaling: true})
            console.dir("Start pos:" + this.state.startPos)
            document.querySelector('.scrollXarea:hover').style = "cursor: ew-resize"
        }
        mouseUpHandler(){
            this.setState({scaling: false})
            deltaXpos = 0
            startPos = 0
            
            document.querySelector('.scrollXarea:hover').style = "cursor: grab"

        } 
        mouseLeaveHandler(){
            this.setState({scaling: false})
            deltaXpos = 0
            startPos = 0
        }
        mouseMoveHandlerScaling(e){
            if (this.state.scaling === true){

                if (e.clientX > startPos){
                deltaXpos = -(e.clientX - startPos)
                prevdeltaXpos = this.state.deltaXpos
                
                    if ((deltaXpos > prevdeltaXpos) && (deltaXpos != 0)){
                        startPos = e.clientX
                        console.log('direction reset from right to left')
                    }
                }
                
                if (e.clientX < startPos){
                    deltaXpos = startPos - e.clientX
                    prevdeltaXpos = this.state.deltaXpos

                    if ((deltaXpos < prevdeltaXpos) && (deltaXpos != 0)){
                        startPos = e.clientX
                        console.log('direction reset from left to right')
                    }
                }

                
                if (this.state.deltaXpos < 0){
                    moveCounter = 1
                }
                if (this.state.deltaXpos > 0){
                    moveCounter = -1
                }
                if (e.clientX === startPos)
                    deltaXpos = 0


                if ((this.state.startPos !== 0) && (this.state.scaling === true)){
                    
                    this.setState({deltaXpos: deltaXpos})

                    console.dir("Delta Pos: " + this.state.deltaXpos)

                    let currentMax = new Date(this.state.options.xAxis.max)
                        console.log("CURRENT MAX:")
                        console.log(currentMax)

                        day = currentMax.getDate()
                        month = currentMax.getMonth()
                        year = currentMax.getUTCFullYear()

                    dayCounter = day + (moveCounter * multiplier)

                        if (dayCounter > 31) {
                            month++
                            dayCounter = 1
                            console.log("MONTH ++")
                            if (month > 11) {
                                year++
                            console.log("YEAR ++")
                                dayCounter = 1
                                month = 1
                            }
                        }
                        if (dayCounter < 1) {
                            month--
                            dayCounter = 30
                            if (month <= 1){
                                year--
                                month = 11
                            }
                        }




                        if (dayCounter < 10)  
                            dayCounter = Number('0' + dayCounter)

                        if (month < 10)
                            month = Number('0' + month) 

                            
                        console.log("CURRENT DAY: ")
                        console.log(dayCounter)
                        console.log("CURRENT MONTH:")
                        console.log(month)
                        console.log("CURRENT YEAR:")
                        console.log(year)

                        console.log("day: " + dayCounter + " Month: " + month + " Year: " + year)
                            
                    newMax = Date.UTC(year, month, dayCounter)
                    console.log(newMax)


                    if ((xAxisAbsoluteMin > (newMax))){
                        newMax = xAxisAbsoluteMin
                        console.log(xAxisAbsoluteMin)
                        console.log("MIN REACHED: " + newMax)
                    }

                    if ((xAxisAbsoluteMax < (newMax))){
                        newMax =  xAxisAbsoluteMax
                        console.log(xAxisAbsoluteMax)
                        console.log("MAX REACHED: " + newMax)
                    }

                    this.setState({options: {xAxis: {max: newMax}}})
                }

                }
                else {
                deltaXpos = 0
                startPos = 0
                }
        }



        scaleSwitch(){
            if (this.state.isSwitched === true)
            this.setState({
                isSwitched: false,
                switchLabel: 'Linear',
                options: { yAxis: { type: 'linear'}, xAxis: { max: xAxisCalcMax }}
            })
            else if (this.state.isSwitched === false)
            this.setState({
                isSwitched: true,
                switchLabel: 'Log',
                options: { yAxis: { type: 'logarithmic'}, xAxis: { max: xAxisCalcMax }}
            })
        }
        

 
        clickHandle(e){
                // let max = this.state.options.xAxis.max - 1
                // console.log(e)
                // this.setState({options: {xAxis: {max: max}}})
        }

        chooseExchange(e){
            let dontContinue = false

            if (e.target.value === 'bitstamp'){
                    this.setState({ marketPairs: {
                        btcusd: 'flex',
                        ethusd: 'flex',
                        maticusd: 'flex',
                        adausd: 'flex',
                        dogeusd: 'none',
                        
                        btcusdt: 'none',
                        ethusdt: 'none',
                        maticusdt: 'none',
                        adausdt: 'none',
                        dogeusdt: 'none',
                    }})
                    if((this.state.pair === 'dogeusd') || (this.state.pair === 'dogeusdt')){
                        this.setState({pair: 'btcusd'})
                        dontContinue = true

                    }
            }
            if (e.target.value === 'binance'){
                    this.setState({ marketPairs: {
                        btcusd: 'none',
                        ethusd: 'none',
                        maticusd: 'none',
                        adausd: 'none',
                        dogeusd: 'none',
                        
                        btcusdt: 'flex',
                        ethusdt: 'flex',
                        maticusdt: 'flex',
                        adausdt: 'flex',
                        dogeusdt: 'flex',
                    }})
            }
            if (e.target.value === 'kraken'){
                this.setState({ marketPairs: {
                    btcusd: 'none',
                    ethusd: 'none',
                    maticusd: 'none',
                    adausd: 'none',
                    dogeusd: 'none',
                    
                    btcusdt: 'flex',
                    ethusdt: 'flex',
                    maticusdt: 'none',
                    adausdt: 'flex',
                    dogeusdt: 'flex',
                }})
                if((this.state.pair === 'maticusdt') || (this.state.pair === 'maticusd')){
                    this.setState({pair: 'btcusdt'})
                    dontContinue = true
                }
            }
            if (e.target.value === 'bitfinex'){
                this.setState({ marketPairs: {
                    btcusd: 'flex',
                    ethusd: 'flex',
                    maticusd: 'flex',
                    adausd: 'flex',
                    dogeusd: 'flex',
                    
                    btcusdt: 'none',
                    ethusdt: 'none',
                    maticusdt: 'none',
                    adausdt: 'none',
                    dogeusdt: 'none',
                }})                  
            }
            if (e.target.value === 'poloniex'){
                this.setState({ marketPairs: {
                    btcusd: 'none',
                    ethusd: 'none',
                    maticusd: 'none',
                    adausd: 'none',
                    dogeusd: 'none',
                    
                    btcusdt: 'flex',
                    ethusdt: 'flex',
                    maticusdt: 'flex',
                    adausdt: 'flex',
                    dogeusdt: 'flex',
                }})
            }
            if (e.target.value === 'ftx'){
                this.setState({ marketPairs: {
                    btcusd: 'none',
                    ethusd: 'none',
                    maticusd: 'none',
                    adausd: 'none',
                    dogeusd: 'none',
                    
                    btcusdt: 'flex',
                    ethusdt: 'flex',
                    maticusdt: 'none',
                    adausdt: 'none',
                    dogeusdt: 'flex',
                }})
                if(this.state.pair === 'maticusd'){
                    this.setState({pair: 'btcusdt'})
                    dontContinue = true
                }
                if((this.state.pair === 'adausdt') || (this.state.pair === 'adausd')){
                    this.setState({pair: 'btcusdt'})
                    dontContinue = true
                }
            }
            if (e.target.value === 'coinbase-pro'){
                this.setState({ marketPairs: {
                    btcusd: 'flex',
                    ethusd: 'flex',
                    maticusd: 'flex',
                    adausd: 'flex',
                    dogeusd: 'flex',
                    
                    btcusdt: 'none',
                    ethusdt: 'none',
                    maticusdt: 'none',
                    adausdt: 'none',
                    dogeusdt: 'none',
                }})      
            }

                if(dontContinue === false){
                if (( // if markets without usd
                    (e.target.value === 'binance') || 
                    (e.target.value === 'ftx') ||
                    (e.target.value === 'poloniex')
                    ) && 
                    (this.state.pair === 'btcusd', 'ethusd', 'maticusd', 'adausd', 'dogeusd')){
                    if (this.state.pair === 'btcusd')
                        this.setState({pair: 'btcusdt'})
                    else if (this.state.pair === 'ethusd')
                        this.setState({pair: 'ethusdt'})
                    else if (this.state.pair === 'maticusd')
                        this.setState({pair: 'maticusdt'})
                    else if (this.state.pair === 'adausd')
                        this.setState({pair: 'adausdt'})
                    else if (this.state.pair === 'dogeusd')
                        this.setState({pair: 'dogeusdt'})
                    } 
                if (( // if markets without usdt
                    (e.target.value === 'coinbase-pro') || 
                    (e.target.value === 'bitstamp') ||
                    (e.target.value === 'bitfinex')
                    ) && 
                    (this.state.pair === 'btcusdt', 'ethusdt', 'maticusdt', 'adausdt', 'dogeusdt')){
                    if (this.state.pair === 'btcusdt')
                        this.setState({pair: 'btcusd'})
                    else if (this.state.pair === 'ethusdt')
                        this.setState({pair: 'ethusd'})
                    else if (this.state.pair === 'maticusdt')
                        this.setState({pair: 'maticusd'})
                    else if (this.state.pair === 'adausdt')
                        this.setState({pair: 'adausd'})
                    else if (this.state.pair === 'dogeusdt')
                        this.setState({pair: 'dogeusd'})
                    }
                }
                this.setState({ exchange: e.target.value}); // by default

                this.setTitleSubtitle() //series & subtitle for pair

                setTimeout(() => this.fetchAPI(), 10)
                setTimeout(() => this.setTimeframe(), 3000)
                
            }

        choosePair(e){

            if (( // if markets without usd
                (this.state.exchange === 'binance') || 
                (this.state.exchange === 'ftx') ||
                (this.state.exchange === 'poloniex')
                ) && 
                (e.target.value === 'btcusd', 'ethusd', 'maticusd', 'adausd', 'dogeusd')){
                if (e.target.value === 'btcusd')
                    this.setState({pair: 'btcusdt'})
                else if (e.target.value === 'ethusd')
                    this.setState({pair: 'ethusdt'})
                else if (e.target.value === 'maticusd')
                    this.setState({pair: 'maticusdt'})
                else if (e.target.value === 'adausd')
                    this.setState({pair: 'adausdt'})
                else if (e.target.value === 'dogeusd')
                    this.setState({pair: 'dogeusdt'})
                }
                if(e.target.value === 'btcusdt', 'ethusdt', 'maticusdt', 'adausdt', 'dogeusdt'){
                    if (e.target.value === 'btcusdt')
                    this.setState({pair: 'btcusdt'})
                    if (e.target.value === 'ethusdt')
                        this.setState({pair: 'ethusdt'})
                    if (e.target.value === 'maticusdt')
                        this.setState({pair: 'maticusdt'})
                    if (e.target.value === 'adausdt')
                        this.setState({pair: 'adausdt'})
                    if (e.target.value === 'dogeusdt')
                        this.setState({pair: 'dogeusdt'})   
                }
            if (( // if markets without usdt
                (this.state.exchange === 'coinbase-pro') || 
                (this.state.exchange === 'bitstamp') ||
                (this.state.exchange === 'bitfinex')
                ) && 
                (e.target.value === 'btcusdt', 'ethusdt', 'maticusdt', 'adausdt', 'dogeusdt')){
                    if (e.target.value === 'btcusdt')
                    this.setState({pair: 'btcusd'})
                else if (e.target.value === 'ethusdt')
                    this.setState({pair: 'ethusd'})
                else if (e.target.value === 'maticusdt')
                    this.setState({pair: 'maticusd'})
                else if (e.target.value === 'adausdt')
                    this.setState({pair: 'adausd'})
                else if (e.target.value === 'dogeusdt')
                    this.setState({pair: 'dogeusd'})
                }
                if(e.target.value === 'btcusd', 'ethusd', 'maticusd', 'adausd', 'dogeusd'){
                    if (e.target.value === 'btcusd')
                    this.setState({pair: 'btcusd'})
                    if (e.target.value === 'ethusd')
                        this.setState({pair: 'ethusd'})
                    if (e.target.value === 'maticusd')
                        this.setState({pair: 'maticusd'})
                    if (e.target.value === 'adausd')
                        this.setState({pair: 'adausd'})
                    if (e.target.value === 'dogeusd')
                        this.setState({pair: 'dogeusd'})   
                }

            else {
                this.setState({ pair: e.target.value}); //by default
            }


            console.log(e.target)
           
            this.setTitleSubtitle() //series & subtitle for pair
            
            setTimeout(() => this.fetchAPI(), 10)
            setTimeout(() => this.setTimeframe(), 3000)
        }

        setTitleSubtitle(){
            setTimeout(() => {
                console.log(this.state.pair)
                let slicedUSDType = (this.state.pair).substring(this.state.pair.length - 1)
                console.log(slicedUSDType)
                let slicedPair, pairParsedToName, pairParsedToSubtitle
    
    
                if( slicedUSDType === 't'){
                    slicedPair = this.state.pair.slice(0, -4)
                    console.log(slicedPair)
                    switch (slicedPair) {
                        case 'btc': {pairParsedToName = 'Bitcoin'; pairParsedToSubtitle = 'BTC/USDT'; break}
                        case 'eth': {pairParsedToName = 'Ethereum'; pairParsedToSubtitle = 'ETH/USDT'; break}
                        case 'matic': {pairParsedToName = 'Matic (Polygon)'; pairParsedToSubtitle = 'MATIC/USDT'; break}
                        case 'ada': {pairParsedToName = 'Cardano'; pairParsedToSubtitle = 'ADA/USDT'; break}
                        case 'doge': {pairParsedToName = 'Doge'; pairParsedToSubtitle = 'DOGE/USDT'; break}
                    }
                }
                if( slicedUSDType === 'd'){
                    slicedPair = this.state.pair.slice(0, -3)
                    console.log(slicedPair)
                    switch (slicedPair) {
                        case 'btc': {pairParsedToName = 'Bitcoin'; pairParsedToSubtitle = 'BTC/USD'; break}
                        case 'eth': {pairParsedToName = 'Ethereum'; pairParsedToSubtitle = 'ETH/USD'; break}
                        case 'matic': {pairParsedToName = 'Matic (Polygon)'; pairParsedToSubtitle = 'MATIC/USD'; break}
                        case 'ada': {pairParsedToName = 'Cardano'; pairParsedToSubtitle = 'ADA/USD'; break}
                        case 'doge': {pairParsedToName = 'Doge'; pairParsedToSubtitle = 'DOGE/USD'; break}
                    }
                }


            this.setState({ options: { series: { name: pairParsedToName  }, subtitle: { text: pairParsedToSubtitle}}})
        }, 1000)
        }
        setTimeframe(){
            if(this.state.ohlcData){
            console.log("Executed")
            console.log(this.state.ohlcData)

            priceOpenTimeTable = []
            let priceOpen, priceUNIX, dateUTC
            let timeframe = 86400
            console.log(this.state.ohlcData.result)
            let array = this.state.ohlcData.result[timeframe]

                for (let i = 0; i < array.length; i++){
                    priceOpen = this.state.ohlcData.result[timeframe][i][1]
                    priceUNIX = this.state.ohlcData.result[timeframe][i][0]
                        
                    // console.log(date.getDate()) //weekday[date.getDay()]
                    console.log(priceOpen)
                    // console.log(priceUNIX)
                    
                    
                    dateUTC = priceUNIX * 1000

                    console.log(dateUTC)
                    priceOpenTimeTable.push([dateUTC, priceOpen])


                }
                
                console.log(priceOpenTimeTable)
                xAxisCalcMax = (year) 

                xAxisCalcMin = (priceOpenTimeTable[0][0])
                xAxisCalcMax = (priceOpenTimeTable[priceOpenTimeTable.length - 1][0])
                xAxisAbsoluteMin = (priceOpenTimeTable[0][0])

                this.setState({ 
                    options: {
                        series: {
                                data: priceOpenTimeTable
                            },
                        xAxis: {
                            max: xAxisCalcMax,
                            min: xAxisCalcMin,
                            // categories: priceTimeTable
                        }
                    }})

            // array.forEach(element => {
            //     bitfinex
            // });

            // console.log(priceOpen)
            // console.log(priceOpenTimeTable[priceOpenTimeTable.length - 1][0])

            } 
        }

        fetchAPI(){
            let baseUrl = "https://api.cryptowat.ch/markets/" + this.state.exchange + "/" + this.state.pair + "/ohlc"
            let proxyUrl = "https://corsproxy.io/?"//https://thingproxy.freeboard.io/fetch/

            fetch((proxyUrl + baseUrl), foptions)
            .then(response => response.json())
            .then(data => {
                this.setState({ohlcData: data})  
                console.log(data)
            })            
            .catch((error) => {
                console.error("FETCH ERROR", error)
            })
            console.log("------ MARKETS API FETCHED, SEND TO STATE. EX: " + this.state.exchange + " PAIR: " + this.state.pair)
            

            // fetch((proxyUrl + 'https://api.cryptowat.ch/markets'), foptions)
            // .then(response => response.json())
            // .then((data) => console.log(data))

        } 

        
        render() {

          return (

      <div className="chart-container animate__animated animate__fadeIn" onContextMenu={( e => e.preventDefault())}>  
 
        <div className="chart" onContextMenu={this.clickHandle}>
            <HighchartsReact
            highcharts={Highcharts}
            options={this.state.options}
            />

            <div className="scrollXarea" 
            onMouseMoveCapture={this.mouseMoveHandlerScaling} 
            onMouseDownCapture={this.mouseDownHandler}
            onMouseUpCapture={this.mouseUpHandler}
            onMouseOutCapture={this.mouseLeaveHandler}
            >
                </div>
 
        </div>

            <div className="categories-panel">
           
                <FormControl sx={{ m: 2, minWidth: 120 }} variant="standard" htmlFor="grouped-selected" size="small" color="primary">
                <InputLabel id="pair">Para</InputLabel>
                    <Select labelId="pair"
                            id="pair"
                            value= {this.state.pair}
                            label="Pair"
                            style={item_group_style} 
                            onChange={this.choosePair}>
                    <ListSubheader style={category_group_style}>Bitcoin</ListSubheader>
                            <MenuItem value={'btcusd'} style={{display: this.state.marketPairs.btcusd, ...item_group_style}}>BTC/USD</MenuItem>
                            <MenuItem value={'btcusdt'} style={{display: this.state.marketPairs.btcusdt, ...item_group_style}}>BTC/USDT</MenuItem>
                    <ListSubheader style={category_group_style}>Ethereum</ListSubheader>
                            <MenuItem value={'ethusd'} style={{display: this.state.marketPairs.ethusd, ...item_group_style}}>ETH/USD</MenuItem>
                            <MenuItem value={'ethusdt'} style={{display: this.state.marketPairs.ethusdt, ...item_group_style}}>ETH/USDT</MenuItem>
                    <ListSubheader style={category_group_style}>Alts</ListSubheader>
                            <MenuItem value={'maticusdt'} style={{display: this.state.marketPairs.maticusdt, ...item_group_style}}>MATIC/USDT</MenuItem>
                            <MenuItem value={'maticusd'} style={{display: this.state.marketPairs.maticusd, ...item_group_style}}>MATIC/USD</MenuItem>
                            <MenuItem value={'adausdt'} style={{display: this.state.marketPairs.adausdt, ...item_group_style}}>ADA/USDT</MenuItem>
                            <MenuItem value={'adausd'} style={{display: this.state.marketPairs.adausd, ...item_group_style}}>ADA/USD</MenuItem>
                            <MenuItem value={'dogeusd'} style={{display: this.state.marketPairs.dogeusd, ...item_group_style}}>DOGE/USD</MenuItem>
                            <MenuItem value={'dogeusdt'} style={{display: this.state.marketPairs.dogeusdt, ...item_group_style}}>DOGE/USDT</MenuItem>
                    </Select>
                </FormControl>
 
                <FormControl sx={{ m: 2, minWidth: 180, textAlign: 'center' }} variant="standard" size="small" color="primary"> 
                <InputLabel id="exchange">Rynek</InputLabel> 
                    <Select labelId="exchange"
                            id="exchange"
                            value= {this.state.exchange}
                            label="Exchange"
                            style={item_group_style}
                            onChange={this.chooseExchange}>

                            <MenuItem value={'bitstamp'} style={item_group_style}>Bitstamp</MenuItem>
                            <MenuItem value={'binance'} style={item_group_style}>Binance</MenuItem>
                            <MenuItem value={'kraken'} style={item_group_style}>Kraken</MenuItem>
                            <MenuItem value={'bitfinex'} style={item_group_style}>Bitfinex</MenuItem>
                            <MenuItem value={'poloniex'} style={item_group_style}>Poloniex</MenuItem>
                            <MenuItem value={'ftx'} style={item_group_style}>FTX</MenuItem>
                            <MenuItem value={'coinbase-pro'} style={item_group_style}>Coinbase Pro</MenuItem>
                            
                    </Select>
                </FormControl>

            </div>

            <div className="panel">

            <div className="btn time">
                    <Tooltip title="Przedział czasowy" placement="right" arrow > 
                        <Fab color="primary" size="medium" onClick={this.setTimeframe}>
                            <p className="btn-timeframe">1D</p>
                        </Fab>
                    </Tooltip>
                </div>
                <div className="btn cnd">
                    <Tooltip title="Świece" placement="right" arrow>
                        <Fab color="primary" size="medium" aria-label="add">
                            <ImStatsBars2 fontSize={'25px'} />
                        </Fab>
                    </Tooltip>    
                </div>
                <div className="btn draw">
                    <Tooltip title="Rysuj" placement="right" arrow>
                        <Fab color="primary" size="medium">
                            <FaPencilRuler fontSize={'22px'} />
                        </Fab>
                    </Tooltip>
                </div>
                <div className="btn fx">
                    <Tooltip title="Funkcje" placement="right" arrow>
                        <Fab color="primary" size="medium">
                            <TbMathFunction fontSize={'27px'} />
                        </Fab>
                    </Tooltip>
                </div>
                <div className="btn alert">
                    <Tooltip title="Alerty" placement="right" arrow> 
                        <Fab color="primary" size="medium">
                            <MdOutlineAddAlert fontSize={'27px'} />
                        </Fab>
                    </Tooltip>
                </div>

                <div className="btn vis">
                    <Tooltip title="Widoczność" placement="right" arrow>
                        <Fab color="primary" size="medium">
                            <MdVisibility fontSize={'25px'} />
                        </Fab>
                    </Tooltip>
                </div>
                <Tooltip title="Skala" placement="right" arrow>
                    <div className="btn log">
                    <Switch defaultChecked onClick={this.scaleSwitch}/>
                    <p className="btn-scale">{this.state.switchLabel}</p>
                    </div>
                </Tooltip>
            </div>  

            </div>

          );
        }
      }

    
export default Chart


// import { ResponsiveLine } from '@nivo/line'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.


{/* <ResponsiveLine
                data={[
                    {
                    id: "Bitcoin",
                    data: [
                        {
                        x: "Maj 15",
                        y: 0.1
                        },
                        {
                        x: "Maj 18",
                        y: 17
                        },
                        {
                        x: "Maj 27",
                        y: 300
                        },
                        {
                        x: "Czerwiec 01",
                        y: 500
                        }
                    ]
                    }
                ]}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point'}}
                yScale={{
                    type: 'log',
                    min: '0.0001',
                    max: '1000', 
                    stacked: true,
                    reverse: false
                }}
                yFormat=" >-.2f"
                axisTop={null}
                axisRight={{ 
                    orient: 'left',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legendOffset: -40,
                    legendPosition: 'middle'}}
                axisBottom={{
                    orient: 'bottom',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Bitcoin',
                    legendOffset: 36,
                    legendPosition: 'middle'
                }}
                axisLeft={null}
                pointSize={0}
                colors="#2376f1"
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                lineWidth={2}
                enableGridY={false}


                legends={[
                    {
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 0,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemBackground: 'rgba(0, 0, 0, .03)',
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
            /> */}