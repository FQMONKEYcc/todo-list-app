// ===== Theme Toggle — Enhanced with Animations =====

const ThemeToggle = {
  btn: null,
  currentTheme: 'dark',

  init() {
    this.btn = document.getElementById('themeToggle');
    this.btn.addEventListener('click', () => this.toggle());
  },

  async load() {
    const settings = await window.api.getSettings();
    this.currentTheme = settings.theme || 'dark';
    this.apply();
  },

  apply() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  },

  async toggle() {
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

    await window.api.updateSettings({ theme: this.currentTheme });
  }
};
