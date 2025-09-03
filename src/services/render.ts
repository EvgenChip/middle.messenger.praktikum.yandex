// utils/render.ts

import Block from "./Block";

// utils/render.ts
export function render(query: string, block: Block): HTMLElement {
  const root = document.querySelector(query);
  if (!root) throw new Error(`Root not found: ${query}`);

  // Убедимся, что блок полностью инициализирован
  block.dispatchComponentDidMount();

  // Даем время на рендеринг
  setTimeout(() => {
    const content = block.getContent();
    if (!content) {
      console.error('Block content:', block);
      throw new Error("Render failed: content is empty");
    }

    root.innerHTML = '';
    root.appendChild(content);
  }, 0);

  return root as HTMLElement;
}