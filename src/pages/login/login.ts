import "../../style.scss";
import "../../partials/styles/message.scss";
import "../../partials/styles/messageInput.scss";
// import { render } from '../../utils/render';
import Button from "../../components/Button/Button";
import FormInputGroup from "../../components/formInputGroup";
import MessageInput from "../../components/messageInput";
// import { render } from "../../main"
import Handlebars from "handlebars";
import Block from "../../services/Block";
import { render } from "../../services/render";
import { loginTemplate } from "./loginTemplate";
import { buttonTemplate } from "../../components/Button/buttonTemplate";
import { formInputGroupTemplate } from "../../components/FormInputGroup/formInputGroupTemplate";

// src/pages/Login/Login.ts

interface LoginPageProps {
  title: string;
  subtitle: string;
}
Handlebars.registerPartial("Button", buttonTemplate);
Handlebars.registerPartial("FormInputGroup", formInputGroupTemplate);
export class LoginPage extends Block {
  constructor(props: LoginPageProps) {
    super("div", {
      ...props,
      events: {
        submit: (e: Event) => this.handleSubmit(e),
      },
    });
  }

  componentDidMount() {
    // Инициализация дочерних компонентов
    this.children.loginInput = new FormInputGroup({
      id: "login",
      label: "ЛОГИН",
      type: "text",
      name: "login",
      required: true,
      placeholder: "> Введите ваш логин",
      icon: "user",
    });

    this.children.passwordInput = new FormInputGroup({
      id: "password",
      label: "ПАРОЛЬ",
      type: "password",
      name: "password",
      required: true,
      placeholder: "> ********",
      icon: "lock",
    });

    this.children.submitButton = new Button({
      text: "ВОЙТИ",
      type: "submit",
      pulse: true,
      icon: "login",
    });

    this.children.googleButton = new Button({
      text: "",
      type: "button",
      icon: "google",
      onClick: () => this.loginWithGoogle(),
    });

    this.children.githubButton = new Button({
      text: "",
      type: "button",
      icon: "github",
      onClick: () => this.loginWithGithub(),
    });

    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    const login = (this.children.loginInput as FormInputGroup).getValue();
    const password = (this.children.passwordInput as FormInputGroup).getValue();

    if (login && password) {
      console.log(`Login attempt with: ${login}`);
      window.location.href = "/chat";
    } else {
      console.log("Please fill all fields");
    }
  }

  loginWithGoogle() {
    console.log("Login with Google");
  }

  loginWithGithub() {
    console.log("Login with GitHub");
  }

  protected render() {
    // console.log(
    //   this.compile(loginTemplate, {
    //     ...this.props,
    //     ...this.children,
    //   })
    // )
    return this.compile(loginTemplate, {
      ...this.props,
      ...this.children,
    });
  }
}

const loginPage = new LoginPage({
  title: "NEON-CHAT v3.1.2",
  subtitle: "АВТОРИЗАЦИЯ В СИСТЕМЕ",
});

render("#login", loginPage);
