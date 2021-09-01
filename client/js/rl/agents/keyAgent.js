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

    // Set up keys:
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
    if (this.isLeftKeyPressed) return 0;
    if (this.isRightKeyPressed) return 2;
    return 1;
  }
}
