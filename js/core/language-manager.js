// 修改 language-manager.js 文件中的 updateContent 方法

import { translations } from "./constants.js";

// ==============================================
// Language Management
// ==============================================
export const LanguageManager = {
  init() {
    const langToggles = document.querySelectorAll(".lang-toggle");

    langToggles.forEach((toggle) => {
      toggle.addEventListener("click", this.handleLanguageToggle.bind(this));
    });

    // 初始化時更新內容
    const savedLang = localStorage.getItem("lang") || "en";
    this.updateContent(savedLang);
  },

  handleLanguageToggle(e) {
    const toggle = e.currentTarget;
    const currentLang = toggle.dataset.currentLang;
    const newLang = currentLang === "en" ? "zh-TW" : "en";

    document.querySelectorAll(".lang-toggle").forEach((btn) => {
      btn.dataset.currentLang = newLang;
      btn.textContent = newLang === "en" ? "中" : "EN";
    });

    document.documentElement.setAttribute("lang", newLang);
    this.updateContent(newLang);
    localStorage.setItem("lang", newLang);
  },

  updateContent(lang) {
    // 更新所有具有 data-lang-key 屬性的元素
    document.querySelectorAll("[data-lang-key]").forEach((element) => {
      const key = element.dataset.langKey;
      if (translations[lang]?.[key]) {
        // 檢查是否為 reveal-text 元素，需要特殊處理
        if (element.classList.contains("reveal-text")) {
          // 儲存原始文字內容，這樣 text-reveal.js 可以重新處理
          element.dataset.splitText = translations[lang][key];
          // 直接設置內容為新語言文字，不保留任何結構
          element.textContent = translations[lang][key];
        } else if (element.tagName.toLowerCase() === "span") {
          element.textContent = translations[lang][key];
        } else {
          const span = element.querySelector("span");
          if (span) {
            span.textContent = translations[lang][key];
          } else {
            element.textContent = translations[lang][key];
          }
        }
      }
    });

    // 嘗試修復重複內容的問題
    // 檢查頁面中是否有重複的內容片段
    const introElement = document.querySelector('[data-lang-key="intro"]');
    if (introElement) {
      const text = translations[lang].intro;
      // 確保沒有重複顯示
      if (
        introElement.textContent.includes(text + text) ||
        (introElement.textContent.includes("digital experiences in Taiwan since 2021") &&
          introElement.textContent.length > text.length * 1.5)
      ) {
        // 強制重置為正確的文字
        introElement.textContent = text;
      }
    }

    // 觸發語言變更事件，讓其他模塊知道需要更新
    const languageChangedEvent = new CustomEvent("languageChanged", {
      detail: { language: lang },
    });
    document.dispatchEvent(languageChangedEvent);
  },
};
