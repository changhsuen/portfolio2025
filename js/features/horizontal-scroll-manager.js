// features/horizontal-scroll-manager.js
import { projectsData } from "./projects-data.js";
import { translations } from "../core/constants.js";

export const HorizontalScrollManager = {
  initialized: false,
  scrollTriggerInstance: null,
  isMobile: false,

  init() {
    // 避免重複初始化
    if (this.initialized) {
      console.log("HorizontalScrollManager 已初始化，跳過");
      return;
    }

    console.log("初始化 HorizontalScrollManager");

    // 檢查 GSAP 和 ScrollTrigger 是否可用
    if (!window.gsap || !window.gsap.registerPlugin) {
      console.error("GSAP 或 ScrollTrigger 未載入，橫向滾動功能無法初始化");
      return;
    }

    // 註冊 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // 檢查當前是否為首頁
    if (!this.isHomePage()) {
      console.log("不是首頁，跳過初始化橫向滾動");
      return;
    }

    // 檢查當前視窗寬度
    this.isMobile = window.innerWidth <= 768;
    console.log(`當前視窗寬度：${window.innerWidth}，是否手機版：${this.isMobile}`);

    // 建立橫向滾動結構
    this.setupHorizontalScrollStructure();

    // 延遲初始化 ScrollTrigger，確保 DOM 完全渲染
    setTimeout(() => {
      // 只在非手機版初始化 ScrollTrigger
      if (!this.isMobile) {
        this.initScrollTrigger();
      }
    }, 500);

    // 監聽語言變更事件
    document.addEventListener("languageChanged", (e) => {
      console.log("語言變更，更新橫向滾動區域");
      this.updateProjectCards(e.detail.language);
      if (!this.isMobile) {
        this.refreshScrollTrigger();
      }
    });

    // 監聽窗口大小變化
    window.addEventListener(
      "resize",
      this.debounce(() => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        // 只有當狀態變化時才執行相應操作
        if (wasMobile !== this.isMobile) {
          console.log(`視窗大小變化: ${this.isMobile ? "切換到手機版" : "切換到桌面版"}`);

          if (this.isMobile) {
            // 從桌面版變為手機版
            this.disableHorizontalScroll();
          } else {
            // 從手機版變為桌面版
            this.enableHorizontalScroll();
          }
        } else if (!this.isMobile) {
          // 桌面版內的尺寸變化，刷新ScrollTrigger
          this.refreshScrollTrigger();
        }
      }, 250)
    );

    // 將自身暴露到全局以便其他模組訪問
    window.HorizontalScrollManager = this;

    // 標記為已初始化
    this.initialized = true;
  },

  // 判斷當前是否為首頁
  isHomePage() {
    const path = window.location.pathname;
    return path.endsWith("index.html") || path.endsWith("/") || path.split("/").pop() === "";
  },

  // 建立橫向滾動結構
  setupHorizontalScrollStructure() {
    // 查找原始專案區塊
    const section = document.querySelector(".section");

    if (!section) {
      console.error("找不到專案區塊，無法建立橫向滾動結構");
      return;
    }

    // 檢查是否已經有橫向滾動結構
    let horizontalSection = document.querySelector(".horizontal-scroll-section");
    let scrollContainer = document.querySelector(".scroll-container");
    let gallery = document.querySelector(".projects-scroll-gallery");

    // 如果已經有結構但沒有卡片，則嘗試渲染卡片
    if (horizontalSection && scrollContainer && gallery) {
      if (gallery.children.length === 0) {
        this.renderProjectCards();
      }
    } else {
      // 如果沒有必要的結構，則創建它們
      console.log("創建橫向滾動結構");

      // 保存原始標題
      const sectionTitle = section.querySelector(".section-title") || section.querySelector(".horizontal-title");

      // 清空 section 內容
      const sectionHTML = section.innerHTML;
      section.innerHTML = "";

      // 如果有標題，先添加回來
      if (sectionTitle) {
        section.appendChild(sectionTitle.cloneNode(true));
      }

      // 創建結構
      horizontalSection = document.createElement("div");
      horizontalSection.className = "horizontal-scroll-section";

      scrollContainer = document.createElement("div");
      scrollContainer.className = "scroll-container";

      gallery = document.createElement("div");
      gallery.className = "projects-scroll-gallery";

      // 渲染專案卡片
      this.renderProjectCards(gallery);

      // 組裝結構
      scrollContainer.appendChild(gallery);
      horizontalSection.appendChild(scrollContainer);
      section.appendChild(horizontalSection);

      // 添加查看更多按鈕
      const seeMoreContainer = document.createElement("div");
      seeMoreContainer.className = "see-more-projects-container";

      const currentLang = document.documentElement.getAttribute("lang") || "en";
      const seeMoreText = currentLang === "en" ? "See more projects" : "查看更多專案";

      seeMoreContainer.innerHTML = `
        <a href="projects.html" class="see-more-projects" data-lang-key="seeMoreProjects">
          ${seeMoreText}
        </a>
      `;

      section.appendChild(seeMoreContainer);
    }

    // 保存引用
    this.horizontalSection = horizontalSection;
    this.scrollContainer = scrollContainer;
    this.gallery = gallery;
  },

  // 渲染專案卡片
  renderProjectCards(targetGallery) {
    const gallery = targetGallery || this.gallery;

    if (!gallery) {
      console.error("找不到畫廊元素，無法渲染卡片");
      return;
    }

    // 清空畫廊
    gallery.innerHTML = "";

    // 獲取當前語言
    const currentLang = document.documentElement.getAttribute("lang") || "en";

    // 確保有專案數據
    if (!window.projectsData) {
      console.error("找不到專案數據");

      // 嘗試從模塊引入
      try {
        const data = projectsData[currentLang];
        if (data) {
          this.renderProjectCardsFromData(gallery, data, currentLang);
        } else {
          console.error("projectsData 導入失敗");
        }
      } catch (error) {
        console.error("渲染專案卡片失敗:", error);
      }
      return;
    }

    // 使用全局數據
    const data = window.projectsData[currentLang];
    this.renderProjectCardsFromData(gallery, data, currentLang);
  },

  // 從數據渲染卡片 - 為橫向滾動和項目頁使用不同結構
  renderProjectCardsFromData(gallery, projectsData, language) {
    if (!projectsData) {
      console.error(`找不到 ${language} 語言的專案數據`);
      return;
    }

    // 尋找用於首頁的專案
    const homepageProjects = Object.keys(projectsData)
      .filter((id) => projectsData[id].showOnHomepage)
      .map((id) => ({ id, ...projectsData[id] }));

    console.log(`找到 ${homepageProjects.length} 個首頁專案`);

    // 檢查是否是橫向滾動畫廊
    const isHorizontalGallery = gallery.classList.contains("projects-scroll-gallery");

    // 映射標籤到過濾鍵的關係
    const tagMappings = {
      "zh-TW": {
        介面設計: "ui-design",
        使用者研究: "ux-research",
        設計系統: "design-system",
        圖標設計: "iconography",
        原型設計: "prototyping",
        品牌識別: "brand-identity",
        SaaS: "saas",
        平面設計: "graphic-design",
        動態圖像: "motion-graphic",
        包裝設計: "packaging",
      },
      en: {
        "UI Design": "ui-design",
        "UX Research": "ux-research",
        "Design System": "design-system",
        Iconography: "iconography",
        Prototyping: "prototyping",
        "Brand Identity": "brand-identity",
        SaaS: "saas",
        "Graphic Design": "graphic-design",
        "Motion Graphic": "motion-graphic",
        Packaging: "packaging",
      },
    };

    // 渲染每個專案卡片
    homepageProjects.forEach((project) => {
      const card = document.createElement("div");
      card.className = "project-card";
      card.setAttribute("data-project-id", project.id);

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

      // 生成帶過濾屬性的標籤 HTML
      const tagsHTML = project.tags
        .map((tag) => {
          // 查找標籤對應的過濾鍵
          const filterKey = tagMappings[language]?.[tag] || "";
          return `<span class="tag" data-filter="${filterKey}">${tag}</span>`;
        })
        .join("");

      // 根據是否為橫向滾動畫廊使用不同的HTML結構
      if (isHorizontalGallery) {
        // 新布局結構 - 只用於橫向滾動畫廊
        card.innerHTML = `
          <a href="${linkPath}" class="project-image" cursor-class="card-hover">
            <img src="${imagePath}" alt="${project.title}" loading="lazy" />
          </a>
          <div class="project-info">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
          </div>
          <div class="project-tags">
            ${tagsHTML}
          </div>
        `;
      } else {
        // 原始布局結構 - 用於projects.html頁面
        card.innerHTML = `
          <a href="${linkPath}" class="project-image" cursor-class="card-hover">
            <img src="${imagePath}" alt="${project.title}" loading="lazy" />
          </a>
          <div class="project-info">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
              ${tagsHTML}
            </div>
          </div>
        `;
      }

      gallery.appendChild(card);
    });

    // 檢查是否已應用輪播效果
    const isCarousel = gallery.classList.contains("project-carousel");

    // 在首頁，為每張卡片添加特殊類別以便動畫系統識別
    if (this.isHomePage()) {
      gallery.querySelectorAll(".project-card").forEach((card) => {
        card.classList.add("homepage-card");

        // 判斷是否應該設置為不可見
        // 如果已經應用了輪播效果，則不要設置為不可見，由輪播管理器處理
        if (!isCarousel) {
          gsap.set(card, { opacity: 0, y: 20 });
        } else {
          // 如果已經應用了輪播效果，確保卡片是可見的
          gsap.set(card, { opacity: 1, y: 0 });
        }
      });
    }
    // 在專案頁面，等待過濾系統處理
    else if (document.querySelector(".projects-header")) {
      gallery.querySelectorAll(".project-card").forEach((card) => {
        // 移除首頁特殊類別（如果有）
        card.classList.remove("homepage-card");
        // 先設置為不可見，等待動畫系統觸發
        gsap.set(card, { opacity: 0, y: 20 });
      });
    }
  },

  // 更新專案卡片（語言變更時使用）
  updateProjectCards(language) {
    console.log(`更新專案卡片到 ${language} 語言`);
    this.renderProjectCards();
  },

  // 啟用橫向滾動
  enableHorizontalScroll() {
    if (this.scrollTriggerInstance) {
      // 如果已經存在實例，則重新啟用
      this.scrollTriggerInstance.enable();
    } else {
      // 否則初始化
      this.initScrollTrigger();
    }
  },

  // 停用橫向滾動
  disableHorizontalScroll() {
    if (this.scrollTriggerInstance) {
      // 停用實例
      this.scrollTriggerInstance.disable();

      // 重置畫廊位置
      gsap.set(this.gallery, { x: 0 });
    }
  },

  // 獲取顯示的專案數量
  getVisibleProjectsCount() {
    const projectCards = this.gallery?.querySelectorAll(".project-card") || [];
    return projectCards.length;
  },

  // 初始化 ScrollTrigger，包含視差效果和hover效果
  initScrollTrigger() {
    if (!this.horizontalSection || !this.gallery) {
      console.error("找不到必要的元素，無法初始化 ScrollTrigger");
      return;
    }

    // 確保有卡片
    if (this.gallery.children.length === 0) {
      console.log("畫廊為空，嘗試渲染卡片");
      this.renderProjectCards();

      if (this.gallery.children.length === 0) {
        console.error("無法渲染卡片，跳過初始化");
        return;
      }
    }

    // 先清除任何現有的 ScrollTrigger 實例
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
      this.scrollTriggerInstance = null;
    }

    // 計算畫廊的總寬度
    const galleryWidth = this.gallery.scrollWidth;
    const containerWidth = this.horizontalSection.offsetWidth;

    // 為最後一張卡片添加額外的右側空間，確保它完全顯示
    const rightPadding = parseInt(window.getComputedStyle(this.horizontalSection).paddingRight, 10) || 0;

    // 計算畫廊內容超出容器的寬度，加上右側padding確保最後對齊
    const scrollDistance = galleryWidth - containerWidth + rightPadding;

    console.log(`畫廊寬度: ${galleryWidth}px, 容器寬度: ${containerWidth}px, 右側padding: ${rightPadding}px, 超出距離: ${scrollDistance}px`);

    // 如果畫廊寬度小於或等於容器寬度，不需要滾動
    if (galleryWidth <= containerWidth) {
      console.log("畫廊寬度不足，不需要橫向滾動");
      return;
    }

    // 確保 ScrollTrigger 存在
    if (!ScrollTrigger) {
      console.error("ScrollTrigger 不可用");
      return;
    }

    // 獲取所有卡片的圖片元素
    const projectImages = this.gallery.querySelectorAll(".project-card .project-image img");
    console.log(`找到 ${projectImages.length} 張卡片圖片，準備設置視差效果`);

    // 創建新的時間軸動畫
    try {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: this.horizontalSection,
          pin: true, // 固定元素
          start: "top top", // 開始於元素頂部與視窗頂部對齊時
          end: () => `+=${scrollDistance}`, // 包含右側padding的滾動距離
          scrub: 1.5,
          anticipatePin: 1, // 提前處理固定效果，減少跳動
          markers: false, // 關閉調試標記
          id: "horizontal-scroll", // ID方便引用
          // 增加平滑選項
          ease: "power1.out", // 添加緩動函數使滾動更自然
          fastScrollEnd: true, // 快速滾動時更平滑地結束
          preventOverlaps: true, // 防止重疊觸發
          snapDirectional: false, // 禁用方向性捕捉
        },
      });

      // 主要水平滾動動畫 - 卡片容器移動
      tl.to(this.gallery, {
        x: -scrollDistance, // 確保最後一張卡片與右側padding保持一致
        ease: "none",
      });

      // 為每張圖片添加輕微的水平視差效果
      projectImages.forEach((img) => {
        // 可以適當增加視差係數
        const parallaxFactor = -0.02;

        // 計算視差位移量
        const parallaxOffset = scrollDistance * parallaxFactor;

        // 將圖片動畫添加到時間軸
        tl.to(
          img,
          {
            x: -parallaxOffset, // 水平視差
            ease: "none", // 使用線性緩動確保平滑過渡
          },
          0
        ); // 從時間線的開始處執行
      });

      // 保存 ScrollTrigger 實例以便後續使用
      this.scrollTriggerInstance = tl.scrollTrigger;

      // 處理hover效果與視差效果的共存問題
      projectImages.forEach((img) => {
        const imageContainer = img.closest(".project-image");

        // 鼠標進入時
        imageContainer.addEventListener("mouseenter", () => {
          // 應用縮放效果，同時保持當前的位置
          gsap.to(img, {
            scale: 1.1,
            duration: 0.1,
            ease: "cubic-bezier(0.17, 0.35, 0.01, 1)",
            overwrite: "auto",
          });
        });

        // 鼠標離開時
        imageContainer.addEventListener("mouseleave", () => {
          // 移除縮放效果，同時保持當前的位置
          gsap.to(img, {
            scale: 1,
            duration: 0.2,
            ease: "cubic-bezier(0.17, 0.35, 0.01, 1)",
            overwrite: "auto",
          });
        });
      });

      console.log("ScrollTrigger 初始化成功，添加了視差效果和hover效果");
    } catch (error) {
      console.error("初始化 ScrollTrigger 時出錯:", error);
    }

    // 初始化自定義游標（如果有）
    if (window.CustomCursor && window.innerWidth > 768) {
      setTimeout(() => {
        try {
          window.CustomCursor.initCursorModifiers();
        } catch (error) {
          console.error("初始化游標修飾符時出錯:", error);
        }
      }, 200);
    }
  },

  // 刷新 ScrollTrigger
  refreshScrollTrigger() {
    console.log("重新初始化 ScrollTrigger");

    // 先確保任何現有的實例被銷毀
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
      this.scrollTriggerInstance = null;
    }

    // 重置畫廊位置
    if (this.gallery) {
      gsap.set(this.gallery, { x: 0 });
    }

    // 延遲重新初始化
    setTimeout(() => {
      this.initScrollTrigger();
    }, 100);

    // 全局刷新
    if (ScrollTrigger && ScrollTrigger.refresh) {
      ScrollTrigger.refresh(true);
    }
  },

  // 防抖函數，避免頻繁觸發事件
  debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  },
};

// 確保在頁面加載後初始化
if (typeof window !== "undefined") {
  // 將對象暴露給全局
  window.HorizontalScrollManager = HorizontalScrollManager;

  // 頁面加載完成後檢查初始化
  window.addEventListener("load", function () {
    // 稍微延遲執行，確保 DOM 完全渲染
    setTimeout(() => {
      if (window.HorizontalScrollManager && !window.HorizontalScrollManager.initialized) {
        console.log("頁面加載後初始化 HorizontalScrollManager");
        window.HorizontalScrollManager.init();
      } else if (window.HorizontalScrollManager && window.HorizontalScrollManager.initialized) {
        // 如果已經初始化但沒有正常工作，嘗試強制刷新
        console.log("頁面加載後刷新 ScrollTrigger");
        window.HorizontalScrollManager.refreshScrollTrigger();
      }
    }, 500);
  });
}
