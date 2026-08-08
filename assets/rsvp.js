/* RSVP — invite-code household flow.
   1) Guest types the code from their invitation.
   2) Backend returns their household members (+ a plus-one field only where flagged).
   3) One submission writes linked rows (per person) under the Party ID.
   Plus-ones are never searchable names, so they can't RSVP themselves. */
(function () {
  var S = window.SITE || {};

  function post(data) {
    var fd = new FormData();
    Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
    return fetch(S.SCRIPT_URL, { method: "POST", body: fd }).then(function (r) { return r.json(); });
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function val(id) { var e = document.getElementById(id); return e ? (e.value || "").trim() : ""; }

  function boot() {
    var root = document.getElementById("rsvpApp");
    if (!root) return;

    var closed = document.getElementById("rsvpClosed");
    if (!S.RSVP_OPEN || !/^https:\/\//.test(S.SCRIPT_URL)) { if (closed) closed.classList.remove("hidden"); return; }

    var codeForm  = document.getElementById("codeForm");
    var codeErr   = document.getElementById("codeErr");
    var household = document.getElementById("household");
    var thanks    = document.getElementById("rsvpThanks");
    var members   = document.getElementById("members");
    var party = null;

    codeForm.classList.remove("hidden");

    codeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      codeErr.classList.add("hidden");
      var code = val("inviteCode").toUpperCase();
      if (!code) return;
      var btn = codeForm.querySelector("button");
      btn.disabled = true; btn.textContent = "Checking\u2026";
      post({ action: "lookup", code: code }).then(function (res) {
        if (res && res.ok) {
          res.code = code; party = res;
          renderHousehold(res);
          codeForm.classList.add("hidden");
          household.classList.remove("hidden");
        } else {
          codeErr.textContent = (res && res.message) || "That code didn\u2019t match. Please check your invitation.";
          codeErr.classList.remove("hidden");
        }
      }).catch(function () {
        codeErr.textContent = "Couldn\u2019t reach the guest list. Please try again in a moment.";
        codeErr.classList.remove("hidden");
      }).then(function () { btn.disabled = false; btn.textContent = "Find my invitation"; });
    });

    function renderHousehold(p) {
      var label = document.getElementById("hlabel");
      if (label) label.textContent = p.label ? ("Hello, " + p.label + "!") : "You\u2019re on the list \u2014 welcome!";
      members.innerHTML = "";
      (p.members || []).forEach(function (m, i) {
        var row = document.createElement("div");
        row.className = "member";
        row.innerHTML =
          '<div class="member-head"><span class="member-name">' + esc(m.name) + '</span>' +
            '<div class="yn">' +
              '<label><input type="radio" name="att' + i + '" value="yes"> Coming</label>' +
              '<label><input type="radio" name="att' + i + '" value="no"> Can\u2019t make it</label>' +
            '</div></div>' +
          '<input type="text" class="diet" data-i="' + i + '" placeholder="Dietary needs / allergies (optional)">';
        members.appendChild(row);

        if (m.plusOne) {
          var pw = document.createElement("div");
          pw.className = "member plusone";
          pw.innerHTML =
            '<div class="member-head"><span class="member-name">Your plus-one</span>' +
              '<div class="yn">' +
                '<label><input type="radio" name="patt' + i + '" value="yes"> Coming</label>' +
                '<label><input type="radio" name="patt' + i + '" value="no"> Not coming</label>' +
              '</div></div>' +
            '<input type="text" class="pname" data-i="' + i + '" placeholder="Plus-one\u2019s full name">' +
            '<input type="text" class="pdiet" data-i="' + i + '" placeholder="Their dietary needs (optional)">';
          members.appendChild(pw);
        }
      });
    }

    document.getElementById("rsvpForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var err = document.getElementById("rsvpErr");
      err.classList.add("hidden");

      var guests = [];
      var missing = false;
      (party.members || []).forEach(function (m, i) {
        var att = document.querySelector('input[name="att' + i + '"]:checked');
        if (!att) missing = true;
        guests.push({ name: m.name, attending: att ? att.value === "yes" : null,
          dietary: (document.querySelector('.diet[data-i="' + i + '"]').value || "").trim(), isPlusOne: false });
        if (m.plusOne) {
          var patt = document.querySelector('input[name="patt' + i + '"]:checked');
          var pname = (document.querySelector('.pname[data-i="' + i + '"]').value || "").trim();
          if (pname || (patt && patt.value === "yes")) {
            guests.push({ name: pname || ("Guest of " + m.name), attending: patt ? patt.value === "yes" : true,
              dietary: (document.querySelector('.pdiet[data-i="' + i + '"]').value || "").trim(), isPlusOne: true, host: m.name });
          }
        }
      });

      if (missing) { err.textContent = "Please mark Coming or Can\u2019t make it for each person."; err.classList.remove("hidden"); return; }

      var btn = document.getElementById("rsvpSend");
      btn.disabled = true; btn.textContent = "Sending\u2026";
      post({
        action: "rsvp",
        partyId: party.partyId,
        code: party.code,
        guests: JSON.stringify(guests),
        song: val("song"),
        note: val("note"),
        sitNear: val("sitNear"),
        email: val("email")
      }).then(function (res) {
        if (res && res.ok) {
          household.classList.add("hidden");
          thanks.classList.remove("hidden");
          thanks.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          err.textContent = (res && res.message) || "Something went wrong. Please try again.";
          err.classList.remove("hidden");
          btn.disabled = false; btn.textContent = "Send our RSVP";
        }
      }).catch(function () {
        err.textContent = "Something went wrong saving your RSVP. Please try again.";
        err.classList.remove("hidden");
        btn.disabled = false; btn.textContent = "Send our RSVP";
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  document.addEventListener("jm:navigated", boot);
})();
