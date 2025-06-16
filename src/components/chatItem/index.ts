import Block from "../../services/Block";
import { iconTemplate } from "../icon/iconTebplate";
import { chatItemTemplate } from "./chatItemTemplate";
import Handlebars from "handlebars";

interface ChatItemProps {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  active?: boolean;
  onClick?: (event: Event) => void;
  onDelete?: (chatId: string) => void;
}
Handlebars.registerPartial("icon", iconTemplate);
class ChatItem extends Block {
  constructor(props: ChatItemProps) {
    super("div", {
      ...props,
      events: {
        click: props.onClick || (() => {}),
      },
    });
  }

  protected render() {
    return this.compile(chatItemTemplate, this.props);
  }
}

export default ChatItem;
