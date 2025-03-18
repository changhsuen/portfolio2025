// ==============================================
// Theme Management
// ==============================================
export const ThemeManager = {
  init() {
    const themeToggles = document.querySelectorAll(".theme-toggle");

    themeToggles.forEach((toggle) => {
      toggle.addEventListener("click", this.handleThemeToggle);
    });

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", this.handleSystemThemeChange);
  },

  handleThemeToggle() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  },

  handleSystemThemeChange(e) {
    if (!localStorage.getItem("theme")) {
      const newTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  },
};
