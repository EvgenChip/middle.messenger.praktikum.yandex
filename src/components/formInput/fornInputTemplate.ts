export const formInputTemplate = `<input
    class="input-group__input"
    type="{{type}}"
    id="{{id}}"
    name="{{name}}"
    placeholder="{{placeholder}}"
    {{#if value}}value="{{value}}"{{/if}}
    {{#if required}}required{{/if}}
  />`;
