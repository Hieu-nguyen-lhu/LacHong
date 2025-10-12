document.addEventListener("DOMContentLoaded", function() {
  // --- PHẦN THÔNG TIN NHÂN VIÊN ---
  const selectNhiemVu = document.querySelector(".input.nhiemvu");
  const selectDinhMuc = document.querySelector(".input.dinhmuc");
  const selectMienGiam = document.querySelector(".input.miengiam");
  const inputPhaiThucHien = document.querySelector(".input.phaituchien");
  const inputThucHienNam = document.querySelector(".input.thuchiennam");
  const inputBaoLuu = document.querySelector(".input.baoluu");
  const inputTongNV = document.querySelector(".input.tongnv");
  const inputHoTen = document.querySelector(".input.hoten");
  const inputMSNV = document.querySelector(".input.msnv");
  const selectDonVi = document.querySelector(".input.donvi");
  const btnLuu = document.querySelector(".add-btn.luu-nhanvien");

  function updateDinhMucAndPhaiThucHien() {
    const nhiemVu = selectNhiemVu.value;
    const miengiam = parseInt(selectMienGiam.value) || 0;

    if (nhiemVu === "giangvien") {
      selectDinhMuc.disabled = false;
      selectDinhMuc.style.background = "";
      selectDinhMuc.value = selectDinhMuc.value || ""; // giữ nguyên nếu đã chọn
    } else {
      selectDinhMuc.disabled = true;
      selectDinhMuc.value = "";
      selectDinhMuc.style.background = "#f2f6fc";
    }

    let dinhMuc = 0;
    if (nhiemVu === "giangvien") {
      dinhMuc = parseInt(selectDinhMuc.value) || 0;
      selectDinhMuc.style.color = "#23397a";
    } else {
      dinhMuc = 0;
      selectDinhMuc.style.color = "#888";
    }

    // Tính Phải thực hiện
    let phaiThucHien = dinhMuc - miengiam;
    if (phaiThucHien < 0) phaiThucHien = 0;
    inputPhaiThucHien.value = phaiThucHien;

    // Nếu không phải giảng viên thì định mức là 0, mờ đi
    if (nhiemVu === "giangvien") {
      selectDinhMuc.disabled = false;
      selectDinhMuc.style.pointerEvents = "";
    } else {
      selectDinhMuc.disabled = true;
      selectDinhMuc.style.pointerEvents = "none";
      selectDinhMuc.value = "";
    }

    updateTongNV();
  }
  selectNhiemVu.addEventListener("change", updateDinhMucAndPhaiThucHien);
  selectDinhMuc.addEventListener("change", updateDinhMucAndPhaiThucHien);
  selectMienGiam.addEventListener("change", updateDinhMucAndPhaiThucHien);
  inputBaoLuu.addEventListener("input", updateTongNV);
  inputThucHienNam && inputThucHienNam.addEventListener("input", updateTongNV);

  function updateTongNV() {
  let thuchien = parseInt(inputThucHienNam.value) || 0;
  let baoluu = parseInt(inputBaoLuu.value) || 0;
  inputTongNV.value = thuchien + baoluu;
}
  updateDinhMucAndPhaiThucHien();

  btnLuu.addEventListener("click", function(e) {
    e.preventDefault();
    let user = localStorage.getItem('loggedInUser') || "default";
    let nhanvienData = {
      hoten: inputHoTen.value.trim(),
      msnv: inputMSNV.value.trim(),
      donvi: selectDonVi.value,
      miengiam: selectMienGiam.value,
      nhiemvu: selectNhiemVu.value,
      dinhmuc: selectDinhMuc.value,
      phaituchien: inputPhaiThucHien.value,
      baoluu: inputBaoLuu.value,
      thuchiennam: inputThucHienNam.value,
      tongnv: inputTongNV.value
    };
    localStorage.setItem("nhanvien_" + user, JSON.stringify(nhanvienData));
    alert("Đã lưu thông tin nhân viên cho user: " + user + "!");
  });

  // Tự động fill lại dữ liệu nếu có
  let user = localStorage.getItem('loggedInUser') || "default";
  let saved = localStorage.getItem("nhanvien_" + user);
  if (saved) {
    try {
      let d = JSON.parse(saved);
      inputHoTen.value = d.hoten || "";
      inputMSNV.value = d.msnv || "";
      selectDonVi.value = d.donvi || "";
      selectMienGiam.value = d.miengiam || "";
      selectNhiemVu.value = d.nhiemvu || "";
      selectDinhMuc.value = d.dinhmuc || "";
      inputPhaiThucHien.value = d.phaituchien || "";
      inputBaoLuu.value = d.baoluu || "";
      inputThucHienNam.value = d.thuchiennam || "";
      inputTongNV.value = d.tongnv || "";
      updateDinhMucAndPhaiThucHien();
    } catch {}
  }

  // --- PHẦN ĐỀ TÀI KHOA HỌC ---
  // DOM
  const dt_hoatdong = document.querySelector('.hoatdong-nckh');
  const dt_cap = document.querySelector('.cap-detai');
  const dt_nhiemvu = document.querySelector('.nhiemvu-detai');
  const dt_nghiemthu = document.querySelector('.nghiemthu-detai');
  const dt_thoigian = document.querySelector('.thoigian-detai');
  const dt_file = document.querySelector('.minhchung-detai');
  const dt_file_label = document.querySelector('.file-input-label[for="minhchung-detai"]');
  const dt_linkmc = document.querySelector('.linkminhchung-detai');
  const dt_diem = document.querySelector('.diemquydoi-detai');
  const dt_btnLuu = document.querySelector('.add-btn.luu-detai');
  const dt_tableBody = document.getElementById('bang-noidung-detai');

  // Hiển thị tên file minh chứng
  dt_file.addEventListener('change', function() {
    if (dt_file.files.length === 0) {
      dt_file_label.textContent = "Chọn minh chứng";
    } else {
      let arr = [];
      for (let i = 0; i < dt_file.files.length; ++i) {
        arr.push(dt_file.files[i].name);
      }
      dt_file_label.textContent = arr.join(', ');
    }
  });

  // Tính điểm quy đổi: Tổng số tiết = cấp + nhiệm vụ, chỉ hiển thị nếu nghiệm thu chọn là "Rồi"
  function updateDiemQuyDoi() {
    const cap = parseInt(dt_cap.value) || 0;
    const nv = parseInt(dt_nhiemvu.value) || 0;
    if (dt_nghiemthu.value === "roi") {
      dt_diem.value = cap + nv;
    } else {
      dt_diem.value = "";
    }
  }
  dt_cap.addEventListener("change", updateDiemQuyDoi);
  dt_nhiemvu.addEventListener("change", updateDiemQuyDoi);
  dt_nghiemthu.addEventListener("change", updateDiemQuyDoi);

  // Lưu đề tài khoa học
  dt_btnLuu.addEventListener("click", function(e) {
    e.preventDefault();
    // Validate
    if (!dt_hoatdong.value.trim() || !dt_cap.value || !dt_nhiemvu.value || !dt_nghiemthu.value || !dt_thoigian.value.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin đề tài!");
      return;
    }
    // Lấy user
    let user = localStorage.getItem('loggedInUser') || "default";
    // Lấy minh chứng (danh sách tên file)
    let minhchungNames = [];
    for (let i = 0; i < dt_file.files.length; ++i) {
      minhchungNames.push(dt_file.files[i].name);
    }
    // Thông tin đề tài
    let detai = {
      hoatdong: dt_hoatdong.value,
      cap: dt_cap.options[dt_cap.selectedIndex].text,
      cap_val: parseInt(dt_cap.value) || 0,
      nhiemvu: dt_nhiemvu.options[dt_nhiemvu.selectedIndex].text,
      nhiemvu_val: parseInt(dt_nhiemvu.value) || 0,
      nghiemthu: dt_nghiemthu.options[dt_nghiemthu.selectedIndex].text,
      nghiemthu_val: dt_nghiemthu.value,
      thoigian: dt_thoigian.value,
      minhchung: minhchungNames,
      linkmc: dt_linkmc.value,
      diemquydoi: (dt_nghiemthu.value === "roi") ? (parseInt(dt_cap.value) + parseInt(dt_nhiemvu.value)) : ""
    };
    // Lưu vào localStorage
    let all = JSON.parse(localStorage.getItem("detai_" + user) || "[]");
    all.push(detai);
    localStorage.setItem("detai_" + user, JSON.stringify(all));
    renderDeTaiTable();
    // Reset fields
    dt_hoatdong.value = "";
    dt_cap.selectedIndex = 0;
    dt_nhiemvu.selectedIndex = 0;
    dt_nghiemthu.selectedIndex = 0;
    dt_thoigian.value = "";
    dt_file.value = "";
    dt_file_label.textContent = "Chọn minh chứng";
    dt_linkmc.value = "";
    dt_diem.value = "";
  });

  // Render table đề tài khoa học
  function renderDeTaiTable() {
    let user = localStorage.getItem('loggedInUser') || "default";
    let all = JSON.parse(localStorage.getItem("detai_" + user) || "[]");
    dt_tableBody.innerHTML = "";
    all.forEach((item, idx) => {
      let mc = item.minhchung && item.minhchung.length ? item.minhchung.join(', ') : "";
      dt_tableBody.innerHTML += `
        <tr>
          <td>${item.hoatdong}</td>
          <td>${item.cap}</td>
          <td>${item.nhiemvu}</td>
          <td>${item.nghiemthu}</td>
          <td>${item.thoigian}</td>
          <td>${mc}</td>
          <td><a href="${item.linkmc || '#'}" target="_blank">${item.linkmc || ""}</a></td>
          <td>${item.diemquydoi || ""}</td>
          <td><button type="button" class="btn-xoa-detai" data-idx="${idx}" style="background:#e57373;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-weight:600;cursor:pointer;">Xóa</button></td>
        </tr>
      `;
    });
    // Thêm sự kiện xóa
    Array.from(document.querySelectorAll('.btn-xoa-detai')).forEach(btn => {
      btn.onclick = function() {
        let idx = parseInt(btn.dataset.idx);
        let user = localStorage.getItem('loggedInUser') || "default";
        let all = JSON.parse(localStorage.getItem("detai_" + user) || "[]");
        all.splice(idx, 1);
        localStorage.setItem("detai_" + user, JSON.stringify(all));
        renderDeTaiTable();
        updateTongSoTiet && updateTongSoTiet(); 
  updateThucHienNamFromBang && updateThucHienNamFromBang();
      }
    });
  }
  renderDeTaiTable();
  updateTongSoTiet && updateTongSoTiet(); 
  updateThucHienNamFromBang && updateThucHienNamFromBang();
});
// === PHẦN HOẠT ĐỘNG KHÁC ===
const hoatdongs = [
  {
    label: "Hoạt động nghiên cứu khoa học",
    key: "nckh",
    selector: "#chon-nckh",
    detailLabel: "HDNCKH"
  },
  {
    label: "Hoạt động sinh viên",
    key: "sinhvien",
    selector: "#chon-sinhvien",
    detailLabel: "Hoạt động sinh viên"
  },
  {
    label: "Chấm thi",
    key: "chamthi",
    selector: "#chon-chamthi",
    detailLabel: "Chấm thi"
  },
  {
    label: "Nhiệm vụ khác",
    key: "khac",
    selector: "#chon-khac",
    detailLabel: "Nhiệm vụ khác"
  }
];
const containerDetail = document.getElementById('other-activity-detail-box');
const emptyMessage = document.getElementById('other-activity-empty-message');
const btnLuuHoatDongKhac = document.getElementById('luu-hoatdongkhac');
const tableBodyHDK = document.getElementById('bang-noidung-hoatdongkhac');
let detailInputs = {};

