import ButtonTest from "../../partials/buttonTest";

export function render(query, block) {
  const root = document.querySelector(query);

  // Можно завязаться на реализации вашего класса Block
  root.appendChild(block.getContent());

  block.dispatchComponentDidMount();

  return root;
}

const but = new ButtonTest();

render("#app", but);
