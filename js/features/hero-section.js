// ==============================================
// Hero Section 管理器 - 使用 GSAP 和 ScrollTrigger
// ==============================================

export const HeroSectionManager = {
  init() {
    console.log("初始化 Hero Section - GSAP 版本");

    // 首先處理導航欄，確保其始終可見
    this.setupFixedNavbar();

    // 然後初始化 hero logo 的滾動效果
    this.setupGsapLogoEffect();

    console.log("Hero Section 初始化完成");
  },

  setupFixedNavbar() {
    // 確保導航欄初始狀態是可見的
    const nav = document.querySelector(".nav");
    const mobileNavControls = document.querySelector(".mobile-nav-controls");

    if (nav) {
      nav.classList.remove("nav-hidden");
    }

    if (mobileNavControls) {
      mobileNavControls.classList.remove("nav-hidden");
    }

    console.log("導航欄設置為固定顯示");
  },

  setupGsapLogoEffect() {
    // 確保 GSAP 和 ScrollTrigger 可用
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.error("GSAP 或 ScrollTrigger 未載入");
      return;
    }

    // 獲取元素
    const heroSection = document.querySelector(".hero-section");
    const heroLogo = document.querySelector(".hero-logo");
    const navLogo = document.querySelector(".logo-icon");
    const mainContent = document.querySelector(".main");
    const container = document.querySelector(".container");

    if (!heroLogo || !navLogo || !mainContent || !heroSection || !container) {
      console.error("找不到必要的元素");
      return;
    }

    // 獲取導航欄 logo 的尺寸和位置
    const navLogoRect = navLogo.getBoundingClientRect();
    const containerPadding = parseInt(window.getComputedStyle(container).paddingLeft, 10);

    // 隱藏導航欄 logo
    navLogo.style.opacity = "0";
    navLogo.style.pointerEvents = "none";

    // 獲取標準 logo 尺寸（用於調整最終尺寸）
    const navLogoWidth = navLogoRect.width;
    const navLogoHeight = navLogoRect.height;

    // 計算初始位置 - 首屏中央
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // 設置初始大小 - 考慮 container 的 padding
    const isMobile = window.innerWidth <= 768;
    const initialWidth = isMobile ? window.innerWidth * 0.8 : window.innerWidth - containerPadding * 2;
    const aspectRatio = 92 / 50; // SVG 的寬高比
    const initialHeight = initialWidth / aspectRatio;

    // 設置 hero logo 的初始樣式
    gsap.set(heroLogo, {
      position: "fixed",
      top: centerY,
      left: centerX,
      xPercent: -50, // 中心點定位
      yPercent: -50,
      width: initialWidth,
      height: initialHeight,
      zIndex: 999, // 小於 nav 的 z-index，使其能夠滑到 nav 下方
    });

    // 創建滾動觸發動畫
    ScrollTrigger.create({
      animation: gsap.timeline().to(heroLogo, {
        top: navLogoRect.top + navLogoRect.height / 2,
        left: navLogoRect.left + navLogoRect.width / 2,
        width: navLogoWidth,
        height: navLogoHeight,
        zIndex: 101, // 動畫過程中增加 z-index，使其顯示在導航欄上方
        ease: "power2.out",
      }),
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        // 在動畫進行過程中確保導航欄 logo 保持隱藏
        navLogo.style.opacity = "0";

        // 在接近結束點時調整 z-index
        if (self.progress > 0.9) {
          heroLogo.style.zIndex = "101"; // 確保在導航欄上方
        }
      },
    });

    // 添加點擊事件 - 點擊 logo 回到首頁
    heroLogo.addEventListener("click", () => {
      window.location.href = "/";
    });

    // 鼠標指針樣式
    heroLogo.style.cursor = "pointer";

    // 處理窗口大小變化
    window.addEventListener("resize", () => {
      // 重新計算 container padding
      const newContainerPadding = parseInt(window.getComputedStyle(container).paddingLeft, 10);

      // 檢查是否為移動設備
      const newIsMobile = window.innerWidth <= 768;

      // 重新計算初始大小
      const newWidth = newIsMobile ? window.innerWidth * 0.8 : window.innerWidth - newContainerPadding * 2;
      const newHeight = newWidth / aspectRatio;

      // 重新獲取導航欄 logo 的尺寸和位置
      const newNavLogoRect = navLogo.getBoundingClientRect();

      // 如果滾動位置在頂部，重置 logo 大小
      if (window.scrollY < 10) {
        gsap.set(heroLogo, {
          width: newWidth,
          height: newHeight,
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
        });
      } else if (window.scrollY >= document.body.scrollHeight - window.innerHeight) {
        // 如果已滾動到底部，確保 logo 位於導航欄位置
        gsap.set(heroLogo, {
          top: newNavLogoRect.top + newNavLogoRect.height / 2,
          left: newNavLogoRect.left + newNavLogoRect.width / 2,
          width: newNavLogoRect.width,
          height: newNavLogoRect.height,
          zIndex: 101,
        });
      }
    });

    console.log("GSAP Logo 效果設置完成");
  },
};

// 將管理器暴露到全局，以便其他模塊訪問
window.HeroSectionManager = HeroSectionManager;
