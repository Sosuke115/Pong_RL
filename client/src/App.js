import React from "react";
import './App.css';
import axios from 'axios';

// ゲーム画面
// 常にStateの描画を繰り返す
class State extends React.Component {
  componentDidMount() {
    this.intervalId = this.props.handleUserAction()
  }
  componentWillUnmount(){
    clearInterval(this.intervalId);
  }
  render () {
    return (
      <img src={`data:image/jpeg;base64,${this.props.state}`} /> 
    )
  }
}

// ゲームをリセット
class ResetButton extends React.Component {
  render() {
    return (
      <button onClick={this.props.handleResetButtonClick}>
        <h2> Reset </h2>
      </button>
    );
  }
}

class App extends React.Component {

  constructor() { 
    super();
    this.state = {
      user_id: null,
      state: null,
      action: "noop"
    };
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleKeyDown= this.handleKeyDown.bind(this);
    this.handleUserAction= this.handleUserAction.bind(this);
    this.handleResetButtonClick=this.handleResetButtonClick.bind(this);
  }

  // state.actionを定期的に監視し、対応するリクエストをサーバーに送り、レスポンスからstateを更新し続ける関数
  // TODO Reset時にadd listerされるようにする
  handleUserAction() {
    setInterval(()=>{
      if (!this.state.user_id) {
        return;
      }

      axios.post('http://127.0.0.1:5000/step', {
        "user_id": this.state.user_id,
        "action": this.state.action,
      }).then((res) => {
        this.setState({
          state: res.data.next_state,
        });
        console.log("step!");
      }).catch((err) => {
        console.log(err);
        console.log(err.response);
      });
    }, 50);
  }

  handleResetButtonClick() {

      axios.get('http://127.0.0.1:5000/reset')
        .then((res) => {
          this.setState({
            user_id: res.data.user_id,
            state: res.data.state,
          });
          console.log("reset!");
          console.log(res.data);
        }).catch((err) => {
          console.log(err);
        });
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 38) {
      this.setState({
        action: "up",
      });
    }
    if (event.keyCode === 40) {
      this.setState({
        action: "down",
      });
    }
    console.log(this.state.action);
  };

  handleKeyUp = (event) => {
    this.setState({
      action: "noop",
    });
    console.log(this.state.action);
  }

  //TODO 最初から背景画像が欲しい Press Reset的な
  //TODO Press Up or Down的な文
　//TODO Layoutと機能は分離？
  render() {
    document.addEventListener("keyup", this.handleKeyUp, false);
    document.addEventListener("keydown", this.handleKeyDown, false);
    return (
        <div>
          <p> <State state={this.state.state} handleUserAction={this.handleUserAction}/></p>
          <p> <ResetButton handleResetButtonClick={this.handleResetButtonClick}/> </p>
        </div>
    );
  }
}


export default App;

