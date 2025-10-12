// Lấy data
function getData() {
  return {
    globalAwards: JSON.parse(localStorage.getItem('awards')) || [],
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

  let html = '<table border="1"><tr><th>Tiêu đề</th><th>Người nộp</th><th>Minh chứng</th><th>Trạng thái</th></tr>';
  pendingAwards.forEach(a => {
  html += `
    <tr>
      <td>${a.title}</td>
      <td>${a.user}</td>
      <td>
        ${(a.minhChung || []).map((img, i) => `<img src="${img}" alt="Minh chứng ${i+1}" width="50">`).join('')}
      </td>
      <td>Pending</td>
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