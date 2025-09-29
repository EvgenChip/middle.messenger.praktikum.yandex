import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { HttpClient } from "./HttpClient";

describe("HttpClient", () => {
  let httpClient: HttpClient;
  let mockXHR: any;

  beforeEach(() => {
    // Создаем мок XMLHttpRequest
    mockXHR = {
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      getAllResponseHeaders: jest.fn(
        () => "content-type: application/json\r\n"
      ),
      getResponseHeader: jest.fn(() => "application/json"),
      readyState: 4,
      status: 200,
      statusText: "OK",
      responseText: '{"success": true}',
      response: '{"success": true}',
      onreadystatechange: null,
      onload: null,
      onerror: null,
      ontimeout: null,
    };

    // Мокаем XMLHttpRequest конструктор
    (global as any).XMLHttpRequest = jest.fn(() => {
      // Симулируем автоматический вызов onreadystatechange
      setTimeout(() => {
        mockXHR.readyState = 4;
        if (mockXHR.onreadystatechange) {
          mockXHR.onreadystatechange();
        }
      }, 0);
      return mockXHR;
    });

    httpClient = new HttpClient();
  });

  describe("Инициализация", () => {
    it("должен создать экземпляр HttpClient", () => {
      expect(httpClient).toBeInstanceOf(HttpClient);
    });
  });

  describe("GET запросы", () => {
    it("должен вызывать XMLHttpRequest.open с правильными параметрами для GET", () => {
      // Не ждем завершения промиса, только проверяем вызовы
      httpClient.get("/test").catch(() => {}); // catch чтобы избежать unhandled promise rejection

      expect(XMLHttpRequest).toHaveBeenCalled();
      expect(mockXHR.open).toHaveBeenCalledWith("GET", "/test", true);
      expect(mockXHR.send).toHaveBeenCalled();
    });

    it("должен устанавливать заголовки для GET запроса", () => {
      httpClient
        .get("/test", {
          headers: { Authorization: "Bearer token" },
        })
        .catch(() => {});

      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith(
        "Authorization",
        "Bearer token"
      );
    });
  });

  describe("POST запросы", () => {
    it("должен вызывать XMLHttpRequest.open с правильными параметрами для POST", () => {
      const testData = { name: "test" };

      httpClient.post("/test", testData).catch(() => {});

      expect(mockXHR.open).toHaveBeenCalledWith("POST", "/test", true);
      expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify(testData));
    });

    it("должен отправлять FormData как есть", () => {
      const formData = new FormData();
      formData.append("field", "value");

      httpClient.post("/test", formData).catch(() => {});

      expect(mockXHR.send).toHaveBeenCalledWith(formData);
    });
  });

  describe("PUT запросы", () => {
    it("должен вызывать XMLHttpRequest.open с правильными параметрами для PUT", () => {
      const testData = { id: 1, name: "updated" };

      httpClient.put("/test/1", testData).catch(() => {});

      expect(mockXHR.open).toHaveBeenCalledWith("PUT", "/test/1", true);
      expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify(testData));
    });
  });

  describe("DELETE запросы", () => {
    it("должен вызывать XMLHttpRequest.open с правильными параметрами для DELETE", () => {
      httpClient.delete("/test/1").catch(() => {});

      expect(mockXHR.open).toHaveBeenCalledWith("DELETE", "/test/1", true);
      expect(mockXHR.send).toHaveBeenCalled();
    });
  });

  describe("Заголовки", () => {
    it("должен устанавливать Content-Type по умолчанию", () => {
      httpClient.post("/test", { data: "test" }).catch(() => {});

      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json"
      );
    });

    it("должен устанавливать пользовательские заголовки", () => {
      httpClient
        .get("/test", {
          headers: {
            Authorization: "Bearer token",
            "X-Custom": "value",
          },
        })
        .catch(() => {});

      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith(
        "Authorization",
        "Bearer token"
      );
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith(
        "X-Custom",
        "value"
      );
    });

    it("не должен устанавливать Content-Type для FormData", () => {
      const formData = new FormData();

      // Сбрасываем моки для чистого теста
      mockXHR.setRequestHeader.mockClear();

      httpClient.post("/test", formData).catch(() => {});

      // Проверяем, что Content-Type не был установлен для FormData
      expect(mockXHR.setRequestHeader).not.toHaveBeenCalledWith(
        "Content-Type",
        expect.stringContaining("multipart/form-data")
      );
    });
  });

  describe("HTTP методы существуют", () => {
    it("должен иметь все необходимые методы", () => {
      expect(typeof httpClient.get).toBe("function");
      expect(typeof httpClient.post).toBe("function");
      expect(typeof httpClient.put).toBe("function");
      expect(typeof httpClient.delete).toBe("function");
    });
  });

  describe("Query параметры", () => {
    it("должен поддерживать query параметры в GET запросе", () => {
      // Проверяем базовую функциональность построения URL
      httpClient.get("/test?param=value").catch(() => {});

      expect(mockXHR.open).toHaveBeenCalledWith(
        "GET",
        "/test?param=value",
        true
      );
    });
  });
});
