// ランキング画面の管理
export class RankingManager {
  constructor(size = 10) {
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
      count: {
        0: "No data",
        20000: "No data",
        50000: "No data",
        100000: "No data",
      },
    };
    this.myRankInfo = {
      0: "No data",
      20000: "No data",
      50000: "No data",
      100000: "No data",
    };
    this.myScoreInfo = {
      0: "No data",
      20000: "No data",
      50000: "No data",
      100000: "No data",
    };
  }

  getRankedUserNames(trainingStep) {
    return this.rankingInfo["ranking"][trainingStep].map(item => item.userName)
  }

  getMyRank(trainingStep) {
    return this.myRankInfo[trainingStep]
  }

  async updateUserInfo(myScore, trainingStep, matchToken) {
    this.myScoreInfo[trainingStep] = myScore;    
    const url = "/api/get_my_rank";
    try {
      const myRank = await $.ajax({
        url: url,
        type: "GET",
        data: {
          token: matchToken,
          trainingStep: trainingStep,
        },
      });
      this.myRankInfo[trainingStep] = myRank.rank;
      console.log(myRank);
    } catch (error) {
      console.error(error);
    }
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
      // console.log(rankingInfo);
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

    const myScore = this.myScoreInfo[rlStep];
    let myRank = this.myRankInfo[rlStep];

    // draw my info
    $("#your-score").text(myScore);

    if (!(myRank == "No data")){
      myRank = String(myRank) + "/" + this.rankingInfo["count"][rlStep]
    }
    console.log(myRank);
    $("#your-rank").text(myRank);
  }
}
