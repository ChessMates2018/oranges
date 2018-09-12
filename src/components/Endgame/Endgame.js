import React, { Component } from 'react'
import './Endgame.css'
import {connect} from 'react-redux';
import {setJudge, updateJudge} from '../../ducks/reducer'
import _ from 'lodash';
import {Redirect} from 'react-router-dom'
import io from 'socket.io-client'

const socket = io.connect('http://localhost:3020')

class Endgame extends Component {
  constructor(){
    super()
    this.state = {
      nextRound: false,
      winner: false,
      toHome: false
    }

    socket.on('lets-go-to-next-round', ()=>{
      this.setState({
        nextRound: true
      })
    })

    socket.on('heres-your-next-judge', data => {
      this.props.setJudge(data)

      let nextJudge = data.filter(user => {
        return user.judge === true
      })
      
    })
  }
  componentDidMount(){
    socket.emit('join-room-generic', {room:this.props.room})
    let winner = this.props.users.filter(user => {
      return user.score === 2
    })
    if(winner[0]){
      this.setState({
        winner: true
      })
    }
  }

  nextRound(){
    let usersArr = this.props.users.slice(0)
    usersArr[0].judge = false
    let shiftedGuy = usersArr.shift()
    usersArr.push(shiftedGuy)
    usersArr[0].judge = true
    socket.emit('next-judge', {users: usersArr, room: this.props.room})

    socket.emit('going-to-next-round', {room:this.props.room})
  }
  toHome(){
    this.setState({
      toHome: true
    })
  }

  render() {
    
    var scoreArray = _.sortBy(this.props.users, ['score']).reverse()
    
    var displayUsers = scoreArray.map((e,i) => {
      return(
        
        <div className='userbubble' key={i}>
        <div className="main-image-div">
          <div className="stem-new"></div>
          <div className="leaf1-new"></div>
          <div className="leaf2-new"></div>
          <div className="image-div">
          <img className='userImage' src={e.userPic} />
          </div>
          </div>
          <h2>{e.user}</h2>
          <h4 className='endscore'>{e.score}</h4>
        </div>
        
      )
    })
    return (
      <div className="endgame">
      {this.state.winner ? <h1>Winner!!!</h1> : ''}
        {displayUsers}
       {this.state.winner ? 
        <div>
        <button className="green">New Game</button>
        <button onClick={()=>this.toHome()}className="green">Exit</button>
        </div>
       : <button onClick={()=>this.nextRound()} className="green">Next Round</button>}
       {this.state.nextRound ? <Redirect to="/Game"/> : ''}
       {this.state.toHome ? <Redirect to="/"/> : ''}
      </div>
    )
  }
}

function mapStateToProps(state){
  return{
    ...this.props, ...state
  }
}


export default connect(mapStateToProps, {setJudge, updateJudge})(Endgame)
