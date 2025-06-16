export const formInputTemplate = `  <input
    class="input-group__input"
    type="{{type}}"
    id="{{id}}"
    name="{{name}}"
    placeholder="{{placeholder}}"
    {{#if required}}required{{/if}}
  >`