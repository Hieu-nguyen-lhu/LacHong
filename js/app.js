/* ==============================================
   app.js - Toàn bộ logic của website quản lý tài liệu
   Phiên bản: 2025-10 (IndexedDB + Người thực hiện + combobox + accordion + Năm + Ghi chú Admin)
   ============================================== */

const TYPES = ['totrinh', 'quyetdinh', 'khenthuong', 'baocao'];
const TYPE_LABEL = {
  totrinh: 'Tờ trình',
  quyetdinh: 'Quyết định',
  khenthuong: 'Khen thưởng',
  baocao: 'Báo cáo',
};

// ======= Helper với IndexedDB =======
const DB_NAME = 'DocumentDB';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

function uid() { 
  return 'id_' + Math.random().toString(36).slice(2, 9) + Date.now(); 
}

// Lấy năm hiện tại
function getCurrentYear() {
  return new Date().getFullYear();
}

// Khởi tạo IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('no', 'no', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

// Lưu document (THAY THẾ localStorage)
async function saveDoc(type, no, note, executor, file, currentUser, banhanhFile = null, year = null, adminNote = '') {
  try {
    const db = await initDB();
    
    const entry = {
      id: uid(),
      type: type,
      no: no,
      note: note,
      executor: executor,
      year: year || getCurrentYear(),
      adminNote: adminNote || '',
      filename: file ? file.name : '',
      filetype: file ? file.type : '',
      filesize: file ? file.size : 0,
      fileBlob: file || null, // Lưu trực tiếp File object
      banhanhFilename: banhanhFile ? banhanhFile.name : '',
      banhanhFiletype: banhanhFile ? banhanhFile.type : '',
      banhanhFilesize: banhanhFile ? banhanhFile.size : 0,
      banhanhFileBlob: banhanhFile || null,
      createdAt: new Date().toISOString(),
      authorEmail: currentUser ? currentUser.email : 'anonymous'
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(entry);
      
      request.onsuccess = () => resolve(entry);
      request.onerror = () => {
        if (request.error.name === 'QuotaExceededError') {
          reject(new Error('Bộ nhớ đã đầy! Vui lòng xóa bớt tài liệu cũ.'));
        } else {
          reject(request.error);
        }
      };
    });
  } catch (e) {
    console.error('Lỗi saveDoc:', e);
    throw e;
  }
}

// Lấy tất cả documents theo type
async function getDocsByType(type) {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);
      
      request.onsuccess = () => {
        const results = request.result.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Lỗi getDocsByType:', e);
    return [];
  }
}

// Lấy tất cả documents (tất cả loại)
async function getAllDocs() {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Lỗi getAllDocs:', e);
    return [];
  }
}

// Lấy một document theo ID
async function getDocById(id) {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Lỗi getDocById:', e);
    return null;
  }
}

// Xóa document
async function deleteDocFromDB(id) {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Lỗi deleteDocFromDB:', e);
    throw e;
  }
}

// Cập nhật document (xóa file ban hành)
async function updateDoc(id, updates) {
  try {
    const db = await initDB();
    const entry = await getDocById(id);
    if (!entry) throw new Error('Không tìm thấy tài liệu');
    
    const updatedEntry = { ...entry, ...updates };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(updatedEntry);
      
      request.onsuccess = () => resolve(updatedEntry);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Lỗi updateDoc:', e);
    throw e;
  }
}

// Download file (THAY THẾ downloadEntry cũ)
async function downloadEntry(entryOrId, isBanhanh = false) {
  try {
    let entry;
    if (typeof entryOrId === 'string') {
      entry = await getDocById(entryOrId);
    } else {
      entry = entryOrId;
    }
    
    if (!entry) return alert('Không tìm thấy tài liệu.');
    
    const blob = isBanhanh ? entry.banhanhFileBlob : entry.fileBlob;
    const filename = isBanhanh ? entry.banhanhFilename : entry.filename;
    
    if (!blob) return alert('Không có file để tải xuống.');
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert('Lỗi khi tải file: ' + e.message);
  }
}

