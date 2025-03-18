// text-reveal.js
export const TextRevealManager = {
  initialized: false, // 標記來確保只初始化一次
  cardsAnimated: false, // 新增標記來追蹤卡片是否已經有動畫

  init() {
    // 避免重複完整初始化
    if (this.initialized) {
      console.log("TextRevealManager 已經初始化，跳過");
      return;
    }

    console.log("TextRevealManager 開始初始化");

    // 將實例暴露到全局
    window.TextRevealManager = this;

    // 標記為已初始化
    this.initialized = true;

    // 先直接設置標題可見，避免閃爍
    this.ensureTitleVisible();

    // 檢查卡片是否已經可見
    this.checkCardsVisibility();

    // 確保頁面完全加載後再應用動畫
    if (document.readyState === "complete") {
      this.setupPageAnimations();
    } else {
      // 使用一次性事件監聽器，確保只觸發一次
      window.addEventListener(
        "load",
        () => {
          this.setupPageAnimations();
        },
        { once: true }
      );
    }

    // 監聽語言切換事件
    document.addEventListener("languageChanged", (e) => {
      console.log("語言變更，重新設置動畫");
      // 語言變更後，重置動畫標記並重新應用動畫
      this.cardsAnimated = false;
      this.refresh();
    });

    console.log("TextRevealManager 初始化完成");
  },

  // 檢查卡片的可見性狀態
  checkCardsVisibility() {
    const projectCards = document.querySelectorAll(".project-card");
    if (projectCards.length === 0) return;

    // 檢查第一張卡片是否已經可見
    const firstCard = projectCards[0];
    const style = window.getComputedStyle(firstCard);

    // 如果卡片已經可見，標記為已動畫
    if (style.opacity > 0.5 && style.transform.includes("matrix") && !style.transform.includes("translate3d(0px, 20px, 0px)")) {
      console.log("卡片已經可見，標記為已動畫");
      this.cardsAnimated = true;
    }
  },

  // 確保標題可見，這是一個緊急措施
  ensureTitleVisible() {
    const sectionTitle = document.querySelector(".section-title");
    if (sectionTitle) {
      console.log("確保標題可見");
      // 確保文字是可見的，但保持一些透明度以便後續動畫
      sectionTitle.style.visibility = "visible";
      sectionTitle.style.opacity = "0.1";
    }
  },

  setupPageAnimations() {
    console.log("設置頁面動畫");

    // 檢測頁面類型並應用相應的動畫
    if (document.querySelector(".about-wrapper")) {
      this.setupAboutPage();
    } else if (document.querySelector(".header")) {
      // 首頁設置
      this.setupHomePage();
    } else if (document.querySelector(".projects-header")) {
      this.setupProjectsPage();
    }
  },

  // 重新整理並重新應用動畫
  refresh() {
    console.log("刷新動畫");

    // 簡化重置過程，保持實例初始化標記
    setTimeout(() => {
      this.setupPageAnimations();
    }, 100);
  },

  setupHomePage() {
    console.log("設置首頁動畫");

    // 獲取首頁元素
    const headerLines = document.querySelectorAll(".header .line span");
    const sectionTitle = document.querySelector(".section-title");

    // 設置標題行動畫
    if (headerLines.length) {
      headerLines.forEach((line, index) => {
        // 設置初始狀態
        gsap.set(line, {
          y: 20,
          opacity: 0,
          visibility: "visible",
        });

        // 添加動畫
        gsap.to(line, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.1 + index * 0.15,
        });
      });
    }

    // 設置章節標題動畫
    if (sectionTitle) {
      // 確保標題有內容
      const savedLang = localStorage.getItem("lang") || "en";
      const titleKey = "selectedProjects";
      const titleText = savedLang === "en" ? "Selected Projects" : "精選專案";
      sectionTitle.textContent = titleText;

      // 設置並執行動畫
      gsap.set(sectionTitle, {
        y: 20,
        opacity: 0,
        visibility: "visible",
      });

      gsap.to(sectionTitle, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.8, // 延後於標題行之後
        onComplete: () => {
          // 設置卡片動畫，但只有在卡片尚未動畫的情況下
          if (!this.cardsAnimated) {
            setTimeout(() => {
              this.setupHomepageProjectCards();
            }, 100);
          }
        },
      });
    } else {
      // 如果沒有找到標題，也要確保卡片顯示，但只有在卡片尚未動畫的情況下
      if (!this.cardsAnimated) {
        setTimeout(() => {
          this.setupHomepageProjectCards();
        }, 500);
      }
    }
  },

  // 專門處理首頁的卡片動畫
  setupHomepageProjectCards() {
    // 只有在卡片尚未動畫的情況下處理
    if (this.cardsAnimated) {
      console.log("卡片已經有動畫，跳過");
      return;
    }

    const projectCards = document.querySelectorAll(".project-card");

    // 確保找到卡片
    if (projectCards.length === 0) {
      console.log("沒有找到卡片");
      return;
    }

    console.log(`找到 ${projectCards.length} 張卡片，開始設置動畫`);

    // 為所有卡片設置動畫
    projectCards.forEach((card, index) => {
      // 檢查卡片是否已經可見
      const style = window.getComputedStyle(card);
      if (style.opacity > 0.5) {
        console.log(`卡片 ${index} 已經可見，跳過`);
        return;
      }

      // 設置初始狀態
      gsap.set(card, {
        y: 20,
        opacity: 0,
        visibility: "visible",
      });

      // 添加動畫
      gsap.to(card, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.1 + index * 0.1, // 每張卡片間隔0.1秒
      });
    });

    // 標記卡片已有動畫
    this.cardsAnimated = true;
  },

  setupAboutPage() {
    // 獲取 about 頁面元素
    const aboutTitle = document.querySelector(".about-content h1");
    const aboutParagraphs = document.querySelectorAll(".about-description p");
    const aboutImage = document.querySelector(".about-img");

    // 設置標題動畫
    if (aboutTitle) {
      gsap.set(aboutTitle, {
        y: 20,
        opacity: 0,
        visibility: "visible",
      });

      gsap.to(aboutTitle, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.1,
      });
    }

    // 設置圖片動畫
    if (aboutImage) {
      gsap.set(aboutImage, {
        y: 20,
        opacity: 0,
        visibility: "visible",
      });

      gsap.to(aboutImage, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3,
      });
    }

    // 設置段落動畫
    if (aboutParagraphs.length) {
      aboutParagraphs.forEach((paragraph, index) => {
        gsap.set(paragraph, {
          y: 20,
          opacity: 0,
          visibility: "visible",
        });

        gsap.to(paragraph, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.5 + index * 0.15,
        });
      });
    }
  },

  setupProjectsPage() {
    // 檢查卡片是否已經有動畫
    if (this.cardsAnimated) {
      console.log("專案頁卡片已經有動畫，跳過");
      return;
    }

    // 獲取專案頁面元素
    const filterTags = document.querySelector(".filter-tags");

    // 設置過濾標籤動畫
    if (filterTags) {
      gsap.set(filterTags, {
        y: 15,
        opacity: 0,
        visibility: "visible",
      });

      gsap.to(filterTags, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.1,
        onComplete: () => {
          // 設置卡片動畫
          this.setupProjectPageCards();
        },
      });
    } else {
      // 如果沒有找到過濾標籤，也要確保卡片顯示
      this.setupProjectPageCards();
    }
  },

  // 專門處理專案頁的卡片動畫
  setupProjectPageCards() {
    // 檢查卡片是否已經有動畫
    if (this.cardsAnimated) {
      console.log("專案頁卡片已經有動畫，跳過");
      return;
    }

    const projectCards = document.querySelectorAll(".project-card");

    if (projectCards.length === 0) {
      console.log("沒有找到專案卡片");
      return;
    }

    console.log(`找到 ${projectCards.length} 張專案卡片，開始設置動畫`);

    // 為所有卡片設置動畫
    projectCards.forEach((card, index) => {
      // 檢查卡片是否已經可見
      const style = window.getComputedStyle(card);
      if (style.opacity > 0.5) {
        console.log(`卡片 ${index} 已經可見，跳過`);
        return;
      }

      gsap.set(card, {
        y: 20,
        opacity: 0,
        visibility: "visible",
        display: "", // 確保卡片是顯示的
      });

      gsap.to(card, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.1 + index * 0.08, // 每張卡片間隔0.08秒
      });
    });

    // 標記卡片已有動畫
    this.cardsAnimated = true;
  },

  // 獲取當前頁面類型
  getCurrentPageType() {
    if (document.querySelector(".about-wrapper")) {
      return "about";
    } else if (document.querySelector(".header")) {
      return "home";
    } else if (document.querySelector(".projects-header")) {
      return "projects";
    }
    return "unknown";
  },
};
