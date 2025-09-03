import ButtonTest from "../partials/buttonTest";

export function render(query, block) {
  const root = document.querySelector(query);

  root.appendChild(block.getContent());

  block.dispatchComponentDidMount();

  return root;
}

const but = new ButtonTest();

return render(".app", but);
console.log(render(".app", but));
