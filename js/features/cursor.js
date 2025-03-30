// ==============================================
// Custom Cursor - 更新版
// ==============================================
export const CustomCursor = {
  init() {
    // 檢查是否為移動設備
    if (window.innerWidth <= 768) return;

    this.cursor = document.querySelector("#cursor");
    if (!this.cursor) return;

    this.cursorCircle = this.cursor.querySelector(".cursor__circle");
    this.mouse = { x: -100, y: -100 };
    this.pos = { x: 0, y: 0 };
    this.speed = 0.2;

    window.addEventListener("mousemove", this.updateCoordinates.bind(this));
    this.initCursorModifiers();
    this.startAnimation();

    // Expose the CustomCursor globally so it can be accessed from other modules
    window.CustomCursor = this;
  },

  updateCoordinates(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  },

  getSqueeze(diffX, diffY) {
    const distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    const maxSqueeze = 0.5;
    const accelerator = 400;
    return Math.min(distance / accelerator, maxSqueeze);
  },

  updateCursor() {
    const diffX = Math.round(this.mouse.x - this.pos.x);
    const diffY = Math.round(this.mouse.y - this.pos.y);

    this.pos.x += diffX * this.speed;
    this.pos.y += diffY * this.speed;

    const squeeze = this.getSqueeze(diffX, diffY);
    const translate = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
    const scale = this.cursor.classList.contains("card-hover")
      ? `scale(${1 + squeeze * 0.5}, ${1 - squeeze * 0.5})`
      : `scale(${1 + squeeze}, ${1 - squeeze})`;

    this.cursor.style.transform = translate;
    this.cursorCircle.style.transform = scale;
  },

  initCursorModifiers() {
    // 保留以前的游標類別狀態
    const cursorState = {
      isClickable: this.cursor.classList.contains("clickable"),
      isCardHover: this.cursor.classList.contains("card-hover"),
    };

    // 重置游標狀態
    this.cursor.classList.remove("clickable", "card-hover");

    // 不使用清理舊事件的方法，以避免破壞語言切換功能

    // 卡片 hover 效果 - 同時支援 home-card 和 project-card
    document.querySelectorAll(".home-card [cursor-class], .project-card [cursor-class]").forEach((cursorModifier) => {
      // 檢查元素是否已經有事件監聽器標記
      if (!cursorModifier.hasAttribute("cursor-initialized")) {
        cursorModifier.setAttribute("cursor-initialized", "true");

        cursorModifier.addEventListener("mouseenter", () => {
          const className = cursorModifier.getAttribute("cursor-class");
          // 先移除所有可能的游標狀態
          this.cursor.classList.remove("clickable", "card-hover");
          this.cursor.classList.add(className);
        });

        cursorModifier.addEventListener("mouseleave", () => {
          const className = cursorModifier.getAttribute("cursor-class");
          this.cursor.classList.remove(className);
        });
      }
    });

    // 一般可點擊元素 - 不包括語言切換按鈕
    const clickableElements = document.querySelectorAll(
      'a:not([cursor-class]):not(.lang-toggle), button:not([cursor-class]):not(.lang-toggle), input[type="submit"]:not([cursor-class])'
    );

    clickableElements.forEach((element) => {
      // 檢查元素是否已經有事件監聽器標記
      if (!element.hasAttribute("cursor-initialized")) {
        element.setAttribute("cursor-initialized", "true");

        element.addEventListener("mouseenter", () => {
          if (!this.cursor.classList.contains("card-hover")) {
            this.cursor.classList.add("clickable");
          }
        });

        element.addEventListener("mouseleave", () => {
          this.cursor.classList.remove("clickable");
        });
      }
    });

    console.log("Cursor modifiers reinitialized");
  },

  startAnimation() {
    const animate = () => {
      this.updateCursor();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  },
};
