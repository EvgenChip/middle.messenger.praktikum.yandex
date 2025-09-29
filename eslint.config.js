import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.js"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        localStorage: "readonly",
        // DOM Types
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLFormElement: "readonly",
        HTMLImageElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLSpanElement: "readonly",
        HTMLAnchorElement: "readonly",
        HTMLUListElement: "readonly",
        HTMLLIElement: "readonly",
        HTMLTemplateElement: "readonly",
        DocumentFragment: "readonly",
        Text: "readonly",
        Comment: "readonly",
        NodeList: "readonly",
        HTMLCollection: "readonly",
        NamedNodeMap: "readonly",
        Attr: "readonly",
        Location: "readonly",
        History: "readonly",
        PopStateEvent: "readonly",
        MouseEvent: "readonly",
        KeyboardEvent: "readonly",
        MessageEvent: "readonly",
        CloseEvent: "readonly",
        FormData: "readonly",
        File: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        XMLHttpRequest: "readonly",
        WebSocket: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        AbortController: "readonly",
        AbortSignal: "readonly",
        Node: "readonly",
        Element: "readonly",
        Event: "readonly",
        EventTarget: "readonly",
        // Test globals
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        // Node.js globals
        global: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        // Block class
        Block: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "warn", // Предупреждение вместо ошибки
      "no-empty": "warn",
      "no-useless-catch": "off",
      "no-unreachable": "warn",
      "no-async-promise-executor": "off",

      // TypeScript правила
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-inferrable-types": "off",

      indent: "off", // Отключаем жесткие правила отступов
      quotes: "off",
      semi: ["warn", "always"],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "no-console": "off", // Разрешаем console в тестах
    },
  },
];
