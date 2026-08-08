/* Renders the data-driven bits from config.js into whichever page is showing:
   Home (venues + map links, countdown, deadline, timeline), Story (gallery),
   Party (adults + kids grids). Static prose lives in the HTML itself. */
(function () {
  var S = window.SITE || {};
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fmtDate(iso) {
    if (!iso) return "TODO";
    var p = iso.split("-");
    var mo = ["January","February","March","April","May","June","July","August","September","October","November","December"][(+p[1]) - 1];
    return mo + " " + (+p[2]) + ", " + p[0];
  }

  function boot() {
    renderMeta();
    renderVenue("ceremony", S.CEREMONY);
    renderVenue("reception", S.RECEPTION);
    renderTimeline();
    renderGallery();
    renderPeople("partyAdults", S.PARTY_ADULTS, false);
    renderPeople("partyKids", S.PARTY_KIDS, true);
    renderRegistry();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  document.addEventListener("jm:navigated", boot);

  function renderRegistry() {
    var emb = document.getElementById("registryEmbed");
    if (emb) {
      if (S.MYREGISTRY_URL) emb.innerHTML = '<iframe src="' + S.MYREGISTRY_URL + '" title="Our registry" loading="lazy" referrerpolicy="no-referrer"></iframe>';
      else emb.innerHTML = '<div class="panel center"><p class="muted">Registry coming soon. Set <strong>MYREGISTRY_URL</strong> in <strong>assets/config.js</strong> to embed your MyRegistry page here.</p></div>';
    }
    var btn = document.getElementById("venmoBtn");
    if (btn && S.VENMO_USER) { btn.href = "https://venmo.com/" + encodeURIComponent(S.VENMO_USER); btn.classList.remove("hidden"); }
  }

  function renderMeta() {
    var wed = new Date(S.WEDDING_DATE);
    var cd = document.getElementById("countdown");
    if (cd) { var d = Math.ceil((wed - new Date()) / 86400000); if (d > 0) cd.textContent = d + " days to go"; }
    var deadline = fmtDate(S.RSVP_DEADLINE);
    document.querySelectorAll("[data-deadline]").forEach(function (e) {
      e.textContent = (e.getAttribute("data-deadline") === "short")
        ? ("Kindly reply by " + deadline)
        : ("Please send your reply by " + deadline + ".");
    });
  }

  function renderVenue(id, v) {
    var host = document.getElementById(id + "Card");
    if (!host || !v) return;
    var name = host.querySelector(".v-name"); if (name) name.textContent = v.name;
    var time = host.querySelector(".v-time"); if (time) time.textContent = v.time ? ("Starts " + v.time) : "";
    var addr = host.querySelector(".v-addr"); if (addr) addr.textContent = v.address || "Address coming soon";
    var maps = host.querySelector(".v-maps");
    if (maps) {
      if (v.address) {
        var m = window.mapLinks(v.address);
        maps.innerHTML =
          '<a href="' + m.google + '" target="_blank" rel="noopener">Google</a>' +
          '<a href="' + m.apple + '" target="_blank" rel="noopener">Apple</a>' +
          '<a href="' + m.waze + '" target="_blank" rel="noopener">Waze</a>';
      } else {
        maps.innerHTML = '<span class="muted">Map links appear once the venue is set</span>';
      }
    }
  }

  function renderTimeline() {
    var host = document.getElementById("timeline");
    if (!host || !S.TIMELINE) return;
    S.TIMELINE.forEach(function (it) {
      host.appendChild(el("div", "tl-item",
        '<div class="tl-time">' + esc(it.time) + '</div>' +
        '<div class="tl-dot" aria-hidden="true"></div>' +
        '<div class="tl-body"><h4>' + esc(it.title) + '</h4>' + (it.note ? '<p>' + esc(it.note) + '</p>' : '') + '</div>'));
    });
  }

  function renderGallery() {
    var host = document.getElementById("gallery");
    if (!host || !S.GALLERY) return;
    S.GALLERY.forEach(function (g) {
      host.appendChild(el("figure", "gal-item",
        '<div class="gal-photo"><img loading="lazy" src="' + esc(g.src) + '" alt="' + esc(g.caption || "") + '"></div>' +
        (g.caption ? '<figcaption>' + esc(g.caption) + '</figcaption>' : '')));
    });
  }

  function renderPeople(id, list, kids) {
    var host = document.getElementById(id);
    if (!host || !list) return;
    list.forEach(function (p) {
      var img = p.photo
        ? '<img loading="lazy" src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">'
        : '<div class="person-noimg" aria-hidden="true">' + esc((p.name || "?").charAt(0)) + '</div>';
      host.appendChild(el("div", "person" + (kids ? " person-kid" : ""),
        '<div class="person-photo">' + img + '</div>' +
        '<h4>' + esc(p.name) + '</h4>' +
        (p.role ? '<p class="person-role">' + esc(p.role) + '</p>' : '') +
        (p.line && !kids ? '<p class="person-line">' + esc(p.line) + '</p>' : '')));
    });
  }
})();
