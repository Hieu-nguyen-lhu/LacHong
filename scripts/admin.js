class AdminPanel {
  constructor() {
    this.storageKey = 'user_permissions';
    this.features = ['totrinh', 'quyetdinh', 'khenthuong', 'baocao', 'banhanh', 'luutru'];
    this.initialize();
  }

  initialize() {
    this.loadUsers();
    this.setupEventListeners();
  }

  loadUsers() {
    const users = Utils.loadFromStorage(this.storageKey) || [];
    const tbody = document.getElementById('users-list');
    tbody.innerHTML = '';

    users.forEach(user => {
      const row = this.createUserRow(user);
      tbody.appendChild(row);
    });
  }

  createUserRow(user) {
    const row = document.createElement('tr');
    row.className = 'user-row';
    
    // Username cell
    const nameCell = document.createElement('td');
    nameCell.textContent = user.username;
    row.appendChild(nameCell);

    // Permission cells
    this.features.forEach(feature => {
      const cell = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'permission-checkbox';
      checkbox.checked = user.permissions[feature];
      checkbox.addEventListener('change', () => this.updatePermission(user.username, feature, checkbox.checked));
      cell.appendChild(checkbox);
      row.appendChild(cell);
    });

    return row;
  }

  updatePermission(username, feature, value) {
    const users = Utils.loadFromStorage(this.storageKey) || [];
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
      users[userIndex].permissions[feature] = value;
      Utils.saveToStorage(this.storageKey, users);
    }
  }

  setupEventListeners() {
    // Add any additional event listeners here
  }
}

// Initialize the admin panel when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new AdminPanel();
});