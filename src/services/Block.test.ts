import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import Block from './Block';

// Мокаем EventBus
jest.mock('./EventBus', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
  }));
});

// Мокаем uuid с разными значениями
let uuidCounter = 0;
jest.mock('uuid', () => ({
  v4: jest.fn(() => `test-uuid-${++uuidCounter}`),
}));

// Мокаем Handlebars
jest.mock('handlebars', () => ({
  registerHelper: jest.fn(),
  compile: jest.fn(() => jest.fn(() => '<div>test content</div>')),
}));

// Создаем тестовый класс, наследующий от Block
class TestBlock extends Block {
  public render(): Node {
    return this.compile('<div>{{content}}</div>');
  }
}

class TestBlockWithChildren extends Block {
  public render(): Node {
    return this.compile('<div>{{{child1}}} {{{child2}}}</div>');
  }
}

describe('Block', () => {
  let block: TestBlock;
  let mockEventBus: any;

  beforeEach(() => {
    // Создаем мок EventBus
    mockEventBus = {
      on: jest.fn(),
      emit: jest.fn(),
    };

    // Мокаем конструктор EventBus
    const EventBus = require('./EventBus');
    EventBus.mockImplementation(() => mockEventBus);

    block = new TestBlock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Инициализация', () => {
    it('должен создать экземпляр Block', () => {
      expect(block).toBeInstanceOf(Block);
    });

    it('должен инициализировать EventBus', () => {
      expect(block.eventBus).toBeDefined();
      expect(block.eventBus.on).toBeDefined();
      expect(block.eventBus.emit).toBeDefined();
    });

    it('должен зарегистрировать события при инициализации', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith('init', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('flow:component-did-mount', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('flow:component-did-update', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('flow:render', expect.any(Function));
    });

    it('должен эмитировать событие INIT при создании', () => {
      expect(mockEventBus.emit).toHaveBeenCalledWith('init');
    });
  });

  describe('Свойства и методы', () => {
    it('должен иметь правильные EVENTS константы', () => {
      expect(Block.EVENTS.INIT).toBe('init');
      expect(Block.EVENTS.FLOW_CDM).toBe('flow:component-did-mount');
      expect(Block.EVENTS.FLOW_RENDER).toBe('flow:render');
      expect(Block.EVENTS.EVENT_FLOW_CDU).toBe('flow:component-did-update');
    });

    it('должен иметь уникальный _id', () => {
      const block1 = new TestBlock();
      const block2 = new TestBlock();

      expect(block1._id).toBeDefined();
      expect(block2._id).toBeDefined();
      expect(block1._id).not.toBe(block2._id);
    });

    it('должен создавать элемент по умолчанию', () => {
      // Инициализируем блок для создания элемента
      block.init();

      expect(block.element).toBeDefined();
      expect(block.element.tagName).toBe('DIV');
    });

    it('должен создавать элемент с кастомным тегом', () => {
      const customBlock = new TestBlock('span');
      customBlock.init();

      expect(customBlock.element.tagName).toBe('SPAN');
    });
  });

  describe('Работа с детьми', () => {
    it('должен правильно разделять children, props и lists', () => {
      const childBlock = new TestBlock();
      const props = {
        text: 'test',
        number: 123,
        child: childBlock,
        list: [childBlock, childBlock],
        boolean: true,
      };

      const result = block.getChildren(props);

      expect(result.children.child).toBe(childBlock);
      expect(result.props.text).toBe('test');
      expect(result.props.number).toBe(123);
      expect(result.props.boolean).toBe(true);
      expect(result.lists.list).toEqual([childBlock, childBlock]);
    });

    it('должен обрабатывать пустые props', () => {
      const result = block.getChildren();

      expect(result.children).toEqual({});
      expect(result.props).toEqual({});
      expect(result.lists).toEqual({});
    });
  });

  describe('Рендеринг', () => {
    it('должен компилировать шаблон', () => {
      const template = '<div>{{content}}</div>';
      const context = { content: 'test' };

      const result = block.compile(template, context);

      expect(result).toBeDefined();
    });

    it('должен использовать props по умолчанию если context не передан', () => {
      block.props.content = 'default content';

      const result = block.compile('<div>{{content}}</div>');

      expect(result).toBeDefined();
    });

    it('должен обрабатывать children в шаблоне', () => {
      const childBlock = new TestBlock();
      const blockWithChildren = new TestBlockWithChildren();
      blockWithChildren.children.child1 = childBlock;

      const result = blockWithChildren.compile('<div>{{{child1}}}</div>');

      expect(result).toBeDefined();
    });
  });

  describe('Жизненный цикл', () => {
    it('должен вызывать componentDidUpdate', () => {
      const componentDidUpdateSpy = jest.spyOn(block, 'componentDidUpdate');
      const oldProps = { test: 'old' };
      const newProps = { test: 'new' };

      const result = block.componentDidUpdate(oldProps, newProps);

      expect(componentDidUpdateSpy).toHaveBeenCalledWith(oldProps, newProps);
      expect(result).toBe(true);
    });
  });

  describe('Обновление props', () => {
    it('должен обновлять props', () => {
      const newProps = { content: 'new content' };

      block.setProps(newProps);

      expect(block.props.content).toBe('new content');
    });

    it('должен обновлять children', () => {
      const childBlock = new TestBlock();
      const newProps = { child: childBlock };

      block.setProps(newProps);

      expect(block.children.child).toBe(childBlock);
    });

    it('должен обновлять lists', () => {
      const childBlock = new TestBlock();
      const newProps = { list: [childBlock] };

      block.setProps(newProps);

      expect(block.lists.list).toEqual([childBlock]);
    });

    it('должен игнорировать пустые props', () => {
      const originalProps = { ...block.props };

      block.setProps();

      expect(block.props).toEqual(originalProps);
    });
  });

  describe('Видимость', () => {
    it('должен показывать элемент', () => {
      // Инициализируем блок для создания элемента
      block.init();

      block.show();

      expect(block.element.style.display).toBe('block');
    });

    it('должен скрывать элемент', () => {
      // Инициализируем блок для создания элемента
      block.init();

      block.hide();

      expect(block.element.style.display).toBe('none');
    });
  });

  describe('Атрибуты и события', () => {
    it('должен добавлять атрибуты', () => {
      // Инициализируем блок для создания элемента
      block.init();

      block.props.attrs = { id: 'test-id', class: 'test-class' };

      block.addAttrs();

      expect(block.element.getAttribute('id')).toBe('test-id');
      expect(block.element.getAttribute('class')).toBe('test-class');
    });

    it('должен добавлять события', () => {
      // Инициализируем блок для создания элемента
      block.init();

      const mockHandler = jest.fn();
      block.props.events = { click: mockHandler };

      block.addEvents();

      const clickEvent = new MouseEvent('click');
      block.element.dispatchEvent(clickEvent);

      expect(mockHandler).toHaveBeenCalledWith(clickEvent);
    });

    it('должен удалять события', () => {
      // Инициализируем блок для создания элемента
      block.init();

      const mockHandler = jest.fn();
      block.props.events = { click: mockHandler };

      block.addEvents();
      block.removeEvents();

      const clickEvent = new MouseEvent('click');
      block.element.dispatchEvent(clickEvent);

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('Proxy для props', () => {
    it('должен создавать proxy для props', () => {
      const originalProps = { test: 'value' };
      const proxy = block._makePropsProxy(originalProps);

      expect(proxy.test).toBe('value');
    });

    it('должен привязывать функции к контексту', () => {
      const originalProps = {
        test: 'value',
        method: function() { return this.test; }
      };
      const proxy = block._makePropsProxy(originalProps);

      expect(proxy.method()).toBe('value');
    });

    it('должен эмитировать событие при изменении props', () => {
      const originalProps = { test: 'value' };
      const proxy = block._makePropsProxy(originalProps);

      proxy.test = 'new value';

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'flow:component-did-update',
        { test: 'value' },
        { test: 'new value' }
      );
    });
  });

  describe('getContent', () => {
    it('должен возвращать элемент', () => {
      // Инициализируем блок для создания элемента
      block.init();

      const content = block.getContent();

      expect(content).toBe(block.element);
    });
  });

  describe('Создание элемента', () => {
    it('должен создавать элемент с правильным тегом', () => {
      const element = block._createDocumentElement('span');

      expect(element.tagName).toBe('SPAN');
    });
  });

  describe('Дополнительные тесты', () => {
    it('должен обрабатывать сложные структуры данных', () => {
      const child1 = new TestBlock();
      const child2 = new TestBlock();
      const complexProps = {
        text: 'test',
        number: 123,
        boolean: true,
        child: child1,
        children: [child1, child2],
        nested: {
          value: 'nested'
        }
      };

      const result = block.getChildren(complexProps);

      expect(result.children.child).toBe(child1);
      expect(result.lists.children).toEqual([child1, child2]);
      expect(result.props.text).toBe('test');
      expect(result.props.nested).toEqual({ value: 'nested' });
    });

    it('должен правильно обрабатывать массивы с не-Block элементами', () => {
      const child = new TestBlock();
      const mixedArray = [child, 'string', 123, true];

      const result = block.getChildren({ list: mixedArray });

      expect(result.lists.list).toEqual([child]);
    });

    it('должен правильно инициализироваться с props', () => {
      const props = { content: 'test content' };
      const blockWithProps = new TestBlock('div', props);

      expect(blockWithProps.props.content).toBe('test content');
    });

    it('должен правильно обрабатывать пустые массивы', () => {
      const result = block.getChildren({ emptyList: [] });

      expect(result.lists.emptyList).toEqual([]);
    });
  });
});
