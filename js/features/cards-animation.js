// 獨立的卡片動畫管理器
export const CardAnimationManager = {
  initialized: false,
  cardsAnimated: false,

  init() {
    if (this.initialized) return;
    console.log("CardAnimationManager 開始初始化");

    window.CardAnimationManager = this;
    this.initialized = true;

    // 檢查卡片可見性
    this.checkCardsVisibility();

    // 頁面載入後執行
    if (document.readyState === "complete") {
      this.setupPageAnimations();
    } else {
      window.addEventListener("load", () => this.setupPageAnimations());
    }

    // 語言更換事件
    document.addEventListener("languageChanged", (e) => {
      console.log("語言變更，重新設置卡片動畫");
      this.cardsAnimated = false;
      setTimeout(() => this.setupPageAnimations(), 300);
    });
  },

  checkCardsVisibility() {
    const projectCards = document.querySelectorAll(".project-card");
    if (projectCards.length === 0) return;

    const firstCard = projectCards[0];
    const style = window.getComputedStyle(firstCard);

    if (style.opacity > 0.5) {
      this.cardsAnimated = true;
    }
  },

  setupPageAnimations() {
    console.log("設置卡片動畫");

    // 檢測當前頁面類型並應用對應的卡片動畫
    if (document.querySelector(".about-wrapper")) {
      // 關於頁面不需要特殊處理卡片
    } else if (document.querySelector(".header")) {
      // 首頁設置
      this.setupSectionTitle();
    } else if (document.querySelector(".projects-header")) {
      // 專案頁面設置
      this.setupProjectsPage();
    }
  },

  // 設置章節標題
  setupSectionTitle() {
    const sectionTitle = document.querySelector(".section-title") || document.querySelector(".horizontal-title");
    if (!sectionTitle) {
      // 如果沒有標題，直接顯示卡片
      if (!this.cardsAnimated) {
        this.setupHomepageProjectCards();
      }
      return;
    }

    // 確保標題有內容
    const currentLang = document.documentElement.getAttribute("lang") || "en";
    const titleText = currentLang === "zh-TW" ? "精選專案" : "Selected Projects";

    if (!sectionTitle.textContent.trim()) {
      sectionTitle.textContent = titleText;
    }

    // 設置標題容器
    const titleParent = sectionTitle.parentElement;
    if (titleParent) {
      titleParent.style.overflow = "hidden";
    }

    // 設置標題樣式
    sectionTitle.style.transform = "translateY(50px)";
    sectionTitle.style.opacity = "1";
    sectionTitle.style.visibility = "visible";

    // 應用動畫 - 加快標題動畫速度
    gsap.to(sectionTitle, {
      y: 0,
      duration: 0.5, // 從0.8減少到0.5
      ease: "power2.out",
      delay: 0.2, // 從1.5減少到0.2，大幅降低延遲
      clearProps: "transform",
      onComplete: () => {
        if (!this.cardsAnimated) {
          this.setupHomepageProjectCards();
        }
      },
    });
  },

  // 設置首頁項目卡片
  setupHomepageProjectCards() {
    if (this.cardsAnimated) return;

    const projectCards = document.querySelectorAll(".project-card");
    if (projectCards.length === 0) return;

    console.log(`找到 ${projectCards.length} 張卡片，開始設置動畫`);

    // 立即讓所有卡片可見以加快顯示
    projectCards.forEach((card, index) => {
      const style = window.getComputedStyle(card);
      if (style.opacity > 0.5) return;

      card.style.opacity = "0"; // 初始設為不可見
      card.style.visibility = "visible";

      gsap.to(card, {
        opacity: 1, // 只做淡入效果
        duration: 0.3, // 從0.7減少到0.3
        ease: "power1.out", // 使用更簡單的緩動效果
        delay: 0.05 * index, // 從0.1 * index減少到0.05 * index
      });
    });

    this.cardsAnimated = true;
  },

  // 項目頁面設置
  setupProjectsPage() {
    if (this.cardsAnimated) return;

    const filterTags = document.querySelector(".filter-tags");

    if (filterTags) {
      // 直接設置標籤為可見，不需要動畫效果
      filterTags.style.opacity = "1";
      filterTags.style.visibility = "visible";

      // 直接調用設置卡片的方法，不需等待過濾標籤動畫完成
      this.setupProjectPageCards();
    } else {
      this.setupProjectPageCards();
    }
  },

  // 項目頁面卡片設置
  setupProjectPageCards() {
    if (this.cardsAnimated) return;

    const projectCards = document.querySelectorAll(".project-card");
    if (projectCards.length === 0) return;

    projectCards.forEach((card, index) => {
      const style = window.getComputedStyle(card);
      if (style.opacity > 0.5) return;

      card.style.opacity = "0"; // 初始設為不可見
      card.style.visibility = "visible";
      card.style.display = "";

      gsap.to(card, {
        opacity: 1, // 只做淡入效果
        duration: 0.5, // 從0.5減少到0.3
        ease: "power1.out", // 使用更簡單的緩動效果
        delay: 0.08 * index, // 從0.08 * index減少到0.05 * index
      });
    });

    this.cardsAnimated = true;
  },
};
