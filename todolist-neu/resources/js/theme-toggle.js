// ===== Theme Toggle — Neutralinojs =====

const ThemeToggle = {
  btn: null,
  currentTheme: 'dark',

  init() {
    this.btn = document.getElementById('themeToggle');
    this.btn.addEventListener('click', () => this.toggle());
  },

  load() {
    // Direct Store call
    const settings = Store.getSettings();
    this.currentTheme = settings.theme || 'dark';
    this.apply();
  },

  apply() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  },

  toggle() {
    // Animate the icon
    const icon = this.btn.querySelector(this.currentTheme === 'dark' ? '.icon-sun' : '.icon-moon');
    if (icon) {
      icon.style.transform = 'rotate(180deg) scale(0)';
    }

    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';

    // Small delay for animation feel
    setTimeout(() => {
      this.apply();
      // Animate new icon in
      const newIcon = this.btn.querySelector(this.currentTheme === 'dark' ? '.icon-sun' : '.icon-moon');
      if (newIcon) {
        newIcon.style.transform = 'rotate(-180deg) scale(0)';
        requestAnimationFrame(() => {
          newIcon.style.transform = '';
        });
      }
    }, 100);

    // Direct Store call
    Store.updateSettings({ theme: this.currentTheme });

    // Broadcast theme change to Widget (cross-process)
    try {
      Neutralino.events.broadcast('themeChanged', this.currentTheme);
    } catch (err) {
      console.warn('Theme broadcast failed:', err);
    }
  }
};
