const servicesList = document.getElementById("services-list");
const totalDisplay = document.getElementById("total-display");
const currentDate = document.getElementById("current-date");
const currentTime = document.getElementById("current-time");
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const newServiceNameInput = document.getElementById("newServiceName");
const newServicePriceInput = document.getElementById("newServicePrice");
const addServiceBtn = document.getElementById("addServiceBtn");
const saveBtn = document.getElementById("saveBtn"); // اگر در HTML نداری، فعلاً استفاده نمی‌شود
const resetBtn = document.getElementById("resetBtn");
const printBtn = document.getElementById("printBtn"); // اگر در HTML نداری، فعلاً استفاده نمی‌شود
const smsBtn = document.getElementById("smsBtn");
const smsText = document.getElementById("smsText");
const historyList = document.getElementById("history-list");

const STORAGE_KEY = "askar_invoice_data";
const HISTORY_KEY = "invoice_history";

let state = loadState();
let history = loadHistory();

function getTodayPersian() {
  return new Date().toLocaleDateString("fa-IR");
}

function getCurrentTimePersian() {
  return new Date().toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
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
    customerPhone: "",
    date: getTodayPersian(),
    time: getCurrentTimePersian(),
    services: defaultServices()
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadHistory() {
  const saved = localStorage.getItem(HISTORY_KEY);
  return saved
