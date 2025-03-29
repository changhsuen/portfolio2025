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

    // 應用動畫
    gsap.to(sectionTitle, {
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 1.5, // 延長延遲，確保文字動畫完成
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

    projectCards.forEach((card, index) => {
      const style = window.getComputedStyle(card);
      if (style.opacity > 0.5) return;

      card.style.overflow = "hidden";
      card.style.transform = "translateY(50px)";
      card.style.opacity = "1";
      card.style.visibility = "visible";

      gsap.to(card, {
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.1 + index * 0.1,
        clearProps: "transform",
      });
    });

    this.cardsAnimated = true;
  },

  // 項目頁面設置
  setupProjectsPage() {
    if (this.cardsAnimated) return;

    const filterTags = document.querySelector(".filter-tags");

    if (filterTags) {
      const container = filterTags.parentElement;
      if (container) container.style.overflow = "hidden";

      filterTags.style.transform = "translateY(50px)";
      filterTags.style.opacity = "1";
      filterTags.style.visibility = "visible";

      gsap.to(filterTags, {
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.1,
        clearProps: "transform",
        onComplete: () => this.setupProjectPageCards(),
      });
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

      card.style.overflow = "hidden";
      card.style.transform = "translateY(50px)";
      card.style.opacity = "1";
      card.style.visibility = "visible";
      card.style.display = "";

      gsap.to(card, {
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.1 + index * 0.08,
        clearProps: "transform",
      });
    });

    this.cardsAnimated = true;
  },
};
