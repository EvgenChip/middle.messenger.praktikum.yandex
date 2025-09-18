import { httpClient } from './HttpClient';

// Тестирование HTTP класса
export class HttpClientDemo {
  static async testGetRequest() {


    try {
      const url = httpClient.buildUrl(
        "https://jsonplaceholder.typicode.com/posts",
        {
          userId: 1,
          _limit: 5,
        }
      );



      const response = await httpClient.get(url, {
        timeout: 5000,
        headers: {
          Accept: "application/json",
        },
      });

      console.log( {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
        firstItem: Array.isArray(response.data)
          ? response.data[0]
          : response.data,
      });

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async testPostRequest() {
    console.log("🧪 Тестируем POST запрос...");

    try {
      const postData = {
        title: "Test Post",
        body: "This is a test post from HttpClient",
        userId: 1,
      };

      const response = await httpClient.post(
        "https://jsonplaceholder.typicode.com/posts",
        postData,
        {
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async testPutRequest() {


    try {
      const updateData = {
        id: 1,
        title: "Updated Post",
        body: "This post has been updated",
        userId: 1,
      };

      const response = await httpClient.put(
        "https://jsonplaceholder.typicode.com/posts/1",
        updateData,
        {
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response;
    } catch (error) {
      console.error( error);
      throw error;
    }
  }

  static async testDeleteRequest() {
    try {
      const response = await httpClient.delete(
        "https://jsonplaceholder.typicode.com/posts/1",
        undefined,
        {
          timeout: 5000,
        }
      );

      console.log("✅ DELETE запрос успешен:", {
        status: response.status,
      });

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Демонстрация обработки ошибок
   */
  static async testErrorHandling() {
    console.log("🧪 Тестируем обработку ошибок...");

    try {
      // Запрос к несуществующему API
      await httpClient.get("https://nonexistent-api.example.com/data", {
        timeout: 3000,
      });
    } catch (error: any) {
      console.log({
        message: error.message,
        status: error.status,
      });
    }

    try {
      // Запрос с таймаутом
      await httpClient.get("https://httpbin.org/delay/5", {
        timeout: 1000,
      });
    } catch (error: any) {
      console.log("✅ Таймаут корректно обработан:", {
        message: error.message,
      });
    }
  }

  /**
   * Демонстрация работы с заголовками
   */
  static async testHeaders() {
    console.log("🧪 Тестируем работу с заголовками...");

    try {
      const response = await httpClient.get("https://httpbin.org/headers", {
        headers: {
          "X-Custom-Header": "TestValue",
          "User-Agent": "HttpClient-Demo/1.0",
        },
      });

      console.log("✅ Заголовки отправлены:", {
        status: response.status,
        receivedHeaders: response.data.headers,
      });

      return response;
    } catch (error) {
      console.error("❌ Тест заголовков не удался:", error);
      throw error;
    }
  }

  /**
   * Запуск всех тестов
   */
  static async runAllTests() {
    console.log("🚀 Запускаем тесты HTTP класса...\n");

    try {
      await this.testGetRequest();
      console.log("");

      await this.testPostRequest();
      console.log("");

      await this.testPutRequest();
      console.log("");

      await this.testDeleteRequest();
      console.log("");

      await this.testErrorHandling();
      console.log("");

      await this.testHeaders();
      console.log("");

      console.log("🎉 Все тесты HTTP класса пройдены успешно!");
    } catch (error) {
      console.error("💥 Ошибка при выполнении тестов:", error);
    }
  }
}

// Экспортируем для использования в других файлах
export default HttpClientDemo;
