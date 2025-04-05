import { translations } from "../core/constants.js";

// ==============================================
// 專案過濾管理器 - 僅保留篩選動畫
// ==============================================
export const ProjectFilterManager = {
  filterInitialized: false, // 追蹤過濾器是否初始化
  initialPageLoad: true, // 追蹤是否為頁面初次載入
  cardAnimationApplied: false, // 追蹤是否已應用卡片動畫

  init() {
    // 防止重複初始化
    if (this.filterInitialized) {
      console.log("ProjectFilterManager 已初始化，跳過");
      return;
    }

    this.filterTags = document.querySelector(".filter-tags");
    this.projectGrid = document.querySelector(".project-grid");

    if (!this.filterTags || !this.projectGrid) return;

    console.log("初始化 ProjectFilterManager");

    // 防止干擾，確保選擇器是專案頁的卡片
    if (!this.isProjectsPage()) {
      console.log("不是專案頁面，跳過過濾器初始化");
      return;
    }

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
      "graphic-design",
      "motion-graphic",
    ];

    // 翻譯到卡片標籤的映射關係
    this.tagMappings = {
      "zh-TW": {
        "ui-design": "介面設計",
        "ux-research": "使用者研究",
        "design-system": "設計系統",
        iconography: "圖標設計",
        prototyping: "原型設計",
        "brand-identity": "品牌識別",
        saas: "SaaS",
        "graphic-design": "平面設計",
        "motion-graphic": "動態圖像",
        packaging: "包裝設計",
      },
      en: {
        "ui-design": "UI Design",
        "ux-research": "UX Research",
        "design-system": "Design System",
        iconography: "Iconography",
        prototyping: "Prototyping",
        "brand-identity": "Brand Identity",
        saas: "SaaS",
        "graphic-design": "Graphic Design",
        "motion-graphic": "Motion Graphic",
        packaging: "Packaging",
      },
    };

    // 存儲當前選擇的標籤
    this.currentTag = "all";

    // 將過濾器暴露給全局，以便其他模組訪問
    window.ProjectFilterManager = this;

    // 建立過濾標籤
    this.createFilterTags();

    // 初始化事件監聽
    this.initEventListeners();

    // 監聽語言變更事件
    document.addEventListener("languageChanged", (e) => {
      console.log("ProjectFilterManager: Language changed to ", e.detail.language);

      // 語言變更後，重新創建標籤
      this.createFilterTags();

      // 恢復之前選擇的標籤狀態
      const activeButton = document.querySelector(`.filter-tag[data-tag="${this.currentTag}"]`);
      if (activeButton) {
        document.querySelectorAll(".filter-tag").forEach((btn) => btn.classList.remove("active"));
        activeButton.classList.add("active");
      }
    });

    // 監聽項目重新渲染事件 - 簡化版本
    document.addEventListener("projectsRerendered", () => {
      console.log("接收到projectsRerendered事件");
      this.initialPageLoad = false;
      this.cardAnimationApplied = true;

      // 如果當前有特定過濾條件，需要重新套用
      if (this.currentTag !== "all") {
        setTimeout(() => {
          this.filterProjects(this.currentTag);
        }, 50);
      }
    });

    // 標記過濾器已初始化
    this.filterInitialized = true;
  },

  // 檢查當前是否為專案頁面
  isProjectsPage() {
    const path = window.location.pathname;
    return path.includes("projects.html");
  },

  createFilterTags() {
    // 建立所有標籤按鈕，使用 data-lang-key 支援多語言
    const currentLang = document.documentElement.getAttribute("lang") || "en";
    const tagsHTML = this.tagKeys
      .map((tag) => {
        const langKey = `filter${tag
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("")}`;

        return `
        <button 
          class="filter-tag ${tag === this.currentTag ? "active" : ""}" 
          data-tag="${tag}"
          data-lang-key="${langKey}"
        >
          ${translations[currentLang]?.[langKey] || tag}
        </button>
      `;
      })
      .join("");

    this.filterTags.innerHTML = tagsHTML;

    // 重新繫結事件監聽器
    this.initEventListeners();
  },

  initEventListeners() {
    // 為每個過濾標籤添加點擊事件
    const filterButtons = document.querySelectorAll(".filter-tag");
    filterButtons.forEach((button) => {
      // 避免重複添加事件監聽器
      if (button.hasAttribute("data-event-bound")) return;

      button.setAttribute("data-event-bound", "true");

      button.addEventListener("click", (e) => {
        // 如果已經是選中狀態，則不做任何操作
        if (button.classList.contains("active")) return;

        // 移除所有按鈕的 active 狀態
        filterButtons.forEach((btn) => btn.classList.remove("active"));

        // 添加當前按鈕的 active 狀態
        button.classList.add("active");

        // 執行篩選
        const selectedTag = button.dataset.tag;
        this.currentTag = selectedTag; // 儲存當前選擇
        this.filterProjects(selectedTag);
      });
    });

    // 確保有一個標籤是 active 的
    if (!document.querySelector(".filter-tag.active")) {
      const allButton = document.querySelector(".filter-tag[data-tag='all']");
      if (allButton) {
        allButton.classList.add("active");
      }
    }
  },

  filterProjects(selectedTag, useAnimation = true) {
    console.log(`執行過濾，標籤: ${selectedTag}, 使用動畫: ${useAnimation}`);

    // 確保有專案卡片
    const projects = document.querySelectorAll(".project-card");
    if (projects.length === 0) {
      console.warn("找不到專案卡片");
      return;
    }

    const currentLang = document.documentElement.getAttribute("lang") || "en";
    console.log(`使用 ${currentLang} 語言過濾標籤: ${selectedTag}`);

    // 停止所有正在進行的動畫
    if (window.gsap) {
      projects.forEach((project) => {
        gsap.killTweensOf(project);
      });
    }

    // 標記每張卡片是否符合過濾條件
    const cardsStatus = new Map();
    projects.forEach((card) => {
      const matchesFilter = selectedTag === "all" || card.querySelector(`.tag[data-filter="${selectedTag}"]`) !== null;
      cardsStatus.set(card, {
        visible: matchesFilter,
        initialRect: card.getBoundingClientRect(),
        display: window.getComputedStyle(card).display !== "none",
      });
    });

    if (useAnimation) {
      // 處理第一階段：先處理將要隱藏的卡片
      const cardsToHide = Array.from(projects).filter((card) => !cardsStatus.get(card).visible);

      if (cardsToHide.length > 0) {
        // 縮小並淡出不符合條件的卡片
        gsap.to(cardsToHide, {
          scale: 0.8,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          stagger: 0.03,
          onComplete: () => {
            // 完全隱藏不符合條件的卡片
            cardsToHide.forEach((card) => {
              card.style.display = "none";
            });

            // 處理第二階段：讓所有可見卡片重新排列
            this.applyVisibleCardsAnimation(projects, cardsStatus);
          },
        });
      } else {
        // 如果沒有要隱藏的卡片，直接處理可見卡片
        this.applyVisibleCardsAnimation(projects, cardsStatus);
      }
    } else {
      // 不使用動畫，直接更新顯示狀態
      projects.forEach((card) => {
        const status = cardsStatus.get(card);
        if (status.visible) {
          card.style.display = "block";
          card.style.opacity = "1";
          card.style.transform = "none";
        } else {
          card.style.display = "none";
          card.style.opacity = "0";
        }
      });
    }
  },

  // 處理可見卡片的動畫
  applyVisibleCardsAnimation(projects, cardsStatus) {
    // 篩選出所有應該顯示的卡片
    const cardsToShow = Array.from(projects).filter((card) => cardsStatus.get(card).visible);

    // 先確保這些卡片都是可見的
    cardsToShow.forEach((card) => {
      const status = cardsStatus.get(card);
      // 如果卡片之前是隱藏的，需要顯示但初始透明度為0，並設置為縮小狀態
      if (!status.display) {
        card.style.display = "block";
        card.style.visibility = "visible";
        gsap.set(card, { opacity: 0, scale: 0.8 });
      }
    });

    // 強制重繪DOM，確保佈局更新
    document.body.offsetHeight;

    // 使用 FLIP 技術收集卡片的最終位置
    const finalPositions = new Map();
    cardsToShow.forEach((card) => {
      finalPositions.set(card, card.getBoundingClientRect());
    });

    // 應用動畫
    cardsToShow.forEach((card) => {
      const initialStatus = cardsStatus.get(card);
      const initialRect = initialStatus.initialRect;
      const finalRect = finalPositions.get(card);

      // 先前隱藏的卡片需要放大顯示
      if (!initialStatus.display) {
        gsap.to(card, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
      // 一直可見的卡片需要平滑移動到新位置
      else if (initialStatus.display && initialRect) {
        // 計算位移
        const deltaX = initialRect.left - finalRect.left;
        const deltaY = initialRect.top - finalRect.top;

        // 只對有明顯位移的卡片應用動畫
        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
          // 設置初始位置
          gsap.set(card, { x: deltaX, y: deltaY });

          // 動畫到最終位置
          gsap.to(card, {
            x: 0,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            clearProps: "x,y", // 完成後清除位置屬性，避免干擾後續操作
          });
        }
      }
    });
  },
};

export default ProjectFilterManager;