hoatdongs.forEach(hd => {
  document.querySelector(hd.selector).addEventListener('change', renderOtherActivityInputs);
});
function renderOtherActivityInputs() {
  containerDetail.innerHTML = "";
  detailInputs = {};
  let selected = hoatdongs.filter(hd => document.querySelector(hd.selector).value === "co");
  if (selected.length === 0) {
    let msg = document.createElement('div');
    msg.className = 'other-activity-empty-message';
    msg.textContent = "Không có hoạt động nào được chọn";
    containerDetail.appendChild(msg);
    return;
  }
  selected.forEach(hd => {
    // 1 dòng nhập gồm: label, input tự do, input link, input file
    const row = document.createElement('div');
    row.className = 'other-activity-detail-row';
    // Label
    const label = document.createElement('label');
    label.textContent = hd.detailLabel;
    row.appendChild(label);
    // Nhập tự do
    const inp = document.createElement('input');
    inp.type = "text";
    inp.className = "other-activity-detail-input";
    inp.placeholder = "Nhập thông tin";
    row.appendChild(inp);
    // Nhập link
    const link = document.createElement('input');
    link.type = "url";
    link.className = "other-activity-detail-link";
    link.placeholder = "Link minh chứng";
    row.appendChild(link);
    // Chọn hình
    const wrap = document.createElement('div');
    wrap.className = "other-activity-file-wrap";
    const labelFile = document.createElement('label');
    labelFile.className = "other-activity-file-label";
    labelFile.textContent = "Chọn hình minh chứng";
    labelFile.htmlFor = "file-other-" + hd.key;
    const file = document.createElement('input');
    file.type = "file";
    file.accept = "image/*";
    file.className = "other-activity-file-input";
    file.id = "file-other-" + hd.key;
    file.addEventListener("change", function() {
      if (file.files.length) {
        labelFile.textContent = file.files[0].name;
      } else {
        labelFile.textContent = "Chọn hình minh chứng";
      }
    });
    wrap.appendChild(labelFile);
    wrap.appendChild(file);
    row.appendChild(wrap);
    containerDetail.appendChild(row);
    // Lưu ref cho lấy dữ liệu về sau
    detailInputs[hd.key] = {inp, link, file};
  });
}
renderOtherActivityInputs();

