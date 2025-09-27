import { httpClient } from './HttpClient';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    login: string;
    first_name: string;
    second_name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
}

export interface RegistrationRequest {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  time: string;
  type: 'sent' | 'received';
}

export interface Chat {
  id: string;
  title: string;
  avatar?: string;
  last_message?: ChatMessage;
  unread_count: number;
}

export interface UserSearchResult {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
}

export class ChatAPI {
  private baseUrl = "https://ya-praktikum.tech/api/v2"; // Пример базового URL

  /**
   * Авторизация пользователя
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>(
        `${this.baseUrl}/auth/signin`,
        data
      );

      "Login response status: " + response.status;
      "Login response data: " + JSON.stringify(response.data);

      // API возвращает токен в Set-Cookie заголовке, а не в теле ответа
      if (response.status === 200) {
        localStorage.setItem("authToken", "authenticated");

        const mockResponse: LoginResponse = {
          token: "cookie-based-auth", // Фиктивный токен, так как реальный в cookies
          user: {
            id: "unknown",
            login: data.login,
            first_name: "User",
            second_name: "Name",
            email: "user@example.com",
            phone: "+79000000000",
          },
        };

        return mockResponse;
      } else if (response.status === 400) {
        // Если пользователь уже в системе, считаем это успешным логином
        try {
          const errorData = await response.data;
          if (
            errorData &&
            typeof errorData === "object" &&
            "reason" in errorData &&
            errorData.reason === "User already in system"
          ) {
            localStorage.setItem("authToken", "authenticated");

            const mockResponse: LoginResponse = {
              token: "cookie-based-auth",
              user: {
                id: "unknown",
                login: data.login,
                first_name: "User",
                second_name: "Name",
                email: "user@example.com",
                phone: "+79000000000",
              },
            };

            return mockResponse;
          }
        } catch {
          // Если не удалось распарсить ошибку, продолжаем с обычной обработкой
        }

        `Login failed with status: ${response.status}`;
        throw new Error(`Login failed with status: ${response.status}`);
      } else {
        `Login failed with status: ${response.status}`;
        throw new Error(`Login failed with status: ${response.status}`);
      }
    } catch (error: unknown) {
      // Показываем детали ошибки от API
      if (error instanceof Error && error.message) {
        "Login error: " + error.message;
      }

      // Если пользователь уже в системе, считаем это успешным логином
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes("User already in system")
      ) {
        localStorage.setItem("authToken", "authenticated");

        const mockResponse: LoginResponse = {
          token: "already-logged-in",
          user: {
            id: "existing-user",
            login: data.login,
            first_name: "User",
            second_name: "Name",
            email: "user@example.com",
            phone: "+79000000000",
          },
        };

        return mockResponse;
      }

      throw error;
    }
  }

  /**
   * Регистрация пользователя
   */
  async register(data: RegistrationRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>(
        `${this.baseUrl}/auth/signup`,
        data
      );

      return response.data;
    } catch (error: unknown) {
      // Если пользователь уже существует, считаем это успешной регистрацией
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes("User already in system")
      ) {
        localStorage.setItem("authToken", "authenticated");

        const mockResponse: LoginResponse = {
          token: "user-exists",
          user: {
            id: "existing-user",
            login: data.login,
            first_name: data.first_name,
            second_name: data.second_name,
            email: data.email,
            phone: data.phone,
          },
        };
        return mockResponse;
      }
      throw error;
    }
  }

  /**
   * Получение списка чатов
   */
  async getChats(): Promise<Chat[]> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      const response = await httpClient.get<Chat[]>(`${this.baseUrl}/chats`);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Получение сообщений чата
   */
  async getChatMessages(
    chatId: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      const url = httpClient.buildUrl(
        `${this.baseUrl}/chats/${chatId}/messages`,
        {
          offset,
          limit,
        }
      );

      const response = await httpClient.get<ChatMessage[]>(url);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Отправка сообщения
   */
  async sendMessage(chatId: string, content: string): Promise<void> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      await httpClient.post(
        `${this.baseUrl}/chats/${chatId}/messages`,
        { content },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Создание нового чата
   */
  async createChat(title: string): Promise<{ id: string }> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      const response = await httpClient.post<{ id: string }>(
        `${this.baseUrl}/chats`,
        { title },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Удаление чата
   */
  async deleteChat(chatId: string): Promise<void> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      await httpClient.delete(`${this.baseUrl}/chats/${chatId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Получение данных текущего пользователя
   */
  async getCurrentUser(): Promise<LoginResponse["user"]> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      const response = await httpClient.get<LoginResponse["user"]>(
        `${this.baseUrl}/auth/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(data: Partial<RegistrationRequest>): Promise<void> {
    try {
      await httpClient.put(`${this.baseUrl}/user/profile`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Смена пароля
   */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      await httpClient.put(
        `${this.baseUrl}/user/password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Загрузка аватара
   */
  async uploadAvatar(file: File): Promise<LoginResponse["user"]> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await httpClient.put<LoginResponse["user"]>(
        `${this.baseUrl}/user/profile/avatar`,
        formData,
        {
          credentials: "include",
          mode: "cors",
          // Не указываем Content-Type - браузер сам подставит multipart/form-data
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Получение токена для WebSocket
   */
  async getWebSocketToken(chatId: string): Promise<{ token: string }> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token");
      }

      const response = await httpClient.post<{ token: string }>(
        `${this.baseUrl}/chats/token/${chatId}`
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Поиск пользователей по логину
   */
  async searchUsers(login: string): Promise<UserSearchResult[]> {
    try {
      const response = await httpClient.post<UserSearchResult[]>(
        `${this.baseUrl}/user/search`,
        { login }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Добавить пользователей в чат
   */
  async addUsersToChat(chatId: string, userIds: number[]): Promise<void> {
    try {
      await httpClient.put(`${this.baseUrl}/chats/users`, {
        users: userIds,
        chatId: parseInt(chatId),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Удалить пользователей из чата
   */
  async removeUsersFromChat(chatId: string, userIds: number[]): Promise<void> {
    try {
      await httpClient.delete(`${this.baseUrl}/chats/users`, {
        users: userIds,
        chatId: parseInt(chatId),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Получить участников чата
   */
  async getChatUsers(chatId: string): Promise<UserSearchResult[]> {
    try {
      const response = await httpClient.get<UserSearchResult[]>(
        `${this.baseUrl}/chats/${chatId}/users`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return; // Уже не авторизован
      }

      await httpClient.post(`${this.baseUrl}/auth/logout`);

      localStorage.removeItem("authToken");
    } catch (error) {
      localStorage.removeItem("authToken");
      throw error;
    }
  }
}

export const chatAPI = new ChatAPI();
