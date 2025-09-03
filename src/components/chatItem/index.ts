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
  unreadCount?: number;
  onClick?: (event: Event) => void;
  onDelete?: (chatId: string) => void;
}

Handlebars.registerPartial("icon", iconTemplate);

class ChatItem extends Block {
  constructor(props: ChatItemProps) {
    super("div", {
      ...props,
      events: {
        click: (e: Event) => {
          // Не вызываем onClick при клике на кнопку удаления
          if (!(e.target as HTMLElement).closest('.delete-chat')) {
            props.onClick?.(e);
          }
        },
      },
    });

    // Добавляем обработчик удаления
    this.element.addEventListener('click', (e: Event) => {
      if ((e.target as HTMLElement).closest('.delete-chat')) {
        e.preventDefault();
        e.stopPropagation();
        props.onDelete?.(props.id);
      }
    });
  }

  protected render() {
    return this.compile(chatItemTemplate, this.props);
  }
}

export default ChatItem;
