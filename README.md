# Middle Messenger - Yandex Practicum

Современный мессенджер, разработанный в рамках курса Middle Frontend от Яндекс.Практикум.

## 🚀 Технологии

- **TypeScript** - строгая типизация
- **Vite** - быстрая сборка и разработка
- **Handlebars** - шаблонизация
- **SCSS** - стилизация
- **Jest** - тестирование
- **ESLint + Stylelint** - линтинг
- **Husky + lint-staged** - pre-commit хуки

## 📋 Требования

- Node.js >= 20.17.0
- npm >= 9.0.0

## 🛠 Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd middle.messenger.praktikum.yandex
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите проект в режиме разработки:
```bash
npm run dev
```

## 📜 Доступные команды

### Разработка
- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка проекта
- `npm run preview` - предварительный просмотр сборки
- `npm run start` - сборка и запуск

### Линтинг
- `npm run lint` - проверка TypeScript/JavaScript
- `npm run lint:fix` - автоматическое исправление
- `npm run lint:styles` - проверка SCSS
- `npm run lint:styles:fix` - автоматическое исправление SCSS
- `npm run lint:all` - проверка всего кода

### Тестирование
- `npm test` - запуск всех тестов
- `npm run test:watch` - тесты в режиме наблюдения
- `npm run test:coverage` - тесты с покрытием

### Pre-commit
- `npm run precommit` - запуск pre-commit проверок

## 🏗 Архитектура

Проект следует принципам:
- **MVC** - разделение логики, представления и данных
- **Component-based** - компонентный подход с Block
- **Event-driven** - событийная архитектура
- **TypeScript** - строгая типизация

## 📁 Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
├── pages/              # Страницы приложения
├── services/           # Бизнес-логика и утилиты
├── partials/           # Частичные шаблоны
└── js/                 # JavaScript утилиты
```

## 🧪 Тестирование

Проект покрыт unit-тестами для:
- **HttpClient** - HTTP клиент
- **Router** - роутинг
- **Block** - базовый компонент

Запуск тестов:
```bash
npm test
```

## 🔧 Pre-commit хуки

Настроены автоматические проверки перед коммитом:
- Линтинг TypeScript/JavaScript
- Линтинг SCSS
- Запуск тестов для измененных файлов

## 🚀 Деплой

Проект готов к деплою на Netlify:
- Автоматическая сборка
- SPA роутинг
- Оптимизация ресурсов

## 📝 Лицензия

Проект создан в рамках образовательной программы Яндекс.Практикум.
