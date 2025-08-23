import { httpClient } from './HttpClient';

// Интерфейсы для API
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

// API сервис для работы с чатом
export class ChatAPI {
  private baseUrl = 'https://ya-praktikum.tech/api/v2'; // Пример базового URL

  /**
   * Авторизация пользователя
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>(
        `${this.baseUrl}/auth/signin`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Сохраняем токен в localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
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
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Получение списка чатов
   */
  async getChats(): Promise<Chat[]> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      const response = await httpClient.get<Chat[]>(`${this.baseUrl}/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get chats error:', error);
      throw error;
    }
  }

  /**
   * Получение сообщений чата
   */
  async getChatMessages(chatId: string, offset: number = 0, limit: number = 20): Promise<ChatMessage[]> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      const url = httpClient.buildUrl(`${this.baseUrl}/chats/${chatId}/messages`, {
        offset,
        limit
      });

      const response = await httpClient.get<ChatMessage[]>(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get chat messages error:', error);
      throw error;
    }
  }

  /**
   * Отправка сообщения
   */
  async sendMessage(chatId: string, content: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      await httpClient.post(
        `${this.baseUrl}/chats/${chatId}/messages`,
        { content },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Создание нового чата
   */
  async createChat(title: string): Promise<{ id: string }> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      const response = await httpClient.post<{ id: string }>(
        `${this.baseUrl}/chats`,
        { title },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Create chat error:', error);
      throw error;
    }
  }

  /**
   * Удаление чата
   */
  async deleteChat(chatId: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      await httpClient.delete(`${this.baseUrl}/chats/${chatId}`, undefined, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Delete chat error:', error);
      throw error;
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(data: Partial<RegistrationRequest>): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      await httpClient.put(
        `${this.baseUrl}/user/profile`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Смена пароля
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      await httpClient.put(
        `${this.baseUrl}/user/password`,
        { oldPassword, newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Загрузка аватара
   */
  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await httpClient.put<{ avatar: string }>(
        `${this.baseUrl}/user/profile/avatar`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
            // Не устанавливаем Content-Type для FormData
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return; // Уже не авторизован
      }

      await httpClient.post(
        `${this.baseUrl}/auth/logout`,
        undefined,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Удаляем токен
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Logout error:', error);
      // Даже при ошибке удаляем токен
      localStorage.removeItem('authToken');
      throw error;
    }
  }
}

// Экспортируем экземпляр API
export const chatAPI = new ChatAPI();
