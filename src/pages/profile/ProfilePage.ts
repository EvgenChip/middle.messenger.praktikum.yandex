import Block from "../../services/Block";
import Handlebars from "handlebars";
import { profileTemplate } from "./profileTemplate";
import { formInputGroupTemplate } from "../../components/formInputGroup/formInputGroupTemplate";
import { formInputTemplate } from "../../components/formInput/fornInputTemplate";
import { buttonTemplate } from "../../components/Button/buttonTemplate";
import { iconTemplate } from "../../components/icon/iconTebplate";
import { Validator, ValidationResult } from "../../services/Validator";
import { chatAPI } from "../../services/api";

// Регистрируем частичные шаблоны
Handlebars.registerPartial("formInputGroup", formInputGroupTemplate);
Handlebars.registerPartial("formInput", formInputTemplate);
Handlebars.registerPartial("btn", buttonTemplate);
Handlebars.registerPartial("icon", iconTemplate);

interface UserData {
  id: string;
  avatar?: string;
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  display_name?: string;
  phone: string;
}

interface ProfilePageProps {
  title: string;
  user: UserData;
}

export class ProfilePage extends Block {
  private user: UserData;
  // private isPasswordModalOpen: boolean = false;

  constructor(props: ProfilePageProps) {
    super("div", {
      ...props,
      events: {
        submit: (e: Event) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "FORM") {
            this.handleProfileSubmit(e);
          }
        },
        click: (e: Event) => this.handleClick(e),
      },
    });
    this.user = props.user;
  }

  componentDidMount() {
    this.loadUserData();
  }
  private async loadUserData() {
    try {
      const userData = await chatAPI.getCurrentUser();

      this.user = userData;
      this.setProps({ user: userData });

      // Принудительно перерендериваем компонент
      this._render();
    } catch (error) {
      alert("Не удалось загрузить данные профиля");
    }
  }
  private handleProfileSubmit(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (target.id === "profileForm") {
      this.handleProfileUpdate(target);
    } else if (target.id === "passwordForm") {
      this.handlePasswordChange(target);
    }
  }

  private async handleProfileUpdate(form: HTMLFormElement) {
    const formData = new FormData(form);
    const data: Record<string, string> = {};

    const email = String(formData.get("email") || "").trim();
    const login = String(formData.get("login") || "").trim();
    const first_name = String(formData.get("first_name") || "").trim();
    const second_name = String(formData.get("second_name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const display_name = String(formData.get("display_name") || "").trim();

    // Сравниваем с текущими данными пользователя
    if (email && email !== this.user.email) data.email = email;
    if (login && login !== this.user.login) data.login = login;
    if (first_name && first_name !== this.user.first_name)
      data.first_name = first_name;
    if (second_name && second_name !== this.user.second_name)
      data.second_name = second_name;
    if (phone && phone !== this.user.phone) data.phone = phone;
    if (display_name && display_name !== (this.user.display_name || ""))
      data.display_name = display_name;

    // Отправляем все поля, так как API может требовать их
    data.email = email;
    data.login = login;
    data.first_name = first_name;
    data.second_name = second_name;
    data.phone = phone;
    data.display_name = display_name || "";

    if (Object.keys(data).length === 0) {
      return;
    }

    // Валидация формы профиля
    const validationResult: ValidationResult = Validator.validateForm(data);

    if (!validationResult.isValid) {
      this.displayValidationErrors(validationResult.fieldErrors);
      return;
    }

    try {
      await chatAPI.updateProfile(data);

      this.user = { ...this.user, ...data };
      this.setProps({ user: this.user });

      alert("Профиль обновлен!");
    } catch (error) {
      alert("Ошибка при обновлении профиля");
    }
  }

  private async handlePasswordChange(form: HTMLFormElement) {
    const formData = new FormData(form);

    const data = {
      oldPassword: String(formData.get("oldPassword") || ""),
      newPassword: String(formData.get("newPassword") || ""),
      confirmNewPassword: String(formData.get("confirmNewPassword") || ""),
    };

    // Простая валидация паролей
    if (data.newPassword !== data.confirmNewPassword) {
      alert("Новые пароли не совпадают!");
      return;
    }

    if (data.newPassword.length < 8) {
      alert("Новый пароль должен содержать минимум 8 символов!");
      return;
    }

    try {
      await chatAPI.changePassword(data.oldPassword, data.newPassword);

      alert("Пароль изменен!");
      this.closePasswordModal();
    } catch (error) {
      alert("Ошибка при смене пароля");
    }
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement;

    if (target.closest('[data-action="submitProfile"]')) {
      e.preventDefault();
      const form = document.getElementById("profileForm") as HTMLFormElement;
      if (form) {
        this.handleProfileUpdate(form);
      }
    } else if (target.closest('[data-action="openPasswordModal"]')) {
      this.openPasswordModal();
    } else if (target.closest('[data-action="closePasswordModal"]')) {
      this.closePasswordModal();
    } else if (target.closest('[data-action="logout"]')) {
      this.logout();
    } else if (target.closest("#avatarUpload")) {
      this.handleAvatarUpload(e);
    } else if (target.id === "passwordModal") {
      // Закрываем модальное окно при клике на фон

      this.closePasswordModal();
    }
  }

  private openPasswordModal() {
    const modal = this.element?.querySelector("#passwordModal") as HTMLElement;
    if (modal) {
      modal.classList.add("show");
      // Блокируем скролл страницы
      document.body.style.overflow = "hidden";
    }
  }

  private closePasswordModal() {
    const modal = this.element?.querySelector("#passwordModal") as HTMLElement;
    if (modal) {
      modal.classList.remove("show");
      // Восстанавливаем скролл страницы
      document.body.style.overflow = "auto";
    }
  }

  private async logout() {
    try {
      await chatAPI.logout();
      // any используется для доступа к глобальному роутеру
      (window as any).router.navigate("/");
    } catch (error) {
      // В случае ошибки все равно перенаправляем на логин
      // any используется для доступа к глобальному роутеру
      (window as any).router.navigate("/");
    }
  }

  private handleAvatarUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // Здесь будет загрузка аватара на сервер
      alert("Аватар загружен!");
    }
  }

  private displayValidationErrors(fieldErrors: Record<string, string[]>) {
    // Очищаем предыдущие ошибки
    this.clearValidationErrors();

    // Отображаем ошибки для каждого поля
    Object.entries(fieldErrors).forEach(([fieldName, errors]) => {
      const field = this.element?.querySelector(
        `[name="${fieldName}"]`
      ) as HTMLElement;
      if (field) {
        const errorElement = document.createElement("div");
        errorElement.className = "validation-error";
        errorElement.textContent = errors[0];
        errorElement.style.color = "#ff4444";
        errorElement.style.fontSize = "12px";
        errorElement.style.marginTop = "5px";

        field.parentElement?.appendChild(errorElement);
      }
    });
  }

  private clearValidationErrors() {
    const errorElements = this.element?.querySelectorAll(".validation-error");
    errorElements?.forEach((element) => element.remove());
  }

  protected render() {
    return this.compile(profileTemplate, {
      ...this.props,
      user: this.user,
      currentYear: String(new Date().getFullYear()),
    });
  }
}

