class ArchiveManager {
  constructor() {
    this.documentTypes = ['totrinh', 'quyetdinh', 'khenthuong', 'baocao', 'banhanh'];
    this.initialize();
  }

  initialize() {
    this.documentTypes.forEach(type => {
      this.loadDocuments(type);
    });
  }

  loadDocuments(type) {
    const documents = Utils.loadFromStorage(`${type}_documents`) || [];
    const section = document.getElementById(`${type}-archive`);
    const countElement = section.querySelector('.count');
    const listElement = section.querySelector('.archive-list');

    countElement.textContent = documents.length;
    listElement.innerHTML = '';

    documents.forEach(doc => {
      const item = this.createDocumentItem(doc);
      listElement.appendChild(item);
    });
  }

  createDocumentItem(doc) {
    const item = document.createElement('div');
    item.className = 'archive-item';
    item.innerHTML = `
      <span class="stt">${doc.stt}</span>
      <span class="note">${doc.note}</span>
      <a href="#" class="download-link" data-file="${doc.fileData}"
         download="${doc.fileName}">Tải ${doc.fileName}</a>
      <span class="date">${Utils.formatDate(doc.dateCreated)}</span>
    `;

    const downloadLink = item.querySelector('.download-link');
    downloadLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.downloadFile(doc.fileData, doc.fileName);
    });

    return item;
  }

  downloadFile(fileData, fileName) {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initialize the archive manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new ArchiveManager();
});