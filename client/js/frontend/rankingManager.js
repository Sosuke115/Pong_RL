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

  getMyRank(trainingStep) {
    return this.myRankInfo[trainingStep];
  }

  async updateUserInfo(myScore, trainingStep) {
    this.myScoreInfo[trainingStep] = myScore;
    const url = "/api/get_my_rank";
    try {
      const myRank = await $.ajax({
        url: url,
        type: "GET",
        data: {
          score: myScore,
          trainingStep: trainingStep,
        },
      });
      if (myRank.error) {
        throw "database error";
      }
      this.myRankInfo[trainingStep] = myRank.rank;
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
      if (rankingInfo.error) {
        throw "database error";
      }
      this.rankingInfo = rankingInfo;
    } catch (error) {
      console.error(error);
    }
  }

  isJapanese(userName) {
    let isJapanese = false;
    for (let i = 0; i < userName.length; i++) {
      if (userName.charCodeAt(i) >= 256) {
        isJapanese = true;
        break;
      }
    }
    return isJapanese;
  }

  truncateUsername(userName, isJapanese) {
    if (isJapanese) {
      userName = userName.slice(0, 10);
    } else {
      userName = userName.slice(0, 11);
    }
    return userName;
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

    let rank = 0;
    let score = null;
    let userName = null;
    let isJapanese = false;

    $(`.nicknames`).children().removeClass("japanese-username")
    for (let i = 0; i < rankingInfo.length; i++) {
      if (score === null || score > rankingInfo[i]["score"]) {
        rank++;
        score = rankingInfo[i]["score"];
      }

      userName = rankingInfo[i]["userName"]
      isJapanese = this.isJapanese(userName);
      userName = this.truncateUsername(userName, isJapanese);
    
      $(`#rank${i + 1}-rank`).text(rank);
      $(`#rank${i + 1}-score`).text(rankingInfo[i]["score"]);
      $(`#rank${i + 1}-name`).text(userName);
      if (isJapanese) {
        console.log(userName);
        $(`#rank${i + 1}-name`).addClass("japanese-username")
      }
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
    $(".your-score").text(myScore);

    if (!(myRank == "No data")) {
      myRank = String(myRank) + "/" + this.rankingInfo["count"][rlStep];
    }
    $(".your-rank").text(myRank);
  }
}
