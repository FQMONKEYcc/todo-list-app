// ===== Todo Form (Create / Edit Modal) — Neutralinojs =====

const TodoForm = {
  modal: null,
  form: null,
  titleInput: null,
  descInput: null,
  deadlineInput: null,
  statusInput: null,
  tagSelector: null,
  idInput: null,
  modalTitle: null,
  quickTagName: null,
  quickTagColor: null,
  btnQuickAddTag: null,
  tags: [],

  init() {
    this.modal = document.getElementById('todoModal');
    this.form = document.getElementById('todoForm');
    this.titleInput = document.getElementById('todoTitleInput');
    this.descInput = document.getElementById('todoDescInput');
    this.deadlineInput = document.getElementById('todoDeadlineInput');
    this.statusInput = document.getElementById('todoStatusInput');
    this.tagSelector = document.getElementById('tagSelector');
    this.idInput = document.getElementById('todoIdInput');
    this.modalTitle = document.getElementById('modalTitle');
    this.quickTagName = document.getElementById('quickTagName');
    this.quickTagColor = document.getElementById('quickTagColor');
    this.btnQuickAddTag = document.getElementById('btnQuickAddTag');

    document.getElementById('btnCloseModal').addEventListener('click', () => this.close());
    document.getElementById('btnCancelTodo').addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });

    // Quick tag add
    this.btnQuickAddTag.addEventListener('click', () => this.quickAddTag());
    this.quickTagName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.quickAddTag();
      }
    });
  },

  open(todo, tags) {
    this.tags = tags;
    this.renderTagSelector(todo ? todo.tagIds : []);

    if (todo) {
      this.modalTitle.textContent = 'Edit Todo';
      this.idInput.value = todo.id;
      this.titleInput.value = todo.title;
      this.descInput.value = todo.description || '';
      this.deadlineInput.value = toLocalDatetime(todo.deadline);
      this.statusInput.value = todo.status;
    } else {
      this.modalTitle.textContent = 'New Todo';
      this.idInput.value = '';
      this.form.reset();
      this.statusInput.value = '未开始';
    }

    // Reset quick tag inputs
    this.quickTagName.value = '';
    this.quickTagColor.value = '#6b7280';

    // Remove closing class if present
    this.modal.classList.remove('closing');
    this.modal.style.display = 'flex';
    this.titleInput.focus();
  },

  close() {
    // Animate out
    this.modal.classList.add('closing');
    setTimeout(() => {
      this.modal.style.display = 'none';
      this.modal.classList.remove('closing');
    }, 150);
  },

  renderTagSelector(selectedIds) {
    this.tagSelector.innerHTML = '';
    this.tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'tag-select-chip' + (selectedIds.includes(tag.id) ? ' selected' : '');
      chip.dataset.tagId = tag.id;
      chip.style.color = tag.color;
      chip.innerHTML = `<span class="tag-color-dot" style="background:${tag.color}"></span>${tag.name}`;

      if (selectedIds.includes(tag.id)) {
        chip.style.borderColor = tag.color;
        chip.style.background = tag.color + '15';
      }

      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
        if (chip.classList.contains('selected')) {
          chip.style.borderColor = tag.color;
          chip.style.background = tag.color + '15';
        } else {
          chip.style.borderColor = '';
          chip.style.background = '';
        }
      });
      this.tagSelector.appendChild(chip);
    });
  },

  getSelectedTagIds() {
    return Array.from(this.tagSelector.querySelectorAll('.selected'))
      .map(el => el.dataset.tagId);
  },

  quickAddTag() {
    const name = this.quickTagName.value.trim();
    if (!name) {
      this.quickTagName.classList.add('shake');
      setTimeout(() => this.quickTagName.classList.remove('shake'), 400);
      return;
    }

    // Direct Store call instead of IPC
    const tag = Store.createTag({
      name,
      color: this.quickTagColor.value
    });

    // Add to local tags list
    this.tags.push(tag);

    // Sync with App
    if (typeof App !== 'undefined') {
      App.tags.push(tag);
    }

    // Re-render tag selector, keeping current selections + auto-select the new tag
    const currentSelected = this.getSelectedTagIds();
    currentSelected.push(tag.id);
    this.renderTagSelector(currentSelected);

    // Clear inputs
    this.quickTagName.value = '';
    this.quickTagName.focus();
  },

  save() {
    const title = this.titleInput.value.trim();
    if (!title) {
      this.titleInput.classList.add('shake');
      setTimeout(() => this.titleInput.classList.remove('shake'), 400);
      this.titleInput.focus();
      return;
    }

    const data = {
      title,
      description: this.descInput.value.trim(),
      deadline: this.deadlineInput.value ? fromLocalDatetime(this.deadlineInput.value) : null,
      status: this.statusInput.value,
      tagIds: this.getSelectedTagIds()
    };

    const id = this.idInput.value;
    if (id) {
      // Direct Store call
      Store.updateTodo(id, data);
    } else {
      Store.createTodo(data);
    }

    // Success feedback on the modal
    const modal = this.modal.querySelector('.modal');
    if (modal) {
      modal.classList.add('success-flash');
      setTimeout(() => modal.classList.remove('success-flash'), 600);
    }

    this.close();
    if (typeof App !== 'undefined') App.refresh();
  }
};
