document.addEventListener('DOMContentLoaded', () => {
  const btnSave = document.getElementById('btnSave');
  const btnClear = document.getElementById('btnClear');
  const btnNext = document.getElementById('btnNext');

  btnSave.addEventListener('click', () => {
    const fullName = document.getElementById('fullName').value;
    const dob = document.getElementById('dob').value;
    // const gender = document.getElementById('gender').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const notes = document.getElementById('notes').value;
    const personalInfo = { fullName, dob, email, phone, address, notes };
    localStorage.setItem("personalInfo", JSON.stringify(personalInfo));
    alert(
      `Họ và Tên: ${fullName}\nNgày sinh: ${dob}\nEmail: ${email}\nSố điện thoại: ${phone}\nĐịa chỉ: ${address}\nGhi chú: ${notes}`
    );
  });

  btnClear.addEventListener('click', () => {
    document.getElementById('infoForm').reset();
  });

  btnNext.addEventListener('click', () => {
    window.location='baidang.html';
  });
});