// Kiểm tra dung lượng
async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
    const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
    const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(2);
    
    return {
      used: estimate.usage,
      quota: estimate.quota,
      available: estimate.quota - estimate.usage,
      usedMB,
      quotaMB,
      percentUsed
    };
  }
  return null;
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
  if (!u) return false;
  
  // Nếu là admin: mặc định cho phép (trừ khi bị tắt rõ ràng)
  if (u.role === 'admin') {
    return u.allowLogin !== false;
  }
  
  // Nếu là client: phải được bật rõ ràng mới cho phép
  return u.allowLogin === true;
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
  input.style.padding = '8px 10px';
  input.style.borderRadius = '8px';
  input.style.border = '1px solid #d8e7ff';
  input.style.fontSize = '14px';
  input.style.width = '100%';
  input.style.height = '40px';
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
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '10px 12px';
      item.style.cursor = 'pointer';
      item.style.borderBottom = '1px solid #f0f5ff';
      item.style.fontSize = '14px';
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = name;
      nameSpan.style.flex = '1';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '✕';
      deleteBtn.style.background = 'transparent';
      deleteBtn.style.border = 'none';
      deleteBtn.style.color = '#ff4444';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.padding = '0 8px';
      deleteBtn.style.fontSize = '16px';
      deleteBtn.style.fontWeight = 'bold';
      deleteBtn.style.opacity = '0';
      deleteBtn.style.transition = 'opacity 0.2s';
      
      item.onmouseover = () => {
        item.style.background = '#f0f5ff';
        deleteBtn.style.opacity = '1';
      };
      item.onmouseout = () => {
        item.style.background = '#fff';
        deleteBtn.style.opacity = '0';
      };
      
      nameSpan.onclick = () => {
        input.value = name;
        dropdown.style.display = 'none';
        input.focus();
      };
      
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Xóa "${name}" khỏi danh sách?`)) {
          const executors = getExecutors();
          const updated = executors.filter(n => n !== name);
          saveExecutors(updated);
          updateDropdown();
          if (input.value === name) {
            input.value = '';
          }
        }
      };
      
      item.appendChild(nameSpan);
      item.appendChild(deleteBtn);
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
  
  const cur = getCurrentUser();
  
  const items = [
    { k: 'totrinh', t: 'Tờ trình' },
    { k: 'quyetdinh', t: 'Quyết định' },
    { k: 'khenthuong', t: 'Khen thưởng' },
    { k: 'baocao', t: 'Báo cáo' }
    
  ];
  
  // CHỈ ADMIN MỚI THẤY "LƯU TRỮ"
  if (cur && cur.role === 'admin') {
    items.push({ k: 'luutru', t: 'Lưu trữ' },{ k: 'banhanh', t: 'Ban hành' });
  }
  
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
  
  // CHỈ ADMIN MỚI THẤY NÚT XUẤT EXCEL
  if (cur && cur.role === 'admin') {
    const excelBtn = document.createElement('button');
    excelBtn.type = 'button';
    excelBtn.className = 'excel-export-btn';
    excelBtn.innerHTML = `
      <img src="icons8-excel-50.png" alt="Excel" style="width:18px;height:18px;">
    `;
    excelBtn.onclick = exportToExcel;
    menu.appendChild(excelBtn);
  }
}

// ======= FORM NHẬP - LAYOUT MỚI 2 Ô CÙNG HÀNG + NĂM =======
function createRowCard(type) {
  const div = document.createElement('div');
  div.className = 'row-card';
  
  // Hàng 1: 3 ô - note, executor, year
  const row1 = document.createElement('div');
  row1.className = 'row-card-row-1';
  row1.style.display = 'grid';
  row1.style.gridTemplateColumns = '1fr 220px 100px';
  row1.style.gap = '12px';
  row1.style.marginBottom = '16px';
  row1.style.alignItems = 'start';
  
  const noteInput = document.createElement('textarea');
  noteInput.className = 'note-input';
  noteInput.placeholder = 'Nội dung...';
  
  const executorContainer = document.createElement('div');
  executorContainer.className = 'executor-container';
  const executorCombo = createExecutorCombobox();
  executorContainer.appendChild(executorCombo);
  
  // THÊM Ô NHẬP NĂM
  const yearContainer = document.createElement('div');
  yearContainer.className = 'year-container';
  const yearInput = document.createElement('input');
  yearInput.type = 'number';
  yearInput.className = 'year-input';
  yearInput.placeholder = 'Năm';
  yearInput.min = '2000';
  yearInput.max = '2100';
  yearInput.style.padding = '8px 10px';
  yearInput.style.borderRadius = '8px';
  yearInput.style.border = '1px solid #d8e7ff';
  yearInput.style.fontSize = '14px';
  yearInput.style.width = '100%';
  yearInput.style.height = '40px';
  yearInput.style.boxSizing = 'border-box';
  yearInput.style.textAlign = 'center';
  yearContainer.appendChild(yearInput);
  
  row1.appendChild(noteInput);
  row1.appendChild(executorContainer);
  row1.appendChild(yearContainer);
  
  // Hàng 2: 2 file đính kèm
  const row2 = document.createElement('div');
  row2.className = 'row-card-row-2';
  
  const fileDiv = document.createElement('div');
  fileDiv.innerHTML = `
    <div style="font-size:13px;color:#52657a;margin-bottom:6px">Đính kèm (*.docx)</div>
    <input class="file-input" type="file">
    <div style="font-size:11px;color:#8b99b0;margin-top:2px" data-filehint></div>
  `;
  
  const banhanhFileDiv = document.createElement('div');
  banhanhFileDiv.innerHTML = `
    <div style="font-size:13px;color:#52657a;margin-bottom:6px">Đính kèm tệp ban hành (*.pdf)</div>
    <input class="banhanh-file-input" type="file" accept=".pdf,application/pdf">
    <div style="font-size:11px;color:#8b99b0;margin-top:2px" data-banhanhfilehint></div>
  `;
  
  row2.appendChild(fileDiv);
  row2.appendChild(banhanhFileDiv);
  
  // Hàng 3: Nút action
  const rowActions = document.createElement('div');
  rowActions.className = 'row-actions';
  rowActions.innerHTML = `
    <button class="btn btn-primary save-btn">Lưu</button>
    <button class="btn btn-ghost remove-btn">Xóa</button>
  `;
  
  div.appendChild(row1);
  div.appendChild(row2);
  div.appendChild(rowActions);

  const fileInput = fileDiv.querySelector('.file-input');
  fileInput.accept = type === 'banhanh'
    ? '.pdf,application/pdf'
    : '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const fileHint = fileDiv.querySelector('[data-filehint]');
  fileInput.onchange = () => {
    const f = fileInput.files[0];
    fileHint.textContent = f ? `${f.name} (${Math.round(f.size / 1024)} KB)` : '';
  };

  const banhanhFileInput = banhanhFileDiv.querySelector('.banhanh-file-input');
  const banhanhFileHint = banhanhFileDiv.querySelector('[data-banhanhfilehint]');
  banhanhFileInput.onchange = () => {
    const f = banhanhFileInput.files[0];
    banhanhFileHint.textContent = f ? `${f.name} (${Math.round(f.size / 1024)} KB)` : '';
  };

  div.querySelector('.remove-btn').onclick = () => div.remove();
  
  div.querySelector('.save-btn').onclick = async () => {
    const cur = getCurrentUser();
    if (!cur) return alert('Chưa đăng nhập.');
    if (!canCurrentUserSave()) return alert('Bạn không có quyền lưu.');

    const note = noteInput.value.trim();
    const executor = executorCombo.getExecutor();
    const year = yearInput.value.trim();
    const f = fileInput.files[0];
    const banhanhFile = banhanhFileInput.files[0];

    if (!f) return alert('Vui lòng chọn tệp đính kèm!');
    if (!year) return alert('Vui lòng nhập năm!');

    // Tự động tạo số thứ tự
    const existingDocs = await getDocsByType(type);
    let maxNo = 0;
    existingDocs.forEach(doc => {
      const docNo = parseInt(doc.no);
      if (!isNaN(docNo) && docNo > maxNo) {
        maxNo = docNo;
      }
    });
    const no = String(maxNo + 1);

    // Kiểm tra kích thước file (GIỚI HẠN 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (f.size > MAX_SIZE) {
      return alert(`File "${f.name}" quá lớn (${Math.round(f.size / 1024 / 1024)}MB).\nVui lòng chọn file nhỏ hơn 50MB.`);
    }
    if (banhanhFile && banhanhFile.size > MAX_SIZE) {
      return alert(`File ban hành quá lớn (${Math.round(banhanhFile.size / 1024 / 1024)}MB).\nVui lòng chọn file nhỏ hơn 50MB.`);
    }

    if (type === 'banhanh' && f && !f.name.toLowerCase().endsWith('.pdf'))
      return alert('Chỉ chấp nhận file PDF');
    if (type !== 'banhanh' && f && !/\.(doc|docx)$/i.test(f.name))
      return alert('Chỉ chấp nhận .doc hoặc .docx');

    if (banhanhFile && !banhanhFile.name.toLowerCase().endsWith('.pdf'))
      return alert('File ban hành chỉ chấp nhận định dạng PDF');

    try {
      await saveDoc(type, no, note, executor, f, cur, banhanhFile, year);
      alert(`Đã lưu thành công! Số thứ tự: ${no}`);
      noteInput.value = '';
      fileInput.value = '';
      fileHint.textContent = '';
      banhanhFileInput.value = '';
      banhanhFileHint.textContent = '';
      executorCombo.clearExecutor();
      if (currentRoute === 'luutru') renderArchive();
    } catch (e) {
      alert('Lỗi khi lưu: ' + e.message);
    }
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

  const renderContent = async (selectedType, searchQuery = '') => {
    contentArea.innerHTML = '';
    
    // Lấy dữ liệu từ IndexedDB
    const list = await getDocsByType(selectedType);
    
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
    
    // Chỉ lấy các tài liệu có file ban hành
    let filteredList = list.filter(e => e.banhanhFilename && e.banhanhFileBlob);
    
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
    table.innerHTML = '<tr><th>Số TT</th><th>Nội dung</th><th>Văn bản ban hành</th><th>Ngày</th></tr>';

    filteredList.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;color:#005F9E">${e.no || ''}</td>
        <td>${e.note || ''}</td>
        <td>
          <span style="color:#005F9E;font-weight:600;">${e.banhanhFilename}</span><br>
          <button class="btn" style="color:white;background:#007BFF;margin-top:4px" data-action="download-banhanh" data-type="${selectedType}" data-id="${e.id}">Tải xuống</button>
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
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const entry = await getDocById(id);
        
        if (action === 'download-banhanh') {
          downloadEntry(id, true);
        } else if (action === 'delete-banhanh') {
          if (confirm(`Xóa file ban hành "${entry.banhanhFilename}"?\n\nLưu ý: Chỉ xóa file ban hành, tài liệu gốc vẫn còn.`)) {
            await updateDoc(id, {
              banhanhFilename: '',
              banhanhFiletype: '',
              banhanhFilesize: 0,
              banhanhFileBlob: null
            });
            
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

  const renderContent = async (selectedType, searchQuery = '') => {
    contentArea.innerHTML = '';
    
    // Load dữ liệu từ IndexedDB
    const list = await getDocsByType(selectedType);
    
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

    // Tính số lượng tài liệu theo người thực hiện
    const executorStats = {};
    list.forEach(e => {
      const executor = (e.executor || 'Chưa phân công').trim();
      executorStats[executor] = (executorStats[executor] || 0) + 1;
    });

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
    titleDiv.style.display = 'flex';
    titleDiv.style.flexDirection = 'column';
    titleDiv.style.width = '100%';

    const mainTitle = document.createElement('h3');
    mainTitle.style.margin = '0';
    mainTitle.style.fontSize = '16px';
    mainTitle.style.color = '#005F9E';
    mainTitle.textContent = `📄 ${TYPE_LABEL[selectedType]}`;

    const totalInfo = document.createElement('div');
    totalInfo.style.fontSize = '13px';
    totalInfo.style.color = '#6b7a8a';
    totalInfo.style.marginTop = '4px';
    totalInfo.textContent = `Tổng số: ${filteredList.length}`;

    const statsInfo = document.createElement('div');
    statsInfo.style.fontSize = '13px';
    statsInfo.style.color = '#6b7a8a';
    statsInfo.style.marginTop = '4px';

    const statsEntries = Object.entries(executorStats)
      .sort((a, b) => b[1] - a[1]); // Sắp xếp theo số lượng giảm dần

    if (statsEntries.length > 0) {
      statsInfo.textContent = 'Thống kê theo người: ' + 
        statsEntries.map(([name, count]) => `${name}: ${count}`).join(', ');
    }

    titleDiv.appendChild(mainTitle);
    titleDiv.appendChild(totalInfo);
    if (statsEntries.length > 0) {
      titleDiv.appendChild(statsInfo);
    }
    
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
    table.innerHTML = '<tr><th>Số TT</th><th>Nội dung</th><th>Văn bản</th><th>Văn bản ban hành</th><th>Người thực hiện</th><th>Năm văn bản</th><th>Ngày lưu</th><th>Ghi chú</th></tr>';

    filteredList.forEach(e => {
      const tr = document.createElement('tr');
      
      // Tạo ô ghi chú cho admin
      let adminNoteCell = '';
      if (cur && cur.role === 'admin') {
        adminNoteCell = `<td><textarea class="admin-note-input" data-id="${e.id}" style="width:100%;min-height:50px;padding:6px;border:1px solid #d8e7ff;border-radius:6px;font-size:13px;resize:vertical;font-family:inherit" placeholder="Ghi chú...">${e.adminNote || ''}</textarea></td>`;
      } else {
        adminNoteCell = `<td style="color:#6b7a8a;font-size:13px">${e.adminNote || ''}</td>`;
      }
      
      tr.innerHTML = `
        <td style="font-weight:600;color:#005F9E">${e.no || ''}</td>
        <td>${e.note || ''}</td>
        <td>
          ${e.filename ? `<span style="color:#0066cc;font-weight:500;font-size:13px;display:block;margin-bottom:4px;line-height:1.3;word-break:break-word;">${e.filename}</span>` : ''}
          <button class="btn" style="color:white;background:#007BFF;margin-top:4px" data-action="download" data-type="${selectedType}" data-id="${e.id}">
            ${e.filename ? 'Tải xuống' : 'Không có file'}
          </button>
        </td>
        <td>
          ${e.banhanhFilename ? `<span style="color:#0066cc;font-weight:500;font-size:13px;display:block;margin-bottom:4px;line-height:1.3;word-break:break-word;">${e.banhanhFilename}</span>` : ''}
          ${e.banhanhFilename ? `<button class="btn" style="color:white;background:#007BFF;margin-top:4px" data-action="download-banhanh" data-type="${selectedType}" data-id="${e.id}">Tải xuống</button>` : '<span style="color:#999">Không có file</span>'}
        </td>
        <td>${e.executor || ''}</td>
        <td style="font-weight:600;color:#005F9E;text-align:center">${e.year || ''}</td>
        <td style="font-size:12px;color:#6b7a8a">
          ${new Date(e.createdAt).toLocaleString()}
          ${cur && cur.role === 'admin' ? `<br><button class="btn btn-ghost" style="margin-top:4px" data-action="delete" data-type="${selectedType}" data-id="${e.id}">Xóa</button>` : ''}
        </td>
        ${adminNoteCell}
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
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const entry = await getDocById(id);

        if (action === 'download') downloadEntry(id);
        else if (action === 'download-banhanh') downloadEntry(id, true);
        else if (action === 'delete') {
          if (confirm(`Xóa "${entry.filename}"?`)) {
            await deleteDocFromDB(id);
            renderContent(selectedType, searchInput.value);
          }
        }
      };
    });

    // Xử lý lưu ghi chú admin
    if (cur && cur.role === 'admin') {
      table.querySelectorAll('.admin-note-input').forEach(textarea => {
        textarea.addEventListener('blur', async () => {
          const id = textarea.dataset.id;
          const adminNote = textarea.value.trim();
          try {
            await updateDoc(id, { adminNote });
          } catch (e) {
            alert('Lỗi khi lưu ghi chú: ' + e.message);
          }
        });
      });
    }
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
    
    // Thay đổi logic hiển thị checkbox
    const allowSaveChecked = (u.allowSave !== false) ? 'checked' : '';
    const allowLoginChecked = (u.role === 'client') 
      ? ((u.allowLogin === true) ? 'checked' : '')  // Client: mặc định KHÔNG tích
      : ((u.allowLogin !== false) ? 'checked' : ''); // Admin: mặc định tích
    
    tr.innerHTML = `<td>${e}</td><td>${u.scientist_name || ''}</td><td>${u.role}</td>
                    <td><input type="checkbox" ${allowSaveChecked} data-email="${e}" data-action="save"></td>
                    <td><input type="checkbox" ${allowLoginChecked} data-email="${e}" data-action="login"></td>`;
    t.appendChild(tr);
  });
  main.appendChild(t);
  
  // Phần xử lý checkbox giữ nguyên
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
  
  // CLIENT VÀO TRANG TỜ TRÌNH, ADMIN VÀO TRANG LƯU TRỮ
  const defaultRoute = (cur.role === 'admin') ? 'luutru' : 'totrinh';
  renderMenu(defaultRoute);
  navigateTo(defaultRoute);
  
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
  document.getElementById('btn-logout').onclick = () => { localStorage.removeItem('currentUser'); location = 'index.html'; };
}

