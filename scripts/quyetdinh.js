class DocumentHandler {
  constructor(type) {
    this.type = 'quyetdinh';
    this.storageKey = `${this.type}_documents`;
    this.counter = this.getLastCounter();
    this.fileHandler = new FileHandler(['doc', 'docx']);
    this.initializeHandlers();
  }

  // Các phương thức khác giống như trong totrinh.js
}

document.addEventListener('DOMContentLoaded', () => {
  new DocumentHandler('quyetdinh');
});