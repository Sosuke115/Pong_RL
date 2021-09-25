// ランキング画面の管理
export class RankingManager {
  constructor() {
      this.rankingInfo = {
        "ranking": {
          "0": [
            {
              "userName": "Ichiro",
              "score": 10
            },
            {
              "userName": "Ichiro",
              "score": 10
            },
            {
              "userName": "Saburo",
              "score": 5
            },
            {
              "userName": "Saburo",
              "score": 5
            },
            {
              "userName": "Jiro",
              "score": 2
            },
          ],
          "20000": [
            {
              "userName": "Saburo",
              "score": 8
            },
            {
              "userName": "Saburo",
              "score": 8
            },
            {
              "userName": "Jiro",
              "score": 4
            },
            {
              "userName": "Jiro",
              "score": 4
            },
            {
              "userName": "Ichiro",
              "score": 3
            },
          ],
          "50000": [
            {
              "userName": "Saburo",
              "score": 5
            },
            {
              "userName": "Saburo",
              "score": 5
            },
            {
              "userName": "Shiro",
              "score": -1
            },
            {
              "userName": "Shiro",
              "score": -1
            },
            {
              "userName": "Ichiro",
              "score": -2
            },
          ],
          "100000": [
            {
              "userName": "Jiro",
              "score": -4
            },
            {
              "userName": "Jiro",
              "score": -4
            },
            {
              "userName": "Ichiro",
              "score": -5
            },
            {
              "userName": "Ichiro",
              "score": -5
            }
          ]
        },
        "avg": {
          "0": "2.6000000000000000",
          "20000": "1.8000000000000000",
          "50000": "-0.25000000000000000000",
          "100000": "-4.5000000000000000"
        }
      }
  }

  // rl stepに対応するランキング表を描画
  draw(rlStep) {
    $('#result-subtitle-rlStep').text(String(rlStep).replace(/(.*)000/,"$1k"));
    const average = this.rankingInfo["avg"][String(rlStep)];
    const rankingInfo = this.rankingInfo["ranking"][String(rlStep)];
    for (let i = 0; i < rankingInfo.length ; i++) {
        $(`#rank${i + 1}-score`).text(rankingInfo[i]["score"]);
        $(`#rank${i + 1}-name`).text(rankingInfo[i]["userName"]);
    }

    $("#avg-score").text(Number(average).toPrecision(2));
  }
}


