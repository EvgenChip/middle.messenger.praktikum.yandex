# HTTP Client Documentation

## Обзор

`HttpClient` - это кастомный класс для работы с HTTP запросами, реализованный согласно требованиям sprint_2. Класс использует только Promise и XHR (XMLHttpRequest), без использования Fetch API или axios.

## Основные возможности

- ✅ **GET** запросы с поддержкой query string
- ✅ **POST** запросы с body
- ✅ **PUT** запросы с body
- ✅ **DELETE** запросы с body (опционально)
- ✅ Настройка заголовков
- ✅ Таймауты
- ✅ Обработка ошибок
- ✅ Поддержка JSON и FormData
- ✅ Типизация TypeScript

## Использование

### Базовые методы

```typescript
import { httpClient } from './services/HttpClient';

// GET запрос
const response = await httpClient.get('https://api.example.com/users');

// POST запрос с данными
const newUser = await httpClient.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT запрос
await httpClient.put('https://api.example.com/users/1', {
  name: 'Jane Doe'
});

// DELETE запрос
await httpClient.delete('https://api.example.com/users/1');
```

### Настройка запросов

```typescript
// С заголовками и таймаутом
const response = await httpClient.get('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer token123',
    'Accept': 'application/json'
  },
  timeout: 5000 // 5 секунд
});
```

### Query параметры

```typescript
// Автоматическое построение URL с параметрами
const url = httpClient.buildUrl('https://api.example.com/users', {
  page: 1,
  limit: 10,
  search: 'john'
});
// Результат: https://api.example.com/users?page=1&limit=10&search=john

const response = await httpClient.get(url);
```

### Обработка ошибок

```typescript
try {
  const response = await httpClient.get('https://api.example.com/data');
  console.log('Успех:', response.data);
} catch (error) {
  if (error.status === 404) {
    console.log('Ресурс не найден');
  } else if (error.message.includes('timeout')) {
    console.log('Превышен таймаут');
  } else {
    console.log('Ошибка сети:', error.message);
  }
}
```

## API Reference

### HttpClient

#### Методы

- `get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>`
- `post<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>`
- `put<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>`
- `delete<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>`
- `buildUrl(baseUrl: string, params?: Record<string, any>): string`

#### Вспомогательные методы

- `setBaseUrl(baseUrl: string): void`
- `setAuthToken(token: string): void`

### Интерфейсы

#### HttpRequestConfig
```typescript
interface HttpRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}
```

#### HttpResponse
```typescript
interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
```

#### HttpError
```typescript
interface HttpError {
  message: string;
  status?: number;
  statusText?: string;
}
```

## Примеры интеграции

### В компонентах Block

```typescript
import { httpClient } from '../../services/HttpClient';

class UserProfile extends Block {
  async loadUserData(userId: string) {
    try {
      const response = await httpClient.get(`/api/users/${userId}`);
      this.setProps({ user: response.data });
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  }
}
```

### В API сервисах

```typescript
import { httpClient } from './HttpClient';

export class UserAPI {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post('/auth/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<UserProfile> {
    const response = await httpClient.get('/user/profile', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.data;
  }
}
```

## Тестирование

Для тестирования HTTP класса создан `HttpClientDemo`:

```typescript
import HttpClientDemo from './services/HttpClient.test';

// Запуск всех тестов
await HttpClientDemo.runAllTests();

// Или отдельные тесты
await HttpClientDemo.testGetRequest();
await HttpClientDemo.testPostRequest();
```

## Особенности реализации

1. **Только XHR**: Используется XMLHttpRequest вместо Fetch API
2. **Promise-based**: Все методы возвращают Promise
3. **Типизация**: Полная поддержка TypeScript с дженериками
4. **Обработка ошибок**: Детальная информация об ошибках
5. **Таймауты**: Настраиваемые таймауты для запросов
6. **Заголовки**: Гибкая настройка заголовков
7. **Query параметры**: Автоматическое построение URL с параметрами

## Соответствие требованиям sprint_2

- ✅ **Не использует Fetch/axios** - только Promise и XHR
- ✅ **Реализует GET, POST, PUT, DELETE** методы
- ✅ **Поддерживает query string** в GET запросах
- ✅ **Поддерживает body** для POST, PUT, DELETE
- ✅ **Типизирован** TypeScript
- ✅ **Интегрирован** в компонентную архитектуру

## Совместимость

- ✅ Все современные браузеры
- ✅ TypeScript 4.0+
- ✅ ES2020+
- ✅ Node.js (с полифилом для XHR)
