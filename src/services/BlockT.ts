import EventBus from "./EventBus.ts";
import Handlebars from "handlebars";

// Нельзя создавать экземпляр данного класса
class BlockT {
  static EVENTS = {
    INIT: "init",
    FLOW_CDM: "flow:component-did-mount",
    FLOW_RENDER: "flow:render",
  };

  _element = null;
  _meta = null;

  /** JSDoc
   * @param {string} tagName
   * @param {Object} props
   *
   * @returns {void}
   */
  constructor(tagName = "div", props = {}) {
    console.log("tagname", tagName);
    const eventBus = new EventBus();
    const template = Handlebars;
    this._meta = {
      tagName,
      props,
    };
console.log('META',this._meta)
    this.props = this._makePropsProxy(props);

    this.eventBus = () => eventBus;

    this._registerEvents(eventBus);
    eventBus.emit(Block.EVENTS.INIT);
  }

  _registerEvents(eventBus) {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  _createResources() {
    const { tagName } = this._meta;
    this._element = this._createDocumentElement(tagName);
  }

  init() {
    this._createResources();
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }
   compile(template: string, context?: BlockProps) {
    console.log(template,context)
    if (typeof context === 'undefined') {
      context = this.props;
    }

    const contextAndStubs = { ...context };


    Object.keys(this?.children).forEach((key) => {
      if (this?.children[key] instanceof Block) {
        contextAndStubs[key] = `<div data-id="${this?.children[key]._id}"></div>`;
      }
    });

    Object.keys(this.lists).forEach((key) => {
      contextAndStubs[key] = `<div data-id="list__${key}"></div>`;
    });

    const fragment = document.createElement('template');
    fragment.innerHTML = Handlebars.compile(template)(contextAndStubs);

    Object.values(this.children).forEach((child) => {
      if (child instanceof Block) {
        const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);

        if (stub) {
          stub.replaceWith(child.getContent());
        }
      }
    });

    Object.entries(this.lists).forEach(([key, child]) => {
      const stub = fragment.content.querySelector(`[data-id="list__${key}"]`);

      if (!stub) return ;

      const listContent = document.createElement('template');

      if (Array.isArray(child)) {
        child.forEach((element: Block | boolean | string | HTMLElement) => {
          if (element instanceof Block) {
            listContent.content.append(element.getContent());
          } else {
            listContent.content.append(`${element}`);
          }
        });
      }

      stub.replaceWith(listContent.content);
    });

    return fragment.content;
  }

  _componentDidMount() {
    this.componentDidMount();
  }

  componentDidMount(oldProps) {}

  dispatchComponentDidMount() {
    this._eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  _componentDidUpdate(oldProps, newProps) {
    console.log("DidUpdate");
  }

  componentDidUpdate(oldProps, newProps) {
    return true;
  }

  setProps = (nextProps) => {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  };

  get element() {
    return this._element;
  }

  _render() {
    const block = this.render();
    // Это небезопасный метод для упрощения логики
    // Используйте шаблонизатор из npm или напишите свой безопасный
    // Нужно компилировать не в строку (или делать это правильно),
    // либо сразу превращать в DOM-элементы и возвращать из compile DOM-ноду
    this._element.innerHTML = block;
  }

  // Переопределяется пользователем. Необходимо вернуть разметку
  render() {
    console.log("123123");
  }

  getContent() {
    return this.element;
  }

  _makePropsProxy(props) {
    // Ещё один способ передачи this, но он больше не применяется с приходом ES6+
    const self = this;

    // Здесь вам предстоит реализовать метод
    return props;
  }

  _createDocumentElement(tagName) {
    console.log('tagName',tagName)
    // Можно сделать метод, который через фрагменты в цикле создаёт сразу несколько блоков
    return document.createElement(tagName);
  }

  show() {
    this.getContent().style.display = "block";
  }

  hide() {
    this.getContent().style.display = "none";
  }
}

export default BlockT;
