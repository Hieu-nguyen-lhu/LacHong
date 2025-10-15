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

async function saveDoc(type, no, note, executor, file, currentUser, banhanhFile = null) {
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
    banhanhFilename: banhanhFile ? banhanhFile.name : '',
    banhanhFiletype: banhanhFile ? banhanhFile.type : '',
    banhanhFiledata: banhanhFile ? await fileToBase64(banhanhFile) : null,
    createdAt: new Date().toISOString(),
    authorEmail: currentUser ? currentUser.email : 'anonymous'
  };
  list.unshift(entry);
  docs[type] = list;
  localStorage.setItem('docs', JSON.stringify(docs));
  return entry;
}

function downloadEntry(entry, isBanhanh = false) {
  if (isBanhanh) {
    if (!entry || !entry.banhanhFiledata) return alert('Không có file ban hành để tải xuống.');
    const a = document.createElement('a');
    a.href = entry.banhanhFiledata;
    a.download = entry.banhanhFilename || 'banhanh';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    if (!entry || !entry.filedata) return alert('Không có file để tải xuống.');
    const a = document.createElement('a');
    a.href = entry.filedata;
    a.download = entry.filename || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
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

function canCurrentUserLogin(email) {
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const u = users[email];
  return u ? (u.allowLogin !== false) : false;
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
      <div style="font-size:13px;color:#52657a;margin-bottom:6px">Đính kèm</div>
      <input class="file-input" type="file">
      <div style="font-size:11px;color:#8b99b0;margin-top:2px" data-filehint></div>
    </div>
    <div>
      <div style="font-size:13px;color:#52657a;margin-bottom:6px">Đính kèm tệp ban hành</div>
      <input class="banhanh-file-input" type="file" accept=".pdf,application/pdf">
      <div style="font-size:11px;color:#8b99b0;margin-top:2px" data-banhanhfilehint></div>
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

  const banhanhFileInput = div.querySelector('.banhanh-file-input');
  const banhanhFileHint = div.querySelector('[data-banhanhfilehint]');
  banhanhFileInput.onchange = () => {
    const f = banhanhFileInput.files[0];
    banhanhFileHint.textContent = f ? `${f.name} (${Math.round(f.size / 1024)} KB)` : '';
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
    const banhanhFile = banhanhFileInput.files[0];

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

    if (banhanhFile && !banhanhFile.name.toLowerCase().endsWith('.pdf'))
      return alert('File ban hành chỉ chấp nhận định dạng PDF');

    await saveDoc(type, no, note, executor, f, cur, banhanhFile);
    alert('Đã lưu thành công!');
    fileInput.value = '';
    fileHint.textContent = '';
    banhanhFileInput.value = '';
    banhanhFileHint.textContent = '';
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

// ======= TRANG BAN HÀNH =======
function renderBanhanhPage() {
  const main = document.getElementById('app-content');
  main.innerHTML = '<h2>Ban hành</h2>';
  
  const BANHANH_TYPES = ['totrinh', 'quyetdinh', 'khenthuong', 'baocao'];
  
  // Tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.style.display = 'flex';
  tabsContainer.style.gap = '8px';
  tabsContainer.style.marginBottom = '20px';
  tabsContainer.style.borderBottom = '2px solid #e9f0fb';
  tabsContainer.style.paddingBottom = '0';
  
  BANHANH_TYPES.forEach(t => {
    const tab = document.createElement('button');
    tab.textContent = TYPE_LABEL[t];
    tab.style.padding = '12px 24px';
    tab.style.border = 'none';
    tab.style.background = 'transparent';
    tab.style.cursor = 'pointer';
    tab.style.fontSize = '15px';
    tab.style.fontWeight = '500';
    tab.style.color = '#6b7a8a';
    tab.style.borderBottom = '3px solid transparent';
    tab.style.transition = 'all 0.3s';
    tab.dataset.type = t;
    
    tab.onmouseover = () => {
      if (tab.dataset.active !== 'true') {
        tab.style.color = '#005F9E';
      }
    };
    tab.onmouseout = () => {
      if (tab.dataset.active !== 'true') {
        tab.style.color = '#6b7a8a';
      }
    };
    
    tabsContainer.appendChild(tab);
  });
  
  main.appendChild(tabsContainer);
  
  // Khung tìm kiếm
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Tìm kiếm số TT...';
  searchInput.style.width = '100%';
  searchInput.style.padding = '10px 12px';
  searchInput.style.borderRadius = '8px';
  searchInput.style.border = '1px solid #d8e7ff';
  searchInput.style.fontSize = '14px';
  searchInput.style.marginBottom = '20px';
  
  main.appendChild(searchInput);
  
  const contentArea = document.createElement('div');
  main.appendChild(contentArea);
  
  const cur = getCurrentUser();

  const renderContent = (selectedType, searchQuery = '') => {
    contentArea.innerHTML = '';
    
    const docs = JSON.parse(localStorage.getItem('docs') || '{}');
    
    // Cập nhật active tab
    tabsContainer.querySelectorAll('button').forEach(btn => {
      if (btn.dataset.type === selectedType) {
        btn.style.color = '#005F9E';
        btn.style.borderBottom = '3px solid #005F9E';
        btn.dataset.active = 'true';
      } else {
        btn.style.color = '#6b7a8a';
        btn.style.borderBottom = '3px solid transparent';
        btn.dataset.active = 'false';
      }
    });
    
    const list = docs[selectedType] || [];
    
    // Chỉ lấy các tài liệu có file ban hành
    let filteredList = list.filter(e => e.banhanhFilename && e.banhanhFiledata);
    
    // Lọc theo search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.trim();
      filteredList = filteredList.filter(e => {
        const no = String(e.no).trim();
        return no === query;
      });
    }
    
    // Header với nút dropdown
    const headerContainer = document.createElement('div');
    headerContainer.style.display = 'flex';
    headerContainer.style.justifyContent = 'space-between';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.padding = '14px';
    headerContainer.style.background = '#f0f5ff';
    headerContainer.style.borderRadius = '10px';
    headerContainer.style.marginBottom = '12px';
    headerContainer.style.cursor = 'pointer';
    headerContainer.style.userSelect = 'none';
    
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `<h3 style="margin:0;font-size:16px;color:#005F9E">📄 ${TYPE_LABEL[selectedType]}</h3>
                          <div style="font-size:13px;color:#6b7a8a;margin-top:4px">Tổng số: ${filteredList.length}</div>`;
    
    const arrow = document.createElement('span');
    arrow.textContent = '▼';
    arrow.style.fontSize = '16px';
    arrow.style.color = '#005F9E';
    arrow.style.transition = 'transform 0.3s ease';
    arrow.style.transform = 'rotate(180deg)';
    
    headerContainer.appendChild(titleDiv);
    headerContainer.appendChild(arrow);
    contentArea.appendChild(headerContainer);
    
    const tableContainer = document.createElement('div');
    tableContainer.style.display = 'block';
    tableContainer.style.transition = 'all 0.3s ease';
    
    if (!filteredList.length) {
      tableContainer.innerHTML = '<div class="archive-empty" style="padding:40px;text-align:center;color:#6b7a8a">(Không có tài liệu ban hành)</div>';
      contentArea.appendChild(tableContainer);
      
      headerContainer.onclick = () => {
        const isOpen = tableContainer.style.display !== 'none';
        tableContainer.style.display = isOpen ? 'none' : 'block';
        arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      };
      return;
    }

    const table = document.createElement('table');
    table.className = 'archive-table';
    table.innerHTML = '<tr><th>Số TT</th><th>Văn bản ban hành</th><th>Ngày</th></tr>';

    filteredList.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;color:#005F9E">${e.no || ''}</td>
        <td>
          <span style="color:#005F9E;font-weight:600;">${e.banhanhFilename}</span><br>
          <button class="btn" style="color:white;background:#28a745;margin-top:4px" data-action="download-banhanh" data-type="${selectedType}" data-id="${e.id}">Tải xuống</button>
          ${cur && cur.role === 'admin' ? `<button class="btn btn-ghost" style="margin-top:4px;margin-left:8px" data-action="delete-banhanh" data-type="${selectedType}" data-id="${e.id}">Xóa file BH</button>` : ''}
        </td>
        <td style="font-size:12px;color:#6b7a8a">${new Date(e.createdAt).toLocaleString()}</td>
      `;
      table.appendChild(tr);
    });

    tableContainer.appendChild(table);
    contentArea.appendChild(tableContainer);
    
    headerContainer.onclick = () => {
      const isOpen = tableContainer.style.display !== 'none';
      tableContainer.style.display = isOpen ? 'none' : 'block';
      arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    };

    table.querySelectorAll('button[data-id]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        const action = btn.dataset.action;
        const docs = JSON.parse(localStorage.getItem('docs') || '{}');
        const list = docs[type] || [];
        const entry = list.find(x => x.id === id);
        
        if (action === 'download-banhanh') {
          downloadEntry(entry, true);
        } else if (action === 'delete-banhanh') {
          if (confirm(`Xóa file ban hành "${entry.banhanhFilename}"?\n\nLưu ý: Chỉ xóa file ban hành, tài liệu gốc vẫn còn.`)) {
            // Chỉ xóa file ban hành, giữ lại tài liệu
            entry.banhanhFilename = '';
            entry.banhanhFiletype = '';
            entry.banhanhFiledata = null;
            
            // Cập nhật lại localStorage
            const updated = list.map(x => x.id === id ? entry : x);
            docs[type] = updated;
            localStorage.setItem('docs', JSON.stringify(docs));
            
            // Render lại
            renderContent(selectedType, searchInput.value);
            alert('Đã xóa file ban hành!');
          }
        }
      };
    });
  };
  
  renderContent(BANHANH_TYPES[0]);
  
  tabsContainer.querySelectorAll('button').forEach(tab => {
    tab.onclick = () => {
      renderContent(tab.dataset.type, searchInput.value);
    };
  });
  
  searchInput.addEventListener('input', () => {
    const activeTab = tabsContainer.querySelector('[data-active="true"]');
    if (activeTab) {
      renderContent(activeTab.dataset.type, searchInput.value);
    }
  });
}

// ======= LƯU TRỮ - TABS =======
function renderArchive() {
  const main = document.getElementById('app-content');
  main.innerHTML = '<h2>Lưu trữ</h2>';
  
  // Tabs cho các loại tài liệu
  const tabsContainer = document.createElement('div');
  tabsContainer.style.display = 'flex';
  tabsContainer.style.gap = '8px';
  tabsContainer.style.marginBottom = '20px';
  tabsContainer.style.borderBottom = '2px solid #e9f0fb';
  tabsContainer.style.paddingBottom = '0';
  
  TYPES.forEach(t => {
    const tab = document.createElement('button');
    tab.textContent = TYPE_LABEL[t];
    tab.style.padding = '12px 24px';
    tab.style.border = 'none';
    tab.style.background = 'transparent';
    tab.style.cursor = 'pointer';
    tab.style.fontSize = '15px';
    tab.style.fontWeight = '500';
    tab.style.color = '#6b7a8a';
    tab.style.borderBottom = '3px solid transparent';
    tab.style.transition = 'all 0.3s';
    tab.dataset.type = t;
    
    tab.onmouseover = () => {
      if (tab.dataset.active !== 'true') {
        tab.style.color = '#005F9E';
      }
    };
    tab.onmouseout = () => {
      if (tab.dataset.active !== 'true') {
        tab.style.color = '#6b7a8a';
      }
    };
    
    tabsContainer.appendChild(tab);
  });
  
  main.appendChild(tabsContainer);
  
  // Khung tìm kiếm
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Tìm kiếm số TT hoặc tên người thực hiện...';
  searchInput.style.width = '100%';
  searchInput.style.padding = '10px 12px';
  searchInput.style.borderRadius = '8px';
  searchInput.style.border = '1px solid #d8e7ff';
  searchInput.style.fontSize = '14px';
  searchInput.style.marginBottom = '20px';
  
  main.appendChild(searchInput);
  
  const contentArea = document.createElement('div');
  main.appendChild(contentArea);
  
  const cur = getCurrentUser();

  const renderContent = (selectedType, searchQuery = '') => {
    contentArea.innerHTML = '';
    
    // Load lại dữ liệu mỗi lần render
    const docs = JSON.parse(localStorage.getItem('docs') || '{}');
    
    // Cập nhật active tab
    tabsContainer.querySelectorAll('button').forEach(btn => {
      if (btn.dataset.type === selectedType) {
        btn.style.color = '#005F9E';
        btn.style.borderBottom = '3px solid #005F9E';
        btn.dataset.active = 'true';
      } else {
        btn.style.color = '#6b7a8a';
        btn.style.borderBottom = '3px solid transparent';
        btn.dataset.active = 'false';
      }
    });
    
    const list = docs[selectedType] || [];
    
    // Lọc theo search query
    let filteredList = list;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.trim();
      filteredList = list.filter(e => {
        const no = String(e.no).trim();
        const executor = String(e.executor || '').trim().toLowerCase();
        const queryLower = query.toLowerCase();
        
        const noMatch = no === query;
        const executorMatch = executor.includes(queryLower);
        
        return noMatch || executorMatch;
      });
    }
    
    // Header với nút dropdown
    const headerContainer = document.createElement('div');
    headerContainer.style.display = 'flex';
    headerContainer.style.justifyContent = 'space-between';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.padding = '14px';
    headerContainer.style.background = '#f0f5ff';
    headerContainer.style.borderRadius = '10px';
    headerContainer.style.marginBottom = '12px';
    headerContainer.style.cursor = 'pointer';
    headerContainer.style.userSelect = 'none';
    
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `<h3 style="margin:0;font-size:16px;color:#005F9E">📄 ${TYPE_LABEL[selectedType]}</h3>
                          <div style="font-size:13px;color:#6b7a8a;margin-top:4px">Tổng số: ${filteredList.length}</div>`;
    
    const arrow = document.createElement('span');
    arrow.textContent = '▼';
    arrow.style.fontSize = '16px';
    arrow.style.color = '#005F9E';
    arrow.style.transition = 'transform 0.3s ease';
    arrow.style.transform = 'rotate(180deg)'; // Mặc định mở
    
    headerContainer.appendChild(titleDiv);
    headerContainer.appendChild(arrow);
    contentArea.appendChild(headerContainer);
    
    // Container cho bảng
    const tableContainer = document.createElement('div');
    tableContainer.style.display = 'block'; // Mặc định hiển thị
    tableContainer.style.transition = 'all 0.3s ease';
    
    if (!filteredList.length) {
      tableContainer.innerHTML = '<div class="archive-empty" style="padding:40px;text-align:center;color:#6b7a8a">(Không có dữ liệu)</div>';
      contentArea.appendChild(tableContainer);
      
      headerContainer.onclick = () => {
        const isOpen = tableContainer.style.display !== 'none';
        tableContainer.style.display = isOpen ? 'none' : 'block';
        arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      };
      return;
    }

    const table = document.createElement('table');
    table.className = 'archive-table';
    table.innerHTML = '<tr><th>Số TT</th><th>Nội dung</th><th>Văn bản</th><th>Văn bản ban hành</th><th>Người thực hiện</th><th>Ngày</th></tr>';

    filteredList.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${e.no || ''}</td>
        <td>${e.note || ''}</td>
        <td>
          ${e.filename ? `<span style="color:#005F9E;font-weight:600;">${e.filename}</span><br>` : ''}
          <button class="btn" style="color:white;background:#007BFF;margin-top:4px" data-action="download" data-type="${selectedType}" data-id="${e.id}">
            ${e.filename ? 'Tải xuống' : 'Không có file'}
          </button>
        </td>
        <td>
          ${e.banhanhFilename ? `<span style="color:#005F9E;font-weight:600;">${e.banhanhFilename}</span><br>` : ''}
          ${e.banhanhFilename ? `<button class="btn" style="color:white;background:#28a745;margin-top:4px" data-action="download-banhanh" data-type="${selectedType}" data-id="${e.id}">Tải xuống</button>` : '<span style="color:#999">Không có file</span>'}
        </td>
        <td>${e.executor || ''}</td>
        <td style="font-size:12px;color:#6b7a8a">
          ${new Date(e.createdAt).toLocaleString()}
          ${cur && cur.role === 'admin' ? `<br><button class="btn btn-ghost" style="margin-top:4px" data-action="delete" data-type="${selectedType}" data-id="${e.id}">Xóa</button>` : ''}
        </td>
      `;
      table.appendChild(tr);
    });

    tableContainer.appendChild(table);
    contentArea.appendChild(tableContainer);
    
    // Xử lý click dropdown
    headerContainer.onclick = () => {
      const isOpen = tableContainer.style.display !== 'none';
      tableContainer.style.display = isOpen ? 'none' : 'block';
      arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    };

    table.querySelectorAll('button[data-id]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        const action = btn.dataset.action;
        const docs = JSON.parse(localStorage.getItem('docs') || '{}');
        const list = docs[type] || [];
        const entry = list.find(x => x.id === id);

        if (action === 'download') downloadEntry(entry);
        else if (action === 'download-banhanh') downloadEntry(entry, true);
        else if (action === 'delete') {
          if (confirm(`Xóa "${entry.filename}"?`)) {
            const updated = list.filter(x => x.id !== id);
            docs[type] = updated;
            localStorage.setItem('docs', JSON.stringify(docs));
            renderContent(selectedType, searchInput.value);
          }
        }
      };
    });
  };
  
  // Mặc định hiển thị tab đầu tiên
  renderContent(TYPES[0]);
  
  // Xử lý click tab
  tabsContainer.querySelectorAll('button').forEach(tab => {
    tab.onclick = () => {
      renderContent(tab.dataset.type, searchInput.value);
    };
  });
  
  // Xử lý tìm kiếm
  searchInput.addEventListener('input', () => {
    const activeTab = tabsContainer.querySelector('[data-active="true"]');
    if (activeTab) {
      renderContent(activeTab.dataset.type, searchInput.value);
    }
  });
}

