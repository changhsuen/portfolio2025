// 導入所有功能模組

import { ThemeManager } from "./core/theme-manager.js";
import { LanguageManager } from "./core/language-manager.js";
import { NavbarScrollManager, MobileMenuManager } from "./core/nav-manager.js";
import { CustomCursor } from "./features/cursor.js";
import { TextRevealManager } from "./features/text-reveal.js";
import { ProjectFilterManager } from "./features/project-filter.js";
import { ProjectRenderer } from "./features/project-renderer.js";

// 設置一個全域變數來追蹤初始化狀態
window.siteInitialized = window.siteInitialized || false;
// 追蹤卡片動畫狀態
window.cardsAnimated = false;

// 初始化網站功能
document.addEventListener("DOMContentLoaded", () => {
  // 檢查是否已經初始化，避免重複執行
  if (window.siteInitialized) {
    console.log("網站已經初始化，跳過");
    return;
  }

  console.log("開始初始化網站功能");

  // 直接確保標題元素可見
  const sectionTitle = document.querySelector(".section-title");
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

  // 初始化專案渲染器
  if (document.querySelector(".project-grid")) {
    console.log("Initializing ProjectRenderer");
    ProjectRenderer.init();

    // 確保過濾器在渲染器之後初始化
    setTimeout(() => {
      // 初始化專案過濾器
      ProjectFilterManager.init();
    }, 100);
  }

  // 檢查卡片是否已經有動畫
  checkCardAnimationStatus();

  // 確保 TextRevealManager 初始化
  setTimeout(() => {
    console.log("初始化 TextRevealManager");
    TextRevealManager.init();
  }, 200);

  // 標記網站已經初始化
  window.siteInitialized = true;
  console.log("網站功能初始化完成");
});

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

// 監聽頁面加載完成事件
window.addEventListener("load", function () {
  // 頁面完全加載後應用緊急修復方案
  setTimeout(() => {
    // 再次檢查卡片動畫狀態
    checkCardAnimationStatus();

    // 再次確保標題可見
    const sectionTitle = document.querySelector(".section-title");
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

    // 檢查是否有隱藏的卡片需要顯示
    if (!window.cardsAnimated) {
      const projectCards = document.querySelectorAll(".project-card");
      let allHidden = true;

      projectCards.forEach((card) => {
        if (window.getComputedStyle(card).opacity > 0.5) {
          allHidden = false;
        }
      });

      if (allHidden && projectCards.length > 0) {
        console.log("所有卡片仍然隱藏，強制顯示");

        // 標記卡片已經有動畫，避免重複
        window.cardsAnimated = true;
        if (window.TextRevealManager) {
          window.TextRevealManager.cardsAnimated = true;
        }

        // 強制顯示卡片
        projectCards.forEach((card, index) => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.1 + index * 0.08,
            ease: "power2.out",
          });
        });
      }
    }
  }, 1000);
});
