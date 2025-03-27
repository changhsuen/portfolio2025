// 導入所有功能模組

import { ThemeManager } from "./core/theme-manager.js";
import { LanguageManager } from "./core/language-manager.js";
import { NavbarScrollManager, MobileMenuManager } from "./core/nav-manager.js";
import { CustomCursor } from "./features/cursor.js";
import { TextRevealManager } from "./features/text-reveal.js";
import { ProjectFilterManager } from "./features/project-filter.js";
import { ProjectRenderer } from "./features/project-renderer.js";
import { HorizontalScrollManager } from "./features/horizontal-scroll-manager.js"; // 導入橫向滾動管理器

// 設置一個全域變數來追蹤初始化狀態
window.siteInitialized = window.siteInitialized || false;
// 追蹤卡片動畫狀態
window.cardsAnimated = false;

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

  // 更新常量中的翻譯
  updateTranslations();

  // 初始化專案渲染器
  const projectGrid = document.querySelector(".project-grid") || document.querySelector(".projects-scroll-gallery");
  if (projectGrid || document.querySelector(".horizontal-scroll-section")) {
    console.log("Initializing ProjectRenderer");
    ProjectRenderer.init();

    // 確保頁面特定功能在渲染器之後初始化
    setTimeout(() => {
      if (isHomePage()) {
        // 首頁：初始化橫向滾動效果
        console.log("初始化首頁橫向滾動效果");
        initializeHomepageScroll();
      } else if (isProjectsPage()) {
        // 專案頁面：應用過濾器
        console.log("初始化專案頁面過濾器");
        ProjectFilterManager.init();
      }

      // 檢查卡片是否已經有動畫
      checkCardAnimationStatus();

      // 確保 TextRevealManager 在所有其他初始化之後運行
      setTimeout(() => {
        console.log("初始化 TextRevealManager");
        TextRevealManager.init();
      }, 200);
    }, 100);
  } else {
    // 即使沒有專案網格，也要確保 TextRevealManager 初始化
    setTimeout(() => {
      TextRevealManager.init();
    }, 200);
  }

  // 標記網站已經初始化
  window.siteInitialized = true;
  console.log("網站功能初始化完成");
});

// 初始化首頁滾動效果
function initializeHomepageScroll() {
  if (!isHomePage()) return;

  if (window.HorizontalScrollManager) {
    // 確保先等待 DOM 渲染
    setTimeout(() => {
      try {
        window.HorizontalScrollManager.init();
      } catch (error) {
        console.error("初始化橫向滾動時出錯:", error);
        // 嘗試重新初始化
        setTimeout(() => {
          console.log("嘗試重新初始化橫向滾動");
          window.HorizontalScrollManager.init();
        }, 500);
      }
    }, 300);
  } else {
    console.warn("找不到 HorizontalScrollManager，無法初始化橫向滾動");
    // 嘗試動態導入
    import("./features/horizontal-scroll-manager.js")
      .then((module) => {
        window.HorizontalScrollManager = module.HorizontalScrollManager;
        setTimeout(() => {
          window.HorizontalScrollManager.init();
        }, 300);
      })
      .catch((error) => {
        console.error("導入 HorizontalScrollManager 失敗:", error);
      });
  }
}

// 檢查卡片動畫狀態
function checkCardAnimationStatus() {
  const projectCards = document.querySelectorAll(".project-card");
  if (projectCards.length === 0) return;

  // 檢查第一張卡片是否已經可見
  const firstCard = projectCards[0];
  const style = window.getComputedStyle(firstCard);

  // 如果卡片已經可見，標記為已動畫
  if (style.opacity > 0.5) {
    console.log("卡片已經可見，標記為已動畫");
    window.cardsAnimated = true;

    // 同步TextRevealManager的狀態，如果存在
    if (window.TextRevealManager) {
      window.TextRevealManager.cardsAnimated = true;
    }
  }
}

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
    // 再次檢查卡片動畫狀態
    checkCardAnimationStatus();

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

    // 緊急確保橫向滾動效果已初始化（僅限首頁）
    if (isHomePage()) {
      const horizontalSection = document.querySelector(".horizontal-scroll-section");
      const galleryCards = document.querySelectorAll(".projects-scroll-gallery .project-card");

      if (horizontalSection && galleryCards.length === 0) {
        console.log("首頁橫向滾動區域沒有卡片，嘗試修復");

        // 嘗試從專案渲染器獲取數據
        if (window.ProjectRenderer && window.ProjectRenderer.rendererInitialized) {
          console.log("使用專案渲染器重新渲染卡片");

          // 強制重新渲染
          const savedLang = localStorage.getItem("lang") || "en";
          window.ProjectRenderer.renderProjects(savedLang);

          // 重新初始化橫向滾動
          setTimeout(() => {
            if (window.HorizontalScrollManager) {
              if (window.HorizontalScrollManager.initialized) {
                console.log("刷新滾動觸發器");
                window.HorizontalScrollManager.refreshScrollTrigger();
              } else {
                console.log("重新初始化橫向滾動");
                window.HorizontalScrollManager.init();
              }
            }
          }, 300);
        }
      }

      // 檢查橫向滾動是否已初始化
      if (window.HorizontalScrollManager && !window.HorizontalScrollManager.initialized) {
        console.log("首頁橫向滾動未初始化，重新初始化");
        window.HorizontalScrollManager.init();
      }
    }
  }, 1000);
});

// 導出一些全局功能，以便其他模塊使用
window.isHomePage = isHomePage;
window.isProjectsPage = isProjectsPage;
