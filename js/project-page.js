// ==============================================
// 專案頁面管理器 - 簡化版
// 只保留多語言功能
// ==============================================
export const ProjectPageManager = {
  init() {
    console.log("專案頁面管理器初始化");

    // 只初始化內嵌多語言支援
    this.setupInlineMultilingual();

    // 如果使用 WOW.js，確保動畫正確初始化
    if (window.wowInstance) {
      setTimeout(() => {
        window.wowInstance.sync();
      }, 100);
    }
  },

  // 設置內嵌多語言支援
  setupInlineMultilingual() {
    // 監聽語言變化
    document.addEventListener("languageChanged", (e) => {
      const lang = e.detail.language;
      this.updateInlineContent(lang);
    });

    // 初始化時設置正確的語言
    const currentLang = document.documentElement.getAttribute("lang") || "en";
    this.updateInlineContent(currentLang);
  },

  // 更新內嵌多語言內容
  updateInlineContent(lang) {
    console.log(`更新內嵌多語言內容為: ${lang}`);

    // 選擇所有帶有 data-content-en 或 data-content-zh 屬性的元素
    const contentKey = lang === "zh-TW" ? "data-content-zh" : "data-content-en";
    const elements = document.querySelectorAll(`[${contentKey}]`);

    elements.forEach((element) => {
      if (element.hasAttribute(contentKey)) {
        element.textContent = element.getAttribute(contentKey);
      }
    });

    // 更新頁面標題
    this.updatePageTitle(lang);
  },

  // 根據語言更新頁面標題
  updatePageTitle(language) {
    const title = document.querySelector("title");
    const projectTitle = document.querySelector(".project-title");

    if (title && projectTitle) {
      if (language === "zh-TW" && projectTitle.hasAttribute("data-content-zh")) {
        title.textContent = `${projectTitle.getAttribute("data-content-zh")} - Milli Chang`;
      } else if (projectTitle.hasAttribute("data-content-en")) {
        title.textContent = `${projectTitle.getAttribute("data-content-en")} - Milli Chang`;
      } else {
        title.textContent = `${projectTitle.textContent} - Milli Chang`;
      }
    }
  },
};
