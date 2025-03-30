// 專案卡片渲染器 - 負責根據語言設定生成專案卡片

import { projectsData } from "./projects-data.js";

export const ProjectRenderer = {
  rendererInitialized: false, // 追蹤是否已初始化

  init() {
    // 防止重複初始化
    if (this.rendererInitialized) {
      console.log("ProjectRenderer 已初始化，跳過");
      return;
    }

    console.log("ProjectRenderer initialized");
    // 檢查是否有專案網格元素
    const projectGrid = document.querySelector(".project-grid");

    if (!projectGrid) {
      console.warn("找不到專案網格元素，退出初始化");
      return;
    }

    // 初始化時渲染專案內容
    const savedLang = localStorage.getItem("lang") || "en";
    this.renderProjects(savedLang);

    // 避免在專案頁面重新渲染時觸發過多事件
    let renderInProgress = false;

    // 監聽語言變化 - 只保留一個事件監聽器
    document.addEventListener("languageChanged", (e) => {
      // 避免重複渲染
      if (renderInProgress) return;

      renderInProgress = true;
      console.log("ProjectRenderer: Language changed to ", e.detail.language);

      // 渲染新語言的專案
      this.renderProjects(e.detail.language);

      // 重要：延遲通知過濾器重新應用過濾條件
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent("projectsRerendered"));
        renderInProgress = false;
      }, 300);

      // 重新初始化游標修飾器，讓新渲染的元素也能有游標效果
      // 確保游標功能只在非移動設備上初始化
      if (window.CustomCursor && window.innerWidth > 768) {
        console.log("Reinitializing cursor modifiers after language change");
        // 延長等待時間，確保DOM完全更新
        setTimeout(() => {
          try {
            window.CustomCursor.initCursorModifiers();
          } catch (error) {
            console.error("Error reinitializing cursor modifiers:", error);
          }
        }, 200);
      }
    });

    // 標記渲染器已初始化
    this.rendererInitialized = true;
  },

  // 渲染所有專案卡片
  renderProjects(language) {
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
    console.log("Current filter state:", currentFilter);

    // 清除現有的專案卡片
    projectGrid.innerHTML = "";

    // 獲取當前語言的專案資料
    const projects = projectsData[language];
    console.log(`Rendering ${Object.keys(projects).length} projects for language: ${language}`);

    // 確認是否為首頁
    const isHomePage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/") ||
      window.location.pathname.split("/").pop() === "";

    // 決定要顯示的專案 ID
    let projectIdsToShow = Object.keys(projects);

    // 如果是首頁，只顯示標記為顯示在首頁的專案
    if (isHomePage) {
      projectIdsToShow = projectIdsToShow.filter((id) => projects[id].showOnHomepage);
      console.log("Homepage detected, showing projects with showOnHomepage=true:", projectIdsToShow);
    }

    // 創建並添加每個專案卡片
    let displayedCount = 0;
    projectIdsToShow.forEach((projectId) => {
      if (projects[projectId]) {
        // 確保專案存在
        const project = projects[projectId];
        const projectCard = this.createProjectCard(projectId, project, displayedCount, language, isHomePage);
        projectGrid.appendChild(projectCard);
        displayedCount++;
      }
    });

    // 檢查是否已應用輪播效果
    const isCarousel = projectGrid.classList.contains("project-carousel");

    // 在首頁，為每張卡片添加特殊類別以便動畫系統識別
    if (isHomePage) {
      projectGrid.querySelectorAll(".project-card").forEach((card) => {
        card.classList.add("homepage-card");

        // 判斷是否應該設置為不可見
        // 如果已經應用了輪播效果，則不要設置為不可見，由輪播管理器處理
        if (!isCarousel) {
          gsap.set(card, { opacity: 0 });
        } else {
          // 如果已經應用了輪播效果，確保卡片是可見的
          gsap.set(card, { opacity: 1 });
        }
      });
    }
    // 在專案頁面，等待過濾系統處理
    else if (document.querySelector(".projects-header")) {
      projectGrid.querySelectorAll(".project-card").forEach((card) => {
        // 移除首頁特殊類別（如果有）
        card.classList.remove("homepage-card");
        // 先設置為不可見，等待動畫系統觸發
        gsap.set(card, { opacity: 0 });
      });
    }
  },

  // 創建單個專案卡片
  createProjectCard(projectId, project, index, language, isHomePage) {
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
  },
};

// 當DOM加載完成後初始化渲染器，但確保只初始化一次
document.addEventListener("DOMContentLoaded", () => {
  // 將渲染器暴露到全局，以便其他模組可以訪問
  window.ProjectRenderer = ProjectRenderer;
  ProjectRenderer.init();
});
