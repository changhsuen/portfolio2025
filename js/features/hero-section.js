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
    const nav = document.querySelector(".nav");
    const menuToggle = document.querySelector(".menu-toggle"); // 漢堡選單按鈕
    const fullscreenMenu = document.querySelector(".fullscreen-menu"); // 全屏選單

    if (!heroLogo || !navLogo || !mainContent || !heroSection || !container || !nav) {
      console.error("找不到必要的元素");
      return;
    }

    // 獲取導航欄 logo 的尺寸和位置
    const navLogoRect = navLogo.getBoundingClientRect();
    const containerPadding = parseInt(window.getComputedStyle(container).paddingLeft, 10);
    const navRect = nav.getBoundingClientRect();

    // 計算 logo 在導航欄中的確切位置
    const exactNavLogoTop = navLogoRect.top;
    const exactNavLogoLeft = navLogoRect.left;

    // 隱藏導航欄 logo
    navLogo.style.opacity = "0";
    navLogo.style.pointerEvents = "none";

    // 獲取標準 logo 尺寸（用於調整最終尺寸）
    const navLogoWidth = navLogoRect.width;
    const navLogoHeight = navLogoRect.height;

    // 設置初始大小 - 較大尺寸
    const isMobile = window.innerWidth <= 768;
    // 增加初始logo尺寸
    const initialWidth = isMobile ? window.innerWidth * 0.8 : window.innerWidth * 0.65; // 增加尺寸
    const aspectRatio = 92 / 50; // SVG 的寬高比
    const initialHeight = initialWidth / aspectRatio;

    // 設置一個極高的 z-index 值
    const highestZIndex = 999999;

    // 確保 heroLogo 的父容器也有正確的定位和 z-index
    if (heroLogo.parentElement) {
      heroLogo.parentElement.style.position = "relative";
      heroLogo.parentElement.style.zIndex = highestZIndex;
    }

    // 修改 main 元素的 z-index，確保它不會創建新的層疊上下文
    if (mainContent) {
      mainContent.style.position = "relative";
      mainContent.style.zIndex = "1";
    }

    // 檢查並調整卡片元素的 z-index
    const projectCards = document.querySelectorAll(".project-card, .home-card");
    projectCards.forEach((card) => {
      card.style.zIndex = "1";
    });

    // 計算距離底部的距離 - 設置較小的值，確保更接近底部
    const bottomDistance = 10; // 只有10px的間距，非常接近底部

    // 設置 hero logo 的初始樣式 - 左下角，幾乎貼近底部
    gsap.set(heroLogo, {
      position: "fixed",
      top: "auto", // 移除頂部定位
      bottom: bottomDistance, // 使用較小的底部間距
      left: containerPadding,
      xPercent: 0, // 不進行水平置中
      yPercent: 0, // 不進行垂直置中
      width: initialWidth,
      height: initialHeight,
      zIndex: highestZIndex, // 使用極高的 z-index 值
      pointerEvents: "none", // 禁用鼠標事件，使logo不可點擊
      transform: "translateZ(0)", // 強制創建新的層疊上下文
    });

    // 創建滾動觸發動畫 - 確保最終位置與導航欄 logo 完全一致
    const logoScrollTrigger = ScrollTrigger.create({
      animation: gsap.timeline().to(heroLogo, {
        // 使用精確的導航欄 logo 位置
        bottom: "auto", // 滾動時切換到頂部定位
        top: exactNavLogoTop, // 使用精確的頂部位置
        left: exactNavLogoLeft, // 使用精確的左側位置
        width: navLogoWidth, // 縮小到導航欄 logo 的寬度
        height: navLogoHeight, // 縮小到導航欄 logo 的高度
        xPercent: 0, // 水平不偏移
        yPercent: 0, // 垂直不偏移
        zIndex: highestZIndex, // 保持最高層級
        ease: "power2.out",
        transform: "translateZ(0)", // 保持層疊上下文
      }),
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        // 在動畫進行過程中確保導航欄 logo 保持隱藏
        navLogo.style.opacity = "0";
      },
    });

    // 創建一個透明遮罩層，確保 logo 始終可見
    const createOverlay = () => {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.zIndex = (highestZIndex - 1).toString();
      overlay.style.pointerEvents = "none"; // 確保不影響用戶交互
      overlay.style.background = "transparent";
      document.body.appendChild(overlay);
      return overlay;
    };

    // 添加透明遮罩層
    const overlay = createOverlay();

    // 移動 heroLogo 到 body 的最後，確保它在 DOM 結構中最後渲染
    document.body.appendChild(heroLogo);

    // 判斷是否為首頁
    const isHomePage = () => {
      const path = window.location.pathname;
      return path.endsWith("index.html") || path.endsWith("/") || path.split("/").pop() === "";
    };

    // 定義一個函數來處理 logo 的顯示/隱藏
    const toggleLogoVisibility = (show) => {
      if (show) {
        gsap.to(heroLogo, {
          opacity: 1,
          visibility: "visible",
          duration: 0.3,
          ease: "power2.inOut",
        });
      } else {
        gsap.to(heroLogo, {
          opacity: 0,
          visibility: "hidden",
          duration: 0.3,
          ease: "power2.inOut",
        });
      }
    };

    // 專門監聽首頁的漢堡選單狀態
    // 這個監聽器針對所有頁面，但會特別處理首頁
    if (menuToggle && fullscreenMenu && heroLogo) {
      // 首先檢查當前選單狀態
      if (fullscreenMenu.classList.contains("active")) {
        toggleLogoVisibility(false);
      }

      // 直接監聽 fullscreenMenu 的類別變化，這比監聽按鈕點擊更可靠
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "class") {
            const isActive = fullscreenMenu.classList.contains("active");
            console.log(`選單狀態變更: ${isActive ? "開啟" : "關閉"}`);
            toggleLogoVisibility(!isActive);
          }
        });
      });

      // 開始觀察 fullscreenMenu 的類別變化
      observer.observe(fullscreenMenu, { attributes: true });

      // 額外監聽漢堡選單按鈕點擊事件
      menuToggle.addEventListener("click", () => {
        console.log(
          `漢堡選單按鈕被點擊，當前選單狀態: ${fullscreenMenu.classList.contains("active") ? "開啟" : "關閉"}`
        );
        // 因為點擊後類別變化會被 observer 捕獲，這裡不需要額外處理
      });

      // 確保當選單項被點擊時也能正確處理 logo
      const menuLinks = document.querySelectorAll(".nav-links.mobile .nav-link");
      menuLinks.forEach((link) => {
        link.addEventListener("click", () => {
          console.log("選單項被點擊");
          // 稍微延遲執行，確保選單關閉後再顯示 logo
          setTimeout(() => {
            if (!fullscreenMenu.classList.contains("active")) {
              toggleLogoVisibility(true);
            }
          }, 300);
        });
      });
    }

    // 處理窗口大小變化
    window.addEventListener("resize", () => {
      // 檢查選單狀態，如果選單開啟，保持 logo 隱藏
      if (fullscreenMenu && fullscreenMenu.classList.contains("active")) {
        toggleLogoVisibility(false);
        return; // 如果選單開啟，不執行後續代碼
      }

      // 如果選單關閉，正常處理 logo
      // 重新計算 container padding
      const newContainerPadding = parseInt(window.getComputedStyle(container).paddingLeft, 10);

      // 檢查是否為移動設備
      const newIsMobile = window.innerWidth <= 768;

      // 重新計算初始大小
      const newWidth = newIsMobile ? window.innerWidth * 0.8 : window.innerWidth * 0.65;
      const newHeight = newWidth / aspectRatio;

      // 重新獲取導航欄 logo 的位置
      const newNavLogoRect = navLogo.getBoundingClientRect();
      const newExactNavLogoTop = newNavLogoRect.top;
      const newExactNavLogoLeft = newNavLogoRect.left;

      // 如果滾動位置在頂部，重置 logo 大小和位置到左下角
      if (window.scrollY < 10) {
        gsap.set(heroLogo, {
          width: newWidth,
          height: newHeight,
          top: "auto",
          bottom: bottomDistance, // 使用相同的底部距離
          left: newContainerPadding,
          xPercent: 0,
          yPercent: 0,
          zIndex: highestZIndex, // 保持最高層級
          pointerEvents: "none", // 確保 resize 後仍然保持不可點擊
          transform: "translateZ(0)", // 保持層疊上下文
        });
      } else if (window.scrollY >= document.body.scrollHeight - window.innerHeight) {
        // 如果已滾動到底部，確保 logo 位於導航欄 logo 的精確位置
        gsap.set(heroLogo, {
          top: newExactNavLogoTop,
          bottom: "auto",
          left: newExactNavLogoLeft,
          xPercent: 0,
          yPercent: 0,
          width: navLogoWidth,
          height: navLogoHeight,
          zIndex: highestZIndex, // 保持最高層級
          pointerEvents: "none", // 確保 resize 後仍然保持不可點擊
          transform: "translateZ(0)", // 保持層疊上下文
        });
      }
    });

    // 頁面加載完成後的處理
    window.addEventListener("load", () => {
      // 檢查選單狀態
      if (fullscreenMenu && fullscreenMenu.classList.contains("active")) {
        toggleLogoVisibility(false);
      }
    });

    // 如果漢堡選單有初始點擊觸發（例如頁面加載前已經打開），確保 logo 狀態正確
    if (fullscreenMenu && heroLogo) {
      const checkMenuStatus = () => {
        if (fullscreenMenu.classList.contains("active")) {
          console.log("漢堡選單初始狀態為開啟，隱藏 logo");
          toggleLogoVisibility(false);
        }
      };

      // 立即檢查一次
      checkMenuStatus();

      // 並在短暫延遲後再次檢查（確保 DOM 完全加載）
      setTimeout(checkMenuStatus, 500);
    }

    console.log("GSAP Logo 效果設置完成，優化了首頁漢堡選單處理");
  },
};

// 將管理器暴露到全局，以便其他模塊訪問
window.HeroSectionManager = HeroSectionManager;
