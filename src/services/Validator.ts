export interface ValidationRule {
  name: string;
  pattern: RegExp;
  message: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  custom?: (value: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string[]>;
}

export class Validator {
  private static readonly VALIDATION_RULES: Record<string, ValidationRule> = {
    first_name: {
      name: 'Имя',
      pattern: /^[А-ЯЁ][а-яё]*$|^[A-Z][a-z]*$/,
      message: 'Имя должно начинаться с заглавной буквы, содержать только буквы (латиница или кириллица)',
      required: true
    },
    second_name: {
      name: 'Фамилия',
      pattern: /^[А-ЯЁ][а-яё]*$|^[A-Z][a-z]*$/,
      message: 'Фамилия должна начинаться с заглавной буквы, содержать только буквы (латиница или кириллица)',
      required: true
    },
    login: {
      name: 'Логин',
      pattern: /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/,
      message: 'Логин должен содержать от 3 до 20 символов, начинаться с буквы, может содержать цифры, дефис и подчеркивание',
      required: true,
      minLength: 3,
      maxLength: 20,
      custom: (value: string) => !/^\d+$/.test(value) // Не должен состоять только из цифр
    },
    email: {
      name: 'Email',
      pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Email должен содержать @ и точку, перед точкой должны быть буквы',
      required: true,
      custom: (value: string) => {
        const parts = value.split('@');
        if (parts.length !== 2) return false;
        const domainParts = parts[1].split('.');
        if (domainParts.length < 2) return false;
        return /^[a-zA-Z]+$/.test(domainParts[domainParts.length - 2]); // Перед точкой должны быть буквы
      }
    },
    password: {
      name: 'Пароль',
      pattern: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
      message: 'Пароль должен содержать от 8 до 40 символов, включая заглавную букву и цифру',
      required: true,
      minLength: 8,
      maxLength: 40
    },
    phone: {
      name: 'Телефон',
      pattern: /^\+?[\d]{10,15}$/,
      message: 'Телефон должен содержать от 10 до 15 цифр, может начинаться с +',
      required: true,
      minLength: 10,
      maxLength: 15
    },
    message: {
      name: 'Сообщение',
      pattern: /^.+$/,
      message: 'Сообщение не должно быть пустым',
      required: true,
      maxLength: 1000
    }
  };

  /**
   * Валидация одного поля
   */
  static validateField(fieldName: string, value: string): string[] {
    const rule = this.VALIDATION_RULES[fieldName];
    if (!rule) {
      return [`Неизвестное поле: ${fieldName}`];
    }

    const errors: string[] = [];

    // Проверка на обязательность
    if (rule.required && (!value || value.trim().length === 0)) {
      errors.push(`${rule.name} обязательно для заполнения`);
      return errors;
    }

    // Если поле не обязательное и пустое - пропускаем
    if (!rule.required && (!value || value.trim().length === 0)) {
      return errors;
    }

    // Проверка длины
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(`${rule.name} должен содержать минимум ${rule.minLength} символов`);
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${rule.name} должен содержать максимум ${rule.maxLength} символов`);
    }

    // Проверка паттерна
    if (!rule.pattern.test(value)) {
      errors.push(rule.message);
    }

    // Кастомная валидация
    if (rule.custom && !rule.custom(value)) {
      errors.push(rule.message);
    }

    return errors;
  }

  /**
   * Валидация всей формы
   */
  static validateForm(formData: Record<string, string>): ValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string[]> = {};

    for (const [fieldName, value] of Object.entries(formData)) {
      const fieldErrorsList = this.validateField(fieldName, value);
      if (fieldErrorsList.length > 0) {
        fieldErrors[fieldName] = fieldErrorsList;
        errors.push(...fieldErrorsList);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  }

  /**
   * Валидация по blur событию
   */
  static validateOnBlur(fieldName: string, value: string): string[] {
    return this.validateField(fieldName, value);
  }

  /**
   * Получить правила валидации для поля
   */
  static getFieldRules(fieldName: string): ValidationRule | null {
    return this.VALIDATION_RULES[fieldName] || null;
  }

  /**
   * Проверить, является ли поле обязательным
   */
  static isFieldRequired(fieldName: string): boolean {
    const rule = this.VALIDATION_RULES[fieldName];
    return rule?.required || false;
  }
}
