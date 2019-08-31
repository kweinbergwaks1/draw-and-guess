import React, { Component } from 'react';
import {SketchField, Tools} from 'react-sketch';
import openSocket from 'socket.io-client';
import './App.css';
import { hard, medium, easy } from "./words.json";


class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      socket: openSocket('http://localhost:1337'),
      draw: null,
      word: null,
      points: 0,
      message: 'Waiting for another player...',
      yourTurn: false,
      showContinue: false,
      valueInputGuessing: ""
    }

    this.state.socket.on('user', user => {
      this.setState({user: user})
    });
    this.state.socket.on('turn', player => {
      if (player === this.state.user) {
        this.setState({message: "You're up. Choose a difficulty and receive a word", yourTurn: true})
      } else {
        this.setState({message: "The other player is choosing a word...", yourTurn: false})
      }   
    });
    this.state.socket.on('wordReceived', word => {
      this.setState({word: word})
      if(this.state.yourTurn) {
        this.setState({message: "You need to draw: " + this.state.word})
      } else {
        this.setState({message: "The other player is drawing"})
      }
    });
    this.state.socket.on('drawReceived', draw => {
      this.setState({draw: draw})
      if(this.state.yourTurn) {
        this.setState({message: "Guess the drawing!"})
      } else {
        this.setState({message: 'The other player is guessing...'})
      }
    });
    this.state.socket.on('wordGuessed', points => {
      this.setState({message: "Word guessed!", points: points, showContinue:true, yourTurn: false, valueInputGuessing:""})
    });

    this.state.socket.on('notGuessed', notGuessed => {
      this.setState({message: "Word not guessed :(", showContinue:true, yourTurn: false, valueInputGuessing:""})
    });
  }

  renderChoosing() {
    if(this.state.yourTurn && this.state.word === null) {
      return(
        <div className="word-choosing-container">
          <button className="button choose-hard" onClick={() => this.chooseAndSendWord("hard")}> Hard </button>
          <button className="button choose-medium" onClick={() => this.chooseAndSendWord("medium")}> Medium </button>
          <button className="button choose-easy" onClick={() => this.chooseAndSendWord("easy")}> Easy </button>
        </div>
      )
    }
  }

  chooseAndSendWord(difficulty) {
    var position = Math.floor(Math.random() * 3)
    switch(difficulty) {
      case "hard":
          this.state.socket.emit('word', hard[position])
          this.state.socket.emit('difficulty', 5)
          break
      case "medium":
          this.state.socket.emit('word', medium[position])
          this.state.socket.emit('difficulty', 3)
          break
      case "easy":
          this.state.socket.emit('word', easy[position])
          this.state.socket.emit('difficulty', 1)
          break
      default:
          this.state.socket.emit('word', 'computer')
          this.state.socket.emit('difficulty', 1)
          break
    }
  }

  renderSketch() {
    if(this.state.yourTurn && this.state.word != null && this.state.draw === null) {
      return (
        <div>
          <SketchField width='350px' 
                  height='320px'
                  className='draw-tool'
                  ref='canvasarea'
                  tool={Tools.Pencil} 
                  lineColor='black'
                  lineWidth={3}
                  backgroundColor='#FFFFFF'
                  undoSteps={20}
                  imageFormat='png' />
          <button className="button send-draw" onClick={() => this.state.socket.emit('draw', this.refs.canvasarea.toDataURL().toString())}> Send draw </button>
        </div>
      )
    }
  }

  renderGuessing() {
    if(this.state.yourTurn && this.state.word != null && this.state.draw != null) {
      return (
        <div>
          <img src={this.state.draw} /><br />
          <input className="input-guessing" type="text" value={this.state.valueInputGuessing} onChange={evt => this.setState({valueInputGuessing: evt.target.value})} />
          <button className="button guess" onClick={() => this.state.socket.emit('wordGuessing', this.state.valueInputGuessing)}> Guess </button>
        </div>
      )
    }
  }

  renderContinue() {
    if(this.state.showContinue) {
      return(
        <div>
          <button className="button continue" onClick={() => this.continueGame()}> Continue </button>
        </div>
      )
    }
  }

  continueGame() {
    this.setState({showContinue: false, word: null, draw: null})
    this.state.socket.emit("continue")
  }

  renderPoints() {
    return (
      <div className='points-container'>
        <p className="points-text">Session points: {this.state.points}</p>
      </div>
    )
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p className="header-title">Draw and Guess</p>
        </header>
        <body className="App-body">
          <h1 className="status-message">
            {this.state.message}
          </h1>
          {this.renderChoosing()}
          {this.renderSketch()}
          {this.renderGuessing()}
          {this.renderContinue()}
          {this.renderPoints()}
        </body>
      </div>
    )
  }
}

export default App