(() => {
  const dialog = document.querySelector(".search-dialog");
  const input = document.querySelector("#site-search");
  const results = document.querySelector(".search-results");
  const hint = document.querySelector(".search-hint");
  let indexPromise;

  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char]);

  function openSearch() {
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => input.focus(), 20);
    indexPromise ||= fetch("/index.json").then((response) => response.json());
  }

  function closeSearch() {
    dialog.hidden = true;
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".search-trigger").forEach((button) => button.addEventListener("click", openSearch));
  document.querySelector(".search-close")?.addEventListener("click", closeSearch);
  dialog?.addEventListener("click", (event) => { if (event.target === dialog) closeSearch(); });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      openSearch();
      return;
    }
    if (event.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape" && !dialog.hidden) closeSearch();
  });

  input?.addEventListener("input", async () => {
    const query = input.value.trim().toLocaleLowerCase();
    results.innerHTML = "";
    hint.hidden = Boolean(query);
    if (!query) return;
    const posts = await indexPromise;
    const matches = posts.filter((post) => [post.title, post.summary, ...(post.tags || []), ...(post.categories || [])]
      .join(" ").toLocaleLowerCase().includes(query)).slice(0, 18);
    if (!matches.length) {
      results.innerHTML = '<div class="search-hint">没有找到匹配的文章</div>';
      return;
    }
    results.innerHTML = matches.map((post) => `
      <a class="search-result" href="${escapeHTML(post.url)}">
        <time>${escapeHTML(post.date)}</time>
        <strong>${escapeHTML(post.title)}</strong>
        <p>${escapeHTML(post.summary)}</p>
      </a>`).join("");
  });

  document.querySelectorAll(".comments-card[data-comments-repo]").forEach((section) => {
    const button = section.querySelector(".comments-load");
    const placeholder = section.querySelector(".comments-placeholder");
    const status = section.querySelector(".comments-status");
    const host = section.querySelector(".comments-host");

    button?.addEventListener("click", () => {
      if (host?.querySelector("script, iframe")) return;

      button.disabled = true;
      button.textContent = "加载中…";
      status.textContent = "正在连接评论服务";

      const script = document.createElement("script");
      script.src = "https://beaudar.lipk.org/client.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.setAttribute("repo", section.dataset.commentsRepo);
      script.setAttribute("issue-term", "pathname");
      script.setAttribute("theme", section.dataset.commentsTheme || "github-light");
      script.addEventListener("load", () => {
        placeholder.hidden = true;
      }, { once: true });
      script.addEventListener("error", () => {
        script.remove();
        button.disabled = false;
        button.textContent = "重新加载评论";
        status.textContent = "评论服务暂时无法连接";
      }, { once: true });
      host?.append(script);
    });
  });

  const lightbox = document.querySelector(".image-lightbox");
  const articleImages = [...document.querySelectorAll(".h-entry .article-content img")];

  if (lightbox && articleImages.length) {
    // Keep the modal outside transformed series layouts so position: fixed
    // always uses the viewport as its containing block.
    document.body.append(lightbox);
    const preview = lightbox.querySelector(".image-lightbox-image");
    const caption = lightbox.querySelector(".image-lightbox-caption");
    const counter = lightbox.querySelector(".image-lightbox-count");
    const closeButton = lightbox.querySelector(".image-lightbox-close");
    const previousButton = lightbox.querySelector(".image-lightbox-prev");
    const nextButton = lightbox.querySelector(".image-lightbox-next");
    const imageURLPattern = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:$|[?#])/i;
    let currentIndex = 0;
    let lastFocused;
    let pointerStartX;

    const items = articleImages.map((image, index) => {
      const link = image.closest("a");
      const trigger = link || image;
      const figureCaption = image.closest("figure")?.querySelector("figcaption")?.textContent.trim();

      image.dataset.lightboxIndex = index;
      image.classList.add("image-lightbox-trigger-image");
      trigger.classList.add("image-lightbox-trigger");
      trigger.setAttribute("aria-label", `放大图片：${image.alt || `第 ${index + 1} 张图片`}`);
      if (!link) {
        trigger.tabIndex = 0;
        trigger.setAttribute("role", "button");
      }

      return {
        image,
        trigger,
        caption: figureCaption || image.title || image.alt || "",
        source: () => link && imageURLPattern.test(link.href)
          ? link.href
          : image.currentSrc || image.src,
      };
    });

    const showImage = (index) => {
      currentIndex = (index + items.length) % items.length;
      const item = items[currentIndex];
      preview.src = item.source();
      preview.alt = item.image.alt || `第 ${currentIndex + 1} 张图片`;
      caption.textContent = item.caption;
      caption.hidden = !item.caption;
      counter.textContent = `${currentIndex + 1} / ${items.length}`;
    };

    const openLightbox = (index) => {
      lastFocused = document.activeElement;
      showImage(index);
      lightbox.hidden = false;
      document.body.classList.add("image-lightbox-open");
      closeButton.focus();
    };

    const closeLightbox = () => {
      lightbox.hidden = true;
      document.body.classList.remove("image-lightbox-open");
      preview.removeAttribute("src");
      lastFocused?.focus?.();
    };

    const showPrevious = () => showImage(currentIndex - 1);
    const showNext = () => showImage(currentIndex + 1);

    items.forEach((item, index) => {
      item.trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openLightbox(index);
      });
      item.trigger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    const hasMultipleImages = items.length > 1;
    previousButton.hidden = !hasMultipleImages;
    nextButton.hidden = !hasMultipleImages;
    counter.hidden = !hasMultipleImages;

    closeButton.addEventListener("click", closeLightbox);
    previousButton.addEventListener("click", showPrevious);
    nextButton.addEventListener("click", showNext);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("pointerdown", (event) => {
      pointerStartX = event.clientX;
    });
    lightbox.addEventListener("pointerup", (event) => {
      if (!hasMultipleImages || pointerStartX === undefined) return;
      const distance = event.clientX - pointerStartX;
      pointerStartX = undefined;
      if (Math.abs(distance) < 60) return;
      if (distance > 0) showPrevious();
      else showNext();
    });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (hasMultipleImages && event.key === "ArrowLeft") showPrevious();
      if (hasMultipleImages && event.key === "ArrowRight") showNext();
      if (event.key === "Tab") {
        const controls = [closeButton, previousButton, nextButton].filter((button) => !button.hidden);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  const backToTop = document.querySelector(".back-to-top");
  const updateBackToTop = () => backToTop?.classList.toggle("visible", window.scrollY > 500);
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  document.querySelectorAll(".article-content a[href^='http']").forEach((link) => {
    if (link.hostname !== location.hostname) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });

  const seriesSidebar = document.querySelector(".series-sidebar");
  const seriesReaderActive = document.documentElement.classList.contains("series-reader-requested");
  if (seriesSidebar && seriesReaderActive) {
    const compactSeriesLayout = window.matchMedia("(max-width: 1199px)");
    const seriesScrollKey = `series-scroll:${seriesSidebar.dataset.seriesKey || "default"}`;
    const readSeriesScroll = () => {
      try {
        return Number.parseInt(sessionStorage.getItem(seriesScrollKey) || "0", 10);
      } catch {
        return 0;
      }
    };
    const saveSeriesScroll = () => {
      if (compactSeriesLayout.matches) return;
      try {
        sessionStorage.setItem(seriesScrollKey, String(seriesSidebar.scrollTop));
      } catch {
        // Storage may be unavailable in strict privacy modes; navigation still works normally.
      }
    };
    const syncSeriesSidebar = ({ matches }) => {
      seriesSidebar.open = !matches;
      if (!matches) window.requestAnimationFrame(() => { seriesSidebar.scrollTop = readSeriesScroll(); });
    };
    syncSeriesSidebar(compactSeriesLayout);
    compactSeriesLayout.addEventListener("change", syncSeriesSidebar);
    seriesSidebar.addEventListener("scroll", saveSeriesScroll, { passive: true });
    seriesSidebar.querySelectorAll("a[href]").forEach((link) => link.addEventListener("click", saveSeriesScroll));
    window.addEventListener("pagehide", saveSeriesScroll);
  }

  const tocLinks = seriesReaderActive
    ? [...document.querySelectorAll(".series-capable .toc-card a[href^='#']")]
    : [];
  if (tocLinks.length) {
    const headings = tocLinks.map((link) => {
      const id = decodeURIComponent(link.hash.slice(1));
      return { link, heading: document.getElementById(id) };
    }).filter(({ heading }) => heading);

    const setActiveTocLink = (activeLink) => {
      tocLinks.forEach((link) => {
        const active = link === activeLink;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    if (headings.length) {
      let tocUpdatePending = false;
      const updateActiveTocLink = () => {
        const current = headings.reduce((selected, item) => (
          item.heading.getBoundingClientRect().top <= 140 ? item : selected
        ), headings[0]);
        setActiveTocLink(current.link);
        tocUpdatePending = false;
      };
      const requestTocUpdate = () => {
        if (tocUpdatePending) return;
        tocUpdatePending = true;
        window.requestAnimationFrame(updateActiveTocLink);
      };
      updateActiveTocLink();
      window.addEventListener("scroll", requestTocUpdate, { passive: true });
      headings.forEach(({ link }) => link.addEventListener("click", () => setActiveTocLink(link)));
    }
  }
})();
