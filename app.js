// ==== تاریخ شمسی خودکار ====
function jalaliDate() {
  return new Date().toLocaleDateString("fa-IR");
}
document.getElementById("date").value = jalaliDate();

// ==== محصولات ذخیره شده در LocalStorage ====
let products = JSON.parse(localStorage.getItem("products") || "[]");
if(products.length === 0){
  products = [
    { name: "شستشو سرسیلندر", price: 3000000, checked: false },
    { name: "آب‌بندی سوپاپ", price: 7000000, checked: false }
  ];
  localStorage.setItem("products", JSON.stringify(products));
}

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
          <input type="checkbox" onchange="toggle(${i})" ${p.checked ? "checked" : ""}>
          ${p.name}
        </label>
        <span>${p.price.toLocaleString()}</span>
        <button onclick="editProduct(${i})">✏️</button>
        <button onclick="deleteProduct(${i})">🗑️</button>
      </div>
    `;
  });
  document.getElementById("total").innerText = "مجموع: " + total.toLocaleString();
}

// ==== تغییر وضعیت تیک ====
function toggle(i){
  products[i].checked = !products[i].checked;
  localStorage.setItem("products", JSON.stringify(products));
  render();
}

// ==== افزودن محصول ====
function addProduct(){
  const name = prompt("نام خدمت:");
  const price = parseInt(prompt("قیمت ریال:"));
  if(!name || !price) return;
  products.push({name, price, checked:false});
  localStorage.setItem("products", JSON.stringify(products));
  render();
}

// ==== ویرایش محصول ====
function editProduct(i){
  const name = prompt("نام خدمت:", products[i].name);
  const price = parseInt(prompt("قیمت ریال:", products[i].price));
  if(!name || !price) return;
  products[i].name = name;
  products[i].price = price;
  localStorage.setItem("products", JSON.stringify(products));
  render();
}

// ==== حذف محصول ====
function deleteProduct(i){
  if(confirm("آیا مطمئن هستید که این خدمت حذف شود؟")){
    products.splice(i,1);
    localStorage.setItem("products", JSON.stringify(products));
    render();
  }
}

// ==== تولید فاکتور ====
function generateInvoice(){
  const customer = document.getElementById("customer").value;
  const date = document.getElementById("date").value;
  let textInvoice = `[تراشکاری عساکره]      [فاکتور]\n--------------------------------\nنام مشتری: ${customer}   تاریخ: ${date}\n--------------------------------\nردیف   محصول           قیمت (ریال)\n`;
  let sum=0; let row=1;
  products.forEach(p=>{
    if(p.checked){
      textInvoice += `${row}   ${p.name}   ${p.price.toLocaleString()}\n`;
      sum+=p.price; row++;
    }
  });
  textInvoice += `--------------------------------\nمجموع: ${sum.toLocaleString()}`;
  document.getElementById("invoice").innerText = textInvoice;
}

// ==== ارسال SMS ====
function sendSMS(){
  const text = document.getElementById("invoice").innerText;
  window.location.href = "sms:?body=" + encodeURIComponent(text);
}

render();
