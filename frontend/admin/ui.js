export function renderList(el, html) {
  el.innerHTML = html || "No data";
}

export function show(el) {
  el.classList.remove("hidden");
}

export function hide(el) {
  el.classList.add("hidden");
}