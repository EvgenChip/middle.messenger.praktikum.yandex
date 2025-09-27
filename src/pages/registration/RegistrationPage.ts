import Block from "../../services/Block";
import Handlebars from "handlebars";
import { registrationTemplate } from "./registrationTemplate";
import { formInputGroupTemplate } from "../../components/formInputGroup/formInputGroupTemplate";
import { formInputTemplate } from "../../components/formInput/fornInputTemplate";
import { buttonTemplate } from "../../components/Button/buttonTemplate";
import { iconTemplate } from "../../components/icon/iconTebplate";
import { Validator, ValidationResult } from "../../services/Validator";
import { chatAPI } from "../../services/api";

Handlebars.registerPartial("formInputGroup", formInputGroupTemplate);
Handlebars.registerPartial("formInput", formInputTemplate);
Handlebars.registerPartial("btn", buttonTemplate);
Handlebars.registerPartial("icon", iconTemplate);

interface RegistrationPageProps {
  title: string;
  subtitle: string;
}

export class RegistrationPage extends Block {
  constructor(props: RegistrationPageProps) {
    super("div", {
      ...props,
      events: {
        submit: (e: Event) => this.handleSubmit(e),
      },
    });
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    const formData = new FormData(target);
    const data = {
      first_name: String(formData.get("first_name") || ""),
      second_name: String(formData.get("second_name") || ""),
      login: String(formData.get("login") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      phone: String(formData.get("phone") || ""),
    };
    const validationResult: ValidationResult = Validator.validateForm(data);

    if (!validationResult.isValid) {
      this.displayValidationErrors(validationResult.fieldErrors);
      return;
    }
    try {
      await chatAPI.register(data);
      (window as any).router.navigate("/messenger");
    } catch {
      // Игнорируем ошибки
    }
  }

  private displayValidationErrors(fieldErrors: Record<string, string[]>) {
    // Очищаем предыдущие ошибки
    this.clearValidationErrors();

    Object.entries(fieldErrors).forEach(([fieldName, errors]) => {
      const field = this.element?.querySelector(
        `[name="${fieldName}"]`
      ) as HTMLElement;
      if (field) {
        const errorElement = document.createElement("div");
        errorElement.className = "validation-error";
        errorElement.textContent = errors[0]; // Показываем первую ошибку
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
    return this.compile(registrationTemplate, {
      ...this.props,
      currentYear: String(new Date().getFullYear()),
    });
  }
}
