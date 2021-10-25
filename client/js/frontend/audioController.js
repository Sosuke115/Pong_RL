export class AudioController {
  constructor() {
    this.goalRl = $("#audio-goal-rl").get(0);
    this.goalHuman = $("#audio-goal-human").get(0);
    this.hitRl = $("#audio-hit-rl").get(0);
    this.hitHuman = $("#audio-hit-human").get(0);
    // this.goalRl.muted = true;
    // $("#audio-goal-human").click();
    // $("#audio-goal-rl").click();
    // $("#audio-hit-human").click();
    // $("#audio-hit-rl").click();
  }
  playGoalAudio(winner) {
    if (winner == "human") {
      // this.goalHuman.load();
      this.goalHuman.play();
      // $("#audio-goal-human").click();
      // soundEffect.play();
      console.log("#audio-goal-human");
      // wa.loadFile("/media/goalHuman.mp3", function(buffer) {
      //   wa.play(buffer);
      // });
    } else {
      // this.goalRl.load();
      // $("#audio-goal-rl").click();
      soundEffect.play();
      console.log("#audio-goal-rl");
      // this.goalRl.muted = false;
      // this.goalRl.play();
    }
  }
  playHitAudio(hitter) {
    if (hitter == "human") {
      // this.hitHuman.load();
      this.hitHuman.play();
      // $("#audio-hit-human").click();
      // soundEffect.play();
      // wa.loadFile("/media/goalHuman.mp3", function(buffer) {
      //   wa.play(buffer);
      // });
      console.log("#audio-hit-human");
    } else if (hitter == "rl") {
      // this.hitRl.load();
      this.hitRl.play();
      // $("#audio-hit-rl").click();
      // soundEffect.play();
      console.log("#audio-hit-rl");
      // wa.loadFile("/media/goalHuman.mp3", function(buffer) {
      //   wa.play(buffer);
      // });

    }
  }
}


// $(".test").click(function (event) {
//   $("#audio-goal-rl").click();
// });

// $("#audio-goal-rl").click(function (event) {
//   $("#audio-goal-rl").get(0).play();
// });

// $("#audio-goal-human").click(function (event) {
//   $("#audio-goal-human").get(0).play();
// });

// $("#audio-hit-rl").click(function (event) {
//   $("#audio-hit-rl").get(0).play();
// });

// $("#audio-hit-human").click(function (event) {
//   $("#audio-hit-human").get(0).play();
// });

// const soundEffect = new Audio();
// soundEffect.autoplay = true;

// // onClick of first interaction on page before I need the sounds
// // (This is a tiny MP3 file that is silent and extremely short - retrieved from https://bigsoundbank.com and then modified)
// soundEffect.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

// // later on when you actually want to play a sound at any point without user interaction
// soundEffect.src = "/media/goalHuman.mp3";

// console.log("load test");



var wa = {

  context: null,
  _buffers: {},

  _initialize: function() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
  },

  playSilent: function() {
    var context = this.context;
    var buf = context.createBuffer(1, 1, 22050);
    var src = context.createBufferSource();
    src.buffer = buf;
    src.connect(context.destination);
    src.start(0);
  },

  play: function(buffer) {
    // ファイル名で指定
    if (typeof buffer === "string") {
      buffer = this._buffers[buffer];
      if (!buffer) {
        console.error('ファイルが用意できてません!');
        return;
      }
    }

    var context = this.context;
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  },

  loadFile: function(src, cb) {
    var self = this;
    var context = this.context;
    var xml = new XMLHttpRequest();
    xml.open('GET', src);
    xml.onreadystatechange = function() {
      if (xml.readyState === 4) {
        if ([200, 201, 0].indexOf(xml.status) !== -1) {

          var data = xml.response;

          // webaudio 用に変換
          context.decodeAudioData(data, function(buffer) {
            // buffer登録
            var s = src.split('/');
            var key = s[s.length-1];
            self._buffers[key] = buffer;

            // コールバック
            cb(buffer);
          });

        } else if (xml.status === 404) {
          // not found
          console.error("not found");
        } else {
          // サーバーエラー
          console.error("server error");
        }
      }
    };

    xml.responseType = 'arraybuffer';

    xml.send(null);
  },

};

wa._initialize(); // audioContextを新規作成

window.wa = wa;


window.onload = function() {
  // ページ読み込みと同時にロード
  wa.loadFile("/media/goalHuman.mp3", function(buffer) {

    console.log("load");
    // ユーザーイベント
    var event = "click";
    document.addEventListener(event, function() {
      // 無音再生
      wa.playSilent();
      // 非同期処理後に再生
      // wa.loadFile("/media/goalHuman.mp3", function(buffer) {
      //   wa.play("sample.mp3");
      // });
    });
  });
}