// 修改後的 transformNavLinks 函數 - 調整動畫區域
export function transformNavLinks() {
  // 找到所有導航連結
  const navLinks = document.querySelectorAll(".nav-link");

  console.log(`找到 ${navLinks.length} 個導航連結`);

  navLinks.forEach((link) => {
    // 檢查連結是否已經轉換過
    if (link.querySelector(".text-container")) {
      console.log("發現已轉換的連結，跳過");
      return; // 已經轉換過，跳過
    }

    // 保存原始屬性和內容
    const originalText = link.textContent.trim();
    const originalHTML = link.innerHTML;
    const isActive = link.classList.contains("active");
    const hasDataLangKey = link.hasAttribute("data-lang-key");
    const dataLangKey = hasDataLangKey ? link.getAttribute("data-lang-key") : null;

    // 儲存原始寬度
    const originalWidth = link.offsetWidth;

    // 創建新的 HTML 結構 - 添加文字容器
    const newHTML = `
          <div class="text-container">
              <span class="hidden">${originalText}</span>
              <span class="visible">${originalText}</span>
          </div>
      `;

    // 替換原始內容
    link.innerHTML = newHTML;

    // 設置最小寬度，確保佈局穩定
    link.style.minWidth = originalWidth + "px";

    // 保留原始屬性
    if (hasDataLangKey) {
      // 將 data-lang-key 屬性應用到容器
      const textContainer = link.querySelector(".text-container");
      if (textContainer) {
        textContainer.setAttribute("data-lang-key", dataLangKey);
      }

      // 同時也應用到兩個 span 元素
      const hiddenSpan = link.querySelector(".hidden");
      const visibleSpan = link.querySelector(".visible");

      if (hiddenSpan && visibleSpan) {
        hiddenSpan.setAttribute("data-lang-key", dataLangKey);
        visibleSpan.setAttribute("data-lang-key", dataLangKey);
      }
    }

    // 保留激活狀態
    if (isActive) {
      link.classList.add("active");
    }

    // 為每個字母添加單獨的 span
    wrapLettersInSpan(link.querySelector(".hidden"));
    wrapLettersInSpan(link.querySelector(".visible"));

    // 設置隱藏文字的初始狀態 - 初始時在上方
    gsap.set(link.querySelectorAll(".hidden span"), {
      yPercent: -100,
    });

    // 添加鼠標懸停事件
    link.addEventListener("mouseover", (e) => {
      if (!gsap.isTweening(link.querySelectorAll(".visible span")) && link.classList.contains("hovered")) {
        link.classList.remove("hovered");
      }

      if (e.target.classList.contains("letter")) {
        // 如果懸停在字母上
        // 標記連結為懸停狀態
        link.classList.add("hovered");

        // 獲取懸停字母的索引
        const indexHover = getChildIndex(e.target);

        // 可見文字向下移動
        gsap.to(link.querySelectorAll(".visible span"), {
          yPercent: 100, // 向下移動
          ease: "back.out(1.5)",
          duration: 0.5,
          stagger: {
            each: 0.023,
            from: indexHover,
          },
        });

        // 隱藏文字從上方移入
        gsap.to(link.querySelectorAll(".hidden span"), {
          yPercent: 0, // 移動到原位
          ease: "back.out(1.5)",
          duration: 0.5,
          stagger: {
            each: 0.023,
            from: indexHover,
          },
          onComplete: () => {
            // 動畫完成後重置
            gsap.set(link.querySelectorAll(".visible span"), { clearProps: "all" });
            gsap.set(link.querySelectorAll(".hidden span"), {
              yPercent: -100, // 重置到初始位置
            });
            link.classList.remove("hovered");
          },
        });
      }
    });

    console.log("成功轉換連結:", originalText);
  });
}

// 工具函數：將文本中的每個字母包裝在 span 中
function wrapLettersInSpan(element) {
  if (!element) return;

  const text = element.textContent;
  element.innerHTML = text
    .split("")
    .map((char) => (char === " " ? "<span>&nbsp;</span>" : `<span class="letter">${char}</span>`))
    .join("");
}

// 工具函數：獲取子元素在父元素中的索引
function getChildIndex(child) {
  return Array.from(child.parentNode.children).indexOf(child);
}

// 處理動態添加的導航連結
export function observeNavChanges() {
  // 與之前相同
  const observer = new MutationObserver((mutations) => {
    let needsUpdate = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasNavLinks = addedNodes.some((node) => node.nodeType === 1 && (node.classList?.contains("nav-link") || node.querySelector?.(".nav-link")));

        if (hasNavLinks) {
          needsUpdate = true;
        }
      }
    });

    if (needsUpdate) {
      console.log("檢測到 DOM 變化，更新導航連結");
      setTimeout(() => {
        transformNavLinks();
      }, 50);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("已設置 DOM 變化監聽器");

  return observer;
}
