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
    document.querySelectorAll("[data-lang-key]").forEach((element) => {
      const key = element.dataset.langKey;
      if (translations[lang]?.[key]) {
        if (element.tagName.toLowerCase() === "span") {
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

    // 觸發語言變更事件，讓專案渲染器知道需要更新
    const languageChangedEvent = new CustomEvent("languageChanged", {
      detail: { language: lang },
    });
    document.dispatchEvent(languageChangedEvent);
  },
};
