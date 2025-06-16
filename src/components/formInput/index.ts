import { formInputTemplate } from "./fornInputTemplate";
import Block from "../../services/Block";

interface FormInputProps {
  type: string;
  id: string;
  name: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  onInput?: (event: Event) => void;
  onChange?: (event: Event) => void;
}

class FormInput extends Block {

  constructor(props: FormInputProps) {
     console.log('111111',props)
    super("input", {
      ...props,
      events: {
        input: props.onInput || (() => {}),
        change: props.onChange || (() => {}),
      },
    });
  }

  protected render() {
    return this.compile(formInputTemplate, this.props);
  }

  getValue(): string {
    return (this.element as HTMLInputElement).value;
  }

  setValue(value: string): void {
    (this.element as HTMLInputElement).value = value;
  }
}

export default FormInput;
