// --------- Helper: ép kiểu về mảng ---------
function getArrayFromStorage(key) {
  let value = localStorage.getItem(key);
  if (!value) return [];
  let arr;
  try {
    arr = JSON.parse(value);
    if (!Array.isArray(arr)) arr = [];
  } catch {
    arr = [];
  }
  return arr;
}

// --------- LẤY USER ĐANG CHỌN (dùng index nếu muốn, mặc định lấy user đầu tiên) ---------
function getCurrentUser() {
  let users = getArrayFromStorage("staff_users");
  return users.length ? users[0] : null;
}

// --------- BẢNG NHÂN VIÊN (cho phép lưu nhiều dòng) ----------
function renderUserInfoTable() {
  const tbody = document.querySelector("#user-info-table tbody");
  tbody.innerHTML = "";
  const users = getArrayFromStorage("staff_users");
  if (users.length === 0) return;
  users.forEach((user, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.msnv}</td>
      <td>${user.donvi}</td>
      <td>${user.miengiam}</td>
      <td>
        <button class="btn-delete-row" data-user="${idx}" title="Xóa dòng này" style="color:red;font-weight:bold;">X</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Bắt sự kiện xóa cho bảng nhân viên
  document.querySelectorAll(".btn-delete-row[data-user]").forEach(btn => {
    btn.onclick = function() {
      let users = getArrayFromStorage("staff_users");
      users.splice(parseInt(this.getAttribute("data-user")), 1);
      localStorage.setItem("staff_users", JSON.stringify(users));
      renderUserInfoTable();
      updateAllTables();
    };
  });

  // Cho phép nhập thêm nhiều dòng (không disable)
  document.getElementById("btnUserLuu").disabled = false;
}

// Nút lưu nhân viên: không giới hạn số dòng
document.getElementById("btnUserLuu").onclick = function() {
  const name = document.getElementById("userName").value.trim();
  const msnv = document.getElementById("userMSNV").value.trim();
  const donvi = document.getElementById("userDonVi").value;
  const miengiam = document.getElementById("userMienGiam").value;
  if (!name || !msnv || !donvi || !miengiam) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }
  const users = getArrayFromStorage("staff_users");
  users.push({ name, msnv, donvi, miengiam });
  localStorage.setItem("staff_users", JSON.stringify(users));
  renderUserInfoTable();
  document.getElementById("userName").value = "";
  document.getElementById("userMSNV").value = "";
  document.getElementById("userDonVi").selectedIndex = 0;
  document.getElementById("userMienGiam").selectedIndex = 0;
  updateAllTables();
};

window.addEventListener("DOMContentLoaded", renderUserInfoTable);

// --------- ĐỀ TÀI KHOA HỌC ----------
function calcTietDetai() {
  let cap = document.getElementById("detaiCap");
  let nv = document.getElementById("detaiNhiemVu");
  let tietCap = +cap.options[cap.selectedIndex]?.getAttribute("data-tiet") || 0;
  let tietNv = +nv.options[nv.selectedIndex]?.getAttribute("data-tiet") || 0;
  let nghiemthu = document.getElementById("detaiNghiemThu").value;
  let ketqua = 0;
  if (nghiemthu === "roi") ketqua = tietCap + tietNv;
  return ketqua;
}
function renderDetaiTable() {
  const tbody = document.querySelector("#detai-info-table tbody");
  tbody.innerHTML = "";
  const curUser = getCurrentUser();
  if (!curUser) return;
  // Lọc chỉ đề tài của user hiện tại
  const users = getArrayFromStorage("detai_users").filter(u => u.msnv === curUser.msnv);
  if (users.length === 0) return;
  users.forEach((u, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${u.ten}</td>
      <td>${u.cap}</td>
      <td>${u.nhiemvu}</td>
      <td>${u.minhchung}</td>
      <td>${u.nghiemthu}</td>
      <td>${u.ketqua}</td>
      <td>
        <button class="btn-delete-row" data-detai="${u._id}" title="Xóa dòng này" style="color:red;font-weight:bold;">X</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-delete-row[data-detai]").forEach(btn => {
    btn.onclick = function() {
      let data = getArrayFromStorage("detai_users");
      let idx = data.findIndex(x => x._id == this.getAttribute("data-detai"));
      if (idx > -1) data.splice(idx, 1);
      localStorage.setItem("detai_users", JSON.stringify(data));
      renderDetaiTable();
      updateAllTables();
    };
  });
}

