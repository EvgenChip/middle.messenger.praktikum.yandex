import Block from "../../services/Block";
import { iconTemplate } from "../icon/iconTebplate";
import { messageInputTemplate } from "./messageInputTemplate";
import Handlebars from "handlebars";

interface MessageInputProps {
  onSend?: (message: string) => void;
  onInput?: (event: Event) => void;
}
Handlebars.registerPartial("icon", iconTemplate);
class MessageInput extends Block {
  constructor(props: MessageInputProps) {
    super("div", {
      ...props,
      events: {
        click: (e: Event) => {
          if ((e.target as HTMLElement).closest(".send-button")) {
            const input = this.element.querySelector("input");
            if (input && props.onSend) {
              props.onSend(input.value);
              input.value = "";
            }
          }
        },
        input: props.onInput || (() => {}),
      },
    });
  }

  protected render() {
    return this.compile(messageInputTemplate, this.props);
  }
}

export default MessageInput;
