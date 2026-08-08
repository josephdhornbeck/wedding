/* Soft single-page navigation.
   Intercepts internal .html link taps and swaps ONLY the page content (.page-wrap),
   so the nav bar never reloads and there's no white flash. Cross-fades via the View
   Transitions API where supported (Chrome/Edge); an instant, gentle fade elsewhere
   (including iOS Safari). Falls back to a normal full navigation on any error, so
   direct links, bookmarks, and no-JS all still work. */
(function () {
  if (!window.history || !window.fetch || !window.DOMParser) return;

  function currentFile() { return location.pathname.split("/").pop() || "index.html"; }
  function internal(href) {
    if (!href) return false;
    if (/^(https?:)?\/\//i.test(href)) return false;     // external / protocol-relative
    if (/^(mailto:|tel:|#)/i.test(href)) return false;   // mail / phone / same-page hash
    return /\.html(\?|#|$)/i.test(href);
  }

  var busy = false;
  function go(url, push) {
    if (busy) return;
    busy = true;
    fetch(url, { credentials: "same-origin" })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var next = doc.querySelector(".page-wrap");
        var cur = document.querySelector(".page-wrap");
        if (!next || !cur) { window.location.href = url; return; }
        function apply() {
          cur.innerHTML = next.innerHTML;
          document.title = doc.title || document.title;
          document.body.setAttribute("data-page", doc.body.getAttribute("data-page") || "");
          window.scrollTo(0, 0);
          document.dispatchEvent(new Event("jm:navigated"));
        }
        if (push) history.pushState({ jm: 1 }, "", url);
        if (document.startViewTransition) {
          var vt = document.startViewTransition(apply);
          ["finished", "ready", "updateCallbackDone"].forEach(function (k) {
            if (vt && vt[k] && vt[k].catch) vt[k].catch(function () {});   // ignore aborted transitions
          });
        } else {
          apply();
          try { cur.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 160, easing: "ease-out" }); } catch (e) {}
        }
      })
      .catch(function () { window.location.href = url; })
      .then(function () { busy = false; });
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a || a.target === "_blank" || a.hasAttribute("download") || a.getAttribute("rel") === "external") return;
    var href = a.getAttribute("href");
    if (!internal(href)) return;
    e.preventDefault();
    var target = href.split("#")[0].split("?")[0];
    if (target === currentFile()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    go(href, true);
  }, false);

  window.addEventListener("popstate", function () { go(currentFile(), false); });
})();
