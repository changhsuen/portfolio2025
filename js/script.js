// ==============================================
// Constants & Config
// ==============================================
const ANIMATION_CONFIG = {
  duration: 1.8,
  delay: 0.3,
  ease: "power4.out",
  stagger: {
    amount: 0.3,
  },
};

const BREAKPOINTS = {
  mobile: 768,
};

// ==============================================
// Translations
// ==============================================
const translations = {
  "zh-TW": {
    // 導航
    projects: "專案",
    about: "關於",
    cv: "履歷",

    // 首頁內容
    imMilli: "我是 Milli。",
    designerIntro: "我是一位有 3 年業界經驗的 UI/UX 設計師。",
    focusIntro: "專注於設計直觀且實用的產品，平衡用戶需求與商業目標。",
    selectedProjects: "精選專案",

    // 專案卡片
    projectName: "專案名稱",
    projectDescription: "專案簡短描述",

    // 專案篩選標籤
    filterAll: "全部",
    filterUiDesign: "介面設計",
    filterUxResearch: "使用者研究",
    filterDesignSystem: "設計系統",
    filterIconography: "圖標設計",
    filterPrototyping: "原型設計",
    filterBrandIdentity: "品牌識別",
    filterSaas: "SaaS",
  },
  en: {
    // Navigation
    projects: "Projects",
    about: "About",
    cv: "CV",

    // Home content
    imMilli: "I'm Milli.",
    designerIntro: "A UI/UX designer with 3 years of industry experience.",
    focusIntro:
      "Focus on designing intuitive and practical products, balancing user needs with business objectives.",
    selectedProjects: "Selected Projects",

    // Project card
    projectName: "Project Name",
    projectDescription: "Brief description of the project",

    // Project filter tags
    filterAll: "All",
    filterUiDesign: "UI Design",
    filterUxResearch: "UX Research",
    filterDesignSystem: "Design System",
    filterIconography: "Iconography",
    filterPrototyping: "Prototyping",
    filterBrandIdentity: "Brand Identity",
    filterSaas: "SaaS",
  },
};

// ==============================================
// Navbar Scroll Management - 修正版
// ==============================================
export const NavbarScrollManager = {
  init() {
    // 初始化變量
    this.nav = document.querySelector(".nav");
    this.mobileNavControls = document.querySelector(".mobile-nav-controls");
    this.lastScrollTop = 0;
    this.scrollThreshold = 50;
    this.scrollDelta = 5;

    // 確保找到了必要元素
    if (!this.nav) {
      console.error("Navigation element .nav not found");
      return;
    }

    if (!this.mobileNavControls) {
      console.error("Mobile nav controls element .mobile-nav-controls not found");
      // 即使沒找到手機導航，也繼續初始化桌面導航功能
    }

    console.log("NavbarScrollManager initialized with mobile menu support");

    // 綁定滾動事件
    window.addEventListener("scroll", this.handleScroll.bind(this));

    // 初始調用一次，確保初始狀態正確
    this.handleScroll();
  },

  handleScroll() {
    const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

    // 確保滾動超過閾值才觸發
    if (currentScrollTop > this.scrollThreshold) {
      // 向下滾動超過指定的 delta 值
      if (currentScrollTop > this.lastScrollTop + this.scrollDelta) {
        this.nav.classList.add("nav-hidden");

        // 同步處理手機版選單
        if (this.mobileNavControls) {
          this.mobileNavControls.classList.add("nav-hidden");
        }
      }
      // 向上滾動超過指定的 delta 值
      else if (currentScrollTop < this.lastScrollTop - this.scrollDelta) {
        this.nav.classList.remove("nav-hidden");

        // 同步處理手機版選單
        if (this.mobileNavControls) {
          this.mobileNavControls.classList.remove("nav-hidden");
        }
      }
    } else {
      // 如果還沒超過閾值，確保元素是可見的
      this.nav.classList.remove("nav-hidden");

      // 同步處理手機版選單
      if (this.mobileNavControls) {
        this.mobileNavControls.classList.remove("nav-hidden");
      }
    }

    // 更新上次滾動位置
    this.lastScrollTop = currentScrollTop;
  },
};

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

