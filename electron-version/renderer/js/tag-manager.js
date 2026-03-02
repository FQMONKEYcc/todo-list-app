// ===== Tag Manager Modal — Enhanced UX =====

const TagManager = {
  modal: null,
  listContainer: null,
  nameInput: null,
  colorInput: null,
  tags: [],

  init() {
    this.modal = document.getElementById('tagModal');
    this.listContainer = document.getElementById('tagManagerList');
    this.nameInput = document.getElementById('newTagName');
    this.colorInput = document.getElementById('newTagColor');

    document.getElementById('btnCloseTagModal').addEventListener('click', () => this.close());
    document.getElementById('btnManageTags').addEventListener('click', () => this.open());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    document.getElementById('btnAddTag').addEventListener('click', () => this.addTag());
    this.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.addTag(); }
    });
  },

  async open() {
    this.tags = await window.api.getTags();
    this.renderList();
    this.modal.classList.remove('closing');
    this.modal.style.display = 'flex';
    this.nameInput.focus();
  },

  close() {
    this.modal.classList.add('closing');
    setTimeout(() => {
      this.modal.style.display = 'none';
      this.modal.classList.remove('closing');
    }, 150);
    if (typeof App !== 'undefined') App.refresh();
  },

  renderList() {
    this.listContainer.innerHTML = '';
    this.tags.forEach(tag => {
      const item = document.createElement('div');
      item.className = 'tag-manager-item';
      item.innerHTML = `
        <input type="color" value="${tag.color}" data-id="${tag.id}" class="tag-color-input">
        <input type="text" value="${tag.name}" data-id="${tag.id}" class="tag-name-input">
        <button class="btn-delete-tag" data-id="${tag.id}" title="Delete tag">&times;</button>
      `;

      // Color change
      item.querySelector('.tag-color-input').addEventListener('change', async (e) => {
        await window.api.updateTag(tag.id, { color: e.target.value });
      });

      // Name change (on blur)
      const nameInput = item.querySelector('.tag-name-input');
      nameInput.addEventListener('blur', async () => {
        const newName = nameInput.value.trim();
        if (newName && newName !== tag.name) {
          await window.api.updateTag(tag.id, { name: newName });
          tag.name = newName;
        }
      });
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') nameInput.blur();
      });

      // Delete
      item.querySelector('.btn-delete-tag').addEventListener('click', async () => {
        const todos = await window.api.getTodos();
        const affected = todos.filter(t => t.tagIds.includes(tag.id)).length;
        const msg = affected > 0
          ? `Delete tag "${tag.name}"? It is used by ${affected} todo(s).`
          : `Delete tag "${tag.name}"?`;
        if (confirm(msg)) {
          await window.api.deleteTag(tag.id);
          this.tags = this.tags.filter(t => t.id !== tag.id);
          this.renderList();
        }
      });

      this.listContainer.appendChild(item);
    });
  },

  async addTag() {
    const name = this.nameInput.value.trim();
    if (!name) {
      this.nameInput.classList.add('shake');
      setTimeout(() => this.nameInput.classList.remove('shake'), 400);
      return;
    }

    const tag = await window.api.createTag({
      name,
      color: this.colorInput.value
    });
    this.tags.push(tag);
    this.renderList();
    this.nameInput.value = '';
    this.nameInput.focus();
  }
};
