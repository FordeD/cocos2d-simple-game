const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupView extends cc.Component {
  @property({ tooltip: 'Элемент текста окна Popup', type: cc.Label })
  messageLabel: cc.Label;

  @property({
    tooltip: 'Элемент кнопки окна Popup',
    type: cc.Node,
    name: 'Элемент кнопки интерактива',
  })
  buttonBlock: cc.Node;

  @property({
    tooltip: 'Элемент кнопки закрытия окна Popup',
    type: cc.Node,
    name: 'Элемент кнопки закрытия',
  })
  buttonCloseBlock: cc.Node;

  onLoad() {
    this.node.active = false;
  }

  show(options: {
    message: string;
    showButton?: boolean;
    showClose?: boolean;
    onButton?: () => void;
    onClose?: () => void;
  }) {
    this.node.active = true;

    this.messageLabel.string = options.message;

    this.buttonBlock.active = !!options.showButton;
    this.buttonCloseBlock.active = !!options.showClose;

    // Динамический создаем или перезависываем логику интерактивности кнопок
    this.onButton = options.onButton;
    this.onClose = options.onClose;

    this.playShowAnimation();
  }

  hide() {
    this.playHideAnimation(() => {
      this.node.active = false;
    });
  }

  onButtonClicked() {
    this.onButton?.();
    this.hide();
  }

  onCloseClicked() {
    this.onClose?.();
    this.hide();
  }

  playShowAnimation() {
    this.node.scale = 0.8;
    this.node.opacity = 0;

    cc.tween(this.node).to(0.2, { scale: 1, opacity: 255 }).start();
  }

  playHideAnimation(cb: () => void) {
    cc.tween(this.node).to(0.15, { scale: 0.8, opacity: 0 }).call(cb).start();
  }
}
