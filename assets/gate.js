/* Password gate — a "locked screen door": deters casual visitors, NOT real security.
   The genuinely private data (guest list, RSVPs) lives only in your Google Sheet,
   never on this site. Loaded blocking in <head> so content never flashes. */
(function () {
  var S = window.SITE || {};
  var KEY = "jm_unlocked_v1";
  function unlock() {
    document.documentElement.classList.remove("gated");
    try { window.dispatchEvent(new Event("jm:unlock")); } catch (e) {}
  }

  /* Gate off, or already unlocked this session -> reveal before paint. */
  try {
    if (S.GATE_ENABLED === false || sessionStorage.getItem(KEY) === "1") { unlock(); return; }
  } catch (e) { unlock(); return; }   /* storage blocked -> fail open */

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.documentElement.classList.contains("gated")) return;

    var overlay = document.createElement("div");
    overlay.className = "gate";
    overlay.innerHTML =
      '<div class="gate-card">' +
        '<p class="script gate-script">Joseph &amp; Maria</p>' +
        '<p class="gate-lead">Please enter the word from your invitation.</p>' +
        '<form id="gateForm" autocomplete="off" novalidate>' +
          '<input type="password" id="gatePass" aria-label="Invitation word" placeholder="Invitation word" autocapitalize="none" autocorrect="off" spellcheck="false">' +
          '<button type="submit">Enter</button>' +
          '<p class="gate-error hidden" id="gateErr">That\u2019s not it \u2014 check your invitation.</p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(overlay);

    var form = overlay.querySelector("#gateForm");
    var err  = overlay.querySelector("#gateErr");
    var field = overlay.querySelector("#gatePass");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val  = (field.value || "").trim().toLowerCase();
      var pass = String(S.GATE_PASSWORD || "").trim().toLowerCase();
      if (val && val === pass) {
        try { sessionStorage.setItem(KEY, "1"); } catch (e2) {}
        overlay.classList.add("gate-out");
        setTimeout(function () { unlock(); overlay.remove(); }, 240);
      } else {
        err.classList.remove("hidden");
        field.select();
      }
    });
    field.focus();
  });
})();
