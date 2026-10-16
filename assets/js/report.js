(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const sidebar = $("#sidebar");
  const menuToggle = $("#menu-toggle");
  const backdrop = $("#drawer-backdrop");

  const setOpen = (open) => {
    if (!sidebar || !menuToggle || !backdrop) return;
    sidebar.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    backdrop.hidden = !open;
    if (!document.body.classList.contains("lightbox-open")) {
      document.body.style.overflow = open ? "hidden" : "";
    }
  };

  menuToggle?.addEventListener("click", () => setOpen(!sidebar.classList.contains("is-open")));
  backdrop?.addEventListener("click", () => setOpen(false));

  $$('.sidebar__nav a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  const navLinks = $$('.sidebar__nav a[href^="#"]');
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const sync = (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = `#${visible.target.id}`;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === id));
  };

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(sync, { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] });
    sections.forEach((section) => observer.observe(section));
  } else if (navLinks[0]) {
    navLinks[0].classList.add("is-active");
  }

  const shotLinks = $$(".shot-frame a[href]");
  if (!shotLinks.length) return;

  const urls = shotLinks.map((a) => a.getAttribute("href"));
  let index = 0;

  const root = document.createElement("div");
  root.className = "lightbox";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Просмотр скриншота");
  root.hidden = true;
  root.innerHTML = `
    <button type="button" class="lightbox__close" aria-label="Закрыть">
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>
    <button type="button" class="lightbox__nav lightbox__prev" aria-label="Предыдущий">
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
    </button>
    <img class="lightbox__img" alt="">
    <button type="button" class="lightbox__nav lightbox__next" aria-label="Следующий">
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </button>
  `;
  document.body.appendChild(root);

  const img = $(".lightbox__img", root);
  const btnClose = $(".lightbox__close", root);
  const btnPrev = $(".lightbox__prev", root);
  const btnNext = $(".lightbox__next", root);

  const show = (i) => {
    index = (i + urls.length) % urls.length;
    img.src = urls[index];
  };

  const open = (i) => {
    show(i);
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add("is-open"));
    document.body.classList.add("lightbox-open");
    document.body.style.overflow = "hidden";
    btnClose.focus();
  };

  const close = () => {
    root.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    if (!sidebar?.classList.contains("is-open")) {
      document.body.style.overflow = "";
    }
    window.setTimeout(() => {
      if (!root.classList.contains("is-open")) {
        root.hidden = true;
        img.removeAttribute("src");
      }
    }, 180);
  };

  shotLinks.forEach((link, i) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      open(i);
    });
  });

  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => show(index - 1));
  btnNext.addEventListener("click", () => show(index + 1));

  root.addEventListener("click", (e) => {
    if (e.target === root) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!root.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
})();
