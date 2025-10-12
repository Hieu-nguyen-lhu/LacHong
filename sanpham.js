document.addEventListener("DOMContentLoaded", function () {
  let products = JSON.parse(localStorage.getItem('products')) || [];

  function renderProducts() {
    const tbody = document.querySelector("#productList tbody");
    tbody.innerHTML = '';
    products.forEach((p, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.personName}</td>
        <td>${p.productName}</td>
        <td>${p.quantity}</td>
        <td>${p.amount}</td>
        <td>${p.evidence || ""}</td>
        <td>
          <button title="Xóa" onclick="deleteProduct(${idx})">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Cho phép xóa
  window.deleteProduct = function(idx) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      products.splice(idx, 1);
      localStorage.setItem('products', JSON.stringify(products));
      renderProducts();
    }
  }

  // Thêm sản phẩm mới
  document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const personName = document.getElementById("personName").value.trim();
    const productName = document.getElementById("productName").value.trim();
    const quantity = document.getElementById("quantity").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const evidence = document.getElementById("evidence").value.trim();

    if (personName && productName && quantity && amount) {
      products.push({ personName, productName, quantity, amount, evidence });
      localStorage.setItem('products', JSON.stringify(products));
      renderProducts();
      // Reset form
      document.getElementById("personName").value = "";
      document.getElementById("productName").value = "";
      document.getElementById("quantity").value = "";
      document.getElementById("amount").value = "";
      document.getElementById("evidence").value = "";
    }
  });

  document.getElementById("exportBtn").addEventListener("click", function () {
    // Xuất file Word
    let html = `<h2>Danh sách Sản phẩm</h2>
      <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;">
        <tr>
          <th>Tên người thực hiện</th>
          <th>Tên sản phẩm</th>
          <th>Số lượng</th>
          <th>Thành tiền</th>
          <th>Minh chứng</th>
        </tr>
        ${products.map(p => `
        <tr>
          <td>${p.personName}</td>
          <td>${p.productName}</td>
          <td>${p.quantity}</td>
          <td>${p.amount}</td>
          <td>${p.evidence || ""}</td>
        </tr>
        `).join('')}
      </table>`;
    const blob = new Blob([
      `<html><head><meta charset="UTF-8"></head><body>${html}</body></html>`
    ], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Danh_sach_san_pham.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  renderProducts();
});