import React, { useEffect, useCallback } from "react";
// import logo from './logo.svg';
import './App.css';
import Axios from 'axios';
// import AxiosCookiejarSupport from 'axios-cookiejar-support';
// axios.defaults.withCredentials = true;
// import request from 'request';

// const axiosWithCookies = Axios.create({
//   xsrfHeaderName: 'X-CSRF-Token',
//   withCredentials: true
// });

// var cookieJar = request.jar();

// Axiosにプラグイン注入
// AxiosCookiejarSupport(Axios);

// let axiosWithCookies = Axios.create({
//     jar: true, // cookiejarを有効化する
//     withCredentials: true, // 依然として必要
//  });

// State
// 常にcomponentDidMountで監視
// 上か下がkeydownされているか、もしくは何もされていないかを判定
// リクエストを送り続けnext stateを得て、stateを更新し続ける

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

class ResetButton extends React.Component {
  render() {
    return (
      <button onClick={this.props.handleResetButtonClick}>
        <h1> Reset </h1>
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

  // TODO reset時にadd listerされるようにする
  // TODO state.actionを定期的に監視
  handleUserAction() {
    setInterval(()=>{
      if (!this.state.user_id) {
        return;
      }

      // axiosWithCookies
      Axios.post('http://127.0.0.1:5000/step', {
        "user_id": this.state.user_id,
        "action": "up",
      }).then((res) => {
        this.setState({
          state: res.data.next_state,
        });
        console.log("step!");
      }).catch((err) => {
        console.log(err);
        console.log(err.response);
      });
    }, 500);

      // console.log("step!");
      // Axios.post('http://127.0.0.1:5000/step', { 
      //   withCredentials: true,
      //   "action": "up",
      // }).then((res) => {
      //   this.setState({
      //     state: res.data.next_state,
      //   });
      //   console.log("step!")
      // })



      // request(options, function (error, response, body) {
      //   console.log(response);
      // })
    

    //   fetch('http://127.0.0.1:5000/step', {
    //     method: 'POST',
    //     dataType: 'json',
    //     mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     credentials: 'include',
    //     // credentials: 'same-origin',
    //     "action": "up",
    //   }).then(res => res.json())
    //     .then((res) => {
    //     this.setState({
    //       state: res.data.next_state,
    //     });
    //     console.log("step!")
    //   })
    // }, 5000);
  }

  handleResetButtonClick() {

      // axiosWithCookies.get('http://127.0.0.1:5000/reset').then((res) => {
      //   this.setState({
      //     state: res.data.state,
      //   });
      //   console.log("reset!")
      // })

      // Axios.get('http://127.0.0.1:5000/reset', { 
      //   withCredentials: true
      // }).then((res) => {
      Axios.get('http://127.0.0.1:5000/reset')
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
      // fetch('http://127.0.0.1:5000/reset', {
      //   method: 'GET',
      //   dataType: 'json',
      //   mode: "cors",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   credentials: 'include'
      //   // credentials: 'same-origin',
      // }).then(res => res.json())
      //   .then((res) => {
      //   console.log(res);
      //   this.setState({
      //     state: res.state,
      //   });
      //   console.log("reset!")
      // })
      // var options = {
      //   url: 'http://127.0.0.1:5000/reset',
      //   method: 'GET',
      //   jar: cookieJar,
      // }
      // request(options, function (error, response, body) {
      //   console.log(response);
      // })

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

  render() {
    document.addEventListener("keyup", this.handleKeyUp, false);
    document.addEventListener("keydown", this.handleKeyDown, false);
    return (
        <div>
          <p>
          <State state={this.state.state} handleUserAction={this.handleUserAction}/>
          </p>
          <p>
          <ResetButton handleResetButtonClick={this.handleResetButtonClick}/>
          </p>
        </div>
    );
  }
}


export default App;

