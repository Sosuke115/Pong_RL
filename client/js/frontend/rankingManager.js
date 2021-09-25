// ランキング画面の管理
export class RankingManager {
  constructor() {
    this.rankingInfo = {
      ranking: {
        "0": Array(5).fill({ score: "No data", userName: "No data" }),
        "20000": Array(5).fill({ score: "No data", userName: "No data" }),
        "50000": Array(5).fill({ score: "No data", userName: "No data" }),
        "100000": Array(5).fill({ score: "No data", userName: "No data" }),
      },
      avg: {
        "0": "No data",
        "20000": "No data",
        "50000": "No data",
        "100000": "No data",
      },
    };
  }

  async updateRankingInfo() {
    const url = "/api/get_ranking";
    try {
      const rankingInfo = await $.ajax({
        url: url,
        type: "GET",
        data: {
          size: 5,
        },
      });
      this.rankingInfo = rankingInfo;
    //   console.log(rankingInfo);
    } catch (error) {
      console.error(error);
    }
  }

  // rl stepに対応するランキング表を描画
  draw(rlStep) {
    $("#result-subtitle-rlStep").text(String(rlStep).replace(/(.*)000/, "$1k"));

    const rankingInfo = this.rankingInfo["ranking"][String(rlStep)];
    for (let i = 0; i < rankingInfo.length; i++) {
      $(`#rank${i + 1}-score`).text(rankingInfo[i]["score"]);
      $(`#rank${i + 1}-name`).text(rankingInfo[i]["userName"]);
    }

    let average = this.rankingInfo["avg"][String(rlStep)];
    average = average != "No data" ?  Math.round(average * 10) / 10 : average;
    $("#avg-score").text(average);
  }
}
