export const formInputGroupTemplate = `<div class="input-group {{#if error}}input-group--error{{/if}}">
  <label class="input-group__label" for="{{id}}">
    {{label}}
    {{#if required}}<span class="input-group__required">*</span>{{/if}}
  </label>

 {{> formInput
    }}


</div>`;
