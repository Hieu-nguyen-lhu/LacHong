const postForm = document.getElementById("postForm");
const postList = document.getElementById("postList");

// Load bài đăng từ localStorage khi mở trang
document.addEventListener("DOMContentLoaded", () => {
  const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
  savedPosts.forEach(post => renderPost(post.title, post.content));
});

// Khi submit form
postForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (title && content) {
    // Hiển thị bài mới lên trang
    renderPost(title, content);

    // Lưu vào localStorage
    const savedPosts = JSON.parse(localStorage.getItem("posts")) || [];
    savedPosts.unshift({ title, content }); // unshift để bài mới lên đầu
    localStorage.setItem("posts", JSON.stringify(savedPosts));

    postForm.reset();
  }
});

// Hàm hiển thị bài lên giao diện
function renderPost(title, content) {
  const postDiv = document.createElement("div");
  postDiv.className = "post";
  postDiv.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
  postList.prepend(postDiv);
}
