// 導入所需的管理器
import { ThemeManager } from "./core/theme-manager.js";
import { LanguageManager } from "./core/language-manager.js";
import { NavbarScrollManager, MobileMenuManager } from "./core/nav-manager.js";
import { CustomCursor } from "./features/cursor.js";

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
    <footer class="enhanced-footer">
  <div class="footer-content">
    <div class="footer-main">
      
      
      <div class="footer-sections">
        <div class="footer-section">
          <h3 class="footer-heading" data-lang-key="contact">Contact</h3>
          <ul class="footer-links">
            <li><a href="mailto:changhsuen@gmail.com" class="footer-link">changhsuen@gmail.com</a></li>
            <li><a href="tel:+886938193135" class="footer-link">+886 938 193 135</a></li>
            <li><a href="https://linkedin.com/" target="_blank" class="footer-link">LinkedIn</a></li>
          </ul>
        </div>
        
     
        
        <div class="footer-section">
          <h3 class="footer-heading" data-lang-key="links">Links</h3>
          <ul class="footer-links">
            <li><a href="projects.html" class="footer-link" data-lang-key="projects">Projects</a></li>
            <li><a href="about.html" class="footer-link" data-lang-key="about">About</a></li>
            <li><a href="assets/cv.pdf" target="_blank" class="footer-link" data-lang-key="cv">CV↗</a></li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="copyright">
        <p>© 2025 Milli Chang. <span data-lang-key="allRightsReserved">All Rights Reserved.</span></p>
      </div>
    </div>
  </div>
</footer>
  `;
}

// 處理相對路徑
function getRelativePath(path) {
  const isInSubfolder = window.location.pathname.includes("/projects/");
  return isInSubfolder ? "../" + path : path;
}

// 添加 Google Analytics 追蹤代碼
function addGoogleAnalytics() {
  // 檢查是否已經添加過 Google Analytics 代碼
  if (document.querySelector('script[src*="googletagmanager"]')) {
    return;
  }

  // 創建並添加第一個 script 標籤（外部腳本）
  const gaScript1 = document.createElement("script");
  gaScript1.async = true;
  gaScript1.src = "https://www.googletagmanager.com/gtag/js?id=G-8KTXEJX088";
  document.head.appendChild(gaScript1);

  // 創建並添加第二個 script 標籤（內聯腳本）
  const gaScript2 = document.createElement("script");
  gaScript2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-8KTXEJX088');
  `;
  document.head.appendChild(gaScript2);
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

  // 添加 Google Analytics 追蹤代碼
  addGoogleAnalytics();

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
