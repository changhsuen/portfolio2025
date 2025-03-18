import { BREAKPOINTS } from "./constants.js";

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
      console.error(
        "Mobile nav controls element .mobile-nav-controls not found"
      );
      // 即使沒找到手機導航，也繼續初始化桌面導航功能
    }

    // 綁定滾動事件
    window.addEventListener("scroll", this.handleScroll.bind(this));

    // 初始調用一次，確保初始狀態正確
    this.handleScroll();
  },

  handleScroll() {
    const currentScrollTop =
      window.scrollY || document.documentElement.scrollTop;

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

    if (this.menuToggle && this.fullscreenMenu) {
      this.menuToggle.addEventListener(
        "click",
        this.handleMenuToggle.bind(this)
      );

      const mediaQuery = window.matchMedia(
        `(min-width: ${BREAKPOINTS.mobile + 1}px)`
      );
      mediaQuery.addEventListener("change", this.handleScreenResize.bind(this));
    }
  },

  handleMenuToggle() {
    this.menuToggle.classList.toggle("active");
    this.fullscreenMenu.classList.toggle("active");
    document.body.style.overflow = this.fullscreenMenu.classList.contains(
      "active"
    )
      ? "hidden"
      : "";
  },

  handleScreenResize(e) {
    if (e.matches) {
      this.menuToggle.classList.remove("active");
      this.fullscreenMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  },
};
