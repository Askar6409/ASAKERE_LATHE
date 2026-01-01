// ==== تنظیمات زبان ====
let lang = "fa";
const text = {
  fa: { customer: "نام مشتری", invoice: "فاکتور", total: "مجموع", services: "خدمات" },
  en: { customer: "Customer", invoice: "Invoice", total: "Total", services: "Services" }
};

function toggleLang() {
  lang = lang === "fa" ? "en" : "fa";
  render();
}

// ==== تاریخ شمسی خودکار ====
function jalaliDate() {
  return new Date().toLocaleDateString("fa-IR");
}
document.getElementById("date").value = jalaliDate();

// ==== محصولات اولیه ====
let products = [
  { name: "شستشو سرسیلندر", price: 3000000, checked: false },
  { name: "آب‌بندی سوپاپ", price: 7000000, checked: false }
];

// ==== رندر لیست ====
function render() {
  const container = document.getElementById("products");
  container.innerHTML = "";
  let total = 0;
  products.forEach((p,i)=>{
    if(p.checked) total+=p.price;
    container.innerHTML += `
      <div class="product">
        <label>
          <input type="checkbox" onchange="toggle(${i})">
          ${p.name}
        </label>
        <span>${p.price.toLocaleString()}</span>
      </div>
    `;
  });
  document.getElementById("total").innerText =
    (lang==="fa"?"مجموع: ":"Total: ") + total.toLocaleString() + (lang==="fa"?" تومان":"");
}

// ==== تغییر وضعیت تیک ====
function toggle(i){
  products[i].checked = !products[i].checked;
  render();
}

// ==== افزودن محصول ====
function addProduct(){
  const name = prompt("نام خدمت:");
  const price = parseInt(prompt("قیمت:"));
  if(!name || !price) return;
  products.push({name, price, checked:false});
  render();
}

// ==== تولید فاکتور ====
function generateInvoice(){
  const customer = document.getElementById("customer").value;
  const date = document.getElementById("date").value;
  let textInvoice = `[تراشکاری عساکره]      [${lang==="fa"?"فاکتور":"Invoice"}]\n--------------------------------\n${lang==="fa"?"نام مشتری":"Customer"}: ${customer}   ${lang==="fa"?"تاریخ":"Date"}: ${date}\n--------------------------------\nردیف   محصول           قیمت\n`;
  let sum=0; let row=1;
  products.forEach(p=>{
    if(p.checked){
      textInvoice += `${row}   ${p.name}   ${p.price.toLocaleString()}\n`;
      sum+=p.price; row++;
    }
  });
  textInvoice += `--------------------------------\n${lang==="fa"?"مجموع":"Total"}: ${sum.toLocaleString()} تومان`;
  document.getElementById("invoice").innerText = textInvoice;
  saveInvoice(textInvoice);
}

// ==== ذخیره محلی فاکتورها ====
function saveInvoice(data){
  let list = JSON.parse(localStorage.getItem("invoices") || "[]");
  list.push(data);
  localStorage.setItem("invoices", JSON.stringify(list));
}

// ==== خروجی عکس ====
function exportImage(){
  const invoice = document.getElementById("invoice");
  html2canvas(invoice,{backgroundColor:"#ffffff"}).then(canvas=>{
    const link = document.createElement("a");
    link.download = "invoice.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

// ==== خروجی PDF ====
function exportPDF(){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const invoice = document.getElementById("invoice");
  html2canvas(invoice,{scale:2}).then(canvas=>{
    const img = canvas.toDataURL("image/png");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height*w)/canvas.width;
    pdf.addImage(img,"PNG",0,10,w,h);
    pdf.save("invoice.pdf");
  });
}

// ==== ارسال WhatsApp و SMS ====
function sendWhatsApp(){
  const text = document.getElementById("invoice").innerText;
  window.open("https://wa.me/?text="+encodeURIComponent(text));
}

function sendSMS(){
  const text = document.getElementById("invoice").innerText;
  window.location.href = "sms:?body="+encodeURIComponent(text);
}

// ==== شروع رندر ====
render();
