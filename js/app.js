/* ==============================================
   app.js - Toàn bộ logic của website quản lý tài liệu
   Phiên bản: 2025-10
   ============================================== */

const TYPES = ['totrinh', 'quyetdinh', 'khenthuong', 'baocao', 'banhanh'];
const TYPE_LABEL = {
  totrinh: 'Tờ trình',
  quyetdinh: 'Quyết định',
  khenthuong: 'Khen thưởng',
  baocao: 'Báo cáo',
  banhanh: 'Ban hành'
};

// ======= Helper =======
function uid() { return 'id_' + Math.random().toString(36).slice(2, 9); }

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

async function saveDoc(type, no, note, file, currentUser) {
  const docs = JSON.parse(localStorage.getItem('docs') || '{}');
  const list = docs[type] || [];
  const entry = {
    id: uid(),
    no,
    note,
    filename: file ? file.name : '',
    filetype: file ? file.type : '',
    filedata: file ? await fileToBase64(file) : null,
    createdAt: new Date().toISOString(),
    authorEmail: currentUser ? currentUser.email : 'anonymous'
  };
  list.unshift(entry);
  docs[type] = list;
  localStorage.setItem('docs', JSON.stringify(docs));
  return entry;
}

function downloadEntry(entry) {
  if (!entry || !entry.filedata) return alert('Không có file để tải xuống.');
  const a = document.createElement('a');
  a.href = entry.filedata;
  a.download = entry.filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
  catch { return null; }
}

function canCurrentUserSave() {
  const cur = getCurrentUser();
  if (!cur) return false;
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const u = users[cur.email];
  return u ? (u.allowSave !== false) : false;
}

// ======= MENU =======
function renderMenu(activeKey) {
  const menu = document.getElementById('app-menu');
  menu.innerHTML = '';
  const items = [
    { k: 'totrinh', t: 'Tờ trình' },
    { k: 'quyetdinh', t: 'Quyết định' },
    { k: 'khenthuong', t: 'Khen thưởng' },
    { k: 'baocao', t: 'Báo cáo' },
    { k: 'banhanh', t: 'Ban hành' },
    { k: 'luutru', t: 'Lưu trữ' }
  ];
  const cur = getCurrentUser();
  if (cur && cur.role === 'admin') items.push({ k: 'quanly', t: 'Quản lý' });
  items.forEach(it => {
    const a = document.createElement('a');
    a.href = 'javascript:void(0)';
    a.textContent = it.t;
    a.dataset.key = it.k;
    a.className = (it.k === activeKey) ? 'active' : '';
    a.onclick = () => navigateTo(it.k);
    menu.appendChild(a);
  });
}

// ======= FORM NHẬP =======
function createRowCard(type) {
  const div = document.createElement('div');
  div.className = 'row-card';
  div.innerHTML = `
    <input type="number" class="no-input" placeholder="Số thứ tự">
    <textarea class="note-input" placeholder="Ghi chú..."></textarea>
    <div>
      <div style="font-size:13px;color:#52657a;margin-bottom:6px">Đính kèm</div>
      <input class="file-input" type="file">
      <div style="font-size:12px;color:#8b99b0;margin-top:6px" data-filehint></div>
    </div>
    <div class="row-actions">
      <button class="btn btn-primary save-btn">Lưu</button>
      <button class="btn btn-ghost remove-btn">Xóa</button>
    </div>
  `;

  const fileInput = div.querySelector('.file-input');
  fileInput.accept = type === 'banhanh'
    ? '.pdf,application/pdf'
    : '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const fileHint = div.querySelector('[data-filehint]');
  fileInput.onchange = () => {
    const f = fileInput.files[0];
    fileHint.textContent = f ? `${f.name} (${Math.round(f.size / 1024)} KB)` : '';
  };

  div.querySelector('.remove-btn').onclick = () => div.remove();
  div.querySelector('.save-btn').onclick = async () => {
    const cur = getCurrentUser();
    if (!cur) return alert('Chưa đăng nhập.');
    if (!canCurrentUserSave()) return alert('Bạn không có quyền lưu.');

    const no = div.querySelector('.no-input').value;
    const note = div.querySelector('.note-input').value;
    const f = fileInput.files[0];

    // validate file
    if (type === 'banhanh' && f && !f.name.toLowerCase().endsWith('.pdf'))
      return alert('Chỉ chấp nhận file PDF');
    if (type !== 'banhanh' && f && !/\.(doc|docx)$/i.test(f.name))
      return alert('Chỉ chấp nhận .doc hoặc .docx');

    await saveDoc(type, no, note, f, cur);
    alert('Đã lưu thành công!');
    fileInput.value = '';
    fileHint.textContent = '';
    if (currentRoute === 'luutru') renderArchive();
  };

  return div;
}

// ======= TRANG NHẬP DỮ LIỆU =======
function renderDocEntryPage(type) {
  const main = document.getElementById('app-content');
  main.innerHTML = `<h2>${TYPE_LABEL[type]}</h2>`;
  const area = document.createElement('div');
  area.id = `form-${type}`;
  area.appendChild(createRowCard(type));
  main.appendChild(area);

  const add = document.createElement('div');
  add.className = 'add-row';
  const btn = document.createElement('button');
  btn.className = 'btn btn-yellow';
  btn.textContent = '➕ Thêm';
  btn.onclick = () => area.appendChild(createRowCard(type));
  add.appendChild(btn);
  main.appendChild(add);
}

