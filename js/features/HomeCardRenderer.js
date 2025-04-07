// HomeCardRenderer.js - 整合版首頁專案卡片渲染器
// 負責將專案資料渲染為首頁的卡片 (home-card)，並控制卡片動畫與水平滾動效果

import { projectsData } from "./projects-data.js";
import { translations } from "../core/constants.js";

export const HomeCardRenderer = {
  rendererInitialized: false, // 追蹤是否已初始化
  cardsAnimated: false, // 追蹤卡片是否已完成動畫
  scrollTriggerInstance: null, // 水平滾動觸發器
  isMobile: false, // 是否為手機版

  init() {
    // 避免重複初始化
    if (this.rendererInitialized) {
      console.log("HomeCardRenderer 已初始化，跳過");
      return;
    }

    console.log("初始化 HomeCardRenderer");

    // 檢查是否為首頁
    if (!this.isHomePage()) {
      console.log("非首頁，跳過 HomeCardRenderer 初始化");
      return;
    }

    // 檢查 GSAP 和 ScrollTrigger 是否可用
    if (!window.gsap || !window.gsap.registerPlugin) {
      console.error("GSAP 或 ScrollTrigger 未載入，橫向滾動功能無法初始化");
      return;
    }

    // 註冊 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // 檢查當前視窗寬度
    this.isMobile = window.innerWidth <= 768;
    console.log(`當前視窗寬度：${window.innerWidth}，是否手機版：${this.isMobile}`);

    // 查找專案畫廊元素
    const gallery = document.querySelector(".projects-scroll-gallery");
    if (!gallery) {
      console.warn("找不到專案畫廊元素，跳過渲染");
      return;
    }

    // 檢查卡片可見性
    this.checkCardsVisibility();

    // 設置章節標題動畫
    this.setupSectionTitle();

    // 初始化時渲染專案內容
    const savedLang = localStorage.getItem("lang") || "en";
    this.renderHomeCards(savedLang);

    // 避免在首頁重新渲染時觸發過多事件
    let renderInProgress = false;

    // 監聽語言變化
    document.addEventListener("languageChanged", (e) => {
      // 避免重複渲染
      if (renderInProgress) return;

      renderInProgress = true;
      console.log("HomeCardRenderer: 語言變更為", e.detail.language);

      // 渲染新語言的專案
      this.renderHomeCards(e.detail.language);

      // 延遲通知渲染完成
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent("homeCardsRerendered"));
        renderInProgress = false;

        // 語言變更後，重新應用卡片動畫
        this.cardsAnimated = false;
        this.setupHomeCardAnimations();

        // 刷新水平滾動
        if (!this.isMobile) {
          this.refreshScrollTrigger();
        }
      }, 300);

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

    // 延遲初始化水平滾動，確保DOM完全渲染
    setTimeout(() => {
      // 只在非手機版初始化水平滾動
      if (!this.isMobile) {
        this.initScrollTrigger();
      }
    }, 500);

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

    // 頁面載入後執行
    if (document.readyState === "complete") {
      this.setupHomeCardAnimations();
    } else {
      window.addEventListener("load", () => this.setupHomeCardAnimations());
    }

    // 將自身暴露到全局以便其他模組訪問
    window.HomeCardRenderer = this;

    // 標記渲染器已初始化
    this.rendererInitialized = true;
  },

  // 檢查卡片可見性
  checkCardsVisibility() {
    const homeCards = document.querySelectorAll(".home-card");
    if (homeCards.length === 0) return;

    const firstCard = homeCards[0];
    const style = window.getComputedStyle(firstCard);

    if (style.opacity > 0.5) {
      this.cardsAnimated = true;
    }
  },

  // 設置章節標題
  setupSectionTitle() {
    const sectionTitle = document.querySelector(".section-title") || document.querySelector(".horizontal-title");
    if (!sectionTitle) {
      // 如果沒有標題，直接顯示卡片
      if (!this.cardsAnimated) {
        this.setupHomeCardAnimations();
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
          this.setupHomeCardAnimations();
        }
      },
    });
  },

  // 設置首頁卡片動畫
  setupHomeCardAnimations() {
    if (this.cardsAnimated) return;

    const homeCards = document.querySelectorAll(".home-card");
    if (homeCards.length === 0) return;

    console.log(`找到 ${homeCards.length} 張卡片，開始設置動畫`);

    // 確保每張卡片都可見
    homeCards.forEach((card, index) => {
      const style = window.getComputedStyle(card);
      if (style.opacity > 0.5) return; // 跳過已經可見的卡片

      // 使用淡入效果
      gsap.fromTo(
        card,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          ease: "power1.out",
          delay: 0.05 * index,
          clearProps: "opacity",
        }
      );
    });

    this.cardsAnimated = true;
  },

  // 檢查當前是否為首頁
  isHomePage() {
    const path = window.location.pathname;
    return path.endsWith("index.html") || path.endsWith("/") || path.split("/").pop() === "";
  },

  // 渲染首頁專案卡片
  renderHomeCards(language) {
    // 查找專案畫廊元素
    const gallery = document.querySelector(".projects-scroll-gallery");
    if (!gallery) {
      console.warn("找不到專案畫廊元素，跳過渲染");
      return;
    }

    // 清空畫廊
    gallery.innerHTML = "";

    // 檢查是否有專案資料
    if (!projectsData[language]) {
      console.warn(`找不到 ${language} 語言的專案資料`);
      return;
    }

    // 獲取當前語言的專案資料
    const projects = projectsData[language];
    console.log(`渲染 ${Object.keys(projects).length} 個專案，語言: ${language}`);

    // 尋找用於首頁的專案
    const homepageProjects = Object.keys(projects)
      .filter((id) => projects[id].showOnHomepage)
      .map((id) => ({ id, ...projects[id] }));

    console.log(`找到 ${homepageProjects.length} 個首頁專案`);

    // 渲染每個專案卡片
    homepageProjects.forEach((project) => {
      const card = this.createHomeCard(project, language);
      gallery.appendChild(card);
    });

    // 檢查是否已應用輪播效果
    const isCarousel = gallery.classList.contains("project-carousel");

    // 為每張卡片添加特殊類別以便動畫系統識別
    gallery.querySelectorAll(".home-card").forEach((card) => {
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
  },

  // 創建首頁專案卡片
  createHomeCard(project, language) {
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

    // 映射標籤關聯
    const tagMappings = this.getTagMappings();

    // 生成帶過濾屬性的標籤 HTML
    const tagsHTML = project.tags
      .map((tag) => {
        // 查找標籤對應的過濾鍵
        const filterKey = tagMappings[language]?.[tag] || "";
        return `<span class="tag" data-filter="${filterKey}">${tag}</span>`;
      })
      .join("");

    // 創建卡片容器
    const card = document.createElement("div");
    card.className = "home-card";
    card.setAttribute("data-project-id", project.id);

    // 根據畫廊類型使用不同的結構
    const isHorizontalGallery =
      document.querySelector(".projects-scroll-gallery")?.closest(".horizontal-scroll-section") !== null;

    if (isHorizontalGallery) {
      // 水平滾動畫廊結構
      card.innerHTML = `
        <a href="${linkPath}" class="card-image" cursor-class="card-hover">
          <img src="${imagePath}" alt="${project.title}" loading="lazy" />
        </a>
        <div class="card-info">
          <h3 class="card-title">${project.title}</h3>
          <p class="card-description">${project.description}</p>
        </div>
        <div class="card-tags">
          ${tagsHTML}
        </div>
      `;
    } else {
      // 一般網格結構
      card.innerHTML = `
        <a href="${linkPath}" class="card-image" cursor-class="card-hover">
          <img src="${imagePath}" alt="${project.title}" loading="lazy" />
        </a>
        <div class="card-info">
          <h3 class="card-title">${project.title}</h3>
          <p class="card-description">${project.description}</p>
          <div class="card-tags">
            ${tagsHTML}
          </div>
        </div>
      `;
    }

    return card;
  },

  // ==========================================
  // 水平滾動功能
  // ==========================================

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
      const gallery = document.querySelector(".projects-scroll-gallery");
      if (gallery) {
        gsap.set(gallery, { x: 0 });
      }
    }
  },

  // 初始化 ScrollTrigger，包含視差效果和hover效果
  initScrollTrigger() {
    // 查找水平滾動區域
    const section = document.querySelector(".horizontal-scroll-section");
    const gallery = document.querySelector(".projects-scroll-gallery");

    if (!section || !gallery) {
      console.error("找不到必要的元素，無法初始化 ScrollTrigger");
      return;
    }

    // 確保有卡片
    const cards = gallery.querySelectorAll(".home-card");
    if (cards.length === 0) {
      console.log("畫廊為空，跳過初始化");
      return;
    }

    console.log(`找到 ${cards.length} 張卡片，初始化滾動效果`);

    // 先清除任何現有的 ScrollTrigger 實例
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
      this.scrollTriggerInstance = null;
    }

    // 計算畫廊的總寬度和容器寬度
    const galleryWidth = gallery.scrollWidth;
    const containerWidth = section.offsetWidth;

    // 為最後一張卡片添加額外的右側空間，確保完全顯示
    const rightPadding = parseInt(window.getComputedStyle(section).paddingRight, 10) || 0;

    // 計算畫廊內容超出容器的寬度，加上右側padding確保最後對齊
    const scrollDistance = galleryWidth - containerWidth + rightPadding;

    console.log(
      `畫廊寬度: ${galleryWidth}px, 容器寬度: ${containerWidth}px, 右側padding: ${rightPadding}px, 超出距離: ${scrollDistance}px`
    );

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
    const cardImages = gallery.querySelectorAll(".home-card .card-image img");
    console.log(`找到 ${cardImages.length} 張卡片圖片，準備設置視差效果`);

    // 創建新的時間軸動畫
    try {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
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
      tl.to(gallery, {
        x: -scrollDistance, // 確保最後一張卡片與右側padding保持一致
        ease: "none",
      });

      // 為每張圖片添加輕微的水平視差效果
      cardImages.forEach((img) => {
        // 視差係數
        const parallaxFactor = -0.05;

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
      cardImages.forEach((img) => {
        const imageContainer = img.closest(".card-image");

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
    const gallery = document.querySelector(".projects-scroll-gallery");
    if (gallery) {
      gsap.set(gallery, { x: 0 });
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
