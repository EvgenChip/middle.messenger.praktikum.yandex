import Block from "../../services/Block";
import Handlebars from "handlebars";
import { profileTemplate } from "./profileTemplate";
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

interface UserData {
  avatar: string;
  email: string;
  login: string;
  firstName: string;
  lastName: string;
  displayName: string;
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
        submit: (e: Event) => this.handleProfileSubmit(e),
        click: (e: Event) => this.handleClick(e),
      },
    });
    this.user = props.user;
  }

  private handleProfileSubmit(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (target.id === 'profileForm') {
      this.handleProfileUpdate(target);
    } else if (target.id === 'passwordForm') {
      this.handlePasswordChange(target);
    }
  }

  private handleProfileUpdate(form: HTMLFormElement) {
    const formData = new FormData(form);
    const data = {
      email: String(formData.get('email') || ''),
      login: String(formData.get('login') || ''),
      first_name: String(formData.get('first_name') || ''),
      last_name: String(formData.get('last_name') || ''),
      display_name: String(formData.get('display_name') || ''),
      phone: String(formData.get('phone') || ''),
    };

    console.log("Profile update data:", data);

    // Валидация формы профиля
    const validationResult: ValidationResult = Validator.validateForm(data);

    if (!validationResult.isValid) {
      console.error("Profile validation errors:", validationResult.errors);
      this.displayValidationErrors(validationResult.fieldErrors);
      return;
    }

    console.log("Profile validation passed! Updating profile...");
    // Здесь будет обновление профиля на сервере
    alert('Профиль обновлен!');
  }

  private handlePasswordChange(form: HTMLFormElement) {
    const formData = new FormData(form);
    const data = {
      oldPassword: String(formData.get('oldPassword') || ''),
      newPassword: String(formData.get('newPassword') || ''),
      confirmNewPassword: String(formData.get('confirmNewPassword') || ''),
    };

    console.log("Password change data:", data);

    // Простая валидация паролей
    if (data.newPassword !== data.confirmNewPassword) {
      alert('Новые пароли не совпадают!');
      return;
    }

    if (data.newPassword.length < 8) {
      alert('Новый пароль должен содержать минимум 8 символов!');
      return;
    }

    console.log("Password validation passed! Changing password...");
    // Здесь будет смена пароля на сервере
    alert('Пароль изменен!');
    this.closePasswordModal();
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement;

    if (target.closest('[onClick="openPasswordModal()"]')) {
      this.openPasswordModal();
    } else if (target.closest('[onClick="closePasswordModal()"]')) {
      this.closePasswordModal();
    } else if (target.closest('[onClick="logout()"]')) {
      this.logout();
    } else if (target.closest('#avatarUpload')) {
      this.handleAvatarUpload(e);
    }
  }

  private openPasswordModal() {
    const modal = this.element?.querySelector('#passwordModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'block';
    }
  }

  private closePasswordModal() {
    const modal = this.element?.querySelector('#passwordModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }

  private logout() {
    console.log("Logging out...");
    // Здесь будет логика выхода
    window.location.href = "/home";
  }

  private handleAvatarUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      console.log("Avatar file selected:", file.name);
      // Здесь будет загрузка аватара на сервер
      alert('Аватар загружен!');
    }
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
    return this.compile(profileTemplate, {
      ...this.props,
      user: this.user,
      currentYear: String(new Date().getFullYear()),
    });
  }
}

