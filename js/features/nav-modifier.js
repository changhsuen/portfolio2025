// 修復重疊問題的 nav-modifier.js
export function transformNavLinks() {
  // 找到所有導航連結
  const navLinks = document.querySelectorAll(".nav-link");

  console.log(`找到 ${navLinks.length} 個導航連結`);

  navLinks.forEach((link) => {
    // 檢查連結是否已經轉換過
    if (link.querySelector(".nav-link-cube")) {
      console.log("發現已轉換的連結，跳過");
      return; // 已經轉換過，跳過
    }

    // 保存原始內容和屬性
    const originalText = link.textContent.trim();
    const originalHTML = link.innerHTML;
    const isActive = link.classList.contains("active");
    const hasDataLangKey = link.hasAttribute("data-lang-key");
    const dataLangKey = hasDataLangKey ? link.getAttribute("data-lang-key") : null;

    // 關鍵改變：儲存原始文字到 data-text 屬性，用於保持布局尺寸
    link.setAttribute("data-text", originalText);

    // 創建 3D 結構但保持原始內容可見
    const cubeHTML = `<div class="nav-link-cube">
      <div class="nav-link-face nav-link-front">${originalHTML}</div>
      <div class="nav-link-face nav-link-top">${originalHTML}</div>
    </div>`;

    // 添加 3D 結構而不是替換原內容
    link.innerHTML = cubeHTML;

    // 保留原始屬性
    if (hasDataLangKey) {
      const frontFace = link.querySelector(".nav-link-front [data-lang-key]");
      const topFace = link.querySelector(".nav-link-top [data-lang-key]");

      if (frontFace) frontFace.setAttribute("data-lang-key", dataLangKey);
      if (topFace) topFace.setAttribute("data-lang-key", dataLangKey);
    }

    // 保留激活狀態
    if (isActive) {
      link.classList.add("active");
    }

    console.log("成功轉換連結:", originalText);
  });
}

// 處理動態添加的導航連結
export function observeNavChanges() {
  // 使用 MutationObserver 來監控 DOM 變化
  const observer = new MutationObserver((mutations) => {
    let needsUpdate = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        // 檢查是否添加了新的導航連結
        const addedNodes = Array.from(mutation.addedNodes);
        const hasNavLinks = addedNodes.some((node) => node.nodeType === 1 && (node.classList?.contains("nav-link") || node.querySelector?.(".nav-link")));

        if (hasNavLinks) {
          needsUpdate = true;
        }
      }
    });

    if (needsUpdate) {
      console.log("檢測到 DOM 變化，更新導航連結");
      // 延遲一點執行，確保 DOM 已經完全更新
      setTimeout(() => {
        transformNavLinks();
      }, 50);
    }
  });

  // 監控整個 body 的變化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("已設置 DOM 變化監聽器");

  return observer;
}
