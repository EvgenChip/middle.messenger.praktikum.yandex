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
import { chatAPI } from "../../services/api";
import { webSocketService, WSMessage } from "../../services/WebSocketService";

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
  type: "sent" | "received";
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
        keypress: (e: KeyboardEvent) => this.handleKeypress(e),
      },
    });

    // Инициализируем свойства после super()
    this.chats = chats;
    this.activeChatId = activeChatId;
    this.messages = messages;
  }

  componentDidMount() {
    this.loadChatsFromAPI();
  }

  componentWillUnmount() {
    // Отключаемся от WebSocket при выходе из чата
    webSocketService.disconnect();
  }

  private async loadChatsFromAPI() {
    try {
      const apiChats = await chatAPI.getChats();

      this.chats = apiChats.map((chat) => ({
        id: chat.id.toString(),
        name: chat.title,
        avatar: chat.avatar || "",
        preview: chat.last_message?.content || "",
        time: chat.last_message?.time || "",
        unreadCount: chat.unread_count || 0,
        status: "online",
      }));

      this.initializeChatItems();
      this.initializeMessageInput();

      if (!this.activeChatId && this.chats.length > 0) {
        this.activeChatId = this.chats[0].id;
        await this.loadMessagesForChat(this.activeChatId);
      }

      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    } catch (error) {
      this.initializeChatItems();
      this.initializeMessageInput();
      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    }
  }

  private async loadMessagesForChat(chatId: string) {
    try {
      const apiMessages = await chatAPI.getChatMessages(chatId);

      const currentUserId = await this.getCurrentUserId();
      this.messages = apiMessages.map((message) => ({
        id: message.id,
        type: message.user_id === currentUserId ? "sent" : "received",
        content: message.content,
        time: new Date(message.time).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        chatId: chatId,
      }));

      this.updateConversation();
    } catch (error) {
      this.messages = this.getMockMessages(chatId);
      this.updateConversation();
    }
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      const userData = await chatAPI.getCurrentUser();
      return userData.id.toString();
    } catch (error) {
      return "unknown";
    }
  }

  private async connectToWebSocket(chatId: string): Promise<void> {
    try {
      await webSocketService.connect({
        chatId,
        onMessage: (message) => this.handleWebSocketMessage(message),
        onMessages: (messages) => this.handleWebSocketMessages(messages),
        onConnect: () => console.log("✅ WebSocket connected to chat:", chatId),
        onDisconnect: () => console.log("🔌 WebSocket disconnected from chat:", chatId),
        onError: (error) => console.log("❌ WebSocket error:", error),
      });
    } catch (error) {
      await this.loadMessagesForChat(chatId);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Обработка нового сообщения из WebSocket
   */
  private async handleWebSocketMessage(wsMessage: WSMessage): Promise<void> {
    const currentUserId = await this.getCurrentUserId();

    const message: ChatMessage = {
      id: wsMessage.id || Date.now().toString(),
      type: wsMessage.user_id === currentUserId ? "sent" : "received",
      content: this.escapeHtml(wsMessage.content),
      time: wsMessage.time
        ? new Date(wsMessage.time).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      chatId: this.activeChatId || "",
    };

    this.messages.unshift(message);
    this.updateConversation();
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private async handleWebSocketMessages(
    wsMessages: WSMessage[]
  ): Promise<void> {
    const currentUserId = await this.getCurrentUserId();

    const messages: ChatMessage[] = wsMessages.map((wsMessage) => ({
      id: wsMessage.id || Date.now().toString(),
      type: wsMessage.user_id === currentUserId ? "sent" : "received",
      content: this.escapeHtml(wsMessage.content),
      time: wsMessage.time
        ? new Date(wsMessage.time).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      chatId: this.activeChatId || "",
    }));

    this.messages = messages;

    this.updateConversation();
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private initializeChatItems() {}

  private initializeMessageInput() {
    this.children.messageInput = new MessageInput({
      placeholder: "Введите сообщение...",
      onSend: (message: string) => this.handleMessageSend(message),
      onInput: (event: Event) => this.handleMessageInput(event),
    });
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement;

    if (target.closest(".new-chat-button")) {
      this.handleNewChat();
      return;
    }

    const chatItem = target.closest(".chat-item");
    if (chatItem) {
      const chatId = chatItem.getAttribute("data-chat-id");
      if (chatId) {
        this.handleChatSelect(chatId, e);
        return;
      }
    }

    const deleteButton = target.closest(".delete-chat");
    if (deleteButton) {
      const chatItem = deleteButton.closest(".chat-item");
      if (chatItem) {
        const chatId = chatItem.getAttribute("data-chat-id");
        if (chatId) {
          `Delete chat button clicked for chat: ${chatId}`;
          this.handleChatDelete(chatId);
          return;
        }
      }
    }

    // Обработка клика по кнопке закрытия модального окна
    if (target.closest('[data-action="closeCreateChatModal"]')) {
      this.closeCreateChatModal();
      return;
    }

    // Обработка клика по фону модального окна
    if (target.id === "createChatModal") {
      this.closeCreateChatModal();
      return;
    }

    if (target.classList.contains("send-button")) {
      const messageInput = target.parentElement?.querySelector(
        'input[name="message"]'
      ) as HTMLInputElement;
      if (messageInput && messageInput.value.trim()) {
        this.handleMessageSend(messageInput.value.trim());
        messageInput.value = "";
      }
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (target.classList.contains("message-form")) {
      const messageInput = target.querySelector(
        'input[name="message"]'
      ) as HTMLInputElement;
      if (messageInput) {
        this.handleMessageSend(messageInput.value);
        messageInput.value = "";
      }
    } else if (target.id === "createChatForm") {
      this.handleCreateChatSubmit(e);
    }
  }

  private async handleChatSelect(chatId: string, e: Event) {
    e.preventDefault();
    `Выбран чат: ${chatId}`;

    // Отключаемся от предыдущего чата
    if (this.activeChatId && this.activeChatId !== chatId) {
      webSocketService.disconnect();
    }

    this.activeChatId = chatId;

    await this.connectToWebSocket(chatId);

    this.updateConversation();

    this.forceRender();
  }

  private async handleChatDelete(chatId: string) {
    `Удаляем чат: ${chatId}`;

    try {
      // Удаляем чат через API
      await chatAPI.deleteChat(chatId);

      // Удаляем чат из списка
      this.chats = this.chats.filter((chat) => chat.id !== chatId);

      // Если удаляемый чат был активным, сбрасываем активный чат
      if (this.activeChatId === chatId) {
        this.activeChatId = null;
        this.messages = [];
      }

      this.initializeChatItems();
      this.updateConversation();

      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    } catch (error) {
      alert("Ошибка при удалении чата");
    }
  }

  private async handleMessageSend(message: string) {
    if (!this.activeChatId) {
      return;
    }

    if (!this.validateMessage(message)) {
      return;
    }

    try {
      if (webSocketService.isConnected()) {
        webSocketService.sendMessage(message);

        const activeChat = this.chats.find(
          (chat) => chat.id === this.activeChatId
        );
        if (activeChat) {
          activeChat.preview = message;
          activeChat.time = new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      } else {
        await chatAPI.sendMessage(this.activeChatId, message);
        await this.loadMessagesForChat(this.activeChatId);
      }
    } catch (error) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "sent",
        content: message,
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        chatId: this.activeChatId,
      };

      this.messages.unshift(newMessage);
      this.updateConversation();
      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    }
  }

  private handleMessageInput(_event: Event) {
    // Обработчик для будущего использования
  }

  private handleKeypress(event: KeyboardEvent) {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      const input = event.target as HTMLInputElement;
      if (input.name === "message" && input.value.trim()) {
        event.preventDefault();
        this.handleMessageSend(input.value.trim());
        input.value = "";
      }
    }
  }

  private handleNewChat() {
    this.openCreateChatModal();
  }

  private openCreateChatModal() {
    const modal = document.getElementById("createChatModal");
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";

      const input = modal.querySelector("#chatTitle") as HTMLInputElement;
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }
  }

  private closeCreateChatModal() {
    const modal = document.getElementById("createChatModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "";

      const form = modal.querySelector("#createChatForm") as HTMLFormElement;
      if (form) {
        form.reset();
      }
    }
  }

  private async handleCreateChatSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get("chatTitle") as string;

    if (!title || title.trim() === "") {
      return;
    }

    try {
      await chatAPI.createChat(title.trim());

      // Закрываем модальное окно
      this.closeCreateChatModal();

      // Перезагружаем список чатов
      await this.loadChatsFromAPI();
    } catch (error) {}
  }

  private validateMessage(message: string): boolean {
    // Используем новый класс Validator
    const errors = Validator.validateField("message", message);
    return errors.length === 0;
  }

  private updateConversation() {
    if (this.activeChatId) {
      const activeChat = this.chats.find(
        (chat) => chat.id === this.activeChatId
      );

      if (activeChat) {
        this.children.conversationHeader = new ConversationHeader({
          name: activeChat.name,
          avatar: activeChat.avatar,
          status: activeChat.status || "online",
          onSettingsClick: () => this.handleChatSettings(),
        });
      }
    } else {
    }
  }

  /**
   * Принудительно обновляет рендер страницы
   */
  private forceRender() {
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private handleChatSettings() {}

  private static getMockChats(): Chat[] {
    return [
      {
        id: "1",
        name: "Анна Петрова",
        avatar: "/avatars/anna.jpg",
        preview: "Привет! Когда встретимся?",
        time: "15:30",
        unreadCount: 2,
        status: "online",
      },
      {
        id: "2",
        name: "Алексей Смирнов",
        avatar: "/avatars/alexey.jpg",
        preview: "Проект готов к сдаче",
        time: "14:20",
        unreadCount: 0,
        status: "offline",
      },
      {
        id: "3",
        name: "Мария Козлова",
        avatar: "/avatars/maria.jpg",
        preview: "Спасибо за помощь!",
        time: "12:45",
        unreadCount: 1,
        status: "online",
      },
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
          chatId: "1",
        },
        {
          id: "2",
          type: "sent",
          content: "Привет! Проект почти готов, осталось немного доработать",
          time: "12:32",
          chatId: "1",
        },
        {
          id: "3",
          type: "received",
          content: "Отлично! Когда встретимся?",
          time: "12:35",
          chatId: "1",
        },
      ],
      "2": [
        {
          id: "4",
          type: "sent",
          content: "Проект готов к сдаче",
          time: "14:20",
          chatId: "2",
        },
        {
          id: "5",
          type: "received",
          content: "Проверим и дадим обратную связь",
          time: "14:25",
          chatId: "2",
        },
      ],
      "3": [
        {
          id: "6",
          type: "received",
          content: "Спасибо за помощь с кодом!",
          time: "12:45",
          chatId: "3",
        },
      ],
    };

    return messagesByChat[chatId] || [];
  }

  protected render() {
    // Убеждаемся, что все свойства инициализированы
    const chats = this.chats || [];
    const activeChatId = this.activeChatId || "";
    const messages = this.messages || [];
    const activeChat =
      chats.find(
        (chat) =>
          chat.id === activeChatId || chat.id === activeChatId.toString()
      ) || {};

    return this.compile(chatTemplate, {
      chats,
      activeChatId,
      activeChat,
      messages,
      ...this.children,
    });
  }
}
