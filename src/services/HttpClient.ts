export interface HttpRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  credentials?: "include" | "same-origin" | "omit";
  mode?: "cors" | "no-cors" | "same-origin";
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpError {
  message: string;
  status?: number;
  statusText?: string;
}

export class HttpClient {
  private defaultTimeout = 10000; // 10 секунд по умолчанию

  /**
   * GET запрос с поддержкой query string
   */
  public async get<T = unknown>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("GET", url, undefined, config);
  }

  /**
   * POST запрос с body
   */
  public async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("POST", url, data, config);
  }

  /**
   * PUT запрос с body
   */
  public async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", url, data, config);
  }

  /**
   * DELETE запрос с body (опционально)
   */
  public async delete<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", url, data, config);
  }

  /**
   * Основной метод для выполнения HTTP запросов
   */
  private request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    // Логируем HTTP запрос
    "HTTP " + method + " " + url;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const timeout = config?.timeout || this.defaultTimeout;

      // Устанавливаем таймаут
      xhr.timeout = timeout;

      // Обработчики событий
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Успешный ответ
            let responseData: T;
            try {
              responseData = xhr.responseText
                ? JSON.parse(xhr.responseText)
                : null;
            } catch {
              responseData = xhr.responseText as T;
            }

            const response: HttpResponse<T> = {
              data: responseData,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: this.parseHeaders(xhr.getAllResponseHeaders()),
            };


            resolve(response);
          } else if (xhr.status === 400) {
            let responseData: T;
            try {
              responseData = xhr.responseText
                ? JSON.parse(xhr.responseText)
                : null;
            } catch {
              responseData = xhr.responseText as T;
            }

            const response: HttpResponse<T> = {
              data: responseData,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: this.parseHeaders(xhr.getAllResponseHeaders()),
            };

            resolve(response);
          } else {
            // Ошибка HTTP
            let errorMessage = `HTTP Error ${xhr.status}: ${xhr.statusText}`;

            try {
              const errorData = xhr.responseText
                ? JSON.parse(xhr.responseText)
                : null;

              if (errorData && errorData.reason) {
                errorMessage += ` - ${errorData.reason}`;
              }
            } catch {
              // Если не удалось распарсить JSON, используем текст ответа
              if (xhr.responseText) {
                errorMessage += ` - ${xhr.responseText}`;
              }
            }

            const error: HttpError = {
              message: errorMessage,
              status: xhr.status,
              statusText: xhr.statusText,
            };
            reject(error);
          }
        }
      };

      // Обработчик ошибок
      xhr.onerror = () => {
        const error: HttpError = {
          message: "Network Error: Failed to fetch",
        };
        reject(error);
      };

      // Обработчик таймаута
      xhr.ontimeout = () => {
        const error: HttpError = {
          message: `Request timeout after ${timeout}ms`,
        };
        reject(error);
      };

      // Открываем соединение
      xhr.open(method, url, true);

      xhr.withCredentials = true;

      // Устанавливаем заголовки
      if (config?.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      if (data && ["POST", "PUT", "DELETE"].includes(method)) {
        const hasContentType =
          config?.headers &&
          Object.keys(config.headers).some(
            (key) => key.toLowerCase() === "content-type"
          );

        if (!hasContentType) {
          if (data instanceof FormData) {
            // Для FormData не устанавливаем Content-Type
          } else if (typeof data === "object") {
            xhr.setRequestHeader("Content-Type", "application/json");
          } else {
            xhr.setRequestHeader("Content-Type", "text/plain");
          }
        }
      }

      if (data) {
        if (data instanceof FormData) {
          xhr.send(data);
        } else {
          const requestData =
            typeof data === "object" ? JSON.stringify(data) : String(data);
          xhr.send(requestData);
        }
      } else {
        xhr.send();
      }
    });
  }

  /**
   * Парсинг заголовков ответа
   */
  private parseHeaders(headersString: string): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!headersString) return headers;

    const headerPairs = headersString.split("\u000d\u000a");

    for (const pair of headerPairs) {
      const index = pair.indexOf("\u003a\u0020");
      if (index > 0) {
        const key = pair.substring(0, index);
        const value = pair.substring(index + 2);
        headers[key.toLowerCase()] = value;
      }
    }

    return headers;
  }

  /**
   * Создание URL с query параметрами
   */
  public buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const url = new URL(baseUrl, window.location.origin);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, String(item)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });

    return url.toString();
  }

  /**
   * Установка базового URL для всех запросов
   */
  public setBaseUrl(_baseUrl: string): void {}

  /**
   * Установка заголовка авторизации
   */
  public setAuthToken(_token: string): void {}
}

export const httpClient = new HttpClient();
