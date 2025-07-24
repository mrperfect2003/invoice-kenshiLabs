function addRow() {
  const table = document.getElementById('itemList');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" placeholder="Description"></td>
    <td><input type="number" value="1" oninput="calculateTotal()"></td>
    <td><input type="number" value="0" oninput="calculateTotal()"></td>
    <td class="item-total">0</td>
  `;
  table.appendChild(row);
  calculateTotal();
}

function calculateTotal() {
  const rows = document.querySelectorAll('#itemList tr');
  let subtotal = 0;

  rows.forEach(row => {
    const qty = Math.max(0, parseFloat(row.cells[1].querySelector('input').value) || 0);
    const price = Math.max(0, parseFloat(row.cells[2].querySelector('input').value) || 0);
    const total = qty * price;
    row.cells[3].textContent = total.toFixed(2);
    subtotal += total;
  });

  const tax = subtotal * 0.18;
  const grand = subtotal + tax;
  const advance = Math.max(0, parseFloat(document.getElementById('advancePaid').value) || 0);
  const due = grand - advance;

  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('tax').textContent = tax.toFixed(2);
  document.getElementById('grandTotal').textContent = grand.toFixed(2);
  document.getElementById('due').textContent = due.toFixed(2);
}

function downloadPDF() {
  calculateTotal(); // Update totals before export

  const original = document.getElementById('invoiceContent');
  const clone = original.cloneNode(true);

  // Replace <input> elements with spans
  clone.querySelectorAll('input').forEach(input => {
    const span = document.createElement('span');
    span.textContent = input.value || '';
    span.style.display = 'inline-block';
    span.style.minWidth = '100px';
    span.style.padding = '4px 0';
    input.parentNode.replaceChild(span, input);
  });

  // Replace <textarea> elements with divs
  clone.querySelectorAll('textarea').forEach(textarea => {
    const div = document.createElement('div');
    div.textContent = textarea.value || '';
    div.style.whiteSpace = 'pre-wrap';
    div.style.padding = '6px 0';
    textarea.parentNode.replaceChild(div, textarea);
  });

  // Style clone for PDF export
  clone.style.width = "794px"; // A4 width at 96 DPI
  clone.style.minHeight = "1123px"; // A4 height at 96 DPI
  clone.style.padding = "40px";
  clone.style.background = "#fff";
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  document.body.appendChild(clone);

  html2pdf().set({
    margin: 0,
    filename: 'invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(clone).save().then(() => {
    document.body.removeChild(clone); // Clean up
  });
}

window.onload = () => {
  const today = new Date().toISOString().substr(0, 10);
  document.getElementById('invoiceDate').value = today;
  calculateTotal();
};
