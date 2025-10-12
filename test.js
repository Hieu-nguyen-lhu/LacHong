document.addEventListener('DOMContentLoaded', function () {
  // Lấy user hiện tại
  const urlParams = new URLSearchParams(window.location.search);
  const viewingUser = urlParams.get('user') || localStorage.getItem('loggedInUser');

  if (!viewingUser) {
    alert('Không xác định được người dùng!');
  }

  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (!users[viewingUser]) {
    users[viewingUser] = {
      role: 'client',
      info: {},
      posts: [],
      awards: []
    
    };
  }

  // Phần Thông tin cá nhân
  const infoForm = document.getElementById('infoForm');
  const btnSave = document.getElementById('btnSave');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const infoTableContainer = document.getElementById('infoTableContainer');

  function renderInfoTable(data) {
    const fieldLabels = {
      fullName: 'Họ và tên',
      dob: 'Ngày sinh',
      gender: 'Giới tính',
      degree: 'Học vị',
      academicTitle: 'Chức danh khoa học',
      position: 'Chức vụ',
      year: 'Năm bổ nhiệm',
      hometown: 'Quê quán',
      ethnicity: 'Dân tộc',
      // cccd: 'Số CCCD',
      email: 'Email chính',
      altEmail: 'Email thay thế',
      phone: 'Số điện thoại',
      workplace: 'Tên cơ quan công tác',
      workAddress: 'Địa chỉ cơ quan',
      province: 'Tỉnh/TP'
    };

    let html = '<table class="info-table">';
    for (const key in fieldLabels) {
      const label = fieldLabels[key];
      let value = data[key] || '';
      if (key === 'dob' && value) {
        const d = new Date(value);
        value = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      }
      html += `<tr><td>${label}</td><td>${value}</td></tr>`;
    }
    html += '</table>';
    infoTableContainer.innerHTML = html;
  }


  function loadPersonalInfo() {
    const data = users[viewingUser].info || {};
    for (const key in data) {
      if (infoForm[key]) infoForm[key].value = data[key];
    }
    profileName.textContent = data.fullName || 'Họ và Tên';
    profileEmail.textContent = viewingUser || 'Email';
    renderInfoTable(data);
  }

  btnSave.onclick = () => {
    const data = {};
    Array.from(infoForm.elements).forEach(el => {
      if (el.id) data[el.id] = el.value;
    });
    users[viewingUser].info = data;
    localStorage.setItem('users', JSON.stringify(users));
    profileName.textContent = data.fullName || 'Họ và Tên';
    renderInfoTable(data); // Gọi lại để hiển thị đầy đủ
    alert("Đã lưu thông tin cá nhân!");
  };

  document.getElementById('fullName').addEventListener('input', e => {
    profileName.textContent = e.target.value || 'Họ và Tên';
  });
  document.getElementById('email').addEventListener('input', e => {
    // Không thay đổi viewingUser
  });

  loadPersonalInfo();

  // quá trính đào tạo
  const eduForm = document.getElementById('eduForm');
  const eduTableBody = document.querySelector('#eduTable tbody');

  // Lấy danh sách đào tạo riêng cho user
  let eduList = users[viewingUser].eduList || [];

  // Load bảng ngay
  renderEduTable();

  eduForm.onsubmit = (e) => {
    e.preventDefault();
    const degree = document.getElementById('eduDegree').value.trim();
    const major = document.getElementById('eduMajor').value.trim();
    const school = document.getElementById('eduSchool').value.trim();
    const country = document.getElementById('eduCountry').value.trim();
    const year = document.getElementById('eduYear').value.trim();

    if (degree && major && school && country && year) {
      eduList.push({ degree, major, school, country, year });
      renderEduTable();
      eduForm.reset();
    }
  };

  function renderEduTable() {
    eduTableBody.innerHTML = '';
    eduList.forEach((edu, index) => {
      const row = `<tr>
        <td>${index + 1}</td>
        <td>${edu.degree}</td>
        <td>${edu.major}</td>
        <td>${edu.school}</td>
        <td>${edu.country}</td>
        <td>${edu.year}</td>
        <td><button class="btn-delete" data-index="${index}"><img src="./delete.png" alt="Xóa" style="width: 20px; height: 20px;"></button></td>
      </tr>`;
      eduTableBody.innerHTML += row;
    });
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.getAttribute('data-index');
        eduList.splice(index, 1);
        renderEduTable();
      });
    });
  }

  // Lưu vào users[viewingUser]
  document.getElementById('btnSaveEdu').onclick = () => {
    users[viewingUser].eduList = eduList;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đã lưu quá trình đào tạo!');
  };

  // === QUÁ TRÌNH CÔNG TÁC ===
  const workForm = document.getElementById('workForm');
  const workTableBody = document.querySelector('#workTable tbody');

  // Lấy danh sách công tác riêng của user
  let workList = users[viewingUser].workList || [];

  function renderWorkTable() {
    workTableBody.innerHTML = '';
    workList.forEach((w, index) => {
      const row = `<tr>
        <td>${index + 1}</td>
        <td>${w.time}</td>
        <td>${w.place}</td>
        <td>${w.job}</td>
        <td><button class="btn-delete" data-index="${index}"><img src="./delete.png" alt="Xóa" style="width: 20px; height: 20px;"></button></td>
      </tr>`;
      workTableBody.innerHTML += row;
    });
    document.querySelectorAll('#workTable .btn-delete').forEach(btn => {
      btn.onclick = () => {
        const idx = btn.getAttribute('data-index');
        workList.splice(idx, 1);
        renderWorkTable();
      };
    });
  }

  // Load bảng khi bắt đầu
  renderWorkTable();

  workForm.onsubmit = e => {
    e.preventDefault();
    const time = document.getElementById('workTime').value.trim();
    const place = document.getElementById('workPlace').value.trim();
    const job = document.getElementById('workJob').value.trim();
    if (time && place && job) {
      workList.push({ time, place, job });
      renderWorkTable();
      workForm.reset();
    }
  };

  // Lưu riêng vào user
  document.getElementById('btnSaveWork').onclick = () => {
    users[viewingUser].workList = workList;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đã lưu quá trình công tác!');
  };


  // === NGOẠI NGỮ ===
  const languageForm = document.getElementById('languageForm');
  const languageTableBody = document.querySelector('#languageTable tbody');

  // Lấy dữ liệu ngoại ngữ riêng cho user
  let languageList = users[viewingUser].languageList || [];

  function renderLanguageTable() {
    languageTableBody.innerHTML = '';
    languageList.forEach((l, index) => {
      const row = `<tr>
        <td>${index + 1}</td>
        <td>${l.language}</td>
        <td>${l.read}</td>
        <td>${l.write}</td>
        <td>${l.listen}</td>
        <td>${l.speak}</td>
        <td><button class="btn-delete" data-index="${index}"><img src="./delete.png" alt="Xóa" style="width: 20px; height: 20px;"></button></td>
      </tr>`;
      languageTableBody.innerHTML += row;
    });
    document.querySelectorAll('#languageTable .btn-delete').forEach(btn => {
      btn.onclick = () => {
        const idx = btn.getAttribute('data-index');
        languageList.splice(idx, 1);
        renderLanguageTable();
      };
    });
  }
  renderLanguageTable();

  languageForm.onsubmit = e => {
    e.preventDefault();
    const language = document.getElementById('languageName').value.trim();
    const read = document.getElementById('langRead').value.trim();
    const write = document.getElementById('langWrite').value.trim();
    const listen = document.getElementById('langListen').value.trim();
    const speak = document.getElementById('langSpeak').value.trim();
    if (language && read && write && listen && speak) {
      languageList.push({ language, read, write, listen, speak });
      renderLanguageTable();
      languageForm.reset();
    }
  };

  // Lưu vào users[viewingUser]
  document.getElementById('btnSaveLanguage').onclick = () => {
    users[viewingUser].languageList = languageList;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đã lưu ngoại ngữ!');
  };


  // === KINH NGHIỆM ===
  const experienceForm = document.getElementById('experienceForm');
  const experienceInput = document.getElementById('experienceInput');
  const experienceListEl = document.getElementById('experienceList');

  // Lấy dữ liệu kinh nghiệm của user hiện tại
  let experienceList = users[viewingUser].experienceList || [];

  function renderExperienceList() {
    experienceListEl.innerHTML = '';
    experienceList.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = item;

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Xóa';
      delBtn.style.marginLeft = '10px';
      delBtn.onclick = () => {
        experienceList.splice(index, 1);
        renderExperienceList();
      };
      li.appendChild(delBtn);
      experienceListEl.appendChild(li);
    });
  }

  // Load bảng lần đầu
  renderExperienceList();

  experienceForm.onsubmit = e => {
    e.preventDefault();
    const value = experienceInput.value.trim();
    if (value) {
      experienceList.push(value);
      renderExperienceList();
      experienceForm.reset();
    }
  };

  document.getElementById('btnSaveExperience').onclick = () => {
    users[viewingUser].experienceList = experienceList;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đã lưu kinh nghiệm!');
  };


  // === THÀNH TÍCH ===
  const achievementForm = document.getElementById('achievementForm');
  const achievementInput = document.getElementById('achievementInput');
  const achievementListEl = document.getElementById('achievementList');

  // Lấy dữ liệu thành tích của user hiện tại
  let achievementList = users[viewingUser].achievementList || [];

  function renderAchievementList() {
    achievementListEl.innerHTML = '';
    achievementList.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = item;

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Xóa';
      delBtn.style.marginLeft = '10px';
      delBtn.onclick = () => {
        achievementList.splice(index, 1);
        renderAchievementList();
      };
      li.appendChild(delBtn);
      achievementListEl.appendChild(li);
    });
  }

  // Load bảng lần đầu
  renderAchievementList();

  achievementForm.onsubmit = e => {
    e.preventDefault();
    const value = achievementInput.value.trim();
    if (value) {
      achievementList.push(value);
      renderAchievementList();
      achievementForm.reset();
    }
  };

  document.getElementById('btnSaveAchievement').onclick = () => {
    users[viewingUser].achievementList = achievementList;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đã lưu thành tích!');
  };


  // === HƯỚNG NGHIÊN CỨU ===
  const researchForm = document.getElementById('researchForm');
  const researchInput = document.getElementById('researchInput');
  const researchListEl = document.getElementById('researchList');

  // Lấy dữ liệu hướng nghiên cứu của user hiện tại
  let researchList = users[viewingUser].researchList || [];

  function renderResearchList() {
    researchListEl.innerHTML = '';
    researchList.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = item;

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Xóa';
      delBtn.style.marginLeft = '10px';
      delBtn.onclick = () => {
        researchList.splice(index, 1);
        renderResearchList();
      };
      li.appendChild(delBtn);
      researchListEl.appendChild(li);
    });
  }

  // Load bảng lần đầu
  renderResearchList();

  researchForm.onsubmit = e => {
    e.preventDefault();
    const value = researchInput.value.trim();
    if (value) {
      researchList.push(value);
      renderResearchList();
      researchForm.reset();
    }
  };

  document.getElementById('btnSaveResearch').onclick = () => {
    users[viewingUser].researchList = researchList;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đã lưu hướng nghiên cứu!');
  };


  // === ĐỀ TÀI NGHIÊN CỨU ===
  const projectForm = document.getElementById('projectForm');
  const projectTable = document.getElementById('projectTable').getElementsByTagName('tbody')[0];

  // Lấy danh sách đề tài của user hiện tại
  let projectList = users[viewingUser].projectList || [];

  function renderProjectTable() {
    projectTable.innerHTML = '';
    projectList.forEach((proj, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${proj.name}</td>
        <td>${proj.agency}</td>
        <td>${proj.time}</td>
        <td>${proj.role}</td>
        <td><button class="btn-delete" data-index="${index}"><img src="./delete.png" alt="Xóa" style="width: 20px; height: 20px;"></button></td>
      `;
      row.querySelector('.btn-delete').onclick = () => {
        projectList.splice(index, 1);
        renderProjectTable();
      };
      projectTable.appendChild(row);
    });
  }

  // Load bảng lần đầu
  renderProjectTable();

  projectForm.onsubmit = function (e) {
    e.preventDefault();
    const name = document.getElementById('projectName').value.trim();
    const agency = document.getElementById('fundingAgency').value.trim();
    const time = document.getElementById('duration').value.trim();
    const role = document.getElementById('role').value.trim();

    if (name && agency && time && role) {
      projectList.push({ name, agency, time, role });
      renderProjectTable();
      projectForm.reset();
    }
  };

  document.getElementById('btnSaveProjects').onclick = () => {
    users[viewingUser].projectList = projectList;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đã lưu danh sách đề tài!');
  };


  // === CÔNG BỐ KHOA HỌC ===
  let publicationList = users[viewingUser].publicationList || [];

  // Thêm công bố mới
  document.getElementById('btnAddPublication').onclick = () => {
    const author = document.getElementById('pubAuthor').value.trim();
    const title = document.getElementById('pubTitle').value.trim();
    const journal = document.getElementById('pubJournal').value.trim();
    const note = document.getElementById('pubNote').value.trim();

    if (author && title && journal) {
      publicationList.push({ author, title, journal, note });
      renderPublicationTable();
      // Xóa input sau khi thêm
      document.getElementById('pubAuthor').value = '';
      document.getElementById('pubTitle').value = '';
      document.getElementById('pubJournal').value = '';
      document.getElementById('pubNote').value = '';
    }
  };

  // Lưu danh sách công bố khoa học
  document.getElementById('btnSavePublication').onclick = () => {
    users[viewingUser].publicationList = publicationList;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đã lưu danh sách công bố khoa học!');
  };

  // Hiển thị bảng công bố
  function renderPublicationTable() {
    const pubTableBody = document.getElementById('pubTableBody');
    pubTableBody.innerHTML = '';
    publicationList.forEach((pub, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${pub.author}</td>
        <td>${pub.title}</td>
        <td>${pub.journal}</td>
        <td>${pub.note}</td>
        <td><button class="btn-delete" data-index="${index}">Xóa</button></td>
      `;
      row.querySelector('.btn-delete').onclick = () => {
        publicationList.splice(index, 1);
        renderPublicationTable();
      };
      pubTableBody.appendChild(row);
    });
  }

  // Gọi render ngay khi load
  renderPublicationTable();




  //==========In==========
  function toWord() {
  const urlParams = new URLSearchParams(window.location.search);
  const viewingUser = urlParams.get('user') || localStorage.getItem('loggedInUser');

  const users = JSON.parse(localStorage.getItem('users')) || {};
  const userData = users[viewingUser] || {};

  const info = userData.info || {};
  const workList = userData.workList || [];
  const languages = userData.languageList || [];
  const experienceList = userData.experienceList || [];
  const achievementList = userData.achievementList || [];
  const researchList = userData.researchList || [];
  const projectList = userData.projectList || [];
  const publicationList = userData.publicationList || [];
  const awards = userData.awards || [];
  const courseList = userData.courseList || [];

  const totalLessons = courseList.reduce((sum, c) => sum + (Number(c.lessons) || 0), 0);
  const lessonStatus = totalLessons >= 30 ? 'Đạt' : 'Không đạt';

  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Segoe UI, sans-serif; padding: 20px; }
      h2 { color: #0d47a1; border-bottom: 1px solid #90caf9; padding-bottom: 4px; }
      .section { margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      td, th { border: 1px solid #000; padding: 8px; }
      th { background: #e3f2fd; color: #0d47a1; text-align: left; }
      ul { margin: 0; padding-left: 20px; }
    </style>
  </head>
  <body>
    <h2>A. Thông tin cá nhân</h2>
    <table>
      <tr><th>Họ và tên</th><td>${info.fullName || ''}</td></tr>
      <tr><th>Ngày sinh</th><td>${info.dob ? new Date(info.dob).toLocaleDateString('vi-VN') : ''}</td></tr>
      <tr><th>Giới tính</th><td>${info.gender || ''}</td></tr>
      <tr><th>Email</th><td>${info.email || ''}</td></tr>
      <tr><th>Số điện thoại</th><td>${info.phone || ''}</td></tr>
    </table>

    <div class="section">
      <h2>B. Quá trình công tác chuyên môn</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Thời gian</th>
            <th>Nơi công tác</th>
            <th>Công việc đảm nhiệm</th>
          </tr>
        </thead>
        <tbody>
          ${workList.map((w, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${w.time}</td>
              <td>${w.place}</td>
              <td>${w.job}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>C. Ngoại ngữ</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Ngoại ngữ</th>
            <th>Đọc</th>
            <th>Viết</th>
            <th>Nghe</th>
            <th>Nói</th>
          </tr>
        </thead>
        <tbody>
          ${languages.map((l, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${l.language}</td>
              <td>${l.read}</td>
              <td>${l.write}</td>
              <td>${l.listen}</td>
              <td>${l.speak}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>D. Kinh nghiệm & Thành tích</h2>
      <h3>1. Kinh nghiệm</h3>
      <ul>
        ${experienceList.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <h3>2. Thành tích</h3>
      <ul>
        ${achievementList.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h2>E. Hướng nghiên cứu</h2>
      <ul>
        ${researchList.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h2>F. Đề tài nghiên cứu</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Tên đề tài</th>
            <th>Cơ quan tài trợ</th>
            <th>Thời gian</th>
            <th>Vai trò</th>
          </tr>
        </thead>
        <tbody>
          ${projectList.map((p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${p.name}</td>
              <td>${p.agency}</td>
              <td>${p.time}</td>
              <td>${p.role}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>G. Công bố khoa học</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Tác giả</th>
            <th>Tên công trình</th>
            <th>Tạp chí / Hội thảo</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${publicationList.map((p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${p.author}</td>
              <td>${p.title}</td>
              <td>${p.journal}</td>
              <td>${p.note}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>H. Giải thưởng</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Tên giải thưởng</th>
            <th>Số người</th>
            <th>Năm</th>
            <th>Cấp</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          ${awards.map((a, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${a.title}</td>
              <td>${a.amountOfPeople}</td>
              <td>${a.year}</td>
              <td>${a.level}</td>
              <td>${a.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="section">
      <h2>I. Tiết khóa học</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Tên học phần</th>
            <th>Số tiết</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          ${courseList.map((c, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${c.name}</td>
              <td>${c.lessons}</td>
              <td>${c.time}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p><strong>Tổng số tiết:</strong> ${totalLessons} — <strong>Kết quả:</strong> ${lessonStatus}</p>
    </div>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Thong_tin_cv_${Date.now()}.doc`;
  link.click();
  URL.revokeObjectURL(url);
}


  document.getElementById('btnExportWord').onclick = toWord;


  window.onload = function () {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const tbodyRight = document.getElementById('userTableBodyRight');

    function renderAllUsers() {
      tbodyRight.innerHTML = '';
      Object.entries(users).forEach(([email, data]) => {
        const info = data.info || {};
        const row = `<tr>
        <td>${info.fullName || ''}</td>
        <td>${info.position || ''}</td>
        <td><a href="test.html?user=${encodeURIComponent(email)}" target="_blank">Xem</a></td>
      </tr>`;
        tbodyRight.innerHTML += row;
      });
    }

    renderAllUsers();
    const avatar = document.getElementById('avatar');
    const avatarInput = document.getElementById('avatarInput');

    const userEmail = document.getElementById('profileEmail').innerText.trim();
    console.log("✅ Current email:", userEmail);  // Kiểm tra

    const storageKey = 'avatar_' + userEmail;

    const savedAvatar = localStorage.getItem(storageKey);
    if (savedAvatar) {
      avatar.src = savedAvatar;
    }

    avatar.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', () => {
      const file = avatarInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          avatar.src = e.target.result;
          localStorage.setItem(storageKey, e.target.result);
        };
        reader.readAsDataURL(file);
      }

    });
  };
});

/*Giai thuong*/ 
// === GIẢI THƯỞNG ===

// Khi click nút Chờ xét duyệt
document.getElementById('btnSaveAwards').addEventListener('click', function() {
  const awardTitle = document.getElementById('awardTitle').value.trim();
  const amountOfPeople = document.getElementById('amountofpeople').value.trim();
  const awardYear = document.getElementById('awardYear').value.trim();
  const awardLevel = document.getElementById('awardLevel').value;

  const minhChungInput = document.getElementById('minhchung');
  const files = minhChungInput.files;
  const minhChungArr = [];

  const readerPromises = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        minhChungArr.push(e.target.result);
        resolve();
      };
      reader.readAsDataURL(file);
    });
  });

  Promise.all(readerPromises).then(() => {
    const newAward = {
  awardId: Date.now(), // hoặc crypto.randomUUID() nếu muốn
  title: awardTitle,
  amountOfPeople: amountOfPeople,
  year: awardYear,
  level: awardLevel,
  minhChung: minhChungArr,
  status: 'pending',
  user: localStorage.getItem('loggedInUser') || 'guest'
};


    let users = JSON.parse(localStorage.getItem('users')) || {};
    const viewingUser = newAward.user;

    if (!users[viewingUser]) {
      users[viewingUser] = { awards: [] };
    }
    if (!users[viewingUser].awards) {
      users[viewingUser].awards = [];
    }
    users[viewingUser].awards.push(newAward);
    localStorage.setItem('users', JSON.stringify(users));

    // Lưu vào global awards
    let globalAwards = JSON.parse(localStorage.getItem('awards')) || [];
    globalAwards.push(newAward);
    localStorage.setItem('awards', JSON.stringify(globalAwards));

    alert('Đã lưu giải thưởng!');
    renderAwardTable();
    renderApprovedAwards();
  });
});

// Render bảng Giải thưởng PENDING cho user
function renderAwardTable() {
  const viewingUser = new URLSearchParams(window.location.search).get('user') || localStorage.getItem('loggedInUser');
  const users = JSON.parse(localStorage.getItem('users')) || {};
  const awards = (users[viewingUser] && users[viewingUser].awards) || [];

  const tbody = document.getElementById('awardTableBody');
  tbody.innerHTML = '';

  awards
    .filter(a => a.status === 'pending')
    .forEach((award, index) => {
      const minhChungHTML = (award.minhChung || []).map(src =>
        `<img src="${src}" style="width: 50px; margin-right: 5px;">`
      ).join('');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${award.title}</td>
        <td>${award.amountOfPeople}</td>
        <td>${award.year}</td>
        <td>${award.level}</td>
        <td>${minhChungHTML}</td>
        <td>${award.status}</td>
        <td><button onclick="deleteAward(${award.awardId})">Xóa</button></td>

      `;
      tbody.appendChild(tr);
    });
}

// Xóa giải thưởng
function deleteAward(awardId) {
  // Lấy dữ liệu
  let users = JSON.parse(localStorage.getItem('users')) || {};
  let globalAwards = JSON.parse(localStorage.getItem('awards')) || [];

  // Xác định user hiện tại
  const viewingUser = new URLSearchParams(window.location.search).get('user') || localStorage.getItem('loggedInUser');

  // Xóa trong users[user].awards
  if (users[viewingUser] && users[viewingUser].awards) {
    users[viewingUser].awards = users[viewingUser].awards.filter(a => a.awardId != awardId);
  }

  // Xóa trong global awards
  globalAwards = globalAwards.filter(a => a.awardId != awardId);

  // Lưu lại
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('awards', JSON.stringify(globalAwards));

  alert('Đã xóa giải thưởng!');
  renderAwardTable();
}



// Render bảng đã duyệt
function renderApprovedAwards() {
  const awards = JSON.parse(localStorage.getItem('awards')) || [];
  const approvedAwards = awards.filter(award => award.status === 'approved');

  const tbody = document.getElementById('awardApprovedTableBody');
  tbody.innerHTML = '';

  approvedAwards.forEach((award, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${award.title}</td>
      <td>${award.amountOfPeople}</td>
      <td>${award.year}</td>
      <td>${award.level}</td>
      <td>${award.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Preview minh chứng
document.getElementById('minhchung').addEventListener('change', function() {
  const preview = document.getElementById('previewMinhChung');
  preview.innerHTML = '';
  Array.from(this.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.width = '50px';
      img.style.marginRight = '5px';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

// Khi load trang thì render luôn
window.addEventListener('load', () => {
  renderAwardTable();
  renderApprovedAwards();
});
// === TIẾT KHÓA HỌC ===
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const viewingUser = urlParams.get('user') || localStorage.getItem('loggedInUser');

  let users = JSON.parse(localStorage.getItem('users')) || {};
  if (!users[viewingUser]) {
    users[viewingUser] = { courseList: [] };
  }
  let courseList = users[viewingUser].courseList || [];

  const tbody = document.getElementById('courseTableBody');
  const totalLessons = document.getElementById('totalLessons');
  const lessonStatus = document.getElementById('lessonStatus');
  const btnSaveCourses = document.getElementById('btnSaveCourses');

  function renderCourseRows() {
    tbody.innerHTML = '';
    courseList.forEach((course, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="text" value="${course.name}" data-index="${index}" data-field="name"></td>
        <td><input type="number" value="${course.lessons}" data-index="${index}" data-field="lessons"></td>
        <td><input type="text" value="${course.time}" data-index="${index}" data-field="time"></td>
      `;
      tbody.appendChild(row);
    });
    addEmptyRow();
    updateTotalLessons();
  }

  function addEmptyRow() {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" data-index="new" data-field="name"></td>
      <td><input type="number" data-index="new" data-field="lessons"></td>
      <td><input type="text" data-index="new" data-field="time"></td>
    `;
    tbody.appendChild(row);
  }

  function updateTotalLessons() {
    const sum = courseList.reduce((acc, cur) => acc + Number(cur.lessons || 0), 0);
    totalLessons.innerHTML = `Tổng số tiết: ${sum} - <span id="lessonStatus">${sum >= 30 ? 'Đạt' : 'Không đạt'}</span>`;
  }

  tbody.addEventListener('input', (e) => {
    const input = e.target;
    const index = input.dataset.index;
    const field = input.dataset.field;

    if (index === 'new') {
      // Tạo mới
      const row = input.closest('tr');
      const inputs = row.querySelectorAll('input');
      const name = inputs[0].value.trim();
      const lessons = inputs[1].value.trim();
      const time = inputs[2].value.trim();

      if (name && lessons && time) {
        courseList.push({
          name: name,
          lessons: Number(lessons),
          time: time
        });
        renderCourseRows();
      }
    } else {
      // Cập nhật dòng cũ
      if (field === 'lessons') {
        courseList[index][field] = Number(input.value);
      } else {
        courseList[index][field] = input.value;
      }
      updateTotalLessons();
    }
  });

  btnSaveCourses.addEventListener('click', () => {
    users[viewingUser].courseList = courseList;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đã lưu danh sách tiết khóa học!');
  });

  renderCourseRows();
});


// Gọi khi load
renderApprovedAwards();

// Tải bảng khi load
window.addEventListener('load', renderAwardTable);
