// ===== Filter Bar (Search, Status, Tags, Sort, Date Range) =====

const FilterBar = {
  searchInput: null,
  sortBySelect: null,
  sortOrderBtn: null,
  statusFilters: null,
  tagFiltersContainer: null,
  dateTabs: null,
  statusToggle: null,

  currentStatus: 'all',
  currentTagIds: [],
  currentSearch: '',
  currentSortBy: 'deadline',
  currentSortOrder: 'asc',
  currentDateRange: 'all',
  searchDebounce: null,

  init() {
    this.searchInput = document.getElementById('searchInput');
    this.sortBySelect = document.getElementById('sortBy');
    this.sortOrderBtn = document.getElementById('sortOrder');
    this.statusFilters = document.getElementById('statusFilters');
    this.tagFiltersContainer = document.getElementById('tagFilters');
    this.dateTabs = document.getElementById('dateTabs');
    this.statusToggle = document.getElementById('statusToggle');

    // Search
    this.searchInput.addEventListener('input', () => {
      if (this.searchDebounce) clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        this.currentSearch = this.searchInput.value.trim().toLowerCase();
        if (typeof App !== 'undefined') App.applyFilters();
      }, 200);
    });

    // Sort
    this.sortBySelect.addEventListener('change', () => {
      this.currentSortBy = this.sortBySelect.value;
      this.savePreferences();
      if (typeof App !== 'undefined') App.applyFilters();
    });

    this.sortOrderBtn.addEventListener('click', () => {
      this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
      this.sortOrderBtn.classList.toggle('desc', this.currentSortOrder === 'desc');
      this.savePreferences();
      if (typeof App !== 'undefined') App.applyFilters();
    });

    // Status filters
    this.statusFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      this.statusFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.currentStatus = btn.dataset.status;
      this.savePreferences();
      if (typeof App !== 'undefined') App.applyFilters();
    });

    // Date range tabs
    if (this.dateTabs) {
      this.dateTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.date-tab');
        if (!tab) return;
        this.dateTabs.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentDateRange = tab.dataset.range;
        this.savePreferences();
        if (typeof App !== 'undefined') App.applyFilters();
      });
    }

    // Collapsible status section
    if (this.statusToggle) {
      this.statusToggle.addEventListener('click', () => {
        this.statusToggle.classList.toggle('collapsed');
        this.statusFilters.classList.toggle('collapsed');
      });
    }
  },

  loadPreferences(settings) {
    this.currentSortBy = settings.sortBy || 'deadline';
    this.currentSortOrder = settings.sortOrder || 'asc';
    this.currentStatus = settings.filterStatus || 'all';
    this.currentTagIds = settings.filterTagIds || [];
    this.currentDateRange = settings.filterDateRange || 'all';

    this.sortBySelect.value = this.currentSortBy;
    this.sortOrderBtn.classList.toggle('desc', this.currentSortOrder === 'desc');

    this.statusFilters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === this.currentStatus);
    });

    if (this.dateTabs) {
      this.dateTabs.querySelectorAll('.date-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.range === this.currentDateRange);
      });
    }
  },

  renderTagFilters(tags) {
    this.tagFiltersContainer.innerHTML = '';
    tags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'tag-filter-btn' + (this.currentTagIds.includes(tag.id) ? ' active' : '');
      btn.dataset.tagId = tag.id;
      btn.innerHTML = `<span class="tag-color-dot" style="background:${tag.color}"></span>${tag.name}`;

      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (btn.classList.contains('active')) {
          this.currentTagIds.push(tag.id);
        } else {
          this.currentTagIds = this.currentTagIds.filter(id => id !== tag.id);
        }
        this.savePreferences();
        if (typeof App !== 'undefined') App.applyFilters();
      });

      this.tagFiltersContainer.appendChild(btn);
    });
  },

  updateCounts(allTodos) {
    // Apply date range filter first for accurate counts
    const dateFiltered = this.filterByDateRange(allTodos);
    const counts = { all: dateFiltered.length, '未开始': 0, '进行中': 0, '已完成': 0 };
    dateFiltered.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });

    document.getElementById('countAll').textContent = counts.all;
    document.getElementById('countPending').textContent = counts['未开始'];
    document.getElementById('countProgress').textContent = counts['进行中'];
    document.getElementById('countDone').textContent = counts['已完成'];
  },

  filterByDateRange(todos) {
    if (this.currentDateRange === 'all') return todos;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    if (this.currentDateRange === 'today') {
      return todos.filter(t => {
        const created = new Date(t.createdAt);
        const createdMatch = created >= todayStart && created < todayEnd;
        let deadlineMatch = false;
        if (t.deadline) {
          const dl = new Date(t.deadline);
          deadlineMatch = dl >= todayStart && dl < todayEnd;
        }
        return createdMatch || deadlineMatch;
      });
    }

    if (this.currentDateRange === 'week') {
      // Week starts on Monday
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - mondayOffset);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      return todos.filter(t => {
        const created = new Date(t.createdAt);
        const createdMatch = created >= weekStart && created < weekEnd;
        let deadlineMatch = false;
        if (t.deadline) {
          const dl = new Date(t.deadline);
          deadlineMatch = dl >= weekStart && dl < weekEnd;
        }
        return createdMatch || deadlineMatch;
      });
    }

    return todos;
  },

  filter(todos) {
    // Apply date range first
    let filtered = this.filterByDateRange(todos);

    // Status filter
    if (this.currentStatus !== 'all') {
      filtered = filtered.filter(t => t.status === this.currentStatus);
    }

    // Tag filter (OR logic)
    if (this.currentTagIds.length > 0) {
      filtered = filtered.filter(t =>
        this.currentTagIds.some(tagId => t.tagIds.includes(tagId))
      );
    }

    // Keyword search
    if (this.currentSearch) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(this.currentSearch) ||
        (t.description && t.description.toLowerCase().includes(this.currentSearch))
      );
    }

    return filtered;
  },

  sort(todos) {
    const sorted = [...todos];
    const order = this.currentSortOrder === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      if (this.currentSortBy === 'deadline') {
        // Nulls last
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return (new Date(a.deadline) - new Date(b.deadline)) * order;
      }
      if (this.currentSortBy === 'createdAt') {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * order;
      }
      if (this.currentSortBy === 'status') {
        return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * order;
      }
      return 0;
    });

    return sorted;
  },

  savePreferences() {
    // Direct call to Store instead of IPC
    Store.updateSettings({
      sortBy: this.currentSortBy,
      sortOrder: this.currentSortOrder,
      filterStatus: this.currentStatus,
      filterTagIds: this.currentTagIds,
      filterDateRange: this.currentDateRange
    });
  }
};
