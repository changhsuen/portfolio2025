// ProjectCardRenderer.js - 專案頁卡片渲染器 (無動畫效果)
// 負責將專案資料渲染為專案頁的卡片 (project-card)

import { projectsData } from "./projects-data.js";

export const ProjectCardRenderer = {
  rendererInitialized: false, // 追蹤是否已初始化

  init() {
    // 防止重複初始化
    if (this.rendererInitialized) {
      console.log("ProjectCardRenderer 已初始化，跳過");
      return;
    }

    console.log("初始化 ProjectCardRenderer");

    // 檢查是否為專案頁面
    if (!this.isProjectsPage()) {
      console.log("非專案頁面，跳過 ProjectCardRenderer 初始化");
      return;
    }

    // 檢查是否有專案網格元素
    const projectGrid = document.querySelector(".project-grid");
    if (!projectGrid) {
      console.warn("找不到專案網格元素，跳過渲染");
      return;
    }

    // 設置過濾標籤動畫
    this.setupFilterTagsAnimation();

    // 初始化時渲染專案內容
    const savedLang = localStorage.getItem("lang") || "en";
    this.renderProjectCards(savedLang);

    // 避免在專案頁面重新渲染時觸發過多事件
    let renderInProgress = false;

    // 監聽語言變化
    document.addEventListener("languageChanged", (e) => {
      // 避免重複渲染
      if (renderInProgress) return;

      renderInProgress = true;
      console.log("ProjectCardRenderer: 語言變更為", e.detail.language);

      // 渲染新語言的專案
      this.renderProjectCards(e.detail.language);

      // 延遲通知過濾器重新應用過濾條件
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent("projectsRerendered"));
        renderInProgress = false;
      }, 50);

      // 重新初始化游標修飾器，讓新渲染的元素也能有游標效果
      if (window.CustomCursor && window.innerWidth > 768) {
        console.log("重新初始化游標修飾符");
        setTimeout(() => {
          try {
            window.CustomCursor.initCursorModifiers();
          } catch (error) {
            console.error("初始化游標修飾符時出錯:", error);
          }
        }, 200);
      }
    });

    // 標記渲染器已初始化
    this.rendererInitialized = true;

    // 通知卡片已經渲染完成
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("projectsRerendered"));
    }, 50);
  },

  // 設置過濾標籤動畫
  setupFilterTagsAnimation() {
    const filterTags = document.querySelector(".filter-tags");
    if (!filterTags) return;

    // 設置過濾標籤為可見
    filterTags.style.opacity = "1";
    filterTags.style.visibility = "visible";
  },

  // 檢查當前是否為專案頁面
  isProjectsPage() {
    const path = window.location.pathname;
    return path.includes("projects.html");
  },

  // 渲染專案卡片
  renderProjectCards(language) {
    const projectGrid = document.querySelector(".project-grid");

    // 如果沒有找到專案網格，則退出
    if (!projectGrid) {
      console.warn("渲染時找不到專案網格元素");
      return;
    }

    // 檢查是否有專案資料
    if (!projectsData[language]) {
      console.warn(`找不到 ${language} 語言的專案資料`);
      return;
    }

    // 記住當前的篩選狀態
    const currentFilter = window.ProjectFilterManager?.currentTag || "all";
    console.log("當前過濾狀態:", currentFilter);

    // 清除現有的專案卡片
    projectGrid.innerHTML = "";

    // 獲取當前語言的專案資料
    const projects = projectsData[language];
    console.log(`渲染 ${Object.keys(projects).length} 個專案，語言: ${language}`);

    // 決定要顯示的專案 ID
    let projectIdsToShow = Object.keys(projects);

    // 創建並添加每個專案卡片
    let displayedCount = 0;
    projectIdsToShow.forEach((projectId) => {
      if (projects[projectId]) {
        // 確保專案存在
        const project = projects[projectId];
        const projectCard = this.createProjectCard(projectId, project, displayedCount, language);
        projectGrid.appendChild(projectCard);
        displayedCount++;
      }
    });

    // 設置所有卡片為完全可見
    const allCards = projectGrid.querySelectorAll(".project-card");
    if (allCards.length > 0) {
      allCards.forEach((card) => {
        card.style.opacity = "1";
        card.style.visibility = "visible";
        card.style.display = "block";
      });
    }

    // 快速通知卡片已渲染完成
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("projectsRerendered"));
    }, 50);
  },

  // 創建專案卡片
  createProjectCard(projectId, project, index, language) {
    // 檢查路徑是否需要調整 (處理從子資料夾訪問時的路徑問題)
    const isInSubfolder = window.location.pathname.includes("/projects/");
    let imagePath = project.image;
    let linkPath = project.link;

    // 調整路徑
    if (isInSubfolder && imagePath.startsWith("./")) {
      imagePath = `../${imagePath.substring(2)}`;
    } else if (isInSubfolder) {
      imagePath = `../${imagePath}`;
    }

    if (isInSubfolder && linkPath.startsWith("./")) {
      linkPath = `../${linkPath.substring(2)}`;
    } else if (isInSubfolder && !linkPath.startsWith("../")) {
      linkPath = `../${linkPath}`;
    }

    // 創建卡片容器
    const card = document.createElement("div");
    card.className = "project-card";
    card.setAttribute("data-project-id", projectId);

    // 設置卡片為完全可見
    card.style.opacity = "1";
    card.style.visibility = "visible";
    card.style.display = "block";

    // 為每個標籤添加過濾屬性，以便於精確比對
    const tagsWithFilterAttr = project.tags
      .map((tag) => {
        // 尋找標籤對應的過濾鍵
        let filterKey = "";
        const tagMappings = this.getTagMappings();

        // 查找當前標籤對應的過濾鍵
        for (const [key, value] of Object.entries(tagMappings[language] || tagMappings.en)) {
          if (value === tag) {
            filterKey = key;
            break;
          }
        }

        return `<span class="tag" data-filter="${filterKey}">${tag}</span>`;
      })
      .join("");

    // 創建卡片內容
    card.innerHTML = `
      <a href="${linkPath}" class="project-image" cursor-class="card-hover">
        <img src="${imagePath}" alt="${project.title}" loading="lazy" />
      </a>
      <div class="project-info">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-tags">
          ${tagsWithFilterAttr}
        </div>
      </div>
    `;

    return card;
  },

  // 輔助方法：獲取標籤映射
  getTagMappings() {
    return {
      "zh-TW": {
        "uiux-design": "UI/UX設計",
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
        "uiux-design": "UI/UX Design",
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
  },
};

// 將渲染器暴露到全局，以便其他模組可以訪問
window.ProjectCardRenderer = ProjectCardRenderer;

// 預設匯出渲染器
export default ProjectCardRenderer;