// ==============================================
// Language Management
// ==============================================
export const LanguageManager = {
  init() {
    const langToggles = document.querySelectorAll(".lang-toggle");

    langToggles.forEach((toggle) => {
      toggle.addEventListener("click", this.handleLanguageToggle.bind(this));
    });

    // 初始化時更新內容
    const savedLang = localStorage.getItem("lang") || "en";
    this.updateContent(savedLang);
  },

  handleLanguageToggle(e) {
    const toggle = e.currentTarget;
    const currentLang = toggle.dataset.currentLang;
    const newLang = currentLang === "en" ? "zh-TW" : "en";

    document.querySelectorAll(".lang-toggle").forEach((btn) => {
      btn.dataset.currentLang = newLang;
      btn.textContent = newLang === "en" ? "中" : "EN";
    });

    document.documentElement.setAttribute("lang", newLang);
    this.updateContent(newLang);
    localStorage.setItem("lang", newLang);
  },

  updateContent(lang) {
    document.querySelectorAll("[data-lang-key]").forEach((element) => {
      const key = element.dataset.langKey;
      if (translations[lang]?.[key]) {
        if (element.tagName.toLowerCase() === "span") {
          element.textContent = translations[lang][key];
        } else {
          const span = element.querySelector("span");
          if (span) {
            span.textContent = translations[lang][key];
          } else {
            element.textContent = translations[lang][key];
          }
        }
      }
    });
  },
};

