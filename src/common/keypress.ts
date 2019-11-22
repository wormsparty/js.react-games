export class KeyPress {
  public pressed: boolean;
  public prevPressed: boolean;

  constructor() {
    this.pressed = false;
    this.prevPressed = false;
  }
}