import Block from "../../services/Block";
import ConversationHeader from "../../components/conversationHeader";
import MessageInput from "../../components/messageInput";
import { chatTemplate } from "./chatTemplate";
import Handlebars from "handlebars";
import { conversationHeaderTemplate } from "../../components/conversationHeader/conversationHeaderTemplate";
import { messageTemplate } from "../../components/message/messageTemplate";
import { messageInputTemplate } from "../../components/messageInput/messageInputTemplate";
import { chatItemTemplate } from "../../components/chatItem/chatItemTemplate";
import { iconTemplate } from "../../components/icon/iconTebplate";
import { Validator } from "../../services/Validator";

// Регистрируем все необходимые partials
Handlebars.registerPartial("conversationHeader", conversationHeaderTemplate);
Handlebars.registerPartial("message", messageTemplate);
Handlebars.registerPartial("messageInput", messageInputTemplate);
Handlebars.registerPartial("chatItem", chatItemTemplate);
Handlebars.registerPartial("icon", iconTemplate);

interface Chat {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unreadCount?: number;
  status?: string;
}

interface ChatMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  time: string;
  chatId: string;
}

interface ChatPageProps {
  chats?: Chat[];
  activeChatId?: string;
  messages?: ChatMessage[];
}

export class ChatPage extends Block {
  private chats: Chat[];
  private activeChatId: string | null;
  private messages: ChatMessage[];

  constructor(props: ChatPageProps = {}) {
    // Инициализируем свойства до вызова super()
    const chats = props.chats || ChatPage.getMockChats();
    const activeChatId = props.activeChatId || null;
    const messages = props.messages || [];

    super("div", {
      ...props,
      events: {
        click: (e: Event) => this.handleClick(e),
        submit: (e: Event) => this.handleSubmit(e),
      },
    });

    // Инициализируем свойства после super()
    this.chats = chats;
    this.activeChatId = activeChatId;
    this.messages = messages;
  }

