/* ==============================================
   app.js - Toàn bộ logic của website quản lý tài liệu
   Phiên bản: 2025-10 (Người thực hiện + combobox + accordion)
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

async function saveDoc(type, no, note, executor, file, currentUser) {
  const docs = JSON.parse(localStorage.getItem('docs') || '{}');
  const list = docs[type] || [];
  const entry = {
    id: uid(),
    no,
    note,
    executor,
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

// ======= NGƯỜI THỰC HIỆN - COMBOBOX =======
const EXECUTOR_KEY = 'executors_list';

function getExecutors() {
  return JSON.parse(localStorage.getItem(EXECUTOR_KEY) || '[]');
}

function saveExecutors(list) {
  localStorage.setItem(EXECUTOR_KEY, JSON.stringify(list));
}

function createExecutorCombobox() {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = '100%';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'executor-input';
  input.placeholder = 'Chọn hoặc nhập người thực hiện';
  input.style.padding = '10px';
  input.style.borderRadius = '8px';
  input.style.border = '1px solid #d8e7ff';
  input.style.fontSize = '14px';
  input.style.width = '100%';
  input.style.height = '56px';
  input.style.boxSizing = 'border-box';
  
  const dropdown = document.createElement('div');
  dropdown.style.position = 'absolute';
  dropdown.style.top = '100%';
  dropdown.style.left = '0';
  dropdown.style.right = '0';
  dropdown.style.background = '#fff';
  dropdown.style.border = '1px solid #d8e7ff';
  dropdown.style.borderTop = 'none';
  dropdown.style.borderRadius = '0 0 8px 8px';
  dropdown.style.maxHeight = '200px';
  dropdown.style.overflowY = 'auto';
  dropdown.style.display = 'none';
  dropdown.style.zIndex = '1000';
  
  const updateDropdown = () => {
    dropdown.innerHTML = '';
    const executors = getExecutors();
    executors.forEach(name => {
      const item = document.createElement('div');
      item.textContent = name;
      item.style.padding = '10px 12px';
      item.style.cursor = 'pointer';
      item.style.borderBottom = '1px solid #f0f5ff';
      item.style.fontSize = '14px';
      item.onmouseover = () => item.style.background = '#f0f5ff';
      item.onmouseout = () => item.style.background = '#fff';
      item.onclick = () => {
        input.value = name;
        dropdown.style.display = 'none';
        input.focus();
      };
      dropdown.appendChild(item);
    });
  };
  
  updateDropdown();
  container.appendChild(input);
  container.appendChild(dropdown);
  
  input.addEventListener('focus', () => {
    updateDropdown();
    if (dropdown.children.length > 0) {
      dropdown.style.display = 'block';
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
  
  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    dropdown.innerHTML = '';
    const executors = getExecutors();
    const filtered = executors.filter(name => name.toLowerCase().includes(query));
    
    filtered.forEach(name => {
      const item = document.createElement('div');
      item.textContent = name;
      item.style.padding = '10px 12px';
      item.style.cursor = 'pointer';
      item.style.borderBottom = '1px solid #f0f5ff';
      item.style.fontSize = '14px';
      item.onmouseover = () => item.style.background = '#f0f5ff';
      item.onmouseout = () => item.style.background = '#fff';
      item.onclick = () => {
        input.value = name;
        dropdown.style.display = 'none';
        input.focus();
      };
      dropdown.appendChild(item);
    });
    
    if (filtered.length > 0) {
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  });
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newName = input.value.trim();
      if (newName !== '') {
        const executors = getExecutors();
        if (!executors.includes(newName)) {
          executors.push(newName);
          saveExecutors(executors);
          updateDropdown();
        }
        dropdown.style.display = 'none';
      }
    }
  });
  
  container.getExecutor = () => input.value;
  container.setExecutor = (val) => { input.value = val; };
  container.clearExecutor = () => { input.value = ''; };
  
  return container;
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
    <div class="executor-container"></div>
    <div>
      <div style="font-size:13px;color:#52657a;margin-bottom:6px">Định kèm</div>
      <input class="file-input" type="file">
      <div style="font-size:11px;color:#8b99b0;margin-top:2px" data-filehint></div>
    </div>
    <div class="row-actions">
      <button class="btn btn-primary save-btn">Lưu</button>
      <button class="btn btn-ghost remove-btn">Xóa</button>
    </div>
  `;

  const executorContainer = div.querySelector('.executor-container');
  const executorCombo = createExecutorCombobox();
  executorContainer.appendChild(executorCombo);

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

    const no = div.querySelector('.no-input').value.trim();
    const note = div.querySelector('.note-input').value.trim();
    const executor = executorCombo.getExecutor();
    const f = fileInput.files[0];

    if (!no) return alert('Vui lòng nhập số thứ tự!');
    if (!f) return alert('Vui lòng chọn tệp đính kèm!');

    const docs = JSON.parse(localStorage.getItem('docs') || '{}');
    const list = docs[type] || [];
    if (list.some(entry => entry.no === no)) {
      return alert(`Số thứ tự "${no}" đã tồn tại trong hệ thống. Vui lòng sử dụng số thứ tự khác!`);
    }

    if (type === 'banhanh' && f && !f.name.toLowerCase().endsWith('.pdf'))
      return alert('Chỉ chấp nhận file PDF');
    if (type !== 'banhanh' && f && !/\.(doc|docx)$/i.test(f.name))
      return alert('Chỉ chấp nhận .doc hoặc .docx');

    await saveDoc(type, no, note, executor, f, cur);
    alert('Đã lưu thành công!');
    fileInput.value = '';
    fileHint.textContent = '';
    executorCombo.clearExecutor();
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

// ======= LƯU TRỮ - ACCORDION =======
function renderArchive() {
  const main = document.getElementById('app-content');
  main.innerHTML = '<h2>Lưu trữ</h2>';
  
  // Khung tìm kiếm
  const searchContainer = document.createElement('div');
  searchContainer.style.marginBottom = '20px';
  searchContainer.style.display = 'flex';
  searchContainer.style.gap = '12px';
  searchContainer.style.flexWrap = 'wrap';
  
  // Dropdown chọn loại tài liệu
  const typeSelect = document.createElement('select');
  typeSelect.style.padding = '10px 12px';
  typeSelect.style.borderRadius = '8px';
  typeSelect.style.border = '1px solid #d8e7ff';
  typeSelect.style.fontSize = '14px';
  typeSelect.style.minWidth = '150px';
  typeSelect.style.cursor = 'pointer';
  typeSelect.innerHTML = `<option value="">-- Tất cả loại tài liệu --</option>`;
  TYPES.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = TYPE_LABEL[t];
    typeSelect.appendChild(opt);
  });
  
  // Khung nhập tìm kiếm
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Tìm kiếm số TT hoặc tên người thực hiện...';
  searchInput.style.flex = '1';
  searchInput.style.minWidth = '250px';
  searchInput.style.padding = '10px 12px';
  searchInput.style.borderRadius = '8px';
  searchInput.style.border = '1px solid #d8e7ff';
  searchInput.style.fontSize = '14px';
  
  searchContainer.appendChild(typeSelect);
  searchContainer.appendChild(searchInput);
  main.appendChild(searchContainer);
  
  const docs = JSON.parse(localStorage.getItem('docs') || '{}');
  const cur = getCurrentUser();

  const renderArchiveContent = (selectedType = '', searchQuery = '') => {
    const sections = main.querySelectorAll('.archive-section');
    sections.forEach(s => s.remove());
    
    // Xác định loại tài liệu cần hiển thị
    const typesToShow = selectedType ? [selectedType] : TYPES;
    
    typesToShow.forEach(t => {
      const sec = document.createElement('div');
      sec.className = 'archive-section';
      
      const header = document.createElement('div');
      header.style.cursor = 'pointer';
      header.style.padding = '14px';
      header.style.background = '#f0f5ff';
      header.style.borderRadius = '10px';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.userSelect = 'none';
      header.style.marginBottom = '12px';
      
      const list = docs[t] || [];
      
      // Lọc theo search query
      let filteredList = list;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        filteredList = list.filter(e => {
          const no = String(e.no).trim().toLowerCase();
          const executor = String(e.executor || '').trim().toLowerCase();
          return no.includes(query) || executor.includes(query);
        });
      }
      
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `<h3 style="margin:0;font-size:16px;color:#005F9E">📄 ${TYPE_LABEL[t]}</h3>
                            <div style="font-size:13px;color:#6b7a8a;margin-top:4px">Tổng số: ${filteredList.length}</div>`;
      
      const arrow = document.createElement('span');
      arrow.textContent = '▼';
      arrow.style.fontSize = '16px';
      arrow.style.color = '#005F9E';
      arrow.style.transition = 'transform 0.3s ease';
      
      header.appendChild(titleDiv);
      header.appendChild(arrow);
      sec.appendChild(header);
      
      const content = document.createElement('div');
      content.style.display = 'none';
      content.style.padding = '14px';
      content.style.border = '1px solid #e9f0fb';
      content.style.borderRadius = '10px';
      
      if (!filteredList.length) {
        content.innerHTML = '<div class="archive-empty">(Không có dữ liệu)</div>';
        sec.appendChild(content);
        main.appendChild(sec);
        
        header.onclick = () => {
          const isOpen = content.style.display !== 'none';
          content.style.display = isOpen ? 'none' : 'block';
          arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        };
        return;
      }

      const table = document.createElement('table');
      table.className = 'archive-table';
      table.innerHTML = '<tr><th>Số TT</th><th>Ghi chú</th><th>Người thực hiện</th><th>File</th><th>Ngày</th></tr>';

      filteredList.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${e.no || ''}</td>
          <td>${e.note || ''}</td>
          <td>${e.executor || ''}</td>
          <td>
            ${e.filename ? `<span style="color:#005F9E;font-weight:600;">${e.filename}</span> ` : ''}
            <button class="btn" style="color:white;background:#007BFF" data-action="download" data-type="${t}" data-id="${e.id}">
              ${e.filename ? 'Tải xuống' : 'Không có file'}
            </button>
            ${cur && cur.role === 'admin'
              ? `<button class="btn btn-ghost" data-action="delete" data-type="${t}" data-id="${e.id}">Xóa</button>`
              : ''}
          </td>
          <td style="font-size:12px;color:#6b7a8a">${new Date(e.createdAt).toLocaleString()}</td>
        `;
        table.appendChild(tr);
      });

      content.appendChild(table);
      sec.appendChild(content);
      main.appendChild(sec);

      header.onclick = () => {
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      };

      content.querySelectorAll('button[data-id]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.id;
          const type = btn.dataset.type;
          const action = btn.dataset.action;
          const docs = JSON.parse(localStorage.getItem('docs') || '{}');
          const list = docs[type] || [];
          const entry = list.find(x => x.id === id);

          if (action === 'download') downloadEntry(entry);
          else if (action === 'delete') {
            if (confirm(`Xóa "${entry.filename}"?`)) {
              const updated = list.filter(x => x.id !== id);
              docs[type] = updated;
              localStorage.setItem('docs', JSON.stringify(docs));
              renderArchive();
            }
          }
        };
      });
    });
  };
  
  renderArchiveContent();
  
  // Xử lý thay đổi
  typeSelect.addEventListener('change', () => {
    renderArchiveContent(typeSelect.value, searchInput.value);
  });
  
  searchInput.addEventListener('input', () => {
    renderArchiveContent(typeSelect.value, searchInput.value);
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
    tr.innerHTML = `<td>${e}</td><td>${u.scientist_name || ''}</td><td>${u.role}</td>
                    <td><input type="checkbox" ${u.allowSave !== false ? 'checked' : ''} data-email="${e}"></td>`;
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
  document.getElementById('btn-logout').onclick = () => { localStorage.removeItem('currentUser'); location = 'index.html'; };
}

function initAdminUI() {
  const cur = getCurrentUser();
  if (!cur || cur.role !== 'admin') { alert('Không có quyền'); location = 'index.html'; return; }
  renderMenu('quanly');
  navigateTo('quanly');
  document.getElementById('btn-logout').onclick = () => { localStorage.removeItem('currentUser'); location = 'index.html'; };
}

window.app = { initClientUI, initAdminUI, navigateTo };