function updateDetaiKetQua() {
  document.getElementById("detaiKetQua").value = calcTietDetai();
  updateAllTables();
}

// --------- GIÁO TRÌNH ----------
function calcTietGiaotrinh() {
  let loai = document.getElementById("gtLoai");
  let nv = document.getElementById("gtNhiemVu");
  let tietLoai = +loai.options[loai.selectedIndex]?.getAttribute("data-tiet") || 0;
  let tietNv = +nv.options[nv.selectedIndex]?.getAttribute("data-tiet") || 0;
  let nghiemthu = document.getElementById("gtNghiemThu").value;
  let ketqua = 0;
  if (nghiemthu === "roi") ketqua = tietLoai + tietNv;
  return ketqua;
}
function renderGtTable() {
  const tbody = document.querySelector("#gt-info-table tbody");
  tbody.innerHTML = "";
  const curUser = getCurrentUser();
  if (!curUser) return;
  const users = getArrayFromStorage("gt_users").filter(u => u.msnv === curUser.msnv);
  if (users.length === 0) return;
  users.forEach((u, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${u.ten}</td>
      <td>${u.loai}</td>
      <td>${u.nhiemvu}</td>
      <td>${u.minhchung}</td>
      <td>${u.nghiemthu}</td>
      <td>${u.ketqua}</td>
      <td>
        <button class="btn-delete-row" data-gt="${u._id}" title="Xóa dòng này" style="color:red;font-weight:bold;">X</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-delete-row[data-gt]").forEach(btn => {
    btn.onclick = function() {
      let data = getArrayFromStorage("gt_users");
      let idx = data.findIndex(x => x._id == this.getAttribute("data-gt"));
      if (idx > -1) data.splice(idx, 1);
      localStorage.setItem("gt_users", JSON.stringify(data));
      renderGtTable();
      updateAllTables();
    };
  });
}

function updateGtKetQua() {
  document.getElementById("gtKetQua").value = calcTietGiaotrinh();
  updateAllTables();
}

// --------- BÀI BÁO ----------
function calcTietBaibao() {
  let loai = document.getElementById("bbLoai");
  let tietLoai = +loai.options[loai.selectedIndex]?.getAttribute("data-tiet") || 0;
  let tacgia = document.getElementById("bbTacGia");
  let tietTacGia = 0;
  if (tacgia.value === "chinh") tietTacGia = 10;
  let nghiemthu = document.getElementById("bbNghiemThu").value;
  let ketqua = 0;
  if (nghiemthu === "roi") ketqua = tietLoai + tietTacGia;
  return ketqua;
}
function renderBbTable() {
  const tbody = document.querySelector("#bb-info-table tbody");
  tbody.innerHTML = "";
  const curUser = getCurrentUser();
  if (!curUser) return;
  const users = getArrayFromStorage("bb_users").filter(u => u.msnv === curUser.msnv);
  if (users.length === 0) return;
  users.forEach((u, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${u.ten}</td>
      <td>${u.loai}</td>
      <td>${u.minhchung}</td>
      <td>${u.tacgia}</td>
      <td>${u.nghiemthu}</td>
      <td>${u.ketqua}</td>
      <td>
        <button class="btn-delete-row" data-bb="${u._id}" title="Xóa dòng này" style="color:red;font-weight:bold;">X</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-delete-row[data-bb]").forEach(btn => {
    btn.onclick = function() {
      let data = getArrayFromStorage("bb_users");
      let idx = data.findIndex(x => x._id == this.getAttribute("data-bb"));
      if (idx > -1) data.splice(idx, 1);
      localStorage.setItem("bb_users", JSON.stringify(data));
      renderBbTable();
      updateAllTables();
    };
  });
}