btnLuuHoatDongKhac.addEventListener("click", function(e) {
  e.preventDefault();
  let user = localStorage.getItem('loggedInUser') || "default";
  let data = [];
  // Lấy từng mục nếu có
  hoatdongs.forEach(hd => {
    if (document.querySelector(hd.selector).value === "co") {
      let v = detailInputs[hd.key];
      if (!v) return;
      data.push({
        loai: hd.label,
        thongtin: v.inp.value,
        link: v.link.value,
        hinh: v.file.files.length ? v.file.files[0].name : ""
      });
    }
  });
  localStorage.setItem("hoatdongkhac_" + user, JSON.stringify(data));
  renderTableHDK();
  updateTongSoTiet && updateTongSoTiet(); 
  updateThucHienNamFromBang && updateThucHienNamFromBang();
});

function renderTableHDK() {
  let user = localStorage.getItem('loggedInUser') || "default";
  let data = JSON.parse(localStorage.getItem("hoatdongkhac_" + user) || "[]");
  tableBodyHDK.innerHTML = "";
  data.forEach((item, idx) => {
    tableBodyHDK.innerHTML += `
      <tr>
        <td>${item.loai}</td>
        <td>${item.thongtin}</td>
        <td><a href="${item.link || "#"}" target="_blank">${item.link || ""}</a></td>
        <td>${item.hinh}</td>
        <td>5</td>
        <td><button type="button" class="btn-xoa-hdk" data-idx="${idx}" style="background:#e57373;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-weight:600;cursor:pointer;">Xóa</button></td>
      </tr>
    `;
  });
  // Sự kiện xóa
  Array.from(document.querySelectorAll('.btn-xoa-hdk')).forEach(btn => {
    btn.onclick = function() {
      let idx = parseInt(btn.dataset.idx);
      let user = localStorage.getItem('loggedInUser') || "default";
      let data = JSON.parse(localStorage.getItem("hoatdongkhac_" + user) || "[]");
      data.splice(idx, 1);
      localStorage.setItem("hoatdongkhac_" + user, JSON.stringify(data));
      renderTableHDK();
      updateTongSoTiet && updateTongSoTiet(); 
      updateThucHienNamFromBang && updateThucHienNamFromBang();
    }
  });
}
// Khi load trang thì render lại
renderTableHDK();
// ==== GIÁO TRÌNH ====
const giaotrinhGrid = document.querySelector('.giaotrinh-input-grid');
const tbodyGT = document.getElementById('bang-noidung-giaotrinh');
if (giaotrinhGrid) {
  giaotrinhGrid.innerHTML = `
    <select class="input gt-loaisach">
      <option value="Sách chuyên khảo">Sách chuyên khảo</option>
      <option value="Tham khảo">Tham khảo</option>
      <option value="Giáo trình">Giáo trình</option>
    </select>
    <select class="input gt-theloai">
      <option value="">Chọn thể loại</option>
      <option value="quocte">Quốc tế - 100</option>
      <option value="trongnuoc">Trong nước - 50</option>
    </select>
    <select class="input gt-nhiemvu">
      <option value="">Chọn nhiệm vụ</option>
      <option value="chubien">Chủ biên - 50</option>
      <option value="khongchubien">Không chủ biên - 25</option>
    </select>
    <input type="text" class="input gt-noiphat" placeholder="Nơi phát hành">
    <input type="text" class="input gt-thoigian" placeholder="Thời gian">
    <input type="file" class="input gt-minhchung" style="padding: 0.5em; background: #fff;">
    <input type="text" class="input gt-link" placeholder="Link minh chứng">
    <input type="number" class="input gt-ketqua" value="0" min="0" readonly>
  `;
  // Optional: custom file input như các phần khác
  function setupCustomFileInput(selector, text) {
    document.querySelectorAll(selector).forEach(function (input) {
      const wrap = document.createElement('span');
      wrap.className = 'file-input-wrap';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      const label = document.createElement('label');
      label.className = 'file-input-label';
      label.textContent = text || "Chọn file minh chứng";
      label.htmlFor = input.id || '';
      wrap.insertBefore(label, input);
      input.classList.add('file-input-custom');
      if (!input.id) input.id = 'file-' + Math.random().toString(36).substr(2, 9);
      const preview = document.createElement('span');
      preview.className = 'file-name-preview';
      wrap.appendChild(preview);
      label.addEventListener('click', function (e) {
        e.preventDefault();
        input.click();
      });
      input.addEventListener('change', function () {
        preview.textContent = input.files.length ? input.files[0].name : '';
      });
    });
  }
  setTimeout(function () {
    setupCustomFileInput('.gt-minhchung', "Chọn file minh chứng");
  }, 0);

  const GT_THELOAI_GIA_TRI = { quocte: 100, trongnuoc: 50 };
  const GT_NHIEMVU_GIA_TRI = { chubien: 50, khongchubien: 25 };

  const gt_loaiSach = giaotrinhGrid.querySelector('.gt-loaisach');
  const gt_theLoai = giaotrinhGrid.querySelector('.gt-theloai');
  const gt_nhiemVu = giaotrinhGrid.querySelector('.gt-nhiemvu');
  const gt_noiPhatHanh = giaotrinhGrid.querySelector('.gt-noiphat');
  const gt_thoiGian = giaotrinhGrid.querySelector('.gt-thoigian');
  const gt_file = giaotrinhGrid.querySelector('.gt-minhchung');
  const gt_link = giaotrinhGrid.querySelector('.gt-link');
  const gt_ketQua = giaotrinhGrid.querySelector('.gt-ketqua');
  const btnLuuGT = document.querySelector('.luu-gt');

  function calcKetQuaGT() {
    const theloaiVal = gt_theLoai.value;
    const nvVal = gt_nhiemVu.value;
    if (GT_THELOAI_GIA_TRI[theloaiVal] && GT_NHIEMVU_GIA_TRI[nvVal]) {
      gt_ketQua.value = GT_THELOAI_GIA_TRI[theloaiVal] + GT_NHIEMVU_GIA_TRI[nvVal];
    } else {
      gt_ketQua.value = 0;
    }
  }
  [gt_theLoai, gt_nhiemVu].forEach(el => el.addEventListener('change', calcKetQuaGT));
  calcKetQuaGT();

  function renderGiaotrinhList() {
    tbodyGT.innerHTML = "";
    const user = localStorage.getItem('loggedInUser');
    if (!user) return;
    const data = JSON.parse(localStorage.getItem('giaotrinh_' + user)) || [];
    data.forEach((gt, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${gt.loaisach || ''}</td>
        <td>${gt.theloaiText || ''}</td>
        <td>${gt.nhiemvuText || ''}</td>
        <td>${gt.noiPhatHanh || ''}</td>
        <td>${gt.thoigian || ''}</td>
        <td>${gt.minhchungName || ''}</td>
        <td>${gt.linkminhchung || ''}</td>
        <td>${gt.ketqua}</td>
        <td>
          <button class="del-gt-btn" data-idx="${idx}" style="background:#e57373;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-weight:600;cursor:pointer;">Xóa</button>
        </td>
      `;
      tbodyGT.appendChild(tr);
    });
    const delBtns = tbodyGT.querySelectorAll('.del-gt-btn');
    delBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(btn.getAttribute('data-idx'));
        deleteGiaotrinh(idx);
      });
    });
    updateTongSoTiet && updateTongSoTiet();
    updateThucHienNamFromBang && updateThucHienNamFromBang();
  }

  function deleteGiaotrinh(idx) {
    const user = localStorage.getItem('loggedInUser');
    if (!user) return;
    let data = JSON.parse(localStorage.getItem('giaotrinh_' + user)) || [];
    data.splice(idx, 1);
    localStorage.setItem('giaotrinh_' + user, JSON.stringify(data));
    renderGiaotrinhList();
    updateThucHienNamFromBang && updateThucHienNamFromBang();
    checkAndSaveUserFullInfo && checkAndSaveUserFullInfo(user);
    updateTongSoTiet && updateTongSoTiet();
  }

  function checkAndSaveUserFullInfo() {
  // Dummy function: để tránh lỗi, không làm gì cả.
}
  btnLuuGT.addEventListener('click', function (e) {
    e.preventDefault();
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
      alert('Bạn chưa đăng nhập!');
      return;
    }
    const loaisach = gt_loaiSach.value;
    const theloai = gt_theLoai.value;
    const theloaiText = gt_theLoai.options[gt_theLoai.selectedIndex]?.text || '';
    const minhchungFile = gt_file.files[0];
    const minhchungName = minhchungFile ? minhchungFile.name : '';
    const nhiemvu = gt_nhiemVu.value;
    const nhiemvuText = gt_nhiemVu.options[gt_nhiemVu.selectedIndex]?.text || '';
    const noiPhatHanh = gt_noiPhatHanh.value.trim();
    const thoigian = gt_thoiGian.value.trim();
    const linkminhchung = gt_link.value.trim();
    const ketqua = gt_ketQua.value;
    if (!loaisach || !theloai || !nhiemvu) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    let data = JSON.parse(localStorage.getItem('giaotrinh_' + user)) || [];
    data.push({
      loaisach, theloai, theloaiText, nhiemvu, nhiemvuText, noiPhatHanh, thoigian, minhchungName, linkminhchung, ketqua
    });
    localStorage.setItem('giaotrinh_' + user, JSON.stringify(data));
    gt_loaiSach.value = '';
    gt_theLoai.value = '';
    gt_file.value = '';
    gt_nhiemVu.value = '';
    gt_noiPhatHanh.value = '';
    gt_thoiGian.value = '';
    gt_link.value = '';
    gt_ketQua.value = 0;
    renderGiaotrinhList();
    checkAndSaveUserFullInfo && checkAndSaveUserFullInfo(user);
  });

  renderGiaotrinhList();
  updateTongSoTiet && updateTongSoTiet(); 
      updateThucHienNamFromBang && updateThucHienNamFromBang();
}

// ==== BÀI BÁO ====
const baibaoGrid = document.querySelector('.baibao-input-grid');
const tbodyBB = document.getElementById('bang-noidung-baibao');
if (baibaoGrid) {
  baibaoGrid.innerHTML = `
    <select class="input bb-theloai-tapchi">
      <option value="">Thể loại tạp chí</option>
      <option value="wos">WOS - 250</option>
      <option value="scopus">Scopus - 200</option>
      <option value="hoithao">Hội thảo - 180</option>
      <option value="hdgsnn">HĐGSNN - 150</option>
      <option value="kh-lh">Tạp chí KHLH - 150</option>
    </select>
    <select class="input bb-theloai">
      <option value="">Chọn thể loại</option>
      <option value="quocte">Quốc tế</option>
      <option value="trongnuoc">Trong nước</option>
    </select>
    <select class="input bb-tacgia">
      <option value="">Chọn tác giả</option>
      <option value="chinh">Tác giả chính - 10</option>
      <option value="phu">Tác giả phụ - 0</option>
    </select>
    <input type="text" class="input bb-tentapchi" placeholder="Tên tạp chí">
    <input type="text" class="input bb-issn" placeholder="Mã ISSN">
    <input type="file" class="input bb-minhchung" style="padding: 0.5em; background: #fff;">
    <input type="text" class="input bb-link" placeholder="Link minh chứng">
    <input type="number" class="input bb-ketqua" value="0" min="0" readonly>
  `;
  setTimeout(function () {
    setupCustomFileInput('.bb-minhchung', "Chọn file minh chứng");
  }, 0);
  const BB_THELOAI_TC_GIA_TRI = {
    wos: 250, scopus: 200, hoithao: 180, hdgsnn: 150, 'kh-lh': 150
  };
  const BB_THELOAI_GIA_TRI = { quocte: 100, trongnuoc: 50 };
  const BB_TACGIA_GIA_TRI = { chinh: 10, phu: 0 };

  const bb_theLoaiTC = baibaoGrid.querySelector('.bb-theloai-tapchi');
  const bb_theLoai = baibaoGrid.querySelector('.bb-theloai');
  const bb_tacGia = baibaoGrid.querySelector('.bb-tacgia');
  const bb_tenTC = baibaoGrid.querySelector('.bb-tentapchi');
  const bb_issn = baibaoGrid.querySelector('.bb-issn');
  const bb_file = baibaoGrid.querySelector('.bb-minhchung');
  const bb_link = baibaoGrid.querySelector('.bb-link');
  const bb_ketQua = baibaoGrid.querySelector('.bb-ketqua');
  const btnLuuBB = document.querySelector('.luu-bb');

  function calcKetQuaBB() {
    const tcVal = bb_theLoaiTC.value;
    const theloaiVal = bb_theLoai.value;
    const tgVal = bb_tacGia.value;
    if (
      BB_THELOAI_TC_GIA_TRI[tcVal] !== undefined &&
      BB_THELOAI_GIA_TRI[theloaiVal] !== undefined &&
      BB_TACGIA_GIA_TRI[tgVal] !== undefined
    ) {
      bb_ketQua.value =
        BB_THELOAI_TC_GIA_TRI[tcVal] +
        BB_THELOAI_GIA_TRI[theloaiVal] +
        BB_TACGIA_GIA_TRI[tgVal];
    } else {
      bb_ketQua.value = 0;
    }
  }
  [bb_theLoaiTC, bb_theLoai, bb_tacGia].forEach(el =>
    el.addEventListener('change', calcKetQuaBB)
  );
  calcKetQuaBB();

  function renderBaibaoList() {
    tbodyBB.innerHTML = "";
    const user = localStorage.getItem('loggedInUser');
    if (!user) return;
    const data = JSON.parse(localStorage.getItem('baibao_' + user)) || [];
    data.forEach((bb, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${bb.theloaiText || ''}</td>
        <td>${bb.theloaiLoaiText || ''}</td>
        <td>${bb.tacgiaText || ''}</td>
        <td>${bb.tentapchi || ''}</td>
        <td>${bb.issn || ''}</td>
        <td>${bb.minhchungName || ''}</td>
        <td>${bb.linkminhchung || ''}</td>
        <td>${bb.ketqua}</td>
        <td>
          <button class="del-bb-btn" data-idx="${idx}" style="background:#e57373;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-weight:600;cursor:pointer;">Xóa</button>
        </td>
      `;
      tbodyBB.appendChild(tr);
    });
    const delBtns = tbodyBB.querySelectorAll('.del-bb-btn');
    delBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(btn.getAttribute('data-idx'));
        deleteBaibao(idx);
      });
    });
    updateTongSoTiet && updateTongSoTiet();
    updateThucHienNamFromBang && updateThucHienNamFromBang();
  }

  function deleteBaibao(idx) {
    const user = localStorage.getItem('loggedInUser');
    if (!user) return;
    let data = JSON.parse(localStorage.getItem('baibao_' + user)) || [];
    data.splice(idx, 1);
    localStorage.setItem('baibao_' + user, JSON.stringify(data));
    renderBaibaoList();
    checkAndSaveUserFullInfo && checkAndSaveUserFullInfo(user);
    updateTongSoTiet && updateTongSoTiet(); 
  }

  btnLuuBB.addEventListener('click', function (e) {
    e.preventDefault();
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
      alert('Bạn chưa đăng nhập!');
      return;
    }
    const theloai = bb_theLoaiTC.value;
    const theloaiText = bb_theLoaiTC.options[bb_theLoaiTC.selectedIndex]?.text || '';
    const theloaiLoai = bb_theLoai.value;
    const theloaiLoaiText = bb_theLoai.options[bb_theLoai.selectedIndex]?.text || '';
    const tacgia = bb_tacGia.value;
    const tacgiaText = bb_tacGia.options[bb_tacGia.selectedIndex]?.text || '';
    const tentapchi = bb_tenTC.value.trim();
    const issn = bb_issn.value.trim();
    const minhchungFile = bb_file.files[0];
    const minhchungName = minhchungFile ? minhchungFile.name : '';
    const linkminhchung = bb_link.value.trim();
    const ketqua = bb_ketQua.value;
    if (!theloai || !theloaiLoai || !tacgia) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    let data = JSON.parse(localStorage.getItem('baibao_' + user)) || [];
    data.push({
      theloai, theloaiText,
      theloaiLoai, theloaiLoaiText,
      tacgia, tacgiaText,
      tentapchi, issn,
      minhchungName, linkminhchung, ketqua
    });
    localStorage.setItem('baibao_' + user, JSON.stringify(data));
    bb_theLoaiTC.value = '';
    bb_theLoai.value = '';
    bb_tacGia.value = '';
    bb_tenTC.value = '';
    bb_issn.value = '';
    bb_file.value = '';
    bb_link.value = '';
    bb_ketQua.value = 0;
    renderBaibaoList();
    checkAndSaveUserFullInfo && checkAndSaveUserFullInfo(user);
  });

  renderBaibaoList();
  updateTongSoTiet && updateTongSoTiet(); 
      updateThucHienNamFromBang && updateThucHienNamFromBang();
}

