/* Liquid-glass navigation — injected ONCE and kept in place across soft (SPA) page
   swaps, so the bar never reloads. Mobile: floating bottom tab bar (5 tabs + More).
   Desktop: frosted top bar (all 7). The frosted capsule marks the active page;
   updateActive() re-runs on every soft navigation (jm:navigated). */
(function () {
  var ICON = {
    home:     '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    story:    '<path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z"/><path d="M8 7h7M8 11h7"/>',
    info:     '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    registry: '<path d="M4 9h16v11H4z"/><path d="M2 9h20v3H2zM12 9v11M12 9s-4-6-6-3 6 3 6 3zM12 9s4-6 6-3-6 3-6 3z"/>',
    rsvp:     '<path d="M3 5h18v14H3z"/><path d="M3 6l9 7 9-7"/>',
    party:    '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.2 1.3-4 3.5-4S22 17.8 22 20"/>',
    fun:      '<path d="M12 3l2.2 4.8L19 9l-3.5 3.4L16 18l-4-2.6L8 18l.5-5.6L5 9l4.8-1.2z"/>',
    more:     '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'
  };
  function tab(page, href, label, extra) {
    return '<li class="' + (extra || "") + '"><a data-page="' + page + '" href="' + href + '">' +
      '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ICON[page] + '</svg>' +
      '<span>' + label + '</span></a></li>';
  }
  var NAV =
    '<nav class="glassnav" id="siteNav" aria-label="Primary">' +
      '<a class="brand" href="index.html">Joseph <span class="amp">&amp;</span> Maria</a>' +
      '<ul class="navtabs">' +
        tab("home", "index.html", "Home") +
        tab("story", "story.html", "Story") +
        tab("info", "faq.html", "Info") +
        tab("registry", "registry.html", "Registry") +
        tab("rsvp", "rsvp.html", "RSVP", "is-rsvp") +
        tab("party", "party.html", "Party", "secondary") +
        tab("fun", "fun.html", "Fun", "secondary") +
        '<li class="moreli"><button class="moretab" id="moreBtn" data-page="more" type="button">' +
          '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ICON.more + '</svg>' +
          '<span>More</span></button></li>' +
        '<span class="nav-capsule" aria-hidden="true"></span>' +
      '</ul>' +
    '</nav>' +
    '<div class="more-sheet" id="moreSheet" hidden>' +
      '<div class="more-panel">' +
        '<div class="more-grab" aria-hidden="true"></div>' +
        '<a data-page="party" href="party.html">Wedding Party</a>' +
        '<a data-page="fun" href="fun.html">Fun &amp; Games</a>' +
        '<button class="more-close" type="button">Close</button>' +
      '</div>' +
    '</div>';

  var nav, tabs, capsule, moreBtn, sheet;

  function activeEl() {
    var els = nav.querySelectorAll('.navtabs a.active, .navtabs .moretab.active');
    for (var i = 0; i < els.length; i++) { if (els[i].offsetParent !== null) return els[i]; }
    return null;
  }
  function placeCapsule() {
    if (!nav || !capsule) return;
    var el = activeEl();
    if (!el) { capsule.style.opacity = 0; return; }
    var r = el.getBoundingClientRect(), pr = tabs.getBoundingClientRect();
    capsule.style.opacity = 1;
    capsule.style.width = r.width + "px";
    capsule.style.height = r.height + "px";
    capsule.style.transform = "translateX(" + (r.left - pr.left) + "px) translateY(" + (r.top - pr.top) + "px)";
    capsule.classList.toggle("cap-rose", el.classList.contains("is-rsvp"));
  }
  function updateActive() {
    if (!nav) return;
    var page = document.body.getAttribute("data-page");
    nav.querySelectorAll('.navtabs a.active, .moretab.active').forEach(function (el) {
      el.classList.remove("active"); el.removeAttribute("aria-current");
    });
    if (sheet) sheet.querySelectorAll("a.active").forEach(function (el) { el.classList.remove("active"); });
    var pageLink = nav.querySelector('.navtabs a[data-page="' + page + '"]');
    if (pageLink) { pageLink.classList.add("active"); pageLink.setAttribute("aria-current", "page"); }
    if (page === "party" || page === "fun") {
      moreBtn.classList.add("active");
      var slink = sheet.querySelector('a[data-page="' + page + '"]');
      if (slink) slink.classList.add("active");
    }
    placeCapsule();
  }

  function openSheet() { sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add("open"); }); }
  function closeSheet() { if (sheet) { sheet.classList.remove("open"); setTimeout(function () { sheet.hidden = true; }, 260); } }

  function prefetchPages() {
    var PAGES = ["index.html", "story.html", "faq.html", "party.html", "registry.html", "rsvp.html", "fun.html"];
    var here = location.pathname.split("/").pop() || "index.html";
    var done = {};
    function prefetch(href) {
      if (!href) return;
      href = href.split("#")[0].split("?")[0];
      if (!href || done[href] || href === here || !/\.html$/.test(href)) return;
      done[href] = 1;
      var l = document.createElement("link");
      l.rel = "prefetch"; l.as = "document"; l.href = href;
      document.head.appendChild(l);
    }
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 700); };
    idle(function () { PAGES.forEach(prefetch); });
  }

  function build() {
    if (document.getElementById("siteNav")) return;
    var frag = document.createElement("div");
    frag.innerHTML = NAV;
    while (frag.lastChild) document.body.insertBefore(frag.lastChild, document.body.firstChild);

    nav = document.getElementById("siteNav");
    tabs = nav.querySelector(".navtabs");
    capsule = nav.querySelector(".nav-capsule");
    moreBtn = document.getElementById("moreBtn");
    sheet = document.getElementById("moreSheet");

    moreBtn.addEventListener("click", function (e) { e.preventDefault(); sheet.classList.contains("open") ? closeSheet() : openSheet(); });
    sheet.addEventListener("click", function (e) { if (e.target === sheet || e.target.classList.contains("more-close")) closeSheet(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("open")) closeSheet(); });

    window.addEventListener("resize", placeCapsule);
    window.addEventListener("load", placeCapsule);
    window.addEventListener("jm:unlock", placeCapsule);
    document.addEventListener("jm:navigated", function () { closeSheet(); updateActive(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeCapsule);

    prefetchPages();
    updateActive();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
