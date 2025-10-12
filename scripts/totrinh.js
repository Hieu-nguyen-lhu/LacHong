class DocumentHandler {
  constructor(type) {
    this.type = type;
    this.storageKey = `${type}_documents`;
    this.counter = this.getLastCounter();
    this.fileHandler = new FileHandler(['doc', 'docx']);
    this.initializeHandlers();
  }

  getLastCounter() {
    const documents = Utils.loadFromStorage(this.storageKey) || [];
    return documents.length > 0 ? Math.max(...documents.map(doc => doc.stt)) : 0;
  }

  initializeHandlers() {
    document.querySelector('.add-more-btn').addEventListener('click', () => this.addNewRow());
    this.initializeExistingRows();
  }

  async handleSave(row) {
    const stt = row.querySelector('.stt').value;
    const note = row.querySelector('.note').value;
    const file = row.querySelector('.attachment').files[0];

    if (!note || !file) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const fileData = await this.fileHandler.handleFileUpload(file);
      const document = {
        id: Utils.generateId(),
        stt: parseInt(stt),
        note,
        fileName: file.name,
        fileData,
        dateCreated: new Date().toISOString()
      };

      this.saveDocument(document);
      alert('Lưu thành công');
    } catch (error) {
      alert('Lỗi khi lưu tài liệu: ' + error.message);
    }
  }

  saveDocument(document) {
    const documents = Utils.loadFromStorage(this.storageKey) || [];
    documents.push(document);
    Utils.saveToStorage(this.storageKey, documents);
  }

  addNewRow() {
    this.counter++;
    const template = document.querySelector('.form-row').cloneNode(true);
    template.querySelector('.stt').value = this.counter;
    template.querySelector('.note').value = '';
    template.querySelector('.attachment').value = '';
    
    const saveBtn = template.querySelector('.save-btn');
    saveBtn.addEventListener('click', () => this.handleSave(template));

    document.querySelector('.document-container').insertBefore(
      template,
      document.querySelector('.add-more-btn')
    );
  }

  initializeExistingRows() {
    document.querySelectorAll('.form-row').forEach(row => {
      row.querySelector('.save-btn').addEventListener('click', () => this.handleSave(row));
    });
  }
}

// Initialize the handler when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new DocumentHandler('totrinh');
});