// ======= LƯU TRỮ =======
function renderArchive() {
  const main = document.getElementById('app-content');
  main.innerHTML = '<h2>Lưu trữ</h2>';
  const docs = JSON.parse(localStorage.getItem('docs') || '{}');
  const cur = getCurrentUser();

  TYPES.forEach(t => {
    const sec = document.createElement('div');
    sec.className = 'archive-section';
    sec.innerHTML = `<h3>📄 ${TYPE_LABEL[t]}</h3>
                     <div>Tổng số: ${(docs[t] || []).length}</div>`;

    const list = docs[t] || [];
    if (!list.length) {
      sec.innerHTML += '<div class="archive-empty">(Chưa có dữ liệu)</div>';
      main.appendChild(sec);
      return;
    }

    const table = document.createElement('table');
    table.className = 'archive-table';
    table.innerHTML = '<tr><th>Số TT</th><th>Ghi chú</th><th>File</th><th>Ngày</th></tr>';

    list.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${e.no || ''}</td>
        <td>${e.note || ''}</td>
        <td>
          ${e.filename ? `<span style="color:#005F9E;font-weight:600;">${e.filename}</span> ` : ''}
          <button class="btn" style="color:white;background:#007BFF" data-action="download" data-type="${t}" data-id="${e.id}">
            ${e.filename ? 'Tải xuống' : 'Không có file'}
          </button>
          ${cur && cur.role === 'admin'
            ? `<button class="btn btn-ghost"
                data-action="delete" data-type="${t}" data-id="${e.id}">Xóa</button>`
            : ''}
        </td>
        <td style="font-size:12px;color:#6b7a8a">${new Date(e.createdAt).toLocaleString()}</td>
      `;
      table.appendChild(tr);
    });

    sec.appendChild(table);
    main.appendChild(sec);

    // event buttons
    sec.querySelectorAll('button[data-id]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        const action = btn.dataset.action;
        const docs = JSON.parse(localStorage.getItem('docs') || '{}');
        const list = docs[type] || [];
        const entry = list.find(x => x.id === id);

        if (action === 'download') {
          downloadEntry(entry);
        } else if (action === 'delete') {
          if (confirm(`Xác nhận xóa tài liệu "${entry.filename}" ?`)) {
            const updated = list.filter(x => x.id !== id);
            docs[type] = updated;
            localStorage.setItem('docs', JSON.stringify(docs));
            alert('Đã xóa tài liệu.');
            renderArchive();
          }
        }
      };
    });
  });
}

// ======= QUẢN LÝ NGƯỜI DÙNG =======
function renderAdminPage() {
  const main = document.getElementById('app-content');
  main.innerHTML = '<h2>Quản lý người dùng</h2>';
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  const t = document.createElement('table');
  t.className = 'user-table';
  t.innerHTML = '<tr><th>Email</th><th>Tên</th><th>Vai trò</th><th>Cho phép lưu</th></tr>';

  Object.keys(users).forEach(e => {
    const u = users[e];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e}</td>
      <td>${u.scientist_name || ''}</td>
      <td>${u.role}</td>
      <td><input type="checkbox" ${u.allowSave !== false ? 'checked' : ''} data-email="${e}"></td>
    `;
    t.appendChild(tr);
  });

  main.appendChild(t);
  t.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.onchange = () => {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const u = users[cb.dataset.email];
      if (!u) return;
      u.allowSave = cb.checked;
      localStorage.setItem('users', JSON.stringify(users));
      alert('Đã cập nhật quyền cho ' + cb.dataset.email);
    };
  });

  const docs = JSON.parse(localStorage.getItem('docs') || '{}');
  const sum = document.createElement('div');
  sum.style.marginTop = '16px';
  sum.innerHTML = '<h3>Thống kê tài liệu</h3>';
  TYPES.forEach(t => {
    const c = document.createElement('div');
    c.textContent = `${TYPE_LABEL[t]}: ${(docs[t] || []).length} tài liệu`;
    sum.appendChild(c);
  });
  main.appendChild(sum);
}

// ======= ĐIỀU HƯỚNG =======
let currentRoute = 'totrinh';
function navigateTo(r) {
  currentRoute = r;
  document.querySelectorAll('#app-menu a')
    .forEach(a => a.classList.toggle('active', a.dataset.key === r));

  if (r === 'luutru') renderArchive();
  else if (r === 'banhanh') renderDocEntryPage('banhanh');
  else if (r === 'quanly') renderAdminPage();
  else if (TYPES.includes(r)) renderDocEntryPage(r);
}

// ======= KHỞI TẠO =======
function initClientUI() {
  const cur = getCurrentUser();
  if (!cur) { alert('Vui lòng đăng nhập'); location = 'index.html'; return; }
  renderMenu('totrinh');
  navigateTo('totrinh');
  document.getElementById('btn-logout').onclick = () => {
    localStorage.removeItem('currentUser');
    location = 'index.html';
  };
}

function initAdminUI() {
  const cur = getCurrentUser();
  if (!cur || cur.role !== 'admin') { alert('Không có quyền'); location = 'index.html'; return; }
  renderMenu('quanly');
  navigateTo('quanly');
  document.getElementById('btn-logout').onclick = () => {
    localStorage.removeItem('currentUser');
    location = 'index.html';
  };
}

window.app = { initClientUI, initAdminUI, navigateTo };
