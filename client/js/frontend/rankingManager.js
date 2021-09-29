// ランキング画面の管理
export class RankingManager {
  constructor(size=10) {
    this.size = size;
    this.rankingInfo = {
      ranking: {
        0: Array(size).fill({ score: "No data", userName: "No data" }),
        20000: Array(size).fill({ score: "No data", userName: "No data" }),
        50000: Array(size).fill({ score: "No data", userName: "No data" }),
        100000: Array(size).fill({ score: "No data", userName: "No data" }),
      },
      avg: {
        0: "No data",
        20000: "No data",
        50000: "No data",
        100000: "No data",
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
          size: this.size,
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
    $(".result-subtitle-rlStep").text(String(rlStep).replace(/(.*)000/, "$1k"));

    let rankingInfo = this.rankingInfo["ranking"][String(rlStep)];

    let padArray = function (arr, len, fill) {
      return arr.concat(Array(len).fill(fill)).slice(0, len);
    };

    rankingInfo = padArray(rankingInfo.slice(), this.size, {
      score: "No data",
      userName: "No data",
    });

    for (let i = 0; i < rankingInfo.length; i++) {
      $(`#rank${i + 1}-score`).text(rankingInfo[i]["score"]);
      $(`#rank${i + 1}-name`).text(rankingInfo[i]["userName"]);
    }

    let average = this.rankingInfo["avg"][String(rlStep)];
    average =
      average == "No data" || typeof average === "undefined"
        ? "No data"
        : Math.round(average * 10) / 10;
    $("#avg-score").text(average);
  }
}