// ==== ĐỀ TÀI/BÀI BÁO KHÁC ====
const dtbbGrid = document.querySelector('.dtbb-input-grid');
const tbodyDTBB = document.getElementById('bang-noidung-dtbb');
if (dtbbGrid) {
  dtbbGrid.innerHTML = `
    <select class="input dtbb-loai">
      <option value="">Chọn loại</option>
      <option value="detai">Đề tài</option>
      <option value="baibao">Bài báo</option>
    </select>
    <select class="input dtbb-theloai">
      <option value="">Chọn thể loại</option>
      <option value="quocte">Quốc tế - 50</option>
      <option value="trongnuoc">Trong nước - 25</option>
    </select>
    <input type="file" class="input dtbb-minhchung" style="padding: 0.5em; background: #fff;">
    <input type="text" class="input dtbb-link" placeholder="Link minh chứng">
    <input type="number" class="input dtbb-ketqua" value="0" min="0" readonly>
  `;
  setTimeout(function () {
    setupCustomFileInput('.dtbb-minhchung', "Chọn file minh chứng");
  }, 0);

  const DTBB_THELOAI_GIA_TRI = { quocte: 50, trongnuoc: 25 };

  const dtbb_loai = dtbbGrid.querySelector('.dtbb-loai');
  const dtbb_theloai = dtbbGrid.querySelector('.dtbb-theloai');
  const dtbb_file = dtbbGrid.querySelector('.dtbb-minhchung');
  const dtbb_link = dtbbGrid.querySelector('.dtbb-link');
  const dtbb_ketqua = dtbbGrid.querySelector('.dtbb-ketqua');
  const btnLuuDTBB = document.querySelector('.luu-dtbb');

  function calcKetQuaDTBB() {
    const theloaiVal = dtbb_theloai.value;
    if (DTBB_THELOAI_GIA_TRI[theloaiVal] !== undefined) {
      dtbb_ketqua.value = DTBB_THELOAI_GIA_TRI[theloaiVal];
    } else {
      dtbb_ketqua.value = 0;
    }
  }
  [dtbb_loai, dtbb_theloai].forEach(el => el.addEventListener('change', calcKetQuaDTBB));
  calcKetQuaDTBB();

  function renderDTBBList() {
    tbodyDTBB.innerHTML = "";
    const user = localStorage.getItem('loggedInUser');
    if (!user) return;
    const data = JSON.parse(localStorage.getItem('dtbb_' + user)) || [];
    data.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.loaiText || ''}</td>
        <td>${item.theloaiText || ''}</td>
        <td>${item.minhchungName || ''}</td>
        <td>${item.linkminhchung || ''}</td>
        <td>${item.ketqua}</td>
        <td>
          <button class="del-dtbb-btn" data-idx="${idx}" style="background:#e57373;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-weight:600;cursor:pointer;">Xóa</button>
        </td>
      `;
      tbodyDTBB.appendChild(tr);
    });
    const delBtns = tbodyDTBB.querySelectorAll('.del-dtbb-btn');
    delBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(btn.getAttribute('data-idx'));
        deleteDTBB(idx);
      });
    });
    updateTongSoTiet && updateTongSoTiet();
    updateThucHienNamFromBang && updateThucHienNamFromBang();
  }

  function deleteDTBB(idx) {
    const user = localStorage.getItem('loggedInUser');
    if (!user) return;
    let data = JSON.parse(localStorage.getItem('dtbb_' + user)) || [];
    data.splice(idx, 1);
    localStorage.setItem('dtbb_' + user, JSON.stringify(data));
    renderDTBBList();
    checkAndSaveUserFullInfo && checkAndSaveUserFullInfo(user);
    updateTongSoTiet && updateTongSoTiet(); 
  }

  btnLuuDTBB.addEventListener('click', function (e) {
    e.preventDefault();
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
      alert('Bạn chưa đăng nhập!');
      return;
    }
    const loai = dtbb_loai.value;
    const loaiText = dtbb_loai.options[dtbb_loai.selectedIndex]?.text || '';
    const theloai = dtbb_theloai.value;
    const theloaiText = dtbb_theloai.options[dtbb_theloai.selectedIndex]?.text || '';
    const minhchungFile = dtbb_file.files[0];
    const minhchungName = minhchungFile ? minhchungFile.name : '';
    const linkminhchung = dtbb_link.value.trim();
    const ketqua = dtbb_ketqua.value;
    if (!loai || !theloai) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    let data = JSON.parse(localStorage.getItem('dtbb_' + user)) || [];
    data.push({ loai, loaiText, theloai, theloaiText, minhchungName, linkminhchung, ketqua });
    localStorage.setItem('dtbb_' + user, JSON.stringify(data));
    dtbb_loai.value = '';
    dtbb_theloai.value = '';
    dtbb_file.value = '';
    dtbb_link.value = '';
    dtbb_ketqua.value = 0;
    renderDTBBList();
    checkAndSaveUserFullInfo && checkAndSaveUserFullInfo(user);
  });

  renderDTBBList();
  updateTongSoTiet && updateTongSoTiet(); 
      updateThucHienNamFromBang && updateThucHienNamFromBang();
}

// ==== CUỘC THI ====
const cuocthiGrid = document.querySelector('.cuocthi-input-grid');
const tbodyCT = document.getElementById('bang-noidung-cuochthi');
if (cuocthiGrid) {
  cuocthiGrid.innerHTML = `
    <select class="input ct-cap">
      <option value="">Cấp</option>
      <option value="bo">Bộ - 50</option>
      <option value="tinh">Tỉnh - 25</option>
      <option value="khac">Khác - 10</option>
    </select>
    <input type="file" class="input ct-minhchung" style="padding: 0.5em; background: #fff;">
    <input type="text" class="input ct-link" placeholder="Link minh chứng">
    <input type="number" class="input ct-ketqua" value="0" min="0" readonly>
  `;
  setTimeout(function () {
    setupCustomFileInput('.ct-minhchung', "Chọn file minh chứng");
  }, 0);

  const CT_CAP_GIA_TRI = { bo: 50, tinh: 25, khac: 10 };

  const ct_cap = cuocthiGrid.querySelector('.ct-cap');
  const ct_file = cuocthiGrid.querySelector('.ct-minhchung');
  const ct_link = cuocthiGrid.querySelector('.ct-link');
  const ct_ketqua = cuocthiGrid.querySelector('.ct-ketqua');
  const btnLuuCT = document.querySelector('.luu-cuochthi');

  function calcKetQuaCT() {
    const capVal = ct_cap.value;
    if (CT_CAP_GIA_TRI[capVal] !== undefined) {
      ct_ketqua.value = CT_CAP_GIA_TRI[capVal];
    } else {
      ct_ketqua.value = 0;
    }
  }
  [ct_cap].forEach(el => el.addEventListener('change', calcKetQuaCT));
  calcKetQuaCT();

  function renderCuocThiList() {
    tbodyCT.innerHTML = "";
    const user = localStorage.getItem('loggedInUser');
    if (!user) return;
    const data = JSON.parse(localStorage.getItem('cuocthi_' + user)) || [];
    data.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.capText || ''}</td>
        <td>${item.minhchungName || ''}</td>
        <td>${item.linkminhchung || ''}</td>
        <td>${item.ketqua}</td>
        <td>
          <button class="del-cuochthi-btn" data-idx="${idx}" style="background:#e57373;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-weight:600;cursor:pointer;">Xóa</button>
        </td>
      `;
      tbodyCT.appendChild(tr);
    });
    const delBtns = tbodyCT.querySelectorAll('.del-cuochthi-btn');
    delBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(btn.getAttribute('data-idx'));
        deleteCuocThi(idx);
      });
    });
    updateTongSoTiet && updateTongSoTiet();
    updateThucHienNamFromBang && updateThucHienNamFromBang();
  }

  function deleteCuocThi(idx) {
    const user = localStorage.getItem('loggedInUser');
    if (!user) return;
    let data = JSON.parse(localStorage.getItem('cuocthi_' + user)) || [];
    data.splice(idx, 1);
    localStorage.setItem('cuocthi_' + user, JSON.stringify(data));
    renderCuocThiList();
    checkAndSaveUserFullInfo && checkAndSaveUserFullInfo(user);
    updateTongSoTiet && updateTongSoTiet(); 
  }

  btnLuuCT.addEventListener('click', function (e) {
    e.preventDefault();
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
      alert('Bạn chưa đăng nhập!');
      return;
    }
    const cap = ct_cap.value;
    const capText = ct_cap.options[ct_cap.selectedIndex]?.text || '';
    const minhchungFile = ct_file.files[0];
    const minhchungName = minhchungFile ? minhchungFile.name : '';
    const linkminhchung = ct_link.value.trim();
    const ketqua = ct_ketqua.value;
    if (!cap) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    let data = JSON.parse(localStorage.getItem('cuocthi_' + user)) || [];
    data.push({ cap, capText, minhchungName, linkminhchung, ketqua });
    localStorage.setItem('cuocthi_' + user, JSON.stringify(data));
    ct_cap.value = '';
    ct_file.value = '';
    ct_link.value = '';
    ct_ketqua.value = 0;
    renderCuocThiList();
    checkAndSaveUserFullInfo && checkAndSaveUserFullInfo(user);
  });

  renderCuocThiList();
  updateTongSoTiet && updateTongSoTiet(); 
      updateThucHienNamFromBang && updateThucHienNamFromBang();
}
function updateTongSoTiet() {
  const user = localStorage.getItem('loggedInUser');
  let tong = 0;
  // Đề tài khoa học
  let detai = JSON.parse(localStorage.getItem('detai_' + user)) || [];
  tong += detai.reduce((s, i) => s + (Number(i.ketqua) || Number(i.diemquydoi) || 0), 0);
  // Giáo trình
  let giaotrinh = JSON.parse(localStorage.getItem('giaotrinh_' + user)) || [];
  tong += giaotrinh.reduce((s, i) => s + (Number(i.ketqua) || 0), 0);
  // Bài báo
  let baibao = JSON.parse(localStorage.getItem('baibao_' + user)) || [];
  tong += baibao.reduce((s, i) => s + (Number(i.ketqua) || 0), 0);
  // Đề tài/bài báo khác
  let dtbb = JSON.parse(localStorage.getItem('dtbb_' + user)) || [];
  tong += dtbb.reduce((s, i) => s + (Number(i.ketqua) || 0), 0);
  // Cuộc thi
  let cuocthi = JSON.parse(localStorage.getItem('cuocthi_' + user)) || [];
  tong += cuocthi.reduce((s, i) => s + (Number(i.ketqua) || 0), 0);
  // Hoạt động khác: mỗi item 5 điểm
  let hoatdongkhac = JSON.parse(localStorage.getItem('hoatdongkhac_' + user)) || [];
  tong += hoatdongkhac.length * 5;

  // Kết luận: >= 150 là Đạt, còn lại là Không đạt
  const datStr = tong >= 150 ? "Đạt" : "Không đạt";
  const el = document.getElementById('tong-so-tiet');
  if (el) el.textContent = `Tổng số tiết: ${tong} - ${datStr}`;
}
function updateThucHienNamFromBang() {
  const inputThucHienNam = document.querySelector('.input.thuchiennam');
  const user = localStorage.getItem('loggedInUser');
  let tong = 0;
  // ... (tính tổng tiết như cũ)
  let detai = JSON.parse(localStorage.getItem('detai_' + user)) || [];
  tong += detai.reduce((s, i) => s + (Number(i.ketqua) || Number(i.diemquydoi) || 0), 0);
  let giaotrinh = JSON.parse(localStorage.getItem('giaotrinh_' + user)) || [];
  tong += giaotrinh.reduce((s, i) => s + (Number(i.ketqua) || 0), 0);
  let baibao = JSON.parse(localStorage.getItem('baibao_' + user)) || [];
  tong += baibao.reduce((s, i) => s + (Number(i.ketqua) || 0), 0);
  let dtbb = JSON.parse(localStorage.getItem('dtbb_' + user)) || [];
  tong += dtbb.reduce((s, i) => s + (Number(i.ketqua) || 0), 0);
  let cuocthi = JSON.parse(localStorage.getItem('cuocthi_' + user)) || [];
  tong += cuocthi.reduce((s, i) => s + (Number(i.ketqua) || 0), 0);
  let hoatdongkhac = JSON.parse(localStorage.getItem('hoatdongkhac_' + user)) || [];
  tong += hoatdongkhac.length * 5;
  if (inputThucHienNam) inputThucHienNam.value = tong;

  // Gọi cập nhật tổng NV ngay sau khi cập nhật thực hiện trong năm
  if (typeof updateTongNV === "function") updateTongNV();
}
