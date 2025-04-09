// 導入所有功能模組

import { ThemeManager } from "./core/theme-manager.js";
import { LanguageManager } from "./core/language-manager.js";
import { NavbarScrollManager, MobileMenuManager } from "./core/nav-manager.js";
import { CustomCursor } from "./features/cursor.js";
import { TextRevealManager } from "./features/text-reveal.js";
import { ProjectFilterManager } from "./features/project-filter.js";
import { HomeCardRenderer } from "./features/HomeCardRenderer.js"; // 導入整合版首頁卡片渲染器
import { ProjectCardRenderer } from "./features/ProjectCardRenderer.js"; // 導入專案頁卡片渲染器
import { HeroSectionManager } from "./features/hero-section.js"; // 導入 Hero Section 管理器

// 設置一個全域變數來追蹤初始化狀態
window.siteInitialized = window.siteInitialized || false;

// 判斷當前是否為首頁
function isHomePage() {
  const path = window.location.pathname;
  return path.endsWith("index.html") || path.endsWith("/") || path.split("/").pop() === "";
}

// 判斷當前是否為專案頁面
function isProjectsPage() {
  const path = window.location.pathname;
  return path.includes("projects.html");
}

// 初始化網站功能
document.addEventListener("DOMContentLoaded", () => {
  // 檢查是否已經初始化，避免重複執行
  if (window.siteInitialized) {
    console.log("網站已經初始化，跳過");
    return;
  }

  console.log("開始初始化網站功能");

  // 直接確保標題元素可見
  const sectionTitle = document.querySelector(".section-title") || document.querySelector(".horizontal-title");
  if (sectionTitle) {
    // 先確保有文字內容
    const savedLang = localStorage.getItem("lang") || "en";
    const titleText = savedLang === "en" ? "Selected Projects" : "精選專案";
    if (!sectionTitle.textContent.trim()) {
      sectionTitle.textContent = titleText;
    }

    // 確保可見性
    sectionTitle.style.visibility = "visible";
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

  // 初始化基本功能
  ThemeManager.init();
  LanguageManager.init();
  MobileMenuManager.init();
  CustomCursor.init();
  NavbarScrollManager.init();

  // 如果是首頁，初始化 Hero Section 管理器
  if (isHomePage()) {
    console.log("初始化 Hero Section 管理器");
    // 確保共用元件已初始化後再初始化 Hero Section
    const checkComponentsInitialized = () => {
      if (window.componentsInitialized) {
        HeroSectionManager.init();
      } else {
        setTimeout(checkComponentsInitialized, 50);
      }
    };
    checkComponentsInitialized();
  }

  // 更新常量中的翻譯
  updateTranslations();

  // 根據當前頁面類型初始化不同的卡片渲染器
  if (isHomePage()) {
    console.log("初始化首頁卡片渲染器");
    HomeCardRenderer.init();
  } else if (isProjectsPage()) {
    console.log("初始化專案頁卡片渲染器");
    ProjectCardRenderer.init();

    // 專案頁面：應用過濾器
    console.log("初始化專案頁面過濾器");
    ProjectFilterManager.init();
  }

  // 確保 TextRevealManager 在所有其他初始化之後運行
  setTimeout(() => {
    console.log("初始化 TextRevealManager");
    TextRevealManager.init();
  }, 200);

  // 標記網站已經初始化
  window.siteInitialized = true;
  console.log("網站功能初始化完成");
});

// 更新翻譯
function updateTranslations() {
  // 添加「查看更多專案」翻譯
  if (window.translations) {
    if (window.translations["zh-TW"]) {
      window.translations["zh-TW"].seeMoreProjects = "查看更多專案";
    }
    if (window.translations.en) {
      window.translations.en.seeMoreProjects = "See more projects";
    }
  }
}

// 監聽頁面加載完成事件
window.addEventListener("load", function () {
  // 頁面完全加載後應用緊急修復方案
  setTimeout(() => {
    // 再次確保標題可見
    const sectionTitle = document.querySelector(".section-title") || document.querySelector(".horizontal-title");
    if (sectionTitle) {
      // 確保標題有文字
      const savedLang = localStorage.getItem("lang") || "en";
      const titleText = savedLang === "en" ? "Selected Projects" : "精選專案";
      if (!sectionTitle.textContent.trim()) {
        sectionTitle.textContent = titleText;
      }

      // 如果標題仍然不可見，強制顯示
      if (window.getComputedStyle(sectionTitle).opacity < 0.5) {
        console.log("強制顯示標題");
        sectionTitle.style.opacity = "1";
        sectionTitle.style.transform = "translateY(0)";
        sectionTitle.style.visibility = "visible";
      }
    }

    // 緊急確保卡片渲染正確（僅限首頁）
    if (isHomePage()) {
      const horizontalSection = document.querySelector(".horizontal-scroll-section");
      const galleryCards = document.querySelectorAll(".projects-scroll-gallery .home-card");

      if (horizontalSection && galleryCards.length === 0) {
        console.log("首頁卡片區域沒有卡片，嘗試修復");

        // 嘗試從卡片渲染器獲取數據
        if (window.HomeCardRenderer && window.HomeCardRenderer.rendererInitialized) {
          console.log("使用首頁卡片渲染器重新渲染卡片");

          // 強制重新渲染
          const savedLang = localStorage.getItem("lang") || "en";
          window.HomeCardRenderer.renderHomeCards(savedLang);

          // 重新初始化水平滾動
          setTimeout(() => {
            if (window.HomeCardRenderer && window.HomeCardRenderer.refreshScrollTrigger) {
              console.log("刷新滾動觸發器");
              window.HomeCardRenderer.refreshScrollTrigger();
            }
          }, 300);
        }
      }
    }
  }, 1000);
});

// 導出一些全局功能，以便其他模塊使用
window.isHomePage = isHomePage;
window.isProjectsPage = isProjectsPage;
