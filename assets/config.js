/* ============================================================
   Joseph & Maria — ONE place to edit everything guests see.
   Lines marked TODO are your homework; any value here is safe to change.
   ============================================================ */
window.SITE = {
  /* RSVP backend — same Apps Script Web app URL as before (ends in /exec) */
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwaBwloJ7WF471s-_qajvdwzv6gK5ory5RC88FMD9TLdwP0_VbCyvVJht4Q1AEFemAnhw/exec",

  /* The day */
  WEDDING_DATE:  "2027-05-01T16:00:00-04:00",   /* May 1 2027, 4:00 PM ET (ceremony) */
  RSVP_DEADLINE: "2027-03-27",                  /* TODO confirm — shown on Home, RSVP, FAQ */
  RSVP_OPEN:     false,                         /* flip to true when invitations mail */

  /* Password gate — a locked screen door, NOT real security */
  GATE_ENABLED:  true,
  GATE_PASSWORD: "Celebrate",                   /* TODO the word printed on the invitations */

  /* Venues — map links build automatically from the address */
  CEREMONY: {
    name: "Northline Church",
    time: "4:00 PM",
    address: "22140 Champaign St, Taylor, MI 48180"
  },
  RECEPTION: {
    name: "Reception venue \u2014 to be announced",  /* TODO reception venue name */
    time: "6:00 PM",
    address: ""                                      /* TODO reception address (unlocks its map links + timeline) */
  },

  /* Registry + honeymoon fund */
  MYREGISTRY_URL: "",     /* TODO your MyRegistry page URL */
  VENMO_USER:     "",     /* TODO your Venmo username WITHOUT the @  (e.g. Joseph-Hornbeck) */

  /* Weather (Taylor, MI) — live forecast unlocks ~16 days out */
  WEATHER: { lat: 42.24, lon: -83.27, place: "Taylor, MI", switchDays: 16 },

  /* Hour-by-hour timeline (Home). TODO fill in the real hours. */
  TIMELINE: [
    { time: "3:30 PM",  title: "Guests arrive",       note: "Find a seat, say hello" },
    { time: "4:00 PM",  title: "Ceremony",            note: "Northline Church" },
    { time: "5:00 PM",  title: "Cocktail hour",       note: "(minus the cocktails) \u2014 mingle & photos" },
    { time: "6:00 PM",  title: "Reception & dinner",  note: "TODO reception venue" },
    { time: "7:30 PM",  title: "First dance",         note: "TODO" },
    { time: "8:00 PM",  title: "Toasts & cake",       note: "TODO" },
    { time: "10:00 PM", title: "Send-off",            note: "TODO" }
  ],

  /* Story gallery (Story page). TODO add photos to images/ and list them here. */
  GALLERY: [
    { src: "images/miata-sunset.jpg", caption: "TODO caption" },
    { src: "images/holland.jpg",      caption: "TODO caption" },
    { src: "images/diner.jpg",        caption: "TODO caption" }
  ],

  /* Wedding party (Party page). 16 adults: photo + name + role + one-liner. */
  PARTY_ADULTS: [
    { name: "TODO name", role: "Maid of Honor", photo: "", line: "TODO fun one-liner" },
    { name: "TODO name", role: "Best Man",      photo: "", line: "TODO fun one-liner" }
    /* TODO add the rest of your 16 (photo path relative to images/, e.g. "images/party/abby.jpg") */
  ],
  /* 4 flower girls + 4 bridal security — FIRST NAMES ONLY (all 6 and under) */
  PARTY_KIDS: [
    { name: "TODO", role: "Flower Girl" },
    { name: "TODO", role: "Bridal Security" }
  ],

  /* Fun page — couple trivia. answer = 0-based index of the correct option. TODO edit. */
  TRIVIA: [
    { q: "Where did Joe & Maria have their first official date?", options: ["Holland", "Taylor", "Chicago", "Detroit"], answer: 0 },
    { q: "What car started it all?", options: ["F-150 Lightning", "Mazda Miata", "Jeep", "Tesla"], answer: 1 }
  ],

  /* Fun page — live polls / predictions. TODO edit. */
  POLLS: [
    { id: "rain",      question: "Will it rain on May 1?", options: ["Yes", "No"] },
    { id: "firsttear", question: "Who cries first?",       options: ["Joe", "Maria", "Both", "Neither"] }
  ]
};

/* Build Google / Apple / Waze links from a street address */
window.mapLinks = function (address) {
  var q = encodeURIComponent(address || "");
  return {
    google: "https://www.google.com/maps/search/?api=1&query=" + q,
    apple:  "https://maps.apple.com/?q=" + q,
    waze:   "https://waze.com/ul?q=" + q + "&navigate=yes"
  };
};
