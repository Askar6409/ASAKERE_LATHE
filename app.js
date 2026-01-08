let products = JSON.parse(localStorage.getItem("products")) || [
  { name: "شستشو سرسیلندر", price: 3000000, qty: 1, checked: false },
  { name: "آب‌بندی سوپاپ", price: 7000000, qty: 1, checked: false }
];

let invoiceNumber = Number(localStorage.getItem("invoiceNumber")) || 1;
let history = JSON.parse(localStorage.getItem("history")) || [];

function render() {
  const box = document.getElementById("products");
  box.innerHTML = "";

  let total = 0;

  products.forEach((p, i) => {
    if (p.checked) total += p.price * p.qty;

    box.innerHTML += `
      <div class="product">
        <div class="drag">
          <span onclick="moveUp(${i})">≡</span>
          <span onclick="moveDown(${i})">≡</span>
        </div>

        <input type="checkbox" ${p.checked ? "checked" : ""}
          onchange="toggle(${i})">

        <div class="info">
          <div>${i + 1}- ${p.name}</div>

          <div class="qty ${p.checked ? "" : "disabled"}">
            <button onclick="qty(${i},-1)" ${!p.checked ? "disabled" : ""}>−</button>
            <span>${p.qty}</span>
            <button onclick="qty(${i},1)" ${!p.checked ? "disabled" : ""}>+</button>
          </div>
        </div>

        <div class="price">
          ${(p.price * p.qty).toLocaleString()}
        </div>
      </div>
    `;
  });

  document.getElementById("total").innerText = total.toLocaleString();
  localStorage.setItem("products", JSON.stringify(products));
}

function toggle(i) {
  products[i].checked = !products[i].checked;
  render();
}

function qty(i, n) {
  products[i].qty = Math.max(1, products[i].qty + n);
  render();
}

function moveUp(i) {
  if (i === 0) return;
  [products[i], products[i - 1]] = [products[i - 1], products[i]];
  render();
}

function moveDown(i) {
  if (i === products.length - 1) return;
  [products[i], products[i + 1]] = [products[i + 1], products[i]];
  render();
}

function issueInvoice() {
  const items = products.filter(p => p.checked);
  if (!items.length) return alert("هیچ خدمتی انتخاب نشده");

  history.unshift({
    number: invoiceNumber,
    date: new Date().toLocaleDateString("fa-IR"),
    total: items.reduce((s, p) => s + p.price * p.qty, 0)
  });

  invoiceNumber++;
  localStorage.setItem("invoiceNumber", invoiceNumber);
  localStorage.setItem("history", JSON.stringify(history));

  // 🔁 ریست کامل
  products.forEach(p => {
    p.checked = false;
    p.qty = 1;
  });

  renderHistory();
  render();
}

function renderHistory() {
  const h = document.getElementById("history");
  h.innerHTML = "";
  history.forEach(i => {
    h.innerHTML += `
      <div class="history-item">
        فاکتور #${i.number} | ${i.date} | ${i.total.toLocaleString()} ریال
      </div>
    `;
  });
}

render();
renderHistory();
