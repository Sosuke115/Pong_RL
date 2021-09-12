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
    if (this.isLeftKeyPressed) {
      $(".left-key").addClass("left-key-color");
      return 0;
    } else if (this.isRightKeyPressed) {
      $(".right-key").addClass("right-key-color");
      return 2;
    } else {
      $(".left-key").removeClass("left-key-color");
      $(".right-key").removeClass("right-key-color");
      return 1;
    }
  }
}
