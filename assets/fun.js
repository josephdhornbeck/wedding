/* Fun page — couple trivia, guestbook wall (approved messages only), live polls.
   All three talk to the same Apps Script backend. */
(function () {
  var S = window.SITE || {};
  function post(data) {
    var fd = new FormData();
    Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
    return fetch(S.SCRIPT_URL, { method: "POST", body: fd }).then(function (r) { return r.json(); });
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  document.addEventListener("DOMContentLoaded", function () {
    initTrivia(); initGuestbook(); initPolls();
  });

  /* ---------------- trivia ---------------- */
  function initTrivia() {
    var host = document.getElementById("trivia");
    if (!host || !S.TRIVIA || !S.TRIVIA.length) return;
    var i = 0, score = 0;
    function question() {
      var t = S.TRIVIA[i];
      host.innerHTML =
        '<p class="tr-count">Question ' + (i + 1) + ' of ' + S.TRIVIA.length + '</p>' +
        '<h4 class="tr-q">' + esc(t.q) + '</h4><div class="tr-opts"></div>';
      var opts = host.querySelector(".tr-opts");
      t.options.forEach(function (o, oi) {
        var b = document.createElement("button");
        b.className = "tr-opt"; b.type = "button"; b.textContent = o;
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(opts.children, function (c) { c.disabled = true; });
          if (oi === t.answer) { b.classList.add("right"); score++; }
          else { b.classList.add("wrong"); if (opts.children[t.answer]) opts.children[t.answer].classList.add("right"); }
          setTimeout(function () { i++; (i < S.TRIVIA.length) ? question() : done(); }, 950);
        });
        opts.appendChild(b);
      });
    }
    function done() {
      host.innerHTML =
        '<div class="tr-done"><p class="script">' + score + ' / ' + S.TRIVIA.length + '</p>' +
        '<p>' + (score === S.TRIVIA.length ? "Flawless \u2014 you know us too well!" : "Thanks for playing!") + '</p>' +
        '<button class="btn btn-ghost" id="trAgain" type="button">Play again</button></div>';
      document.getElementById("trAgain").addEventListener("click", function () { i = 0; score = 0; question(); });
    }
    question();
  }

  /* ---------------- guestbook ---------------- */
  function initGuestbook() {
    var form = document.getElementById("gbForm");
    var wall = document.getElementById("gbWall");
    if (!form) return;

    function load() {
      if (!wall) return;
      post({ action: "guestbook_list" }).then(function (r) {
        if (!(r && r.ok && r.messages)) return;
        wall.innerHTML = r.messages.length ? "" : '<p class="muted">Be the first to leave a note.</p>';
        r.messages.forEach(function (m) {
          var c = document.createElement("div");
          c.className = "gb-note";
          c.innerHTML = '<p class="gb-msg">' + esc(m.message) + '</p><p class="gb-by">\u2014 ' + esc(m.name) + '</p>';
          wall.appendChild(c);
        });
      }).catch(function () {});
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("gbName").value || "").trim();
      var msg = (document.getElementById("gbMsg").value || "").trim();
      if (!name || !msg) return;
      var btn = form.querySelector("button");
      btn.disabled = true; btn.textContent = "Sending\u2026";
      post({ action: "guestbook_add", name: name, message: msg }).then(function () {
        form.reset();
        document.getElementById("gbThanks").classList.remove("hidden");
      }).catch(function () {}).then(function () {
        btn.disabled = false; btn.textContent = "Sign the guestbook";
      });
    });

    load();
  }

  /* ---------------- polls ---------------- */
  function initPolls() {
    var host = document.getElementById("polls");
    if (!host || !S.POLLS || !S.POLLS.length) return;

    post({ action: "poll_results" }).then(function (r) { render((r && r.results) || {}); })
      .catch(function () { render({}); });

    function render(results) {
      host.innerHTML = "";
      S.POLLS.forEach(function (p) {
        var voted = false;
        try { voted = localStorage.getItem("poll_" + p.id) === "1"; } catch (e) {}
        var counts = results[p.id] || {};
        var total = 0;
        p.options.forEach(function (o) { total += counts[o] || 0; });

        var card = document.createElement("div");
        card.className = "poll";
        card.innerHTML = '<h4>' + esc(p.question) + '</h4>';
        var opts = document.createElement("div");
        opts.className = "poll-opts";

        p.options.forEach(function (o) {
          if (voted) {
            var n = counts[o] || 0, pct = total ? Math.round(n * 100 / total) : 0;
            var bar = document.createElement("div");
            bar.className = "poll-bar";
            bar.innerHTML = '<span class="poll-fill" style="width:' + pct + '%"></span>' +
              '<span class="poll-lbl">' + esc(o) + '</span><span class="poll-pct">' + pct + '%</span>';
            opts.appendChild(bar);
          } else {
            var b = document.createElement("button");
            b.className = "poll-vote"; b.type = "button"; b.textContent = o;
            b.addEventListener("click", function () {
              try { localStorage.setItem("poll_" + p.id, "1"); } catch (e) {}
              post({ action: "poll_vote", pollId: p.id, option: o })
                .then(function (rr) { render((rr && rr.results) || results); })
                .catch(function () { render(results); });
            });
            opts.appendChild(b);
          }
        });

        card.appendChild(opts);
        if (voted && total) card.insertAdjacentHTML("beforeend", '<p class="poll-total">' + total + ' vote' + (total === 1 ? "" : "s") + '</p>');
        host.appendChild(card);
      });
    }
  }
})();
