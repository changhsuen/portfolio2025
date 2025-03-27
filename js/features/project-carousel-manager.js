// 專案輪播效果管理器 - 基於 MWG 008 效果
export const ProjectCarouselManager = {
  initialized: false,
  autoScrollSpeed: 25, // 自動滾動速度調整（數值越大越快）
  carouselElem: null,
  total: 0,
  xTo: null,
  itemValues: [],
  tl: null, // 保存動畫時間軸

  init() {
    // 檢查是否已初始化
    if (this.initialized) {
      console.log("ProjectCarouselManager 已初始化，跳過");
      return;
    }

    // 檢查是否為首頁
    if (!this.isHomePage()) {
      console.log("不是首頁，跳過初始化輪播");
      return;
    }

    // 監聽語言變更事件
    document.addEventListener("languageChanged", (e) => {
      if (this.isHomePage()) {
        console.log("語言變更為:", e.detail.language);
        this.handleLanguageChange(e.detail.language);
      }
    });

    console.log("初始化首頁輪播");

    // 確保 GSAP 和 Observer 可用
    if (!window.gsap) {
      console.error("GSAP 未載入，輪播效果將無法運作");
      return;
    }

    if (!window.gsap.Observer) {
      console.error("GSAP Observer 插件未載入，輪播效果將無法完全運作");
      try {
        window.gsap.registerPlugin(Observer);
        console.log("成功註冊 Observer 插件");
      } catch (error) {
        console.error("註冊 Observer 插件失敗:", error);
      }
    }

    // 綁定 tick 方法的上下文
    this.tick = this.tick.bind(this);

    // 等待頁面完全加載
    if (document.readyState === "complete") {
      this.setupCarousel();
    } else {
      window.addEventListener("load", () => {
        setTimeout(() => this.setupCarousel(), 500);
      });
    }

    // 監聽專案渲染完成事件
    document.addEventListener("projectsRerendered", () => {
      if (this.isHomePage()) {
        console.log("首頁專案重新渲染，重新設置輪播效果");
        setTimeout(() => this.setupCarousel(), 300);
      }
    });

    this.initialized = true;
  },

  // 判斷當前是否為首頁
  isHomePage() {
    const path = window.location.pathname;
    return path.endsWith("index.html") || path.endsWith("/") || path.split("/").pop() === "";
  },

  // 正確處理語言更新
  handleLanguageChange(language) {
    console.log("輪播管理器處理語言變更:", language);

    // 找到「查看更多專案」連結
    const seeMoreLink = document.querySelector(".see-more-projects");
    if (!seeMoreLink) {
      console.log("找不到「查看更多專案」連結，跳過更新");
      return;
    }

    // 根據語言設置文字內容
    const translations = {
      "zh-TW": "查看更多專案",
      en: "See more projects",
    };

    // 更新連結文字
    seeMoreLink.textContent = translations[language] || "See more projects";
    console.log("已更新「查看更多專案」連結文字為:", seeMoreLink.textContent);
  },

  setupCarousel() {
    // 再次確認是否為首頁
    if (!this.isHomePage()) {
      console.log("不是首頁，跳過設置輪播");
      return;
    }

    console.log("設置首頁輪播效果");

    // 查找專案網格
    const projectGrid = document.querySelector(".project-grid");
    if (!projectGrid) {
      const carousel = document.querySelector(".project-carousel");
      if (!carousel) {
        console.log("找不到專案網格或輪播，跳過設置輪播效果");
        return;
      }
      // 如果找到輪播但沒找到網格，表示已經轉換過了
      this.setupCarouselLogic(carousel);
      return;
    }

    // 轉換為輪播
    projectGrid.classList.add("project-carousel");
    projectGrid.classList.remove("project-grid");
    console.log("已將專案網格轉換為輪播");

    // 設置輪播邏輯
    this.setupCarouselLogic(projectGrid);
  },

  setupCarouselLogic(carousel) {
    // 查找所有專案卡片
    let projectCards = carousel.querySelectorAll(".project-card");
    if (projectCards.length === 0) {
      console.log("找不到專案卡片，跳過設置輪播效果");
      return;
    }

    console.log(`找到 ${projectCards.length} 個專案卡片，設置輪播效果`);

    // 先確保所有卡片是可見的
    projectCards.forEach((card) => {
      // 移除任何可能隱藏卡片的內聯樣式
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
      card.style.display = "";
      card.style.visibility = "visible";
      // 移除可能的隱藏類
      card.classList.remove("hidden-project");
    });

    // 清除任何之前複製的卡片
    const duplicateCards = carousel.querySelectorAll(".project-card-duplicate");
    duplicateCards.forEach((card) => card.remove());

    // 複製所有卡片以實現無限滾動
    projectCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add("project-card-duplicate");
      carousel.appendChild(clone);
    });

    // 重新獲取所有卡片（包括原始卡片和複製卡片）
    projectCards = carousel.querySelectorAll(".project-card, .project-card-duplicate");

    // 計算輪播內容寬度和一半寬度
    const carouselWidth = carousel.clientWidth;
    const half = carouselWidth / 2;

    // 使用 GSAP 的 wrap 工具包裝範圍
    const wrap = gsap.utils.wrap(-half, half);

    // 使用 GSAP 的 quickTo 進行平滑滾動
    this.xTo = gsap.quickTo(carousel, "x", {
      duration: 0.5,
      ease: "power3",
      modifiers: {
        x: gsap.utils.unitize(wrap),
      },
    });

    // 為每張卡片生成隨機旋轉和位移值 (範圍 -10 到 10)
    this.itemValues = [];
    const originalCardsCount = projectCards.length / 2;
    for (let i = 0; i < originalCardsCount; i++) {
      this.itemValues.push((Math.random() - 0.5) * 20);
    }

    // 創建動畫時間軸
    const tl = gsap.timeline({ paused: true });

    // 添加卡片變形動畫
    tl.to(projectCards, {
      rotate: (index) => this.itemValues[index % originalCardsCount],
      xPercent: (index) => this.itemValues[index % originalCardsCount],
      yPercent: (index) => this.itemValues[index % originalCardsCount],
      scale: 0.95,
      duration: 0.5,
      ease: "back.inOut(3)",
    });

    // 使用 GSAP Observer 監控互動
    if (gsap.Observer) {
      console.log("創建 Observer 實例");
      gsap.Observer.create({
        target: carousel,
        type: "pointer,touch", // 同時檢測滑鼠和觸控事件
        onPress: () => {
          console.log("按下：播放變形動畫");
          tl.play();
          carousel.classList.add("dragging");

          // 暫停自動滾動
          gsap.ticker.remove(this.tick);
        },
        onDrag: (self) => {
          // 拖曳時更新位置
          this.total += self.deltaX;
          this.xTo(this.total);
        },
        onRelease: () => {
          console.log("釋放：反轉變形動畫");
          tl.reverse();
          carousel.classList.remove("dragging");

          // 恢復自動滾動
          gsap.ticker.add(this.tick);
        },
        onStop: () => {
          tl.reverse();
          carousel.classList.remove("dragging");

          // 恢復自動滾動
          gsap.ticker.add(this.tick);
        },
      });
    } else {
      console.error("Observer 插件不可用，無法添加拖曳功能");

      // 後備方案：使用基本的鼠標事件
      this.setupBasicDragFallback(carousel, tl);
    }

    // 保存引用以便自動滾動
    this.carouselElem = carousel;
    this.tl = tl; // 保存動畫時間軸引用

    // 設置初始總滾動距離
    this.total = 0;

    // 清除先前的自動滾動
    gsap.ticker.remove(this.tick);

    // 啟動自動滾動
    gsap.ticker.add(this.tick);
    console.log("已啟動自動滾動");

    // 添加查看更多專案連結
    this.addSeeMoreLink();
  },

  // 基本拖曳後備方案
  setupBasicDragFallback(carousel, tl) {
    let isDragging = false;
    let startX = 0;
    let startScrollX = 0;

    const startDrag = (e) => {
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      startScrollX = this.total;
      carousel.classList.add("dragging");
      tl.play();

      // 暫停自動滾動
      gsap.ticker.remove(this.tick);

      // 添加臨時事件監聽器
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchend", endDrag);
    };

    const drag = (e) => {
      if (!isDragging) return;

      e.preventDefault();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const deltaX = clientX - startX;

      this.total = startScrollX + deltaX;
      this.xTo(this.total);
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      carousel.classList.remove("dragging");
      tl.reverse();

      // 移除臨時事件監聽器
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchend", endDrag);

      // 恢復自動滾動
      gsap.ticker.add(this.tick);
    };

    carousel.addEventListener("mousedown", startDrag);
    carousel.addEventListener("touchstart", startDrag, { passive: false });
  },

  // 自動滾動函數
  tick(time, deltaTime) {
    if (!this.carouselElem || !this.xTo) return;

    // 調整滾動速度，這裡的值決定了自動滾動的速度
    this.total -= deltaTime / this.autoScrollSpeed;

    // 應用滾動
    this.xTo(this.total);

    // 每200幀輸出一次日誌以確認自動滾動正在運行
    if (Math.floor(time) % 200 === 0) {
      console.log("自動滾動中...", this.total);
    }
  },

  // 添加查看更多專案連結
  addSeeMoreLink() {
    // 查找專案部分
    const sectionElem = document.querySelector(".section");
    if (!sectionElem) return;

    // 查找並刪除現有指示器和連結
    const existingIndicator = document.querySelector(".carousel-indicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }

    const existingLink = document.querySelector(".see-more-projects");
    if (existingLink) {
      existingLink.remove();
    }

    // 獲取當前語言
    const currentLang = document.documentElement.getAttribute("lang") || "en";

    // 根據當前語言決定文字
    const linkText = currentLang === "zh-TW" ? "查看更多專案" : "See more projects";

    // 創建連結
    const linkContainer = document.createElement("div");
    linkContainer.className = "see-more-projects-container";
    linkContainer.style.textAlign = "center";
    linkContainer.style.marginTop = "var(--spacing-07)";
    linkContainer.style.marginBottom = "var(--spacing-07)";

    const link = document.createElement("a");
    link.className = "see-more-projects";
    link.href = "projects.html";
    link.textContent = linkText; // 使用正確的語言文字
    link.style.fontFamily = "var(--font-mono)";
    link.style.color = "var(--text-secondary)";
    link.style.textDecoration = "none";
    link.style.transition = "color 0.3s ease";
    link.setAttribute("data-lang-key", "seeMoreProjects");

    // 添加懸停效果
    link.addEventListener("mouseenter", () => {
      link.style.color = "var(--text-primary)";
    });
    link.addEventListener("mouseleave", () => {
      link.style.color = "var(--text-secondary)";
    });

    linkContainer.appendChild(link);

    // 如果輪播存在，將連結添加到輪播之後
    if (this.carouselElem && this.carouselElem.parentNode) {
      this.carouselElem.parentNode.insertBefore(linkContainer, this.carouselElem.nextSibling);
    } else {
      // 否則添加到 section 的末尾
      sectionElem.appendChild(linkContainer);
    }

    console.log(`已添加「${linkText}」連結`);
  },
};

// 如果這個腳本直接被引入，初始化效果
if (typeof window !== "undefined") {
  window.ProjectCarouselManager = ProjectCarouselManager;

  // 檢查是否已經有 DOM 內容
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(() => ProjectCarouselManager.init(), 300);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => ProjectCarouselManager.init(), 300);
    });
  }
}
