/* Laptop Vision — interactions */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav: scrolled state ---------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("scrollProgress");
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");
  burger.addEventListener("click", function () {
    var open = navLinks.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      navLinks.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Scrollspy ---------- */
  var sections = ["home", "about", "services", "contacts"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          links.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counter ---------- */
  var counters = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counterObs.unobserve(entry.target);
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1500, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { counterObs.observe(c); });
  }

  /* ---------- Live clock (Europe/Sofia) + open status ---------- */
  var hudClock = document.getElementById("hudClock");
  var footerClock = document.getElementById("footerClock");
  var navStatus = document.getElementById("navStatus");

  function sofiaNow() {
    // Europe/Sofia is GMT+2 (EET) / GMT+3 (EEST)
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Sofia" }));
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function tick() {
    var now = sofiaNow();
    var hh = now.getHours(), mm = now.getMinutes(), ss = now.getSeconds();
    if (hudClock) hudClock.textContent = pad(hh) + ":" + pad(mm);
    if (footerClock) footerClock.textContent = "София " + pad(hh) + ":" + pad(mm) + ":" + pad(ss);

    if (navStatus) {
      var day = now.getDay();              // 0 = Нд … 1 = Пн … 5 = Пт
      var mins = hh * 60 + mm;
      var isWorkDay = day !== 1 && day !== 5;   // почивни: понеделник и петък
      var isOpen = isWorkDay && mins >= 600 && mins < 1110; // 10:00–18:30
      navStatus.classList.toggle("open", isOpen);
      navStatus.classList.toggle("closed", !isOpen);
      navStatus.querySelector("em").textContent = isOpen ? "Отворено сега" : "Затворено";
    }
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- HUD mouse coordinates ---------- */
  var coords = document.getElementById("hudCoords");
  if (finePointer && coords) {
    window.addEventListener("mousemove", function (e) {
      coords.textContent =
        String(e.clientX).padStart(4, "0") + " X " +
        String(e.clientY).padStart(4, "0") + " Y";
    }, { passive: true });
  }

  /* ---------- Custom cursor ---------- */
  var cursor = document.getElementById("cursor");
  if (finePointer && !reducedMotion && cursor) {
    var cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, .svc-row, input, select, textarea").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hover"); });
    });
  }

  /* ---------- Hero image parallax ---------- */
  var heroPh = document.getElementById("heroPh");
  var heroImg = document.getElementById("heroImg");
  if (finePointer && !reducedMotion && heroPh && heroImg) {
    var hero = document.getElementById("home");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      heroImg.style.transform = "scale(1.06) translate(" + nx * -14 + "px," + ny * -14 + "px)";
    });
    hero.addEventListener("mouseleave", function () {
      heroImg.style.transform = "";
    });
  }

  /* ---------- Services: floating preview ---------- */
  var svcList = document.getElementById("svcList");
  var preview = document.getElementById("svcPreview");
  if (finePointer && !reducedMotion && svcList && preview) {
    var pImg = preview.querySelector("img");
    var px = 0, py = 0, ptx = 0, pty = 0, previewOn = false;

    svcList.addEventListener("mousemove", function (e) { ptx = e.clientX + 30; pty = e.clientY - 100; }, { passive: true });
    (function pLoop() {
      px += (ptx - px) * 0.12;
      py += (pty - py) * 0.12;
      preview.style.left = px + "px";
      preview.style.top = py + "px";
      requestAnimationFrame(pLoop);
    })();

    svcList.querySelectorAll(".svc-row").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        var src = row.getAttribute("data-img");
        if (src && pImg.getAttribute("src") !== src) pImg.setAttribute("src", src);
        preview.classList.add("is-on");
        previewOn = true;
      });
    });
    svcList.addEventListener("mouseleave", function () {
      preview.classList.remove("is-on");
      previewOn = false;
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  var success = document.getElementById("formSuccess");

  function setInvalid(input, invalid) {
    var field = input.closest(".field");
    if (field) field.classList.toggle("is-invalid", invalid);
  }
  function validPhone(v) { return /^[+\d][\d\s\-()]{5,}$/.test(v.trim()); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }

  ["fName", "fPhone", "fEmail", "fMsg"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function () { setInvalid(el, false); });
  });
  var privacyInput = document.getElementById("fPrivacy");
  if (privacyInput) {
    privacyInput.addEventListener("change", function () { setInvalid(privacyInput, false); });
  }

  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("fName");
    var phone = document.getElementById("fPhone");
    var email = document.getElementById("fEmail");
    var service = document.getElementById("fService");
    var msg = document.getElementById("fMsg");
    var privacy = document.getElementById("fPrivacy");

    var ok = true;
    if (!name.value.trim()) { setInvalid(name, true); ok = false; }
    if (!validPhone(phone.value)) { setInvalid(phone, true); ok = false; }
    if (email.value.trim() && !validEmail(email.value)) { setInvalid(email, true); ok = false; }
    if (msg.value.trim().length < 5) { setInvalid(msg, true); ok = false; }
    if (privacy && !privacy.checked) { setInvalid(privacy, true); ok = false; }
    if (!ok) {
      var firstBad = form.querySelector(".field.is-invalid input, .field.is-invalid textarea");
      if (firstBad) firstBad.focus();
      return;
    }

    var subjectInput = form.querySelector('input[name="subject"]');
    if (subjectInput) {
      subjectInput.value = "Запитване от сайта — " + (service.value || "Общо запитване");
    }

    var btn = form.querySelector('button[type="submit"]');
    var errBox = document.getElementById("formError");
    success.classList.remove("is-shown");
    if (errBox) errBox.classList.remove("is-shown");
    if (btn) { btn.disabled = true; btn.classList.add("is-sending"); }

    var data = {};
    new FormData(form).forEach(function (v, k) {
      if (k !== "botcheck") data[k] = v;
    });

    fetch(form.getAttribute("action"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.success) {
          form.reset();
          success.classList.add("is-shown");
          success.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          throw new Error((res && res.message) || "submit failed");
        }
      })
      .catch(function () {
        if (errBox) {
          errBox.classList.add("is-shown");
          errBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.classList.remove("is-sending"); }
      });
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
