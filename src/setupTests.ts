// Настройка тестовой среды
// import 'jest-dom/extend-expect';

// Мокаем глобальные объекты браузера
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Object.defineProperty(window, 'location', {
//   value: {
//     href: 'http://localhost:3000',
//     pathname: '/',
//     search: '',
//     hash: '',
//     assign: jest.fn(),
//     replace: jest.fn(),
//     reload: jest.fn(),
//   },
//   writable: true,
// });

Object.defineProperty(window, 'history', {
  value: {
    pushState: jest.fn(),
    replaceState: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    go: jest.fn(),
    length: 1,
    state: null,
  },
  writable: true,
});

// Мокаем XMLHttpRequest
class MockXMLHttpRequest {
  open = jest.fn();
  send = jest.fn();
  setRequestHeader = jest.fn();
  getAllResponseHeaders = jest.fn(() => '');
  getResponseHeader = jest.fn();

  readyState = 0;
  status = 200;
  statusText = 'OK';
  responseText = '{}';
  response = '{}';

  onreadystatechange = null;
  onload = null;
  onerror = null;

  constructor() {
    // Симулируем асинхронное выполнение
    setTimeout(() => {
      this.readyState = 4;
      this.status = 200;
      if (this.onreadystatechange) {
        (this.onreadystatechange as any)();
      }
      if (this.onload) {
        (this.onload as any)();
      }
    }, 0);
  }
}

(global as any).XMLHttpRequest = MockXMLHttpRequest;

// Мокаем Handlebars
jest.mock('handlebars', () => ({
  compile: jest.fn(() => jest.fn(() => '<div>mocked template</div>')),
  registerPartial: jest.fn(),
  registerHelper: jest.fn(),
}));

// Мокаем EventBus
jest.mock('./services/EventBus', () => ({
  EventBus: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
  })),
}));
