import Block from "../services/Block";
import Handlebars from "handlebars";

const tpl = `
<button
  class="btn {{#if pulse}}btn--pulse{{/if}} {{class}}"
  type="{{type}}"
  {{#if disabled}}disabled{{/if}}
  {{#if id}}id="{{id}}"{{/if}}
>
  {{text}}
  {{#if icon}}
    <span class="btn__icon">{{{icon}}}</span>
  {{/if}}
</button>
`;
export default class ButtonTest extends Block {
  render() {
    return this.compile(tpl);
  }
}
