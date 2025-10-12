// === QUẢN LÝ GIẢI THƯỞNG ===

// Đảm bảo có user
if (!localStorage.getItem('loggedInUser')) {
  localStorage.setItem('loggedInUser', 'guest');
}

// Khai báo biến lưu Base64
let ghiChuBase64 = "";

// ✅ Lấy các nút & input
const btnUpload = document.getElementById('btnUpload');
const fileInput = document.getElementById('fileInput');
const fileNameSpan = document.getElementById('fileName');

// ✅ Gán sự kiện chọn file ở NGOÀI submit
btnUpload.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      ghiChuBase64 = e.target.result;
      fileNameSpan.textContent = file.name;
    };
    reader.readAsDataURL(file);
  }
});

// ✅ Sự kiện submit form
document.getElementById('awardForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = e.target;

  const newAward = {
    awardId: Date.now(),
    title: form.elements['tenDeTai'].value.trim(),
    tenCuocThi: form.elements['tenCuocThi'].value.trim(),
    tacGia: form.elements['tacGia'].value.trim(),
    diaChi: form.elements['donVi'].value.trim(),
    datGiai: form.elements['datGiai'].value.trim(),
    tien: form.elements['tien'].value.trim(),
    minhChung: ghiChuBase64 ? [ghiChuBase64] : [],
    link: form.elements['link'].value.trim(),
    status: 'pending',
    user: localStorage.getItem('loggedInUser')
  };

  // Lưu user riêng
  let users = JSON.parse(localStorage.getItem('users')) || {};
  const viewingUser = newAward.user;
  if (!users[viewingUser]) {
    users[viewingUser] = { awards: [] };
  }
  if (!Array.isArray(users[viewingUser].awards)) {
    users[viewingUser].awards = [];
  }
  users[viewingUser].awards.push(newAward);
  localStorage.setItem('users', JSON.stringify(users));

  // Lưu global
  let globalAwards = JSON.parse(localStorage.getItem('awards')) || [];
  globalAwards.push(newAward);
  localStorage.setItem('awards', JSON.stringify(globalAwards));

  alert('Đã lưu giải thưởng!');

  form.reset();
  fileInput.value = "";
  fileNameSpan.textContent = "Chưa chọn file";
  ghiChuBase64 = "";

  renderAwardTable();
  renderApprovedAwards();
});

// SỬA: Bảng chờ xét duyệt - lấy từ global awards, chỉ của user hiện tại
function renderAwardTable() {
  const viewingUser = localStorage.getItem('loggedInUser');
  const globalAwards = JSON.parse(localStorage.getItem('awards')) || [];
  // Lấy các giải thưởng của user hiện tại, status pending
  const pendingAwards = globalAwards.filter(a => a.user === viewingUser && a.status === 'pending');

  const tbody = document.getElementById('awardTableBody');
  tbody.innerHTML = '';

  if (pendingAwards.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:#888;">Không có giải thưởng chờ duyệt</td></tr>`;
    return;
  }

  pendingAwards.forEach((award, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${award.title}</td>
      <td>${award.tenCuocThi}</td>
      <td>${award.tacGia}</td>
      <td>${award.diaChi}</td>
      <td>${award.datGiai}</td>
      <td>${award.tien}</td>
      <td>${(award.minhChung && award.minhChung.length) ? `<img src="${award.minhChung[0]}" alt="Minh chứng" width="50">` : 'Không có'}</td>
      <td><a href="${award.link}" target="_blank">Link</a></td>
      <td>Chờ xét duyệt</td>
      <td><button onclick="deleteAward(${award.awardId})">Xóa</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Bảng đã duyệt - lấy từ global awards, chỉ của user hiện tại
function renderApprovedAwards() {
  const viewingUser = localStorage.getItem('loggedInUser');
  const globalAwards = JSON.parse(localStorage.getItem('awards')) || [];
  const approved = globalAwards.filter(a => a.user === viewingUser && a.status === 'approved');

  const tbody = document.getElementById('awardApprovedTableBody');
  tbody.innerHTML = '';

  if (approved.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:#888;">Không có giải thưởng đã duyệt</td></tr>`;
    return;
  }

  approved.forEach((award, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${award.title}</td>
      <td>${award.tenCuocThi}</td>
      <td>${award.tacGia}</td>
      <td>${award.diaChi}</td>
      <td>${award.datGiai}</td>
      <td>${award.tien}</td>
      <td>${(award.minhChung && award.minhChung.length) ? `<img src="${award.minhChung[0]}" alt="Minh chứng" width="50">` : 'Không có'}</td>
      <td><a href="${award.link}" target="_blank">Link</a></td>
      <td>Đã xét duyệt</td>
    `;
    tbody.appendChild(tr);
  });
}

// Xóa
function deleteAward(id) {
  let users = JSON.parse(localStorage.getItem('users')) || {};
  let global = JSON.parse(localStorage.getItem('awards')) || [];
  const viewingUser = localStorage.getItem('loggedInUser');

  // Xóa ở mảng user
  if (users[viewingUser] && Array.isArray(users[viewingUser].awards)) {
    users[viewingUser].awards = users[viewingUser].awards.filter(a => a.awardId != id);
  }
  // Xóa ở mảng global
  global = global.filter(a => !(a.awardId == id && a.user === viewingUser));

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('awards', JSON.stringify(global));

  alert('Đã xóa!');
  renderAwardTable();
  renderApprovedAwards();
}

window.addEventListener('load', () => {
  renderAwardTable();
  renderApprovedAwards();
});
