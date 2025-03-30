import { BREAKPOINTS } from "./constants.js";
import { transformNavLinks, observeNavChanges } from "../features/nav-modifier.js";

// ==============================================
// Navbar Scroll Management
// ==============================================
export const NavbarScrollManager = {
  init() {
    // 初始化變量
    this.nav = document.querySelector(".nav");
    this.mobileNavControls = document.querySelector(".mobile-nav-controls");
    this.lastScrollTop = 0;
    this.scrollThreshold = 50;
    this.scrollDelta = 5;

    // 確保找到了必要元素
    if (!this.nav) {
      console.error("Navigation element .nav not found");
      return;
    }

    if (!this.mobileNavControls) {
      console.error("Mobile nav controls element .mobile-nav-controls not found");
      // 即使沒找到手機導航，也繼續初始化桌面導航功能
    }

    // 綁定滾動事件
    window.addEventListener("scroll", this.handleScroll.bind(this));

    // 初始調用一次，確保初始狀態正確
    this.handleScroll();

    // 初始化導航連結的 3D 效果
    setTimeout(() => {
      transformNavLinks();
      observeNavChanges();
    }, 300); // 稍微延遲以確保 DOM 已完全加載
  },

  handleScroll() {
    const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

    // 確保滾動超過閾值才觸發
    if (currentScrollTop > this.scrollThreshold) {
      // 向下滾動超過指定的 delta 值
      if (currentScrollTop > this.lastScrollTop + this.scrollDelta) {
        this.nav.classList.add("nav-hidden");

        // 同步處理手機版選單
        if (this.mobileNavControls) {
          this.mobileNavControls.classList.add("nav-hidden");
        }
      }
      // 向上滾動超過指定的 delta 值
      else if (currentScrollTop < this.lastScrollTop - this.scrollDelta) {
        this.nav.classList.remove("nav-hidden");

        // 同步處理手機版選單
        if (this.mobileNavControls) {
          this.mobileNavControls.classList.remove("nav-hidden");
        }
      }
    } else {
      // 如果還沒超過閾值，確保元素是可見的
      this.nav.classList.remove("nav-hidden");

      // 同步處理手機版選單
      if (this.mobileNavControls) {
        this.mobileNavControls.classList.remove("nav-hidden");
      }
    }

    // 更新上次滾動位置
    this.lastScrollTop = currentScrollTop;
  },
};

// ==============================================
// Mobile Menu Management
// ==============================================
export const MobileMenuManager = {
  init() {
    this.menuToggle = document.querySelector(".menu-toggle");
    this.fullscreenMenu = document.querySelector(".fullscreen-menu");
    this.menuLinks = document.querySelectorAll(".nav-links.mobile .nav-link");
    this.mobileControls = document.querySelector(".mobile-controls");

    // 檢查 GSAP 是否可用
    const hasGSAP = typeof gsap !== "undefined";

    // 初始設置
    if (hasGSAP) {
      // 預設動畫配置
      gsap.defaults({
        ease: "power3.out",
        duration: 0.5,
      });

      // 先隱藏菜單項目（初始狀態）
      gsap.set(this.menuLinks, { opacity: 0, y: 40 });
      gsap.set(this.mobileControls, { opacity: 0, y: 20 });
    }

    if (this.menuToggle && this.fullscreenMenu) {
      this.menuToggle.addEventListener("click", this.handleMenuToggle.bind(this));

      const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.mobile + 1}px)`);
      mediaQuery.addEventListener("change", this.handleScreenResize.bind(this));
    }
  },

  handleMenuToggle() {
    if (this.fullscreenMenu.classList.contains("active")) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  },

  openMenu() {
    this.menuToggle.classList.add("active");
    this.fullscreenMenu.classList.add("active");
    document.body.style.overflow = "hidden";

    // 確保菜單項目有 3D 效果結構
    setTimeout(() => {
      transformNavLinks();
    }, 10);

    // 如果 GSAP 可用，添加進入動畫
    if (typeof gsap !== "undefined") {
      // 重置初始狀態
      gsap.set(this.menuLinks, { opacity: 0, y: 40 });
      gsap.set(this.mobileControls, { opacity: 0, y: 20 });

      // 創建時間軸
      const tl = gsap.timeline();

      // 菜單項目依次滑入
      tl.to(this.menuLinks, {
        opacity: 1,
        y: 0,
        stagger: 0.08, // 每個項目間隔時間
        duration: 0.5,
        delay: 0.1,
        ease: "back.out(1.2)", // 帶有輕微回彈效果
      });

      // 控制項淡入
      tl.to(
        this.mobileControls,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        },
        "-=0.2"
      ); // 稍微重疊動畫
    }
  },

  closeMenu() {
    // 如果 GSAP 可用，添加退出動畫
    if (typeof gsap !== "undefined") {
      const tl = gsap.timeline({
        onComplete: () => {
          this.menuToggle.classList.remove("active");
          this.fullscreenMenu.classList.remove("active");
          document.body.style.overflow = "";
        },
      });

      // 先淡出控制項
      tl.to(this.mobileControls, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
      });

      // 菜單項目依次淡出（相反順序）
      tl.to(
        this.menuLinks,
        {
          opacity: 0,
          y: 40,
          stagger: 0.05,
          duration: 0.3,
          ease: "power2.in",
        },
        "-=0.1"
      );
    } else {
      // 無 GSAP 時的回退方案
      this.menuToggle.classList.remove("active");
      this.fullscreenMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  handleScreenResize(e) {
    if (e.matches) {
      this.menuToggle.classList.remove("active");
      this.fullscreenMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  },
};
