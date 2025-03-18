import { ANIMATION_CONFIG } from "../core/constants.js";

// ==============================================
// WOW Animation Management
// ==============================================
export const WowAnimationManager = {
  init() {
    // 檢查是否已載入 WOW 庫
    if (typeof WOW === "undefined") {
      console.error("WOW.js 庫未載入！請確保已引入相關腳本。");
      return;
    }

    // 初始化 WOW.js，並增加回調功能
    const wow = new WOW({
      boxClass: "wow", // 要套用動畫的元素類名
      animateClass: "animate__animated", // 更新為 Animate.css 4.0+ 的命名空間
      offset: 0, // 元素一進入視口就觸發
      mobile: true, // 是否在移動設備上啟用
      live: true, // 是否對動態添加的元素也應用動畫效果
      callback: function (box) {
        // 當元素動畫開始時觸發
        box.dispatchEvent(new CustomEvent("animationstart"));

        // 當元素完成動畫時觸發
        box.addEventListener(
          "animationend",
          () => {
            box.dispatchEvent(new CustomEvent("wowanimationend"));
          },
          { once: true }
        );
      },
      scrollContainer: null, // 可選滾動容器選擇器，默認為 window
    });

    wow.init();

    // 儲存 wow 實例以便其他地方可能會用到
    window.wowInstance = wow;

    console.log("WOW.js 動畫管理器已初始化，並添加了動畫事件監聽");

    // 添加全域實用方法
    this.addUtilityMethods();
  },

  // 將原有的 data-scroll-animation 和 data-delay 屬性轉換為 WOW.js 格式
  convertExistingAnimations() {
    // 查找所有有 data-scroll-animation 屬性的元素
    const animatedElements = document.querySelectorAll("[data-scroll-animation]");

    animatedElements.forEach((element) => {
      // 取得原有的動畫類型
      const animationType = element.getAttribute("data-scroll-animation");
      let wowAnimation = "";

      // 映射原有的動畫類型到 Animate.css 的類名
      switch (animationType) {
        case "fade-up":
          wowAnimation = "animate__fadeInUp";
          break;
        case "fade-in":
          wowAnimation = "animate__fadeIn";
          break;
        case "slide-in":
          wowAnimation = "animate__slideInUp";
          break;
        default:
          wowAnimation = "animate__fadeIn";
      }

      // 添加 wow 類名
      element.classList.add("wow");
      // 添加 animate__animated 類和特定的動畫類
      element.classList.add("animate__animated", wowAnimation);

      // 處理延遲
      if (element.hasAttribute("data-delay")) {
        const delay = parseFloat(element.getAttribute("data-delay"));
        element.setAttribute("data-wow-delay", `${delay}s`);
      }

      // 根據元素類型設置不同的持續時間
      if (element.classList.contains("project-card")) {
        element.setAttribute("data-wow-duration", "0.8s");
      } else if (element.classList.contains("line")) {
        element.setAttribute("data-wow-duration", "1.2s");
      } else {
        element.setAttribute("data-wow-duration", "1s");
      }
    });

    console.log("已轉換現有動畫元素為 WOW.js 格式");
  },

  // 新增實用方法到全域實例
  addUtilityMethods() {
    if (window.wowInstance) {
      // 增加一個方法，用來手動處理元素動畫
      window.wowInstance.syncElement = function (element) {
        if (element && element.classList.contains("wow")) {
          this.show(element);
        }
      };

      // 增加一個方法，用來重置並重新同步所有動畫
      window.wowInstance.resetAndSync = function () {
        const elements = document.querySelectorAll(".wow");
        elements.forEach((el) => {
          el.style.visibility = "hidden";
          el.classList.remove("animated");
        });

        setTimeout(() => {
          this.sync();
        }, 50);
      };
    }
  },
};
