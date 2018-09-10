import React, { Component } from 'react'
import {connect} from 'react-redux';
import {addPlayer, storeUser, readyPlayer} from '../../ducks/reducer'
import io from 'socket.io-client'
import WOW from 'wowjs'
import './NewGames.css'
import {Redirect, Link} from 'react-router-dom';
import { notDeepEqual } from 'assert';

const socket = io.connect('http://localhost:3020')

class NewGames extends Component {
    constructor(){
        super()
        this.state = {
            input: '',
            pictureInput: '',
            roomId: null,
            players: [],
            toLoading: false,
            userNameSubmit: false,
            cancelGame: false
        }

        socket.on('user-added', data =>{
          let tempArr = this.props.users.slice(0)
          tempArr.push(data)
          console.log(tempArr)
          this.props.addPlayer(tempArr)
        })


        socket.on('new-player', data =>{
        })

        socket.on('get-me-players', ()=>{
          if(this.props.users[0]) {
            socket.emit('here-are-players', {players: this.props.users})
          }
        })

        socket.on('ready-player-added', data => {
          // console.log('readyplayers', data)
          this.props.readyPlayer(data)
        })

        socket.on('readied-players', () => {
          socket.emit('readyPlayers-array', {players: this.props.readyPlayers, room: this.props.room})
        })



    }
    componentDidMount(props){
      this.setState({
        roomId: this.props.room,
        players: this.props.users
      })
      socket.emit('join-room', {room:this.props.room})

      socket.on('add-players', data => {
        this.props.addPlayer(data.data.players)
      })

      socket.emit('receive-ready-players', {room: this.props.room})
      socket.on('here-are-readyPlayers', data => {
        this.props.readyPlayer(data)
      })

    }
    
    createUser(){
      // console.log(this.state.input)
      let names = this.props.users.map(element => {
        return element.user
      })
      if(names.indexOf(this.state.input) === -1){
        socket.emit('add-user', {userName: this.state.input, userPic: `https://api.adorable.io/avatars/50/${this.state.pictureInput}.png`, room:this.props.room})
        this.props.storeUser({user: this.state.input, userPic: `https://api.adorable.io/avatars/50/${this.state.pictureInput}.png`, judge: false})
        this.setState({userNameSubmit: true})
      } else {
        alert('already used ya idiot')
      }
    }

    async readyClick(){
      
      let copyReady = this.props.readyPlayers.slice(0);
      copyReady.push(this.props.user)
      await this.props.readyPlayer(copyReady)
      socket.emit('ready-player', {players: this.props.readyPlayers, room:this.props.room})
      setTimeout(() => {
        this.setState({toLoading: true})
      }, 1000)
    }

    cancelGame = () => {
      this.setState({cancelGame: true})

      // If user submitted userName, but cancelled game--we need to
      // remove them from readyPlayers on cancel.

    }

  render(props) {

    //Initiate WOW on Render
    const wow = new WOW.WOW();
     wow.init();

    var userInputReady = () => {
      // If they haven't submitted a userName, render Input box.
      if (!this.state.userNameSubmit){
        return (
        <div className="userinput">
        {/* <img src={`https://api.adorable.io/avatars/69/${this.state.pictureInput}.png`} /> */}
        <input onChange={(e) => this.setState({input: e.target.value, pictureInput: e.target.value})}/>
        <button onClick={()=>this.createUser()}className="green">Join Game</button>
        </div>
        )}

      // If they submitted userName, render a ready message.
      else {
        return (
          <div className="readymessage wow fadeInUp">
        <h2 className="readyMessage">Join when ready.</h2>
        </div>
        )
      }
    }

    var userButtonReady = () => {
      if (this.state.userNameSubmit){
        return (
          <div>
        <button className="ready g" onClick={() => this.readyClick()} >Ready?</button>
        </div>
        )
      }
      
    }

  
    return (
      <div className="newgames">
        <div className="roomid">
        <h1>Room ID: {this.state.roomId}</h1>
        </div>
        {/* When we pull in users, we'll want to map over that array here instead of a static set of divs. Just for visual example. Please use classnames to maintain styling.  */}
        <div className="userbox">
        {this.props.users.map(element=>{
          console.log('elementuser',element)
          return(
            <div className="userbubble">
              <img className='userImage' src={element.userPic} />
              {element.user}
            </div>
          )
        })}
        
        </div>
        
        
        {/* Running conditional render for userInput */}
        {userInputReady()}
      
        <div className="footer">
        {userButtonReady()}
        </div>
        {this.state.toLoading ? <Redirect to='/loading' /> : ''}
        {this.state.cancelGame ? <Redirect to='/' /> : ''}
      </div>
    )
  }
}

function mapStateToProps(state){
  return {
    room: state.room,
    users: state.users,
    user: state.user,
    readyPlayers: state.readyPlayers
  }
}
export default connect(mapStateToProps, {addPlayer, storeUser, readyPlayer})(NewGames);
