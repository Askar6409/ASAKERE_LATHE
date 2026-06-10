const servicesList = document.getElementById("services-list");
const totalDisplay = document.getElementById("total-display");
const currentDate = document.getElementById("current-date");
const customerNameInput = document.getElementById("customerName");
const newServiceNameInput = document.getElementById("newServiceName");
const newServicePriceInput = document.getElementById("newServicePrice");
const addServiceBtn = document.getElementById("addServiceBtn");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const printBtn = document.getElementById("printBtn");
const smsBtn = document.getElementById("smsBtn");
const smsText = document.getElementById("smsText");

const STORAGE_KEY = "askar_invoice_data";

let state = loadState();

function getTodayPersian() {
  return new Date().toLocaleDateString("fa-IR");
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function defaultServices() {
  return [
    { id: crypto.randomUUID(), name: "شستشو سرسیلندر", price: 4000000, selected: false },
    { id: crypto.randomUUID(), name: "آبندی ۸ سوپاپ", price: 7000000, selected: false },
    { id: crypto.randomUUID(), name: "آبندی ۱۶ سوپاپ", price: 10000000, selected: false },
    { id: crypto.randomUUID(), name: "کف‌تراشی ۸ سوپاپ", price: 5000000, selected: false },
    { id: crypto.randomUUID(), name: "کف‌تراشی ۱۶ سوپاپ", price: 15000000, selected: false },
    { id: crypto.randomUUID(), name: "شستشو گیربکس", price: 4000000, selected: false },
    { id: crypto.randomUUID(), name: "شستشو گیربکس کثیف", price: 5000000, selected: false }
  ];
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  return {
    customerName: "عباس عساکره",
    date: getTodayPersian(),
    services: defaultServices()
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getSelectedServices() {
  return state.services.filter(s => s.selected);
}

function getTotal() {
  return getSelectedServices().reduce((sum, s) => sum + Number(s.price || 0), 0);
}

function buildSmsText() {
  const selected = getSelectedServices();

  let text = `تراشکاری عساکره \n`;
  text += `فاکتور \n`;
  text += `تاریخ: ${state.date}\n`;
  text += `نام مشتری: ${state.customerName || "-"}\n`;
  text += `----------------------\n`;

  if (selected.length === 0) {
    text += `خدمتی انتخاب نشده است.\n`;
  } else {
    selected.forEach((s, i) => {
      text += `${i + 1}. ${s.name} - ${formatMoney(s.price)} ریال\n`;
    });
  }

  text += `----------------------\n`;
  text += `مجموع: ${formatMoney(getTotal())} تومان`;

  return text;
}

function render() {
  currentDate.textContent = state.date || getTodayPersian();
  customerNameInput.value = state.customerName || "";
  servicesList.innerHTML = "";

  state.services.forEach((service, index) => {
    const row = document.createElement("div");
    row.className = "service-row";
    row.innerHTML = `
      <div class="row-index">${index + 1}</div>
      <div class="service-name">
        <input type="checkbox" ${service.selected ? "checked" : ""} data-id="${service.id}">
        <span class="service-title">${service.name}</span>
      </div>
      <div class="service-price">${formatMoney(service.price)} ریال</div>
      <div class="actions-icons">
        <button class="icon-btn edit" data-edit="${service.id}" title="ویرایش">
          <i class='bx bx-pencil'></i>
        </button>
        <button class="icon-btn delete" data-delete="${service.id}" title="حذف">
          <i class='bx bx-trash'></i>
        </button>
      </div>
    `;
    servicesList.appendChild(row);
  });

  updateTotal();
  smsText.value = buildSmsText();
  saveState();
}

function updateTotal() {
  totalDisplay.textContent = `${formatMoney(getTotal())} تومان`;
  smsText.value = buildSmsText();
}

servicesList.addEventListener("change", (e) => {
  if (e.target.matches('input[type="checkbox"][data-id]')) {
    const id = e.target.getAttribute("data-id");
    const service = state.services.find(s => s.id === id);
    if (service) {
      service.selected = e.target.checked;
      updateTotal();
      saveState();
    }
  }
});

servicesList.addEventListener("click", (e) => {
  const editBtn = e.target.closest("[data-edit]");
  const deleteBtn = e.target.closest("[data-delete]");

  if (editBtn) {
    const id = editBtn.getAttribute("data-edit");
    const service = state.services.find(s => s.id === id);
    if (!service) return;

    const newName = prompt("نام خدمت جدید:", service.name);
    if (newName === null) return;

    const newPrice = prompt("قیمت جدید:", service.price);
    if (newPrice === null) return;

    const parsedPrice = Number(String(newPrice).replace(/[^\d]/g, ""));
    if (!newName.trim() || !Number.isFinite(parsedPrice)) {
      alert("نام یا قیمت نامعتبر است.");
      return;
    }

    service.name = newName.trim();
    service.price = parsedPrice;
    render();
  }

  if (deleteBtn) {
    const id = deleteBtn.getAttribute("data-delete");
    const service = state.services.find(s => s.id === id);
    if (!service) return;

    if (confirm(`خدمت "${service.name}" حذف شود؟`)) {
      state.services = state.services.filter(s => s.id !== id);
      render();
    }
  }
});

customerNameInput.addEventListener("input", () => {
  state.customerName = customerNameInput.value;
  saveState();
  updateTotal();
});

addServiceBtn.addEventListener("click", () => {
  const name = newServiceNameInput.value.trim();
  const price = Number(newServicePriceInput.value);

  if (!name || !Number.isFinite(price) || price <= 0) {
    alert("نام خدمت و قیمت معتبر وارد کن.");
    return;
  }

  state.services.push({
    id: crypto.randomUUID(),
    name,
    price,
    selected: false
  });

  newServiceNameInput.value = "";
  newServicePriceInput.value = "";
  render();
});

saveBtn.addEventListener("click", () => {
  saveState();
  alert("فاکتور ذخیره شد.");
});

resetBtn.addEventListener("click", () => {
  if (confirm("همه اطلاعات پاک شوند؟")) {
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    render();
  }
});

printBtn.addEventListener("click", () => {
  window.print();
});

smsBtn.addEventListener("click", async () => {
  const text = buildSmsText();
  smsText.value = text;

  try {
    await navigator.clipboard.writeText(text);
    alert("متن فاکتور برای SMS کپی شد.");
  } catch {
    smsText.select();
    document.execCommand("copy");
    alert("متن فاکتور کپی شد.");
  }
});

currentDate.textContent = getTodayPersian();
render();
