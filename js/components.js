// 導入所需的管理器
import { ThemeManager } from "./core/theme-manager.js";
import { LanguageManager } from "./core/language-manager.js";
import { NavbarScrollManager, MobileMenuManager } from "./core/nav-manager.js";
import { CustomCursor } from "./features/cursor.js";
// import { WowAnimationManager } from "./features/animation-manager.js"; // 移除 WOW.js
// import { TextRevealManager } from "./features/text-reveal.js"; // 從這裡移除引入，避免重複初始化

// 創建並返回導航欄元素
function createNavigation() {
  return `
    <!-- Navigation -->
    <nav class="nav">
      <div class="container">
        <div class="nav-wrapper">
          <a href="${getRelativePath("index.html")}" class="logo">
            <div class="logo-icon" aria-label="Milli"></div>
          </a>

          <div class="nav-right">
            <div class="nav-links desktop">
              <a href="${getRelativePath("projects.html")}" class="nav-link" data-lang-key="projects">Projects</a>
              <a href="${getRelativePath("about.html")}" class="nav-link" data-lang-key="about">About</a>
              <a href="${getRelativePath("assets/cv.pdf")}" class="nav-link" data-lang-key="cv" target="_blank">CV</a>
            </div>

            <div class="nav-controls">
              <button class="lang-toggle" data-current-lang="en">中</button>
              <button class="theme-toggle desktop">
                <div class="switch">
                  <div class="switch-handle"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Nav Controls -->
    <div class="mobile-nav-controls">
      <button class="menu-toggle">
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Fullscreen Menu -->
    <div class="fullscreen-menu">
      <div class="menu-content">
        <div class="nav-links mobile">
          <a href="${getRelativePath("projects.html")}" class="nav-link" data-lang-key="projects">Projects</a>
          <a href="${getRelativePath("about.html")}" class="nav-link" data-lang-key="about">About</a>
          <a href="${getRelativePath("assets/cv.pdf")}" class="nav-link" data-lang-key="cv" target="_blank">CV</a>
        </div>
        <div class="mobile-controls">
          <button class="lang-toggle mobile" data-current-lang="en">中</button>
          <button class="theme-toggle mobile">
            <div class="switch">
              <div class="switch-handle"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  `;
}

// 創建並返回自訂游標
function createCustomCursor() {
  return `
    <div id="cursor">
      <div class="cursor__circle"></div>
    </div>
  `;
}

// 創建並返回頁尾
function createFooter() {
  return `
    <footer>
      <p>© 2025 Milli Chang. All Rights Reserved.</p>
    </footer>
  `;
}

// 處理相對路徑
function getRelativePath(path) {
  const isInSubfolder = window.location.pathname.includes("/projects/");
  return isInSubfolder ? "../" + path : path;
}

// 初始化所有功能
function initializeFeatures() {
  // 檢查是否已經初始化，避免重複執行
  if (window.featuresInitialized) {
    console.log("共用功能已經初始化，跳過");
    return;
  }

  // 初始化主題
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", initialTheme);

  // 初始化語言
  const savedLang = localStorage.getItem("lang") || "en";
  document.documentElement.setAttribute("lang", savedLang);
  document.querySelectorAll(".lang-toggle").forEach((toggle) => {
    toggle.dataset.currentLang = savedLang;
    toggle.textContent = savedLang === "en" ? "中" : "EN";
  });

  // 初始化基本管理器
  ThemeManager.init();
  LanguageManager.init();
  MobileMenuManager.init();
  CustomCursor.init();
  NavbarScrollManager.init();

  // 重要：不在這裡初始化 TextRevealManager
  // 由 main.js 統一管理動畫初始化

  // 標記已初始化
  window.featuresInitialized = true;
}

// 初始化共用元件
function initializeSharedComponents() {
  // 如果已經初始化，則跳過
  if (window.componentsInitialized) {
    console.log("共用元件已經初始化，跳過");
    return;
  }

  // 插入導航
  document.body.insertAdjacentHTML("afterbegin", createNavigation());

  // 找到 main 容器裡的 container
  const container = document.querySelector("main .container");
  if (container) {
    // 將 footer 插入到 container 的最後
    container.insertAdjacentHTML("beforeend", createFooter());
  }

  // 插入自訂游標
  document.body.insertAdjacentHTML("beforeend", createCustomCursor());

  // 初始化所有功能
  initializeFeatures();

  // 標記元件已初始化
  window.componentsInitialized = true;
}

export { initializeSharedComponents };
