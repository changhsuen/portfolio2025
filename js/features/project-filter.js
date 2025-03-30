import { translations } from "../core/constants.js";

// ==============================================
// Project Filter Management
// ==============================================
export const ProjectFilterManager = {
  filterInitialized: false, // 追蹤過濾器是否初始化

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

    // 監聽專案重新渲染事件 - 但避免在初始載入時觸發過濾
    let initialLoad = true;
    document.addEventListener("projectsRerendered", () => {
      if (initialLoad) {
        console.log("初始加載，跳過重新過濾");
        initialLoad = false;
        return;
      }
      console.log("Projects rerendered, reapplying filter: ", this.currentTag);
      // 專案重新渲染後，重新應用過濾，但不使用動畫
      setTimeout(() => {
        this.filterProjects(this.currentTag, false);
      }, 100);
    });

    // 標記過濾器已初始化
    this.filterInitialized = true;

    // 不再主動過濾，讓 TextRevealManager 掌控動畫
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
    console.log(`Starting filter process for tag: ${selectedTag}, useAnimation: ${useAnimation}`);

    // 確保有專案卡片
    const projects = document.querySelectorAll(".project-card");
    if (projects.length === 0) {
      console.warn("No project cards found to filter");
      return;
    }

    const currentLang = document.documentElement.getAttribute("lang") || "en";
    console.log(`Filtering projects with tag: ${selectedTag}, language: ${currentLang}`);

    // 停止所有正在進行的動畫
    projects.forEach((project) => {
      gsap.killTweensOf(project);
    });

    // 流動式佈局動畫
    if (useAnimation) {
      // 首先標記所有卡片，確定哪些需要顯示，哪些需要隱藏
      projects.forEach((project) => {
        const matchesFilter =
          selectedTag === "all" || project.querySelector(`.tag[data-filter="${selectedTag}"]`) !== null;
        project.setAttribute("data-visible", matchesFilter ? "true" : "false");
      });

      // 創建 GSAP 時間軸
      const tl = gsap.timeline({
        defaults: {
          duration: 0.4,
          ease: "power2.inOut",
        },
        onComplete: () => {
          // 動畫完成後，確保不匹配的卡片確實被隱藏
          projects.forEach((project) => {
            if (project.getAttribute("data-visible") === "false") {
              project.style.display = "none";
            }
          });
        },
      });

      // 第一步：縮小並淡出不需要顯示的卡片
      const cardsToHide = Array.from(projects).filter((card) => card.getAttribute("data-visible") === "false");
      tl.to(
        cardsToHide,
        {
          scale: 0.8,
          opacity: 0,
          stagger: 0.03,
        },
        0
      );

      // 第二步：顯示並放大需要顯示的卡片
      const cardsToShow = Array.from(projects).filter((card) => card.getAttribute("data-visible") === "true");
      cardsToShow.forEach((card) => {
        // 確保卡片可見
        card.style.display = "";

        // 檢查卡片當前狀態
        const currentOpacity = parseFloat(window.getComputedStyle(card).opacity);
        const currentScale = parseFloat(
          window.getComputedStyle(card).transform !== "none"
            ? window
                .getComputedStyle(card)
                .transform.match(/^matrix\((.+)\)$/)[1]
                .split(", ")[0]
            : 1
        );

        // 如果卡片不可見或縮小狀態，則添加放大動畫
        if (currentOpacity < 0.5 || currentScale < 0.9) {
          tl.fromTo(
            card,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, stagger: 0.05 },
            0.2 // 輕微延遲，讓隱藏動畫先開始
          );
        }
      });

      // 第三步：使用 FLIP 技術實現卡片位移動畫
      // 計算初始位置
      const initialPositions = new Map();
      cardsToShow.forEach((card) => {
        const rect = card.getBoundingClientRect();
        initialPositions.set(card, { top: rect.top, left: rect.left });
      });

      // 強制DOM更新
      this.projectGrid.classList.add("filtering");

      // 計算最終位置並應用動畫
      setTimeout(() => {
        cardsToShow.forEach((card) => {
          const initialPos = initialPositions.get(card);
          const finalRect = card.getBoundingClientRect();
          const deltaX = initialPos.left - finalRect.left;
          const deltaY = initialPos.top - finalRect.top;

          // 從原位置移動到新位置的動畫
          if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
            gsap.fromTo(card, { x: deltaX, y: deltaY }, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
          }
        });

        this.projectGrid.classList.remove("filtering");
      }, 50);
    } else {
      // 不使用動畫，直接顯示/隱藏
      projects.forEach((project) => {
        const matchesFilter =
          selectedTag === "all" || project.querySelector(`.tag[data-filter="${selectedTag}"]`) !== null;
        project.style.display = matchesFilter ? "" : "none";
        project.style.opacity = matchesFilter ? "1" : "0";
        project.style.transform = "none";
      });
    }
  },
};