function updateBbKetQua() {
  document.getElementById("bbKetQua").value = calcTietBaibao();
  updateAllTables();
}

// --------- BẢNG TỔNG HỢP USER (bên phải) ---------
function renderUserSummaryTable() {
  const tbody = document.querySelector("#user-summary-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  const users = getArrayFromStorage("staff_users");
  if (!users.length) return;
  // Với mỗi user, tính tổng tiết từ các bảng nhỏ (chỉ cộng các dòng có msnv trùng)
  users.forEach(user => {
    let sumDetai = getArrayFromStorage("detai_users").filter(x => x.msnv === user.msnv).reduce((a, b) => a + (parseInt(b.ketqua) || 0), 0);
    let sumGt = getArrayFromStorage("gt_users").filter(x => x.msnv === user.msnv).reduce((a, b) => a + (parseInt(b.ketqua) || 0), 0);
    let sumBb = getArrayFromStorage("bb_users").filter(x => x.msnv === user.msnv).reduce((a, b) => a + (parseInt(b.ketqua) || 0), 0);
    let total = sumDetai + sumGt + sumBb;
    let result = total >= 150 ? "Đạt" : "Không đạt";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${total}</td>
      <td>${result}</td>
    `;
    tbody.appendChild(tr);
  });
}

// --------- CẬP NHẬT TỔNG SỐ TIẾT + KẾT QUẢ CHO USER ĐANG CHỌN ---------
function updateSumResult() {
  const curUser = getCurrentUser();
  if (!curUser) {
    document.getElementById("sumResult").textContent = "Tổng số tiết: 0 - Không đạt";
    return;
  }
  let sumDetai = getArrayFromStorage("detai_users").filter(x => x.msnv === curUser.msnv).reduce((a, b) => a + (parseInt(b.ketqua) || 0), 0);
  let sumGt = getArrayFromStorage("gt_users").filter(x => x.msnv === curUser.msnv).reduce((a, b) => a + (parseInt(b.ketqua) || 0), 0);
  let sumBb = getArrayFromStorage("bb_users").filter(x => x.msnv === curUser.msnv).reduce((a, b) => a + (parseInt(b.ketqua) || 0), 0);
  let total = sumDetai + sumGt + sumBb;
  let result = total >= 150 ? "Đạt" : "Không đạt";
  document.getElementById("sumResult").textContent = `Tổng số tiết: ${total} - ${result}`;
}

// --------- GỌI LẠI TOÀN BỘ CÁC BẢNG, TỔNG HỢP ---------
function updateAllTables() {
  renderDetaiTable();
  renderGtTable();
  renderBbTable();
  updateSumResult();
  renderUserSummaryTable();
}

// --------- SỰ KIỆN LƯU DỮ LIỆU FORM ---------
function randomId() { return Math.random().toString(36).substring(2, 10) + Date.now(); }

document.getElementById("btnDetaiLuu").onclick = function() {
  const curUser = getCurrentUser();
  if (!curUser) { alert("Vui lòng nhập thông tin nhân viên trước!"); return; }
  const ten = document.getElementById("detaiTen").value;
  const capIdx = document.getElementById("detaiCap").selectedIndex;
  const nhiemvuIdx = document.getElementById("detaiNhiemVu").selectedIndex;
  const minhchung = document.getElementById("detaiFileLabel").textContent;
  const nghiemthuIdx = document.getElementById("detaiNghiemThu").selectedIndex;
  const ketqua = document.getElementById("detaiKetQua").value;
  if (!ten || capIdx <= 0 || nhiemvuIdx <= 0 || nghiemthuIdx <= 0) {
    alert("Vui lòng nhập đầy đủ thông tin đề tài!");
    return;
  }
  const cap = document.getElementById("detaiCap").options[capIdx].text;
  const nhiemvu = document.getElementById("detaiNhiemVu").options[nhiemvuIdx].text;
  const nghiemthu = document.getElementById("detaiNghiemThu").options[nghiemthuIdx].text;
  const users = getArrayFromStorage("detai_users");
  users.push({ _id: randomId(), msnv: curUser.msnv, ten, cap, nhiemvu, minhchung, nghiemthu, ketqua });
  localStorage.setItem("detai_users", JSON.stringify(users));
  document.getElementById("detaiTen").value = "";
  document.getElementById("detaiCap").selectedIndex = 0;
  document.getElementById("detaiNhiemVu").selectedIndex = 0;
  document.getElementById("detaiFileLabel").textContent = "Minh chứng";
  document.getElementById("detaiNghiemThu").selectedIndex = 0;
  document.getElementById("detaiKetQua").value = "0";
  updateAllTables();
};

document.getElementById("btnGtLuu").onclick = function() {
  const curUser = getCurrentUser();
  if (!curUser) { alert("Vui lòng nhập thông tin nhân viên trước!"); return; }
  const ten = document.getElementById("gtTen").value;
  const loaiIdx = document.getElementById("gtLoai").selectedIndex;
  const nhiemvuIdx = document.getElementById("gtNhiemVu").selectedIndex;
  const minhchung = document.getElementById("gtFileLabel").textContent;
  const nghiemthuIdx = document.getElementById("gtNghiemThu").selectedIndex;
  const ketqua = document.getElementById("gtKetQua").value;
  if (!ten || loaiIdx <= 0 || nhiemvuIdx <= 0 || nghiemthuIdx <= 0) {
    alert("Vui lòng nhập đầy đủ thông tin giáo trình!");
    return;
  }
  const loai = document.getElementById("gtLoai").options[loaiIdx].text;
  const nhiemvu = document.getElementById("gtNhiemVu").options[nhiemvuIdx].text;
  const nghiemthu = document.getElementById("gtNghiemThu").options[nghiemthuIdx].text;
  const users = getArrayFromStorage("gt_users");
  users.push({ _id: randomId(), msnv: curUser.msnv, ten, loai, nhiemvu, minhchung, nghiemthu, ketqua });
  localStorage.setItem("gt_users", JSON.stringify(users));
  document.getElementById("gtTen").value = "";
  document.getElementById("gtLoai").selectedIndex = 0;
  document.getElementById("gtNhiemVu").selectedIndex = 0;
  document.getElementById("gtFileLabel").textContent = "Minh chứng";
  document.getElementById("gtNghiemThu").selectedIndex = 0;
  document.getElementById("gtKetQua").value = "0";
  updateAllTables();
};

document.getElementById("btnBbLuu").onclick = function() {
  const curUser = getCurrentUser();
  if (!curUser) { alert("Vui lòng nhập thông tin nhân viên trước!"); return; }
  const ten = document.getElementById("bbTen").value;
  const loaiIdx = document.getElementById("bbLoai").selectedIndex;
  const minhchung = document.getElementById("bbFileLabel").textContent;
  const tacgiaIdx = document.getElementById("bbTacGia").selectedIndex;
  const nghiemthuIdx = document.getElementById("bbNghiemThu").selectedIndex;
  const ketqua = document.getElementById("bbKetQua").value;
  if (!ten || loaiIdx <= 0 || tacgiaIdx <= 0 || nghiemthuIdx <= 0) {
    alert("Vui lòng nhập đầy đủ thông tin bài báo!");
    return;
  }
  const loai = document.getElementById("bbLoai").options[loaiIdx].text;
  const tacgia = document.getElementById("bbTacGia").options[tacgiaIdx].text;
  const nghiemthu = document.getElementById("bbNghiemThu").options[nghiemthuIdx].text;
  const users = getArrayFromStorage("bb_users");
  users.push({ _id: randomId(), msnv: curUser.msnv, ten, loai, minhchung, tacgia, nghiemthu, ketqua });
  localStorage.setItem("bb_users", JSON.stringify(users));
  document.getElementById("bbTen").value = "";
  document.getElementById("bbLoai").selectedIndex = 0;
  document.getElementById("bbFileLabel").textContent = "Minh chứng";
  document.getElementById("bbTacGia").selectedIndex = 0;
  document.getElementById("bbNghiemThu").selectedIndex = 0;
  document.getElementById("bbKetQua").value = "0";
  updateAllTables();
};

// --------- TỰ ĐỘNG UPDATE Ô KẾT QUẢ KHI CHỌN NGHIỆM THU ---------
document.getElementById("detaiCap").addEventListener("change", updateDetaiKetQua);
document.getElementById("detaiNhiemVu").addEventListener("change", updateDetaiKetQua);
document.getElementById("detaiNghiemThu").addEventListener("change", updateDetaiKetQua);

document.getElementById("gtLoai").addEventListener("change", updateGtKetQua);
document.getElementById("gtNhiemVu").addEventListener("change", updateGtKetQua);
document.getElementById("gtNghiemThu").addEventListener("change", updateGtKetQua);

document.getElementById("bbLoai").addEventListener("change", updateBbKetQua);
document.getElementById("bbTacGia").addEventListener("change", updateBbKetQua);
document.getElementById("bbNghiemThu").addEventListener("change", updateBbKetQua);

// --------- HIỂN THỊ TÊN FILE KHI CHỌN ---------
function getFileNames(files) {
  let arr = [];
  for (let i = 0; i < files.length; i++) arr.push(files[i].name);
  return arr;
}
function handleFileLabel(inputId, labelId) {
  document.getElementById(inputId).addEventListener("change", function(e) {
    let names = getFileNames(this.files);
    let lbl = document.getElementById(labelId);
    if (names.length === 0) {
      lbl.textContent = "Minh chứng";
    } else if (names.length === 1) {
      lbl.textContent = names[0];
    } else {
      let nameList = names.map((n, i) => `(${n})`).join(", ");
      lbl.textContent = nameList;
    }
  });
}
handleFileLabel("detaiFile", "detaiFileLabel");
handleFileLabel("gtFile", "gtFileLabel");
handleFileLabel("bbFile", "bbFileLabel");
["detaiFile", "gtFile", "bbFile"].forEach(id => {
  document.getElementById(id).addEventListener("click", function() {
    this.value = "";
    document.getElementById(id + "Label").textContent = "Minh chứng";
  });
});

// --------- NÚT LƯU TOÀN BỘ: Lưu thông tin 3 phần nếu đã nhập hợp lệ (đều gắn user) ---
document.getElementById("btnSaveAll").onclick = function() {
  const curUser = getCurrentUser();
  if (!curUser) {
    alert("Vui lòng nhập thông tin nhân viên trước!");
    return;
  }
  // 3 phần: đề tài, giáo trình, bài báo
  // Đề tài
  const detaiTen = document.getElementById("detaiTen").value.trim();
  const detaiCapIdx = document.getElementById("detaiCap").selectedIndex;
  const detaiNhiemVuIdx = document.getElementById("detaiNhiemVu").selectedIndex;
  const detaiFile = document.getElementById("detaiFileLabel").textContent;
  const detaiNghiemThuIdx = document.getElementById("detaiNghiemThu").selectedIndex;
  const detaiKetQua = document.getElementById("detaiKetQua").value;
  let detaiOK = !!detaiTen && detaiCapIdx > 0 && detaiNhiemVuIdx > 0 && detaiNghiemThuIdx > 0;
  // Giáo trình
  const gtTen = document.getElementById("gtTen").value.trim();
  const gtLoaiIdx = document.getElementById("gtLoai").selectedIndex;
  const gtNhiemVuIdx = document.getElementById("gtNhiemVu").selectedIndex;
  const gtFile = document.getElementById("gtFileLabel").textContent;
  const gtNghiemThuIdx = document.getElementById("gtNghiemThu").selectedIndex;
  const gtKetQua = document.getElementById("gtKetQua").value;
  let gtOK = !!gtTen && gtLoaiIdx > 0 && gtNhiemVuIdx > 0 && gtNghiemThuIdx > 0;
  // Bài báo
  const bbTen = document.getElementById("bbTen").value.trim();
  const bbLoaiIdx = document.getElementById("bbLoai").selectedIndex;
  const bbTacGiaIdx = document.getElementById("bbTacGia").selectedIndex;
  const bbFile = document.getElementById("bbFileLabel").textContent;
  const bbNghiemThuIdx = document.getElementById("bbNghiemThu").selectedIndex;
  const bbKetQua = document.getElementById("bbKetQua").value;
  let bbOK = !!bbTen && bbLoaiIdx > 0 && bbTacGiaIdx > 0 && bbNghiemThuIdx > 0;

  let somethingSaved = false;
  // Lưu Đề tài
  if (detaiOK) {
    let detaiCap = document.getElementById("detaiCap").options[detaiCapIdx].text;
    let detaiNhiemVu = document.getElementById("detaiNhiemVu").options[detaiNhiemVuIdx].text;
    let detaiNghiemThu = document.getElementById("detaiNghiemThu").options[detaiNghiemThuIdx].text;
    let arr = getArrayFromStorage("detai_users");
    arr.push({
      _id: randomId(),
      msnv: curUser.msnv,
      ten: detaiTen,
      cap: detaiCap,
      nhiemvu: detaiNhiemVu,
      minhchung: detaiFile,
      nghiemthu: detaiNghiemThu,
      ketqua: detaiKetQua
    });
    localStorage.setItem("detai_users", JSON.stringify(arr));
    document.getElementById("detaiTen").value = "";
    document.getElementById("detaiCap").selectedIndex = 0;
    document.getElementById("detaiNhiemVu").selectedIndex = 0;
    document.getElementById("detaiFileLabel").textContent = "Minh chứng";
    document.getElementById("detaiNghiemThu").selectedIndex = 0;
    document.getElementById("detaiKetQua").value = "0";
    somethingSaved = true;
  }
  // Lưu Giáo trình
  if (gtOK) {
    let gtLoai = document.getElementById("gtLoai").options[gtLoaiIdx].text;
    let gtNhiemVu = document.getElementById("gtNhiemVu").options[gtNhiemVuIdx].text;
    let gtNghiemThu = document.getElementById("gtNghiemThu").options[gtNghiemThuIdx].text;
    let arr = getArrayFromStorage("gt_users");
    arr.push({
      _id: randomId(),
      msnv: curUser.msnv,
      ten: gtTen,
      loai: gtLoai,
      nhiemvu: gtNhiemVu,
      minhchung: gtFile,
      nghiemthu: gtNghiemThu,
      ketqua: gtKetQua
    });
    localStorage.setItem("gt_users", JSON.stringify(arr));
    document.getElementById("gtTen").value = "";
    document.getElementById("gtLoai").selectedIndex = 0;
    document.getElementById("gtNhiemVu").selectedIndex = 0;
    document.getElementById("gtFileLabel").textContent = "Minh chứng";
    document.getElementById("gtNghiemThu").selectedIndex = 0;
    document.getElementById("gtKetQua").value = "0";
    somethingSaved = true;
  }
  // Lưu Bài báo
  if (bbOK) {
    let bbLoai = document.getElementById("bbLoai").options[bbLoaiIdx].text;
    let bbTacGia = document.getElementById("bbTacGia").options[bbTacGiaIdx].text;
    let bbNghiemThu = document.getElementById("bbNghiemThu").options[bbNghiemThuIdx].text;
    let arr = getArrayFromStorage("bb_users");
    arr.push({
      _id: randomId(),
      msnv: curUser.msnv,
      ten: bbTen,
      loai: bbLoai,
      minhchung: bbFile,
      tacgia: bbTacGia,
      nghiemthu: bbNghiemThu,
      ketqua: bbKetQua
    });
    localStorage.setItem("bb_users", JSON.stringify(arr));
    document.getElementById("bbTen").value = "";
    document.getElementById("bbLoai").selectedIndex = 0;
    document.getElementById("bbFileLabel").textContent = "Minh chứng";
    document.getElementById("bbTacGia").selectedIndex = 0;
    document.getElementById("bbNghiemThu").selectedIndex = 0;
    document.getElementById("bbKetQua").value = "0";
    somethingSaved = true;
  }
  updateAllTables();
  if (somethingSaved) {
    alert("Đã lưu toàn bộ thông tin các phần đã nhập đủ!");
  } else {
    alert("Không có phần nào đủ thông tin để lưu!");
  }
};

// --- NÚT "IN RA WORD" --- 
function getPrintHTML() {
  let users = getArrayFromStorage("staff_users");
  let curUser = getCurrentUser();
  if (!curUser) return "Không có dữ liệu nhân viên!";
  let detai = getArrayFromStorage("detai_users").filter(x => x.msnv === curUser.msnv);
  let gt = getArrayFromStorage("gt_users").filter(x => x.msnv === curUser.msnv);
  let bb = getArrayFromStorage("bb_users").filter(x => x.msnv === curUser.msnv);

  let thStyle = 'background:#50b4ff;color:#fff;border:1px solid #cfd8dc;font-size:16px;';
  let tdStyle = 'border:1px solid #cfd8dc;padding:8px 14px;text-align:center;';
  let html = `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Thông tin nhân viên</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 30px; }
      .title { font-size: 28px; font-weight: bold; color: #fff; padding: 16px 0; text-align: center;
        background: linear-gradient(to right, #50b4ff, #005baa); border-radius: 10px; margin-bottom:30px;}
      .section-title { font-size: 19px; color: #005baa; font-weight: bold; margin-bottom: 8px; }
      .info-table { width: 100%; margin: 15px 0 20px 0; border-radius: 8px; border-collapse:collapse;}
      .info-table th, .info-table td { border: 1px solid #cfd8dc; padding: 8px 14px; text-align: center;}
      .result { font-size: 22px; font-weight: bold; text-align: center; margin: 28px 0 14px 0; color: #005baa;}
      .note { color: #555; font-size: 14px; text-align: right;}
    </style>
  </head>
  <body>
    <div class="title">THÔNG TIN NHÂN VIÊN</div>
    <div class="section-title">Thông tin nhân viên</div>
    <table class="info-table">
      <thead>
        <tr>
          <th style="${thStyle}">Họ và tên</th>
          <th style="${thStyle}">MSNV</th>
          <th style="${thStyle}">Đơn vị</th>
          <th style="${thStyle}">Mức miễn giảm</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="${tdStyle}">${curUser.name}</td>
          <td style="${tdStyle}">${curUser.msnv}</td>
          <td style="${tdStyle}">${curUser.donvi}</td>
          <td style="${tdStyle}">${curUser.miengiam}</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">I. Đề tài khoa học</div>
    <table class="info-table">
      <thead>
        <tr>
          <th style="${thStyle}">STT</th>
          <th style="${thStyle}">Tên đề tài</th>
          <th style="${thStyle}">Cấp</th>
          <th style="${thStyle}">Nhiệm vụ</th>
          <th style="${thStyle}">Minh chứng</th>
          <th style="${thStyle}">Nghiệm thu</th>
          <th style="${thStyle}">Kết quả (tiết)</th>
        </tr>
      </thead>
      <tbody>
        ${
          detai.length
            ? detai.map((d, i) => `<tr>
              <td style="${tdStyle}">${i+1}</td>
              <td style="${tdStyle}">${d.ten}</td>
              <td style="${tdStyle}">${d.cap}</td>
              <td style="${tdStyle}">${d.nhiemvu}</td>
              <td style="${tdStyle}">${d.minhchung}</td>
              <td style="${tdStyle}">${d.nghiemthu}</td>
              <td style="${tdStyle}">${d.ketqua}</td>
            </tr>`).join("")
            : `<tr><td colspan="7" style="${tdStyle}color:#888">Không có dữ liệu</td></tr>`
        }
      </tbody>
    </table>

    <div class="section-title">II. Giáo trình</div>
    <table class="info-table">
      <thead>
        <tr>
          <th style="${thStyle}">STT</th>
          <th style="${thStyle}">Tên giáo trình</th>
          <th style="${thStyle}">Thể loại</th>
          <th style="${thStyle}">Nhiệm vụ</th>
          <th style="${thStyle}">Minh chứng</th>
          <th style="${thStyle}">Nghiệm thu</th>
          <th style="${thStyle}">Kết quả (tiết)</th>
        </tr>
      </thead>
      <tbody>
        ${
          gt.length
            ? gt.map((d, i) => `<tr>
              <td style="${tdStyle}">${i+1}</td>
              <td style="${tdStyle}">${d.ten}</td>
              <td style="${tdStyle}">${d.loai}</td>
              <td style="${tdStyle}">${d.nhiemvu}</td>
              <td style="${tdStyle}">${d.minhchung}</td>
              <td style="${tdStyle}">${d.nghiemthu}</td>
              <td style="${tdStyle}">${d.ketqua}</td>
            </tr>`).join("")
            : `<tr><td colspan="7" style="${tdStyle}color:#888">Không có dữ liệu</td></tr>`
        }
      </tbody>
    </table>

    <div class="section-title">III. Bài báo</div>
    <table class="info-table">
      <thead>
        <tr>
          <th style="${thStyle}">STT</th>
          <th style="${thStyle}">Tên bài báo</th>
          <th style="${thStyle}">Thể loại</th>
          <th style="${thStyle}">Minh chứng</th>
          <th style="${thStyle}">Tác giả</th>
          <th style="${thStyle}">Nghiệm thu</th>
          <th style="${thStyle}">Kết quả (tiết)</th>
        </tr>
      </thead>
      <tbody>
        ${
          bb.length
            ? bb.map((d, i) => `<tr>
              <td style="${tdStyle}">${i+1}</td>
              <td style="${tdStyle}">${d.ten}</td>
              <td style="${tdStyle}">${d.loai}</td>
              <td style="${tdStyle}">${d.minhchung}</td>
              <td style="${tdStyle}">${d.tacgia}</td>
              <td style="${tdStyle}">${d.nghiemthu}</td>
              <td style="${tdStyle}">${d.ketqua}</td>
            </tr>`).join("")
            : `<tr><td colspan="7" style="${tdStyle}color:#888">Không có dữ liệu</td></tr>`
        }
      </tbody>
    </table>

    <div class="result">Tổng số tiết: ${
      detai.reduce((a,b)=>a+(parseInt(b.ketqua)||0),0)
      + gt.reduce((a,b)=>a+(parseInt(b.ketqua)||0),0)
      + bb.reduce((a,b)=>a+(parseInt(b.ketqua)||0),0)
    } - ${
      (detai.reduce((a,b)=>a+(parseInt(b.ketqua)||0),0)
      + gt.reduce((a,b)=>a+(parseInt(b.ketqua)||0),0)
      + bb.reduce((a,b)=>a+(parseInt(b.ketqua)||0),0)) >= 150 ? "Đạt" : "Không đạt"
    }</div>
    <div class="note">* Phiếu này được xuất tự động từ hệ thống vào ngày ${new Date().toLocaleDateString()}</div>
  </body>
  </html>`;
  return html;
}

document.getElementById("btnExportWord").onclick = function() {
  let html = getPrintHTML();
  // Đặt tên file theo kiểu Thong_tin_nhan_vien_ngay-thang-nam.doc
  let d = new Date();
  let yyyy = d.getFullYear();
  let mm = String(d.getMonth() + 1).padStart(2, '0');
  let dd = String(d.getDate()).padStart(2, '0');
  let fileName = `Thong_tin_nhan_vien_${dd}-${mm}-${yyyy}.doc`;

  let blob = new Blob(['\ufeff', html], {type: "application/msword"});
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --------- KHỞI TẠO BẢNG KHI VÀO TRANG ---------
window.addEventListener("DOMContentLoaded", function() {
  renderUserInfoTable();
  updateAllTables();
});
