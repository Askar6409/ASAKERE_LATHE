document.getElementById('current-date').innerText = new Date().toLocaleDateString('fa-IR');

const services = [
    { name: 'شستشو سرسیلندر', price: 4000000 },
    { name: 'آبندی ۸ سوپاپ', price: 7000000 },
    { name: 'آبندی ۱۶ سوپاپ', price: 10000000 },
    { name: 'کف‌تراشی ۸ سوپاپ', price: 5000000 },
    { name: 'کف‌تراشی ۱۶ سوپاپ', price: 15000000 }
];

const listContainer = document.getElementById('services-list');

function render() {
    listContainer.innerHTML = '';
    services.forEach((s, index) => {
        listContainer.innerHTML += `
            <div class="service-row">
                <input type="checkbox" class="service-check" data-price="${s.price}" onchange="updateTotal()">
                <span>${s.name}</span>
                <span style="margin-right: auto;">${s.price.toLocaleString()}</span>
                <i class='bx bx-pencil'></i>
                <i class='bx bx-trash'></i>
            </div>
        `;
    });
}

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.service-check:checked').forEach(c => {
        total += parseInt(c.dataset.price);
    });
    document.getElementById('total-display').innerText = `مجموع: ${total.toLocaleString()} ریال`;
}

render();
