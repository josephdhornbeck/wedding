/* Live weather widget (Open-Meteo, no API key). Two modes:
   - More than ~16 days out: typical early-May climate for the Detroit area.
   - Within the 16-day forecast window: the real rolling forecast for May 1,
     refreshed every visit. It flips over automatically in mid-April. */
(function () {
  var S = window.SITE || {}, W = S.WEATHER || {};

  document.addEventListener("DOMContentLoaded", function () {
    var host = document.getElementById("weather");
    if (!host) return;
    var wed = new Date(S.WEDDING_DATE);
    var days = Math.ceil((wed - new Date()) / 86400000);
    if (days <= (W.switchDays || 16) && days >= -1) liveForecast(host, wed);
    else typical(host, false);
  });

  function wmo(c) {
    var m = {
      0: ["Clear skies", "\u2600\uFE0F"], 1: ["Mainly clear", "\uD83C\uDF24\uFE0F"], 2: ["Partly cloudy", "\u26C5"], 3: ["Overcast", "\u2601\uFE0F"],
      45: ["Fog", "\uD83C\uDF2B\uFE0F"], 48: ["Freezing fog", "\uD83C\uDF2B\uFE0F"],
      51: ["Light drizzle", "\uD83C\uDF26\uFE0F"], 53: ["Drizzle", "\uD83C\uDF26\uFE0F"], 55: ["Heavy drizzle", "\uD83C\uDF26\uFE0F"],
      61: ["Light rain", "\uD83C\uDF27\uFE0F"], 63: ["Rain", "\uD83C\uDF27\uFE0F"], 65: ["Heavy rain", "\uD83C\uDF27\uFE0F"],
      71: ["Light snow", "\uD83C\uDF28\uFE0F"], 73: ["Snow", "\uD83C\uDF28\uFE0F"], 75: ["Heavy snow", "\u2744\uFE0F"],
      80: ["Rain showers", "\uD83C\uDF26\uFE0F"], 81: ["Rain showers", "\uD83C\uDF26\uFE0F"], 82: ["Heavy showers", "\u26C8\uFE0F"],
      95: ["Thunderstorm", "\u26C8\uFE0F"], 96: ["Thunderstorm", "\u26C8\uFE0F"], 99: ["Thunderstorm", "\u26C8\uFE0F"]
    };
    return m[c] || ["Weather", "\uD83C\uDF24\uFE0F"];
  }

  function liveForecast(host, wed) {
    var d = wed.getFullYear() + "-" + pad(wed.getMonth() + 1) + "-" + pad(wed.getDate());
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + W.lat + "&longitude=" + W.lon +
      "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
      "&temperature_unit=fahrenheit&timezone=America%2FNew_York&start_date=" + d + "&end_date=" + d;
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      var dd = j.daily;
      if (!dd || !dd.time || !dd.time.length) throw 0;
      var lbl = wmo(dd.weathercode[0]);
      var rain = dd.precipitation_probability_max[0];
      host.innerHTML = card("The forecast for May 1", lbl[1], Math.round(dd.temperature_2m_max[0]),
        Math.round(dd.temperature_2m_min[0]), lbl[0],
        "Chance of rain " + (rain != null ? rain + "%" : "\u2014"),
        "Live forecast \u00B7 updates every visit");
    }).catch(function () { typical(host, true); });
  }

  function typical(host, liveFailed) {
    /* Climate normals for early May near Taylor, MI (refine anytime). */
    host.innerHTML = card("Typical for May 1", "\u26C5", 64, 44, "Partly cloudy",
      "Historic average for the Detroit area",
      liveFailed ? "Live data unavailable right now" : "Live forecast unlocks ~" + (W.switchDays || 16) + " days before the wedding");
  }

  function card(title, emoji, hi, lo, desc, sub, foot) {
    return '<div class="wx-emoji" aria-hidden="true">' + emoji + '</div>' +
      '<p class="wx-title">' + title + '</p>' +
      '<p class="wx-temp">' + hi + '\u00B0<span>&nbsp;/ ' + lo + '\u00B0F</span></p>' +
      '<p class="wx-desc">' + desc + '</p>' +
      '<p class="wx-sub">' + sub + '</p>' +
      '<p class="wx-foot">' + foot + '</p>';
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
})();
