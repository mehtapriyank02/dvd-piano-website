
function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}
