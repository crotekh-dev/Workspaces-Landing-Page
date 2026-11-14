(() => {
  const root = document.documentElement, $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEY = "wl-theme";
  const saved = localStorage.getItem(KEY);
  root.dataset.theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  $("#yr").textContent = new Date().getFullYear();

  const tools = [["notes", "Notes"], ["todo", "Todo"], ["stopwatch", "Stopwatch"], ["calendar", "Calendar"], ["calculator", "Calculator"], ["links", "Links"]];
  const shots = $("#shots"), dots = $("#dots"), cap = $("#cap");
  let i = 0, timer;
  const imgs = tools.map(([k, name], n) => {
    const img = new Image(); img.alt = `${name} screenshot`; img.decoding = "async"; shots.append(img);
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", `Show ${name}`);
    b.onclick = () => { show(n); restart(); }; dots.append(b); return img;
  });
  const tourShots = $("#tourShots");
  const tourImgs = tools.map(([k, name]) => { const im = new Image(); im.alt = `${name} screenshot`; im.decoding = "async"; tourShots.append(im); return im; });
  const setSrc = () => [imgs, tourImgs].forEach((set) => set.forEach((img, n) => (img.src = `assets/shot-${tools[n][0]}-${root.dataset.theme}.png`)));
  const show = (n) => {
    i = n; imgs.forEach((im, k) => im.classList.toggle("on", k === n));
    [...dots.children].forEach((d, k) => d.classList.toggle("on", k === n)); cap.textContent = tools[n][1];
  };
  const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show((i + 1) % tools.length), 3500); };
  setSrc(); show(0); restart();
  const frame = $("#frame");
  frame.addEventListener("pointerenter", () => clearInterval(timer));
  frame.addEventListener("pointerleave", restart);
  if (!reduce && matchMedia("(hover:hover)").matches) {
    frame.addEventListener("pointermove", (e) => {
      const r = frame.getBoundingClientRect();
      frame.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 6 + "deg");
      frame.style.setProperty("--rx", (.5 - (e.clientY - r.top) / r.height) * 5 + "deg");
    });
    frame.addEventListener("pointerleave", () => { frame.style.setProperty("--rx", "0deg"); frame.style.setProperty("--ry", "0deg"); });
  }

  $("#theme").onclick = () => {
    const t = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = t; localStorage.setItem(KEY, t); setSrc();
  };

  const bill = $("#bill");
  bill.onclick = () => {
    const y = bill.getAttribute("aria-checked") !== "true";
    bill.setAttribute("aria-checked", y);
    document.querySelectorAll("[data-m]").forEach((el) => (el.textContent = y ? el.dataset.y : el.dataset.m));
  };

  const steps = [...document.querySelectorAll(".steps li")];
  const pick = (n) => { steps.forEach((s, k) => s.classList.toggle("on", k === n)); tourImgs.forEach((im, k) => im.classList.toggle("on", k === n)); };
  pick(0);
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) pick(steps.indexOf(e.target)); }), { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => so.observe(s));
  }

  const prog = $("#prog");
  addEventListener("scroll", () => { const m = root.scrollHeight - innerHeight; prog.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`; }, { passive: true });

  document.querySelectorAll(".card,.plan,.road li").forEach((el) => el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(); el.style.setProperty("--mx", e.clientX - r.left + "px"); el.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  const count = (el) => {
    const to = +el.dataset.n, s = el.dataset.s || "";
    if (reduce || !to) { el.textContent = to + s; return; }
    const t0 = performance.now();
    (function f(t) { const p = Math.min((t - t0) / 1100, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + s; if (p < 1) requestAnimationFrame(f); })(t0);
  };
  const nums = document.querySelectorAll("[data-n]");
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } }), { threshold: .6 });
    nums.forEach((n) => co.observe(n));
  } else nums.forEach(count);

  const items = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add("in"));
})();
