// キー操作を管理するクラス
export class KeyAgent {
  constructor(options) {
    options = {
      leftKey: 37,
      rightKey: 39,
      ...(options || {}),
    };

    Object.assign(this, options);

    this.isLeftKeyPressed = false;
    this.isRightKeyPressed = false;

    // touch or mouse event
    $(".right-key").on("touchstart mousedown", () => {
      this.isRightKeyPressed = true;
    });
    $(".right-key").on("touchend mouseup", () => {
      this.isRightKeyPressed = false;
    });

    $(".left-key").on("touchstart mousedown", () => {
      this.isLeftKeyPressed = true;
    });
    $(".left-key").on("touchend mouseup", () => {
      this.isLeftKeyPressed = false;
    });

    // key event
    $(document).keydown((event) => {
      if (event.which === this.leftKey) {
        this.isLeftKeyPressed = true;
      } else if (event.which === this.rightKey) {
        this.isRightKeyPressed = true;
      }
    });

    $(document).keyup((event) => {
      if (event.which === this.leftKey) {
        this.isLeftKeyPressed = false;
      } else if (event.which === this.rightKey) {
        this.isRightKeyPressed = false;
      }
    });
  }

  selectAction() {
    console.log(this.isLeftKeyPressed);
    console.log(this.isRightKeyPressed);
    if (this.isLeftKeyPressed) {
      $(".left-key").css("border-right", "40px solid #628DA5");
      return 0;
    } else if (this.isRightKeyPressed) {
      $(".right-key").css("border-left", "40px solid #628DA5");
      return 2;
    } else {
      $(".right-key").css("border-left", "40px solid white");
      $(".left-key").css("border-right", "40px solid white");
      return 1;
    }
  }
}
