import Block from "../../services/Block";
import Handlebars from "handlebars";
import { loginTemplate } from "./loginTemplate";
import { formInputGroupTemplate } from "../../components/formInputGroup/formInputGroupTemplate";
import { formInputTemplate } from "../../components/formInput/fornInputTemplate";
import { buttonTemplate } from "../../components/Button/buttonTemplate";
import { iconTemplate } from "../../components/icon/iconTebplate";
import { Validator, ValidationResult } from "../../services/Validator";

// Регистрируем частичные шаблоны
Handlebars.registerPartial("formInputGroup", formInputGroupTemplate);
Handlebars.registerPartial("formInput", formInputTemplate);
Handlebars.registerPartial("btn", buttonTemplate);
Handlebars.registerPartial("icon", iconTemplate);

interface LoginPageProps {
  title: string;
  subtitle: string;
}

export class LoginPage extends Block {
  constructor(props: LoginPageProps) {
    super("div", {
      ...props,
      events: {
        submit: (e: Event) => this.handleSubmit(e),
        click: (e: Event) => this.handleClick(e),
      },
    });
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (target.id === 'loginForm') {
      this.handleLogin(target);
    }
  }

  private handleLogin(form: HTMLFormElement) {
    const formData = new FormData(form);
    const data = {
      login: String(formData.get('login') || ''),
      password: String(formData.get('password') || ''),
    };

    console.log("Login attempt with:", data);

    // Валидация формы входа
    const validationResult: ValidationResult = Validator.validateForm(data);

    if (!validationResult.isValid) {
      console.error("Login validation errors:", validationResult.errors);
      this.displayValidationErrors(validationResult.fieldErrors);
      return;
    }

    console.log("Login validation passed! Attempting login...");
    // Здесь будет логика входа на сервер
    // Пока просто переходим в чат
    window.location.href = "/chat";
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement;

    if (target.closest('[onClick="loginWithGoogle()"]')) {
      this.loginWithGoogle();
    } else if (target.closest('[onClick="loginWithGithub()"]')) {
      this.loginWithGithub();
    }
  }

  private loginWithGoogle() {
    console.log("Login with Google");
    // Здесь будет интеграция с Google OAuth
    alert('Интеграция с Google в разработке');
  }

  private loginWithGithub() {
    console.log("Login with GitHub");
    // Здесь будет интеграция с GitHub OAuth
    alert('Интеграция с GitHub в разработке');
  }

  private displayValidationErrors(fieldErrors: Record<string, string[]>) {
    // Очищаем предыдущие ошибки
    this.clearValidationErrors();

    // Отображаем ошибки для каждого поля
    Object.entries(fieldErrors).forEach(([fieldName, errors]) => {
      const field = this.element?.querySelector(`[name="${fieldName}"]`) as HTMLElement;
      if (field) {
        const errorElement = document.createElement('div');
        errorElement.className = 'validation-error';
        errorElement.textContent = errors[0];
        errorElement.style.color = '#ff4444';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';

        field.parentElement?.appendChild(errorElement);
      }
    });
  }

  private clearValidationErrors() {
    const errorElements = this.element?.querySelectorAll('.validation-error');
    errorElements?.forEach(element => element.remove());
  }

  protected render() {
    return this.compile(loginTemplate, {
      ...this.props,
      currentYear: String(new Date().getFullYear()),
    });
  }
}

