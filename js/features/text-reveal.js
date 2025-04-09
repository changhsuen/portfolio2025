// 改進的 text-reveal.js 版本 - 支援響應式設計的中文逐行顯示
// 滾動觸發版本

export const TextRevealManager = {
  initialized: false,
  cardsAnimated: false,
  scrollTriggers: [], // 用於存儲所有 ScrollTrigger 實例

  init() {
    if (this.initialized) return;
    console.log("TextRevealManager 開始初始化");

    window.TextRevealManager = this;
    this.initialized = true;

    // 確保GSAP和ScrollTrigger已經載入
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.error("GSAP 或 ScrollTrigger 未正確載入，無法初始化滾動動畫");
      return;
    }

    // 頁面載入後執行
    if (document.readyState === "complete") {
      this.setupTextReveal();
    } else {
      window.addEventListener("load", () => this.setupTextReveal());
    }

    // 語言更換事件
    document.addEventListener("languageChanged", (e) => {
      console.log("語言變更，重新設置動畫");
      // 延遲執行，確保DOM已更新
      setTimeout(() => {
        // 清除舊的動畫結構和觸發器
        this.clearTextAnimations();
        // 然後重新設置
        this.setupTextReveal();
      }, 300);
    });

    // 監聽視窗大小變化
    window.addEventListener(
      "resize",
      this.debounce(() => {
        console.log("視窗大小變化，重新設置動畫");
        this.clearTextAnimations();
        this.setupTextReveal();
      }, 250)
    );
  },

  // 防抖函數，避免resize事件頻繁觸發
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 清除所有文字動畫相關結構和滾動觸發器
  clearTextAnimations() {
    // 清除滾動觸發器
    this.scrollTriggers.forEach((trigger) => {
      if (trigger) {
        trigger.kill();
      }
    });
    this.scrollTriggers = [];

    const elements = document.querySelectorAll(".reveal-text");
    elements.forEach((element) => {
      // 獲取原始文字
      const key = element.dataset.langKey;
      const lang = document.documentElement.getAttribute("lang") || "en";
      const originalText = window.translations?.[lang]?.[key] || element.textContent;

      // 重置元素內容
      element.innerHTML = originalText;

      // 重置可見性，但保持隱藏狀態以便滾動觸發
      element.style.visibility = "hidden";
      element.style.opacity = "0";
    });
  },

  setupTextReveal() {
    // 獲取當前語言
    const currentLang = document.documentElement.getAttribute("lang") || "en";
    const isChinese = currentLang === "zh-TW";

    // 處理文字分割 - 中英文使用不同邏輯
    this.processElements(isChinese);

    // 應用滾動觸發動畫
    this.applyScrollAnimations();
  },

  // 根據螢幕寬度獲取每行字符數
  getCharsPerLine() {
    const windowWidth = window.innerWidth;

    // 響應式調整每行字符數
    if (windowWidth <= 480) {
      return 14; // 手機豎屏
    } else if (windowWidth <= 768) {
      return 14; // 平板或手機橫屏
    } else if (windowWidth <= 1024) {
      return 18; // 小型桌面螢幕
    } else {
      return 21; // 大型桌面螢幕
    }
  },

  // 處理頁面元素
  processElements(isChinese) {
    const elements = document.querySelectorAll(".reveal-text");

    elements.forEach((element) => {
      // 保存原始文字
      const originalText = element.textContent;
      element.dataset.splitText = originalText;

      // 根據語言選擇不同的處理方式
      if (isChinese) {
        this.processChineseText(element, originalText);
      } else {
        this.processEnglishText(element, originalText);
      }
    });
  },

  // 處理中文文字 - 根據螢幕寬度動態調整每行字符數
  processChineseText(element, text) {
    // 清除現有內容
    element.innerHTML = "";

    // 獲取適合當前螢幕的字符數
    const maxCharsPerLine = this.getCharsPerLine();
    console.log(`當前每行字符數: ${maxCharsPerLine}`);

    // 分割文本為適當長度的行
    const lines = [];
    for (let i = 0; i < text.length; i += maxCharsPerLine) {
      // 切出一段文字作為一行
      const line = text.substr(i, maxCharsPerLine);
      lines.push(line);
    }

    // 為每一行創建DOM結構
    lines.forEach((line) => {
      const lineElement = document.createElement("span");
      lineElement.className = "line";

      const wordsElement = document.createElement("span");
      wordsElement.className = "words";

      // 將每個字符包裝為一個單詞
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const wordElement = document.createElement("span");
        wordElement.className = "word";
        wordElement.textContent = char;
        wordsElement.appendChild(wordElement);
      }

      lineElement.appendChild(wordsElement);
      element.appendChild(lineElement);
    });

    // 添加設備類型標記，方便CSS定位
    const deviceType = this.getDeviceType();
    element.setAttribute("data-device", deviceType);

    // 設置初始隱藏狀態，等待滾動觸發
    gsap.set(element, { autoAlpha: 0 });
  },

  // 獲取當前設備類型
  getDeviceType() {
    const windowWidth = window.innerWidth;

    if (windowWidth <= 480) {
      return "mobile";
    } else if (windowWidth <= 768) {
      return "tablet";
    } else {
      return "desktop";
    }
  },

  // 處理英文文字 - 按空格分割為單詞，然後分行
  processEnglishText(element, text) {
    // 分割為單詞
    const words = text.split(/\s+/);
    const processedWords = words.map((word) => {
      return word
        .split("-")
        .map((part) => `<span class="word">${part}</span>`)
        .join('<span class="hyphen">-</span>');
    });

    // 臨時設置，用於計算行分配
    element.innerHTML = processedWords.join('<span class="whitespace"> </span>');

    // 計算行分配
    const lineElements = [];
    let currentLine = [];
    let lastTop = null;

    element.querySelectorAll(".word, .whitespace, .hyphen").forEach((wordElem) => {
      const top = wordElem.offsetTop;

      if (lastTop !== null && top !== lastTop) {
        // 新的一行
        if (currentLine.length > 0) {
          lineElements.push(currentLine);
          currentLine = [];
        }
      }

      currentLine.push(wordElem.outerHTML);
      lastTop = top;
    });

    // 添加最後一行
    if (currentLine.length > 0) {
      lineElements.push(currentLine);
    }

    // 重建HTML
    element.innerHTML = lineElements
      .map((line) => {
        return `<span class="line"><span class="words">${line.join("")}</span></span>`;
      })
      .join("");

    // 添加設備類型標記
    const deviceType = this.getDeviceType();
    element.setAttribute("data-device", deviceType);

    // 設置初始隱藏狀態，等待滾動觸發
    gsap.set(element, { autoAlpha: 0 });
  },

  // 應用滾動觸發動畫
  applyScrollAnimations() {
    const revealElements = document.querySelectorAll(".reveal-text");

    // 確保 GSAP 和 ScrollTrigger 已正確載入
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.error("GSAP 或 ScrollTrigger 未正確載入");
      // 如果未載入，至少確保文字可見
      revealElements.forEach((element) => {
        element.style.visibility = "visible";
        element.style.opacity = "1";
      });
      return;
    }

    // 為每個元素應用滾動觸發動畫
    revealElements.forEach((element) => {
      const lines = element.querySelectorAll(".words");

      if (lines.length > 0) {
        // 創建時間線
        const tl = gsap.timeline({
          paused: true,
          defaults: { duration: 1, ease: "power3.out" },
        });

        // 首先顯示元素本身
        tl.to(element, { autoAlpha: 1, duration: 0.5 });

        // 然後逐行顯示
        tl.from(
          lines,
          {
            yPercent: 100,
            stagger: 0.1,
          },
          "-=0.3"
        ); // 稍微提前開始行動畫

        // 創建 ScrollTrigger
        const trigger = ScrollTrigger.create({
          trigger: element,
          start: "top 80%", // 當元素頂部到達視窗 80% 位置時觸發
          // 可以根據需要調整這個值，例如 "top 75%" 或 "top bottom-=100"
          onEnter: () => {
            tl.play();
          },
          once: true, // 只觸發一次
        });

        // 保存觸發器引用以便後續清理
        this.scrollTriggers.push(trigger);
      } else {
        // 如果沒有行元素，使用簡單的滾動顯示
        const trigger = ScrollTrigger.create({
          trigger: element,
          start: "top 80%",
          onEnter: () => {
            gsap.to(element, { autoAlpha: 1, duration: 0.5 });
          },
          once: true,
        });

        this.scrollTriggers.push(trigger);
      }
    });
  },
};
