// 專案資料模組 - 存放所有專案卡片的資訊
// 每個專案都有 id, title, description, image, link, tags 等屬性
// 注意: 確保 tags 與 constants.js 中的翻譯字串一致

export const projectsData = {
  // 中文資料
  "zh-TW": {
    project1: {
      title: "網頁設計系統",
      description: "為企業建立一套完整的設計系統，確保品牌視覺一致性與開發效率",
      image: "./assets/img/project1-cover.jpg",
      link: "projects/project1.html",
      tags: ["介面設計", "設計系統"],
      showOnHomepage: true,
    },
    cnywb: {
      title: "Chinese New Year without Borders",
      description: "第5屆臺灣創意之星設計獎 楊裕隆評審獎",
      image: "./projects/img/cnywb-cover.gif",
      link: "projects/cnywb.html",
      tags: ["平面設計", "動態圖像"],
      showOnHomepage: true,
    },
    project3: {
      title: "企業品牌識別",
      description: "為新創公司開發品牌識別，包括標誌、色彩系統及各種應用場景",
      image: "./assets/img/project3-cover.jpg",
      link: "projects/project3.html",
      tags: ["品牌識別", "圖標設計"],
      showOnHomepage: true,
    },
    project4: {
      title: "SaaS 平台重設計",
      description: "重新設計企業SaaS平台，提升使用者體驗和工作效率",
      image: "./assets/img/project4-cover.jpg",
      link: "projects/project4.html",
      tags: ["介面設計", "SaaS", "使用者研究"],
      showOnHomepage: true,
    },
    fishEssence: {
      title: "甲芝魚精",
      description: "魚精包裝設計",
      image: "./projects/img/甲芝魚精盒.jpg",
      link: "projects/project5.html",
      tags: ["介面設計", "使用者研究", "原型設計"],
      showOnHomepage: false,
    },
    project6: {
      title: "電子商務網站",
      description: "設計直覺且轉換率高的電商購物體驗，優化從瀏覽到結帳的流程",
      image: "./projects/img",
      link: "projects/project5.html",
      tags: ["介面設計", "使用者研究", "原型設計"],
      showOnHomepage: false,
    },
  },

  // 英文資料
  en: {
    project1: {
      title: "Web Design System",
      description: "Developed a comprehensive design system for enterprise, ensuring brand consistency and development efficiency",
      image: "./assets/img/project1-cover.jpg",
      link: "projects/project1.html",
      tags: ["UI Design", "Design System"],
      showOnHomepage: true,
    },
    cnywb: {
      title: "Chinese New Year without Borders",
      description: "The 5th Taiwan Creative Star Design Award - Yang Yu-Long Jury Award",
      image: "./projects/img/cnywb-cover.gif",
      link: "projects/cnywb.html",
      tags: ["Graphic Design", "Motion Graphic"],
      showOnHomepage: true,
    },
    project3: {
      title: "Corporate Brand Identity",
      description: "Developed brand identity for a startup, including logo, color system, and various applications",
      image: "./assets/img/project3-cover.jpg",
      link: "projects/project3.html",
      tags: ["Brand Identity", "Iconography"],
      showOnHomepage: true,
    },
    project4: {
      title: "SaaS Platform Redesign",
      description: "Redesigned an enterprise SaaS platform to enhance user experience and workflow efficiency",
      image: "./assets/img/project4-cover.jpg",
      link: "projects/project4.html",
      tags: ["UI Design", "SaaS", "UX Research"],
      showOnHomepage: true,
    },
    fishEssence: {
      title: "Jiazhi fish essence",
      description: "Designed an intuitive and high-converting shopping experience, optimizing the browse-to-checkout flow",
      image: "./projects/img/甲芝魚精盒.jpg",
      link: "projects/project5.html",
      tags: ["UI Design", "UX Research", "Prototyping"],
      showOnHomepage: false,
    },
    project6: {
      title: "E-commerce Website",
      description: "Designed an intuitive and high-converting shopping experience, optimizing the browse-to-checkout flow",
      image: "./assets/img/project5-cover.jpg",
      link: "projects/project5.html",
      tags: ["UI Design", "UX Research", "Prototyping"],
      showOnHomepage: false,
    },
  },
};
