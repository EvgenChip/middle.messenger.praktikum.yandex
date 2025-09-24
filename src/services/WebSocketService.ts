/**
 * WebSocket сервис для обмена сообщениями в чате
 * Основан на документации API: https://ya-praktikum.tech/api/v2/openapi/ws
 */

export interface WSMessage {
  id?: string;
  content: string;
  type: 'message' | 'file' | 'sticker' | 'ping' | 'pong' | 'get old' | 'user connected';
  time?: string;
  user_id?: string;
  chat_id?: string;
  file?: {
    id: number;
    user_id: number;
    path: string;
    filename: string;
    content_type: string;
    content_size: number;
    upload_date: string;
  };
}

export interface WSConfig {
  chatId: string;
  onMessage?: (message: WSMessage) => void;
  onMessages?: (messages: WSMessage[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private chatId: string | null = null;
  private pingInterval: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  // Callbacks
  private onMessage?: (message: WSMessage) => void;
  private onMessages?: (messages: WSMessage[]) => void;
  private onConnect?: () => void;
  private onDisconnect?: () => void;
  private onError?: (error: Event) => void;

  constructor() {
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  /**
   * Подключение к WebSocket чата
   */
  public connect(config: WSConfig): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.isConnecting) {

        return;
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {

        resolve();
        return;
      }

      this.isConnecting = true;
      this.chatId = config.chatId;
      this.onMessage = config.onMessage;
      this.onMessages = config.onMessages;
      this.onConnect = config.onConnect;
      this.onDisconnect = config.onDisconnect;
      this.onError = config.onError;

      try {

        const { chatAPI } = await import('./api');
        const tokenResponse = await chatAPI.getWebSocketToken(config.chatId);

        const userData = await chatAPI.getCurrentUser();
        const userId = userData.id;

        // Пробуем URL как в примере кода: /chats/{userId}/{chatId}/{token}
        const wsUrlWithUserAndToken = `wss://ya-praktikum.tech/ws/chats/${userId}/${config.chatId}/${tokenResponse.token}`;

        document.cookie = `authCookie=${tokenResponse.token}; path=/; domain=.ya-praktikum.tech`;

        this.ws = new WebSocket(wsUrlWithUserAndToken);
        this.addEventListeners();

        // Resolve promise when connection is established
        const originalOnConnect = this.onConnect;
        this.onConnect = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          if (originalOnConnect) originalOnConnect();
          resolve();
        };

        // Reject promise on error
        const originalOnError = this.onError;
        this.onError = (error) => {
          this.isConnecting = false;
          if (originalOnError) originalOnError(error);
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;

        reject(error);
      }
    });
  }

  /**
   * Отключение от WebSocket
   */
  public disconnect(): void {

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.removeEventListeners();
      this.ws.close(1000, "Normal closure");
      this.ws = null;
    }

    this.chatId = null;
    this.isConnecting = false;
  }

  /**
   * Отправка текстового сообщения
   */
  public sendMessage(content: string): void {
    if (!this.isConnected()) {

      return;
    }

    const message: WSMessage = {
      content,
      type: 'message'
    };

    this.ws!.send(JSON.stringify(message));
  }

  /**
   * Получение старых сообщений
   */
  public getOldMessages(offset: number = 0): void {
    if (!this.isConnected()) {

      return;
    }

    const message: WSMessage = {
      content: offset.toString(), // offset как строка согласно документации
      type: 'get old'
    };

    this.ws!.send(JSON.stringify(message));
  }

  /**
   * Отправка ping для поддержания соединения
   */
  private sendPing(): void {
    if (!this.isConnected()) {
      return;
    }

    const pingMessage = {
      type: 'ping'
    };

    this.ws!.send(JSON.stringify(pingMessage));
  }

  /**
   * Проверка состояния соединения
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Добавление обработчиков событий
   */
  private addEventListeners(): void {
    if (!this.ws) return;

    this.ws.addEventListener('open', this.handleOpen);
    this.ws.addEventListener('message', this.handleMessage);
    this.ws.addEventListener('error', this.handleError);
    this.ws.addEventListener('close', this.handleClose);
  }

  /**
   * Удаление обработчиков событий
   */
  private removeEventListeners(): void {
    if (!this.ws) return;

    this.ws.removeEventListener('open', this.handleOpen);
    this.ws.removeEventListener('message', this.handleMessage);
    this.ws.removeEventListener('error', this.handleError);
    this.ws.removeEventListener('close', this.handleClose);
  }

  /**
   * Обработчик открытия соединения
   */
  private handleOpen(): void {

    // Запускаем ping каждые 30 секунд
    this.pingInterval = window.setInterval(() => {
      this.sendPing();
    }, 30000);

    this.getOldMessages(0);

    if (this.onConnect) {
      this.onConnect();
    }
  }

  /**
   * Обработчик получения сообщения
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // Обработка pong
      if (data.type === 'pong') {

        return;
      }

      if (data.type === 'user connected') {

        return;
      }

      if (Array.isArray(data)) {

        if (this.onMessages) {
          this.onMessages(data);
        }
        return;
      }

      if (data.type === 'message' || data.type === 'file' || data.type === 'sticker') {

        if (this.onMessage) {
          this.onMessage(data);
        }
        return;
      }

    } catch (error) {

    }
  }

  /**
   * Обработчик ошибки
   */
  private handleError(event: Event): void {

    if (this.onError) {
      this.onError(event);
    }
  }

  /**
   * Обработчик закрытия соединения
   */
  private handleClose(event: CloseEvent): void {

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.removeEventListeners();

    if (this.onDisconnect) {
      this.onDisconnect();
    }

    // Автоматическое переподключение при неожиданном разрыве
    if (event.code === 1006 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        if (this.chatId) {
          this.connect({
            chatId: this.chatId,
            onMessage: this.onMessage,
            onMessages: this.onMessages,
            onConnect: this.onConnect,
            onDisconnect: this.onDisconnect,
            onError: this.onError,
          });
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
}

export const webSocketService = new WebSocketService();
