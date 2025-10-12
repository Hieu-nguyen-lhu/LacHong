// ===== admin.js =====

// Lấy data
function getData() {
  return {
    globalAwards: JSON.parse(localStorage.getItem('awards')) || [],
    users: JSON.parse(localStorage.getItem('users')) || {}
  };
}

// Render bảng Pending Awards
function renderPendingAwards() {
  const { globalAwards } = getData();
  const pendingAwards = globalAwards.filter(a => a.status === 'pending');

  const container = document.getElementById('pendingAwardsContainer');
  container.innerHTML = '';

  if (pendingAwards.length === 0) {
    container.innerHTML = '<p>Không có giải thưởng nào đang chờ duyệt.</p>';
    return;
  }

  let html = '<table border="1"><tr><th>Tiêu đề</th><th>Người nộp</th><th>Minh chứng</th><th>Duyệt</th></tr>';
  pendingAwards.forEach(a => {
  html += `
    <tr>
      <td>${a.title}</td>
      <td>${a.user}</td>
      <td>
        ${(a.minhChung || []).map((img, i) => `<img src="${img}" alt="Minh chứng ${i+1}" width="50">`).join('')}
      </td>
      <td>
        <button class="btn-approve" data-award-id="${a.awardId}">Duyệt</button>
      </td>
    </tr>
  `;
});

  html += '</table>';

  container.innerHTML = html;

  // Gán sự kiện duyệt cho tất cả nút
  document.querySelectorAll('.btn-approve').forEach(btn => {
    btn.onclick = () => approveAward(btn.dataset.awardId);
  });
}

// Render bảng Approved Awards
function renderApprovedAwards() {
  const { globalAwards } = getData();
  const approvedAwards = globalAwards.filter(a => a.status === 'approved');

  const container = document.getElementById('approvedAwardsContainer');
  container.innerHTML = '';

  if (approvedAwards.length === 0) {
    container.innerHTML = '<p>Chưa có giải thưởng nào được duyệt.</p>';
    return;
  }

  let html = '<table border="1"><tr><th>Tiêu đề</th><th>Người nộp</th><th>Minh chứng</th><th>Trạng thái</th></tr>';
  approvedAwards.forEach(a => {
  html += `
    <tr>
      <td>${a.title}</td>
      <td>${a.user}</td>
      <td>
        ${(a.minhChung || []).map((img, i) => `<img src="${img}" alt="Minh chứng ${i+1}" width="50">`).join('')}
      </td>
      <td>Approved</td>
    </tr>
  `;
});

  html += '</table>';

  container.innerHTML = html;
}

// Hàm duyệt 1 giải thưởng
function approveAward(awardId) {
  const data = getData();
  const { globalAwards, users } = data;

  const idx = globalAwards.findIndex(a => a.awardId == awardId);
  if (idx === -1) {
    alert('Không tìm thấy giải thưởng!');
    return;
  }

  // Cập nhật status
  globalAwards[idx].status = 'approved';
  const user = globalAwards[idx].user;

  if (users[user]) {
    const userAwardIdx = users[user].awards.findIndex(a => a.awardId == awardId);
    if (userAwardIdx !== -1) {
      users[user].awards[userAwardIdx].status = 'approved';
    }
  }

  // Lưu lại
  localStorage.setItem('awards', JSON.stringify(globalAwards));
  localStorage.setItem('users', JSON.stringify(users));

  alert(`Đã duyệt giải thưởng "${globalAwards[idx].title}" cho ${user}.`);

  // Render lại
  renderPendingAwards();
  renderApprovedAwards();
}

// ======== GỌI LẠI LÚC LOAD TRANG ========
renderPendingAwards();
renderApprovedAwards();

window.onload = function() {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  const clients = Object.entries(users)
    .filter(([_, u]) => u.role === 'client')
    .sort((a, b) => (a[1].orderIndex ?? 9999) - (b[1].orderIndex ?? 9999));

  const tbody = document.getElementById('userTableBody');

  function renderUserTable(userList) {
    tbody.innerHTML = '';
    userList.forEach(([email, data]) => {
      const info = data.info || {};
      const row = `<tr>
        <td>${info.fullName || ''}</td>
        <td>${info.dob || ''}</td>
        <td>${info.gender || ''}</td>
        <td>${info.cccd || ''}</td>
        <td>${email}</td>
        <td>${info.phone || ''}</td>
        <td>${info.position || ''}</td>
        <td>
          <a href="test.html?user=${encodeURIComponent(email)}" target="_blank">Xem</a>
          <a class="delete-btn" data-email="${email}">Xóa</a>
        </td>
      </tr>`;
      tbody.innerHTML += row;
    });
    addDeleteEvent();
  }

  function addDeleteEvent() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
      btn.onclick = () => {
        const email = btn.dataset.email;
        if (confirm(`Bạn chắc chắn muốn xóa user ${email}?`)) {
          delete users[email];
          localStorage.setItem('users', JSON.stringify(users));
          const index = clients.findIndex(([em, _]) => em === email);
          if (index !== -1) clients.splice(index, 1);
          renderUserTable(clients);
        }
      };
    });
  }

  renderUserTable(clients);

  // ✅ Sortable chỉ cần init 1 lần duy nhất
  new Sortable(tbody, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: function () {
      const newOrderEmails = Array.from(tbody.querySelectorAll('tr')).map(tr => {
        const emailCell = tr.querySelector('td:nth-child(5)');
        return emailCell?.textContent?.trim();
      });

      newOrderEmails.forEach((email, index) => {
        if (users[email]) {
          users[email].orderIndex = index;
        }
      });

      localStorage.setItem('users', JSON.stringify(users));
    }
  });

  const positionOrder = {
    "Giáo sư": 5,
    "Phó giáo sư": 4,
    "Giảng viên": 3,
    "Chuyên viên": 2,
    "": 1
  };

  document.getElementById('sortPositionBtn').onclick = () => {
    const sorted = clients.sort((a, b) => {
      const posA = positionOrder[(a[1].info?.position || '').trim()] ?? 1;
      const posB = positionOrder[(b[1].info?.position || '').trim()] ?? 1;
      return posB - posA;
    });

    sorted.forEach(([email, data], index) => {
      data.orderIndex = index;
    });

    localStorage.setItem('users', JSON.stringify(users));
    renderUserTable(sorted);
  };
};
