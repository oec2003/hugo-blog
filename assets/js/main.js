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
})();