// ======= XUẤT EXCEL =======
async function exportToExcel() {
  try {
    // Tạo workbook mới
    const wb = XLSX.utils.book_new();
    
    // Duyệt qua từng loại tài liệu
    for (const type of TYPES) {
      const docs = await getDocsByType(type);
      
      // SẮP XẾP THEO STT TỪ BÉ ĐẾN LỚN
      docs.sort((a, b) => {
        const noA = parseInt(a.no) || 0;
        const noB = parseInt(b.no) || 0;
        return noA - noB;
      });
      
      // Tạo dữ liệu cho sheet
      const sheetData = [
        ['STT', 'Nội dung', 'Văn bản', 'Văn bản ban hành', 'Người thực hiện', 'Năm văn bản', 'Ngày lưu']
      ];
      
      docs.forEach((doc, index) => {
        const createdDate = new Date(doc.createdAt);
        const dateStr = createdDate.toLocaleDateString('vi-VN') + ' ' + createdDate.toLocaleTimeString('vi-VN');
        
        sheetData.push([
          doc.no || '',
          doc.note || '',
          doc.filename || '',
          doc.banhanhFilename || '',
          doc.executor || '',
          doc.year || '',
          dateStr
        ]);
      });
      
      // Tạo worksheet
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      
      // Điều chỉnh độ rộng cột
      ws['!cols'] = [
        { wch: 8 },   // STT
        { wch: 30 },  // Nội dung
        { wch: 40 },  // Văn bản
        { wch: 40 },  // Văn bản ban hành
        { wch: 20 },  // Người thực hiện
        { wch: 12 },  // Năm
        { wch: 18 }   // Ngày lưu
      ];
      
      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, TYPE_LABEL[type]);
    }
    
    // Xuất file
    const today = new Date();
    const filename = `TaiLieu_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    alert('Xuất Excel thành công!');
  } catch (e) {
    console.error('Lỗi xuất Excel:', e);
    alert('Lỗi khi xuất Excel: ' + e.message);
  }
}

window.app = { initClientUI, initAdminUI, navigateTo, exportToExcel };