  componentDidMount() {
    console.log("ChatPage componentDidMount called");
    // Инициализация дочерних компонентов
    this.initializeChatItems();
    this.initializeMessageInput();

    // Автоматически выбираем первый чат, если нет активного
    if (!this.activeChatId && this.chats.length > 0) {
      console.log("Auto-selecting first chat:", this.chats[0].name);
      this.activeChatId = this.chats[0].id;
      this.messages = this.getMockMessages(this.chats[0].id);

      // Сначала обновляем разговор, затем рендерим
      this.updateConversation();
      console.log("Messages loaded:", this.messages);
    }

    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private initializeChatItems() {
    console.log("Initializing chat items, chats:", this.chats);
    // Не создаем отдельные компоненты ChatItem, так как они рендерятся через шаблон
    // Просто сохраняем данные для рендеринга
    console.log("Chat items data prepared for template rendering");
  }

  private initializeMessageInput() {
    this.children.messageInput = new MessageInput({
      placeholder: "Введите сообщение...",
      onSend: (message: string) => this.handleMessageSend(message),
      onInput: (event: Event) => this.handleMessageInput(event),
    });
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement;
    console.log("Click event detected on:", target);

    // Обработка клика по кнопке нового чата
    if (target.closest('.new-chat-button')) {
      console.log("New chat button clicked");
      this.handleNewChat();
      return;
    }

    // Обработка клика по элементу чата
    const chatItem = target.closest('.chat-item');
    if (chatItem) {
      const chatId = chatItem.getAttribute('data-chat-id');
      if (chatId) {
        console.log(`Chat item clicked, ID: ${chatId}`);
        this.handleChatSelect(chatId, e);
        return;
      }
    }

    // Обработка клика по кнопке удаления чата
    const deleteButton = target.closest('.delete-chat');
    if (deleteButton) {
      const chatItem = deleteButton.closest('.chat-item');
      if (chatItem) {
        const chatId = chatItem.getAttribute('data-chat-id');
        if (chatId) {
          console.log(`Delete chat button clicked for chat: ${chatId}`);
          this.handleChatDelete(chatId);
          return;
        }
      }
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (target.classList.contains('message-form')) {
      const messageInput = target.querySelector('input[name="message"]') as HTMLInputElement;
      if (messageInput) {
        this.handleMessageSend(messageInput.value);
        messageInput.value = '';
      }
    }
  }

    private handleChatSelect(chatId: string, e: Event) {
    e.preventDefault();
    console.log(`Выбран чат: ${chatId}`);

    // Обновляем активный чат
    this.activeChatId = chatId;
    this.messages = this.getMockMessages(chatId);

    console.log(`Активный чат установлен: ${this.activeChatId}, сообщений загружено: ${this.messages.length}`);

    // Обновляем заголовок и сообщения
    this.updateConversation();

    console.log("Перерендериваем страницу...");
    // Принудительно перерендериваем всю страницу
    this.forceRender();
  }

  private handleChatDelete(chatId: string) {
    console.log(`Удаляем чат: ${chatId}`);

    // Удаляем чат из списка
    this.chats = this.chats.filter(chat => chat.id !== chatId);

    // Если удаляемый чат был активным, сбрасываем активный чат
    if (this.activeChatId === chatId) {
      this.activeChatId = null;
      this.messages = [];
    }

    // Обновляем компоненты
    this.initializeChatItems();
    this.updateConversation();

    // Принудительно перерендериваем всю страницу
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private handleMessageSend(message: string) {
    if (!this.activeChatId) {
      console.log("Нет активного чата");
      return;
    }

    // Валидация сообщения
    if (!this.validateMessage(message)) {
      console.log("Сообщение не прошло валидацию");
      return;
    }

    console.log(`Отправка сообщения: ${message}`);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'sent',
      content: message,
      time: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      chatId: this.activeChatId,
    };

    this.messages.push(newMessage);

    // Обновляем превью в списке чатов
    const activeChat = this.chats.find(chat => chat.id === this.activeChatId);
    if (activeChat) {
      activeChat.preview = message;
      activeChat.time = newMessage.time;
    }

    this.updateConversation();

    // Принудительно перерендериваем всю страницу
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private handleMessageInput(event: Event) {
    const target = event.target as HTMLInputElement;
    console.log("Ввод сообщения:", target.value);
  }

  private handleNewChat() {
    console.log("Создание нового чата");
    // Логика создания нового чата
  }

  private validateMessage(message: string): boolean {
    // Используем новый класс Validator
    const errors = Validator.validateField('message', message);
    return errors.length === 0;
  }

  private updateConversation() {
    if (this.activeChatId) {
      const activeChat = this.chats.find(chat => chat.id === this.activeChatId);

      if (activeChat) {
        console.log("Обновляем заголовок для чата:", activeChat.name);

        // Обновляем заголовок переписки
        this.children.conversationHeader = new ConversationHeader({
          name: activeChat.name,
          avatar: activeChat.avatar,
          status: activeChat.status || 'online',
          onSettingsClick: () => this.handleChatSettings(),
        });

        console.log("Заголовок обновлен, сообщений:", this.messages.length);
      }
    } else {
      console.log("Нет активного чата для обновления");
    }
  }

  /**
   * Принудительно обновляет рендер страницы
   */
  private forceRender() {
    console.log("Принудительное обновление рендера");
    // Используем публичный метод для перерендеринга
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private handleChatSettings() {
    console.log("Открыть настройки чата");
  }

    private static getMockChats(): Chat[] {
    return [
      {
        id: "1",
        name: "Анна Петрова",
        avatar: "/avatars/anna.jpg",
        preview: "Привет! Когда встретимся?",
        time: "15:30",
        unreadCount: 2,
        status: "online"
      },
      {
        id: "2",
        name: "Алексей Смирнов",
        avatar: "/avatars/alexey.jpg",
        preview: "Проект готов к сдаче",
        time: "14:20",
        unreadCount: 0,
        status: "offline"
      },
      {
        id: "3",
        name: "Мария Козлова",
        avatar: "/avatars/maria.jpg",
        preview: "Спасибо за помощь!",
        time: "12:45",
        unreadCount: 1,
        status: "online"
      }
    ];
  }

  private getMockMessages(chatId: string): ChatMessage[] {
    const messagesByChat: Record<string, ChatMessage[]> = {
      "1": [
        {
          id: "1",
          type: "received",
          content: "Привет! Как продвигается проект?",
          time: "12:30",
          chatId: "1"
        },
        {
          id: "2",
          type: "sent",
          content: "Привет! Проект почти готов, осталось немного доработать",
          time: "12:32",
          chatId: "1"
        },
        {
          id: "3",
          type: "received",
          content: "Отлично! Когда встретимся?",
          time: "12:35",
          chatId: "1"
        }
      ],
      "2": [
        {
          id: "4",
          type: "sent",
          content: "Проект готов к сдаче",
          time: "14:20",
          chatId: "2"
        },
        {
          id: "5",
          type: "received",
          content: "Проверим и дадим обратную связь",
          time: "14:25",
          chatId: "2"
        }
      ],
      "3": [
        {
          id: "6",
          type: "received",
          content: "Спасибо за помощь с кодом!",
          time: "12:45",
          chatId: "3"
        }
      ]
    };

    return messagesByChat[chatId] || [];
  }

  protected render() {
    // Убеждаемся, что все свойства инициализированы
    const chats = this.chats || [];
    const activeChatId = this.activeChatId || "";
    const messages = this.messages || [];
    const activeChat = chats.find(chat => chat.id === activeChatId) || {};

    console.log("Rendering with data:", {
      chats: chats.length,
      activeChatId,
      messages: messages.length,
      activeChat: (activeChat as any).name || 'none',
      activeChatIdType: typeof activeChatId
    });

    return this.compile(chatTemplate, {
      chats,
      activeChatId,
      activeChat,
      messages,
      ...this.children,
    });
  }
}