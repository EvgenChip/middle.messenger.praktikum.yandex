import "./style.scss";
import "./partials/styles/btn.scss";
import "./partials/styles/formInputGroup.scss";
import "./partials/styles/formUser.scss";
import "./partials/styles/linkCard.scss";
// import "./pages/profile/style.scss";
// import "./pages/registration/registration.scss";
import "./partials/styles/chatItem.scss";
import "./partials/styles/conversationHeader.scss";
import "./partials/styles/message.scss";
import "./partials/styles/messageInput.scss";
import ButtonTest from "./partials/buttonTest";
import Button from "./components/Button/Button";
import FormInput from "./components/formInput";
import FormInputGroup from "./components/formInputGroup";
import LinkCard from "./components/linkCard";
import ChatItem from "./components/chatItem";
import ConversationHeader from "./components/conversationHeader";
import MessageInput from "./components/messageInput";
import Message from "./components/message";
import { LoginPage } from "./pages/login/login";
import { render } from "./services/render";

// export function render(query, block) {
//   const root = document.querySelector(query);
//   console.log(block.content);
//   // Можно завязаться на реализации вашего класса Block
//   root.appendChild(block.getContent());

//   block.dispatchComponentDidMount();

//   return root;
// }

// const loginButton = new Button({
//   text: "Войти",
//   class: "login-button",
//   pulse: true,
//   onClick: (event) => {
//     event.preventDefault();
//     console.log("Кнопка 'Войти' была нажата");
//     // Дополнительная логика при нажатии
//   },
// });

// const formInput = new FormInput({
//   id: "login",
//   type: "text",
//   name: "login",
//   required: true,
//   placeholder: "> Введите ваш логин",
// });

// const emailInput = new FormInputGroup({
//   label: "Email",
//   id: "email",
//   name: "email",
//   type: "email",
//   placeholder: "Введите ваш email",
//   required: true,
//   error: false,
//   value: "test@example.com", // начальное значение
//   onInput: (event) => {
//     console.log("Текущее значение:", (event.target as HTMLInputElement).value);
//   },
// });
// const linkCard = new LinkCard({
//   url: "/profile",
//   accent: "primary",
//   icon: "logout",
//   title: "Мой профиль",
//   description: "Настройки и личные данные",
//   onClick: (event) => {
//     event.preventDefault();
//     console.log("Переход в профиль");
//     // Навигация
//   },
// });

// const chatItem = new ChatItem({
//   id: "chat_123",
//   name: "Анна Петрова",
//   avatar: "/avatars/anna.jpg",
//   preview: "Привет! Когда встретимся?",
//   time: "15:30",
//   active: true,
//   onClick: (event) => {
//     event.preventDefault();
//     console.log("Выбран чат с Анной");
//   },
//   onDelete: (chatId) => {
//     console.log(`Удаляем чат ${chatId}`);
//     // API вызов для удаления чата
//   },
// });

// const header = new ConversationHeader({
//   name: "Алексей Смирнов",
//   avatar: "/avatars/alexey.jpg",
//   status: "online",
//   onSettingsClick: () => {
//     console.log("Открыть настройки чата");
//     // Показать модальное окно с настройками
//   },
// });
// const messageInput = new MessageInput({
//   onSend: (message) => {
//     console.log("Отправка сообщения:", message);
//     // Отправка сообщения на сервер
//   },
//   onInput: (event) => {
//     console.log("Ввод сообщения:", (event.target as HTMLInputElement).value);
//   },
// });

// const incomingMessage = new Message({
//   type: "incoming",
//   content: "Привет! Как твои дела?",
//   time: "12:30",
// });

// const outgoingMessage = new Message({
//   type: "outgoing",
//   content: "Привет! Все отлично, спасибо!",
//   time: "12:32",
// });

// render("#app", loginButton);
// render("#app", emailInput);
// render("#app", messageInput);
// render("#app", incomingMessage);
// render("#app", outgoingMessage);
// document.addEventListener("DOMContentLoaded", () => {
//   render("#app", messageInput);
// });
// render("#login", messageInput);
// Пример обновления значения программно
// setTimeout(() => {
//   emailInput.setValue("new@example.com");
// }, 2000);

// import "./partials/icon.scss";
// document.addEventListener('DOMContentLoaded', () => {
//   const loginPage = new LoginPage({
//     title: "NEON-CHAT v3.1.2",
//     subtitle: "АВТОРИЗАЦИЯ В СИСТЕМЕ"
//   });

//   render('#app', loginPage);
// });