// ==============================================
// Mobile Menu Management
// ==============================================
export const MobileMenuManager = {
  init() {
    this.menuToggle = document.querySelector(".menu-toggle");
    this.fullscreenMenu = document.querySelector(".fullscreen-menu");

    if (this.menuToggle && this.fullscreenMenu) {
      this.menuToggle.addEventListener("click", this.handleMenuToggle.bind(this));

      const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.mobile + 1}px)`);
      mediaQuery.addEventListener("change", this.handleScreenResize.bind(this));
    }
  },

  handleMenuToggle() {
    this.menuToggle.classList.toggle("active");
    this.fullscreenMenu.classList.toggle("active");
    document.body.style.overflow = this.fullscreenMenu.classList.contains("active") ? "hidden" : "";
  },

  handleScreenResize(e) {
    if (e.matches) {
      this.menuToggle.classList.remove("active");
      this.fullscreenMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  },
};

// ==============================================
// Project Filter Management
// ==============================================
export const ProjectFilterManager = {
  init() {
    this.filterTags = document.querySelector(".filter-tags");
    this.projectGrid = document.querySelector(".project-grid");

    if (!this.filterTags || !this.projectGrid) return;

    // 標籤的 key 值（用於篩選和翻譯）
    this.tagKeys = [
      "all",
      "ui-design",
      "ux-research",
      "design-system",
      "iconography",
      "prototyping",
      "brand-identity",
      "saas",
    ];

    // 建立過濾標籤
    this.createFilterTags();

    // 初始化事件監聽
    this.initEventListeners();
  },

  createFilterTags() {
    // 建立所有標籤按鈕，使用 data-lang-key 支援多語言
    const tagsHTML = this.tagKeys
      .map((tag) => {
        const langKey = `filter${tag
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("")}`;

        return `
        <button 
          class="filter-tag ${tag === "all" ? "active" : ""}" 
          data-tag="${tag}"
          data-lang-key="${langKey}"
        >
          ${translations["en"][langKey]}
        </button>
      `;
      })
      .join("");

    this.filterTags.innerHTML = tagsHTML;
  },

  initEventListeners() {
    // 為每個過濾標籤添加點擊事件
    const filterButtons = document.querySelectorAll(".filter-tag");
    filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        // 移除所有按鈕的 active 狀態
        filterButtons.forEach((btn) => btn.classList.remove("active"));

        // 添加當前按鈕的 active 狀態
        button.classList.add("active");

        // 執行篩選
        const selectedTag = button.dataset.tag;
        this.filterProjects(selectedTag);
      });
    });
  },

  filterProjects(selectedTag) {
    const projects = document.querySelectorAll(".project-card");

    projects.forEach((project) => {
      if (selectedTag === "all") {
        project.style.display = "";
        project.style.opacity = "1";
        return;
      }

      // 找到卡片中所有的標籤
      const tagElements = project.querySelectorAll(".tag[data-lang-key]");
      // 檢查標籤的 key 而不是文字內容
      const hasMatchingTag = Array.from(tagElements).some((tag) => {
        const tagKey = tag.getAttribute("data-lang-key");
        // 從 tagKey 推導出對應的 filter key
        const filterKey = tagKey
          .replace(/^filter/, "")
          .replace(/([A-Z])/g, "-$1") // 在大寫字母前加上連字符
          .toLowerCase() // 轉小寫
          .replace(/^-/, ""); // 移除開頭的連字符
        return filterKey === selectedTag;
      });

      if (hasMatchingTag) {
        project.style.display = "";
        setTimeout(() => {
          project.style.opacity = "1";
        }, 10);
      } else {
        project.style.opacity = "0";
        setTimeout(() => {
          project.style.display = "none";
        }, 300); // 配合 CSS transition 時間
      }
    });
  },
};

// ==============================================
// Custom Cursor
// ==============================================
export const CustomCursor = {
  init() {
    this.cursor = document.querySelector("#cursor");
    if (!this.cursor) return;

    this.cursorCircle = this.cursor.querySelector(".cursor__circle");
    this.mouse = { x: -100, y: -100 };
    this.pos = { x: 0, y: 0 };
    this.speed = 0.2;

    window.addEventListener("mousemove", this.updateCoordinates.bind(this));
    this.initCursorModifiers();
    this.startAnimation();
  },

  updateCoordinates(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  },

  getSqueeze(diffX, diffY) {
    const distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    const maxSqueeze = 0.5;
    const accelerator = 400;
    return Math.min(distance / accelerator, maxSqueeze);
  },

  updateCursor() {
    const diffX = Math.round(this.mouse.x - this.pos.x);
    const diffY = Math.round(this.mouse.y - this.pos.y);

    this.pos.x += diffX * this.speed;
    this.pos.y += diffY * this.speed;

    const squeeze = this.getSqueeze(diffX, diffY);
    const translate = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
    const scale = this.cursor.classList.contains("card-hover")
      ? `scale(${1 + squeeze * 0.5}, ${1 - squeeze * 0.5})`
      : `scale(${1 + squeeze}, ${1 - squeeze})`;

    this.cursor.style.transform = translate;
    this.cursorCircle.style.transform = scale;
  },

  initCursorModifiers() {
    // 卡片 hover 效果
    document.querySelectorAll("[cursor-class]").forEach((cursorModifier) => {
      cursorModifier.addEventListener("mouseenter", () => {
        const className = cursorModifier.getAttribute("cursor-class");
        // 先移除所有可能的游標狀態
        this.cursor.classList.remove("clickable", "card-hover");
        this.cursor.classList.add(className);
      });

      cursorModifier.addEventListener("mouseleave", () => {
        const className = cursorModifier.getAttribute("cursor-class");
        this.cursor.classList.remove(className);
      });
    });

    // 一般可點擊元素
    const clickableElements = document.querySelectorAll(
      'a:not([cursor-class]), button:not([cursor-class]), input[type="submit"]:not([cursor-class])'
    );
    clickableElements.forEach((element) => {
      element.addEventListener("mouseenter", () => {
        if (!this.cursor.classList.contains("card-hover")) {
          this.cursor.classList.add("clickable");
        }
      });
      element.addEventListener("mouseleave", () => {
        this.cursor.classList.remove("clickable");
      });
    });
  },

  startAnimation() {
    const animate = () => {
      this.updateCursor();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  },
};

// ==============================================
// Animation Management
// ==============================================
export const AnimationManager = {
  init() {
    const lines = document.querySelectorAll(".line span");
    if (lines.length === 0) return;

    // 設定初始狀態
    gsap.set(".line span", {
      y: 100,
      opacity: 0,
      skewY: 7,
    });

    // 執行動畫
    const tl = gsap.timeline();
    tl.to(".line span", {
      duration: ANIMATION_CONFIG.duration,
      y: 0,
      opacity: 1,
      ease: ANIMATION_CONFIG.ease,
      delay: ANIMATION_CONFIG.delay,
      skewY: 0,
      stagger: ANIMATION_CONFIG.stagger,
    });
  },
};

// 如果直接在頁面中使用 script.js（非模組方式），則自動初始化
if (typeof module === "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
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

    // 初始化所有功能
    ThemeManager.init();
    LanguageManager.init();
    MobileMenuManager.init();
    CustomCursor.init();
    AnimationManager.init();
    ProjectFilterManager.init();
    NavbarScrollManager.init();
  });
}