// ======= QUẢN LÝ NGƯỜI DÙNG =======
function renderAdminPage() {
  const main = document.getElementById('app-content');
  main.innerHTML = '<h2>Quản lý người dùng</h2>';
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const t = document.createElement('table');
  t.className = 'user-table';
  t.innerHTML = '<tr><th>Email</th><th>Tên</th><th>Vai trò</th><th>Cho phép lưu</th><th>Cho phép đăng nhập</th></tr>';
  Object.keys(users).forEach(e => {
    const u = users[e];
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${e}</td><td>${u.scientist_name || ''}</td><td>${u.role}</td>
                    <td><input type="checkbox" ${u.allowSave !== false ? 'checked' : ''} data-email="${e}" data-action="save"></td>
                    <td><input type="checkbox" ${u.allowLogin !== false ? 'checked' : ''} data-email="${e}" data-action="login"></td>`;
    t.appendChild(tr);
  });
  main.appendChild(t);
  t.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.onchange = () => {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const u = users[cb.dataset.email];
      if (!u) return;
      
      if (cb.dataset.action === 'save') {
        u.allowSave = cb.checked;
        localStorage.setItem('users', JSON.stringify(users));
        alert('Đã cập nhật quyền lưu cho ' + cb.dataset.email);
      } else if (cb.dataset.action === 'login') {
        u.allowLogin = cb.checked;
        localStorage.setItem('users', JSON.stringify(users));
        alert('Đã cập nhật quyền đăng nhập cho ' + cb.dataset.email);
        
        // Nếu bỏ quyền đăng nhập và đó là user hiện tại, đăng xuất
        const cur = getCurrentUser();
        if (!cb.checked && cur && cur.email === cb.dataset.email) {
          alert('Tài khoản của bạn đã bị vô hiệu hóa. Bạn sẽ bị đăng xuất.');
          localStorage.removeItem('currentUser');
          location = 'index.html';
        }
      }
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
  else if (r === 'banhanh') renderBanhanhPage();
  else if (r === 'quanly') renderAdminPage();
  else if (TYPES.includes(r)) renderDocEntryPage(r);
}

// ======= KHỞI TẠO =======
function initClientUI() {
  const cur = getCurrentUser();
  if (!cur) { alert('Vui lòng đăng nhập'); location = 'index.html'; return; }
  if (!canCurrentUserLogin(cur.email)) { 
    alert('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
    localStorage.removeItem('currentUser');
    location = 'index.html'; 
    return; 
  }
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