const STORAGE_KEY = "askar_invoice_data";
const HISTORY_KEY = "invoice_history";

const customerNameEl = document.getElementById("customerName");
const customerPhoneEl = document.getElementById("customerPhone");
const servicesListEl = document.getElementById("services-list");
const totalPriceEl = document.getElementById("totalPrice");
const historyListEl = document.getElementById("history-list");
const dateTextEl = document.getElementById("dateText");
const timeTextEl = document.getElementById("timeText");

const newServiceNameEl = document.getElementById("newServiceName");
const newServicePriceEl = document.getElementById("newServicePrice");

const saveBtn = document.getElementById("saveBtn");
const smsBtn = document.getElementById("smsBtn");
const resetBtn = document.getElementById("resetBtn");
const addServiceBtn = document.getElementById("addServiceBtn");

let state = loadState();
let history = loadHistory();

function defaultServices() {
  return [
    { id: crypto.randomUUID(), name: "شستشو سرسیلندر", price: 250000, selected: false },
    { id: crypto.randomUUID(), name: "آبندی", price: 300000, selected: false },
    { id: crypto.randomUUID(), name: "کف‌تراشی", price: 450000, selected: false },
    { id: crypto.randomUUID(), name: "رگلاژ", price: 150000, selected: false },
  ];
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      customerName: "",
      customerPhone: "",
      services: defaultServices(),
    };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      customerName: parsed.customerName || "",
      customerPhone: parsed.customerPhone || "",
      services: Array.isArray(parsed.services) && parsed.services.length ? parsed.services : defaultServices(),
    };
  } catch {
    return {
      customerName: "",
      customerPhone: "",
      services: defaultServices(),
    };
  }
}

function loadHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString("fa-IR");
}

