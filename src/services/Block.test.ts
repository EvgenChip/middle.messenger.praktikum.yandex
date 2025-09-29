import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import Block from "./Block";

// Мокаем EventBus
const mockEventBus = {
  on: jest.fn(),
  emit: jest.fn(),
};

jest.mock("./EventBus", () => {
  return jest.fn(() => mockEventBus);
});

// Создаем тестовый класс, который наследует Block
class TestBlock extends Block {
  constructor(tagName = "div", propsAndChild?: any) {
    super(tagName, propsAndChild);
    // Переопределяем eventBus для использования мока
    (this as any).eventBus = mockEventBus;
    // Вызываем init вручную, чтобы элемент был создан
    this.init();
  }

  render(): Node {
    const fragment = document.createElement("template");
    fragment.innerHTML = "<div>Test Content</div>";
    return fragment.content;
  }

  componentDidMount(_oldProps?: any): void {
    // Пустая реализация для теста
  }

  componentDidUpdate(_oldProps?: any, _newProps?: any): boolean {
    return true;
  }
}

describe("Block", () => {
  let block: TestBlock;

  beforeEach(() => {
    jest.clearAllMocks();
    block = new TestBlock();
  });

  describe("Инициализация", () => {
    it("должен создать экземпляр Block", () => {
      expect(block).toBeInstanceOf(Block);
    });

    it("должен иметь правильные EVENTS константы", () => {
      expect(Block.EVENTS).toEqual({
        INIT: "init",
        FLOW_CDM: "flow:component-did-mount",
        FLOW_RENDER: "flow:render",
        EVENT_FLOW_CDU: "flow:component-did-update",
      });
    });

    it("должен создавать элемент по умолчанию", () => {
      expect(block.element).toBeDefined();
      expect(block.element.tagName).toBe("DIV");
    });

    it("должен создавать элемент с кастомным тегом", () => {
      const customBlock = new TestBlock("span");
      expect(customBlock.element.tagName).toBe("SPAN");
    });
  });

  describe("Свойства и методы", () => {
    it("должен иметь уникальный _id", () => {
      const block1 = new TestBlock();
      const block2 = new TestBlock();
      expect((block1 as any)._id).toBeDefined();
      expect((block2 as any)._id).toBeDefined();
      expect((block1 as any)._id).not.toBe((block2 as any)._id);
    });

    it("должен правильно разделять children, props и lists", () => {
      const { children, props, lists } = block.getChildren({
        text: "Hello",
        child: new TestBlock("span"),
        list: [new TestBlock("li")],
      });

      expect(props).toEqual({ text: "Hello" });
      expect(children.child).toBeInstanceOf(TestBlock);
      expect(lists.list[0]).toBeInstanceOf(TestBlock);
    });

    it("должен обрабатывать пустые props", () => {
      const { children, props, lists } = block.getChildren({});
      expect(children).toEqual({});
      expect(props).toEqual({});
      expect(lists).toEqual({});
    });
  });

  describe("Рендеринг", () => {
    it("должен компилировать шаблон", () => {
      const content = block.render();
      expect(content.textContent).toContain("Test Content");
    });
  });

  describe("Жизненный цикл", () => {
    it("должен вызывать componentDidUpdate", () => {
      const componentDidUpdateSpy = jest.spyOn(block, "componentDidUpdate");
      const oldProps = { test: "old" };
      const newProps = { test: "new" };

      const result = block.componentDidUpdate(oldProps, newProps);

      expect(componentDidUpdateSpy).toHaveBeenCalledWith(oldProps, newProps);
      expect(result).toBe(true);
    });
  });

  describe("Обновление props", () => {
    it("должен обновлять props", () => {
      block.setProps({ newProp: "newValue" });
      expect((block as any).props.newProp).toBe("newValue");
    });

    it("должен обновлять children", () => {
      const newChild = new TestBlock("p");
      block.setProps({ newChild: newChild });
      expect((block as any).children.newChild).toBe(newChild);
    });

    it("должен обновлять lists", () => {
      const newList = [new TestBlock("li")];
      block.setProps({ newList: newList });
      expect((block as any).lists.newList).toStrictEqual(newList);
    });

    it("должен игнорировать пустые props", () => {
      const initialProps = { ...(block as any).props };
      block.setProps(undefined);
      expect((block as any).props).toEqual(initialProps);
    });
  });

  describe("Видимость", () => {
    it("должен показывать элемент", () => {
      block.show();
      expect(block.element.style.display).toBe("block");
    });

    it("должен скрывать элемент", () => {
      block.hide();
      expect(block.element.style.display).toBe("none");
    });
  });

  describe("Атрибуты и события", () => {
    it("должен добавлять атрибуты", () => {
      const setAttributeSpy = jest.spyOn(block.element, "setAttribute");
      block.setProps({ attrs: { "data-test": "value" } });
      block.addAttrs();
      expect(setAttributeSpy).toHaveBeenCalledWith("data-test", "value");
    });

    it("должен добавлять события", () => {
      const addEventListenerSpy = jest.spyOn(block.element, "addEventListener");
      const mockHandler = jest.fn();
      block.setProps({ events: { click: mockHandler } });
      block.addEvents();
      expect(addEventListenerSpy).toHaveBeenCalledWith("click", mockHandler);
    });

    it("должен удалять события", () => {
      const removeEventListenerSpy = jest.spyOn(
        block.element,
        "removeEventListener"
      );
      const mockHandler = jest.fn();
      block.setProps({ events: { click: mockHandler } });
      block.addEvents(); // Добавляем событие, чтобы потом удалить
      block.removeEvents();
      expect(removeEventListenerSpy).toHaveBeenCalledWith("click", mockHandler);
    });
  });

  describe("getContent", () => {
    it("должен возвращать элемент", () => {
      expect(block.getContent()).toBe(block.element);
    });
  });

  describe("Создание элемента", () => {
    it("должен создавать элемент с правильным тегом", () => {
      const element = (block as any)._createDocumentElement("p");
      expect(element.tagName).toBe("P");
    });
  });

  describe("Дополнительные тесты", () => {
    it("должен обрабатывать сложные структуры данных", () => {
      block.setProps({
        data: {
          nested: {
            value: 123,
          },
        },
      });
      expect((block as any).props.data.nested.value).toBe(123);
    });

    it("должен правильно инициализироваться с props", () => {
      const testBlock = new TestBlock("div", { text: "Hello" });
      expect((testBlock as any).props.text).toBe("Hello");
    });

    it("должен правильно обрабатывать пустые массивы", () => {
      const emptyListBlock = new TestBlock("div", { emptyList: [] });
      const content = emptyListBlock.render();
      expect(content.textContent).not.toContain("list__emptyList");
    });
  });
});
