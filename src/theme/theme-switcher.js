/**
 * Theme Switcher
 * Handles toggling between light and dark modes and persists the choice.
 */
export function initializeThemeSwitcher() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggleBtn.innerHTML = '☀️';
      themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
    } else {
      document.body.classList.remove('dark-mode');
      themeToggleBtn.innerHTML = '🌙';
      themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
    }
  };

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  });
}