function updateClock() {
  const now = new Date();
  dateTextEl.textContent = now.toLocaleDateString("fa-IR");
  timeTextEl.textContent = now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

function getTotal() {
  return state.services
    .filter(s => s.selected)
    .reduce((sum, s) => sum + Number(s.price || 0), 0);
}

function updateTotal() {
  totalPriceEl.textContent = `${formatMoney(getTotal())} تومان`;
}

function renderServices() {
  servicesListEl.innerHTML = "";

  state.services.forEach(service => {
    const row = document.createElement("div");
    row.className = "service-row";
    row.innerHTML = `
      <div class="service-main">
        <input type="checkbox" id="service-${service.id}" ${service.selected ? "checked" : ""} data-id="${service.id}">
        <label for="service-${service.id}">${service.name}</label>
      </div>
      <div class="service-price">${formatMoney(service.price)} تومان</div>
      <div class="service-actions">
        <button class="icon-btn edit" data-edit="${service.id}">ویرایش</button>
        <button class="icon-btn delete" data-del="${service.id}">حذف</button>
      </div>
    `;
    servicesListEl.appendChild(row);
  });

  updateTotal();
}

function renderHistory() {
  historyListEl.innerHTML = "";

  if (!history.length) {
    historyListEl.innerHTML = `<div class="history-meta">هنوز فاکتوری ذخیره نشده است.</div>`;
    return;
  }

  history.slice().reverse().forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="history-top">
        <div class="history-name">${item.customerName || "بدون نام"}</div>
        <div class="history-meta">${item.date || ""} - ${item.time || ""}</div>
      </div>
      <div class="history-meta">موبایل: ${item.customerPhone || "-"}</div>
      <div class="history-services">
        ${item.services.map(s => `• ${s.name} (${formatMoney(s.price)} تومان)`).join("<br>")}
      </div>
      <div class="history-meta">مجموع: ${formatMoney(item.total)} تومان</div>
      <div class="history-actions">
        <button class="copy" data-copy="${item.id}">کپی SMS</button>
        <button class="del" data-history-del="${item.id}">حذف</button>
      </div>
    `;
    historyListEl.appendChild(div);
  });
}

function syncInputsToState() {
  state.customerName = customerNameEl.value;
  state.customerPhone = customerPhoneEl.value;
  saveState();
}

customerNameEl.value = state.customerName;
customerPhoneEl.value = state.customerPhone;

customerNameEl.addEventListener("input", syncInputsToState);
customerPhoneEl.addEventListener("input", syncInputsToState);

servicesListEl.addEventListener("change", (e) => {
  if (e.target.type === "checkbox") {
    const id = e.target.dataset.id;
    const service = state.services.find(s => s.id === id);
    if (service) {
      service.selected = e.target.checked;
      saveState();
      updateTotal();
    }
  }
});

servicesListEl.addEventListener("click", (e) => {
  const editId = e.target.dataset.edit;
  const delId = e.target.dataset.del;

  if (editId) {
    const service = state.services.find(s => s.id === editId);
    if (!service) return;
    const newName = prompt("نام خدمت را ویرایش کن:", service.name);
    if (newName === null) return;
    const newPrice = prompt("قیمت خدمت را وارد کن:", service.price);
    if (newName.trim()) service.name = newName.trim();
    if (newPrice !== null && !isNaN(Number(newPrice))) service.price = Number(newPrice);
    saveState();
    renderServices();
  }

  if (delId) {
    state.services = state.services.filter(s => s.id !== delId);
    saveState();
    renderServices();
  }
});

addServiceBtn.addEventListener("click", () => {
  const name = newServiceNameEl.value.trim();
  const price = Number(newServicePriceEl.value);

  if (!name || isNaN(price)) {
    alert("نام و قیمت خدمت را درست وارد کن.");
    return;
  }

  state.services.push({
    id: crypto.randomUUID(),
    name,
    price,
    selected: false,
  });

  newServiceNameEl.value = "";
  newServicePriceEl.value = "";
  saveState();
  renderServices();
});

function buildSmsText() {
  const selected = state.services.filter(s => s.selected);
  const total = getTotal();
  return [
    `تراشکاری عساکره`,
    `نام: ${state.customerName || "-"}`,
    `موبایل: ${state.customerPhone || "-"}`,
    `خدمات:`,
    ...selected.map(s => `- ${s.name}: ${formatMoney(s.price)} تومان`),
    `مجموع: ${formatMoney(total)} تومان`,
  ].join("\n");
}

smsBtn.addEventListener("click", async () => {
  const text = buildSmsText();
  try {
    await navigator.clipboard.writeText(text);
    alert("متن SMS کپی شد.");
  } catch {
    prompt("کپی خودکار نشد، متن را دستی بردار:", text);
  }
});

saveBtn.addEventListener("click", () => {
  const selected = state.services.filter(s => s.selected);
  if (!selected.length) {
    alert("حداقل یک خدمت را انتخاب کن.");
    return;
  }

  const now = new Date();
  const item = {
    id: crypto.randomUUID(),
    customerName: state.customerName,
    customerPhone: state.customerPhone,
    services: selected.map(s => ({ name: s.name, price: s.price })),
    total: getTotal(),
    date: now.toLocaleDateString("fa-IR"),
    time: now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
  };

  history.push(item);
  saveHistory();
  renderHistory();
  alert("فاکتور در سوابق ذخیره شد.");
});

resetBtn.addEventListener("click", () => {
  state.services.forEach(s => (s.selected = false));
  saveState();
  renderServices();
});

historyListEl.addEventListener("click", async (e) => {
  const copyId = e.target.dataset.copy;
  const delId = e.target.dataset.historyDel;

  if (copyId) {
    const item = history.find(h => h.id === copyId);
    if (!item) return;
    const text = [
      `تراشکاری عساکره`,
      `نام: ${item.customerName || "-"}`,
      `موبایل: ${item.customerPhone || "-"}`,
      `مجموع: ${formatMoney(item.total)} تومان`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      alert("متن SMS کپی شد.");
    } catch {
      prompt("متن:", text);
    }
  }

  if (delId) {
    history = history.filter(h => h.id !== delId);
    saveHistory();
    renderHistory();
  }
});

function init() {
  updateClock();
  renderServices();
  renderHistory();
  setInterval(updateClock, 1000);
}

init();
