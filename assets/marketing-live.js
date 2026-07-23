/* marketing-live.js - the message-market-fit lever simulator (learn-ai-marketing-with-phoebe).
   Reusable "watch the number climb" pattern (see learn-ai-finance finance-live.js).
   Deterministic, offline, no dependencies. Renders into #marketing-live.

   Teaching idea: the learner sharpens a positioning message for "Cadence" by toggling
   levers (ICP, pain + proof, offer clarity, brand voice, channel fit) and watches an AI
   draft go from vague everyone-copy to a message that lands - plus a scorecard across
   three audience segments. The "model" is a scripted teaching simulation; the lesson
   (a message aimed at everyone reaches no one) is real. */
(function () {
  var host = document.getElementById("marketing-live");
  if (!host) return;

  var LEVERS = [
    { id: "icp",     label: "Define the ICP",       hint: "who exactly, not everyone",  pts: 35 },
    { id: "pain",    label: "Add the pain + proof",  hint: "the job to be done + evidence", pts: 18 },
    { id: "offer",   label: "Make the offer clear",  hint: "value, plan, and a CTA",     pts: 15 },
    { id: "channel", label: "Fit the channel",       hint: "tailored to where it runs",  pts: 12 },
    { id: "voice",   label: "Apply brand voice",     hint: "on-brand, not generic",      pts: 10 }
  ];

  var state = { icp: false, pain: false, offer: false, channel: false, voice: false, mode: "live" };

  function score() {
    var s = 10;
    LEVERS.forEach(function (l) { if (state[l.id]) s += l.pts; });
    return Math.min(100, s);
  }

  /* three audience segments; each resonates only when its required levers are on.
     Requirements are chosen so different levers unlock different segments, and the
     count visibly climbs 0 -> 3 as the message sharpens. */
  var SEGMENTS = [
    { name: "Solo professional",  need: ["icp", "pain"],            why: "sees their own pain" },
    { name: "Team lead (B2B)",    need: ["icp", "pain", "offer"],   why: "pain + a clear offer" },
    { name: "Exec buyer (B2B)",   need: ["icp", "offer", "channel"], why: "value in their channel" }
  ];
  function segOk(s) { return s.need.every(function (k) { return state[k]; }); }
  function reached() { return SEGMENTS.filter(segOk).length; }

  /* the AI "message draft" from the current lever state */
  function draft() {
    var parts = [];
    if (!state.icp) {
      parts.push({ warn: true, t: "Cadence is a powerful, innovative, all-in-one AI platform that helps everyone do their best work, effortlessly." });
      parts.push({ warn: true, t: "(No ICP defined, so the draft targets “everyone” - which is why it reads as generic filler that lands on no one. This is the number-one positioning failure, and no bigger model fixes it.)" });
      return parts;
    }
    var head = "For busy consultants and team leads who lose the thread across back-to-back meetings, Cadence is the AI note-taker that captures every decision automatically.";
    parts.push({ warn: false, t: head });

    var body = "";
    if (state.pain) body += "It kills the after-meeting write-up: notes, decisions, and action items are drafted the moment the call ends, so nothing slips. ";
    else body += "(No specific pain or proof yet, so the message states features without showing why anyone should care.) ";
    if (state.offer) body += "Start free on the solo plan; upgrade to Teams for shared workspaces and admin controls. ";
    else body += "(No clear offer or CTA, so even an interested reader does not know what to do next.) ";
    parts.push({ warn: false, t: body.trim() });

    var close = "";
    if (state.channel) close += "Tuned for the channel it runs in - a punchy hook for social, a benefit-led subject line for email, a proof-led headline for a landing page. ";
    if (state.voice) close += "And it sounds like Cadence: warm, plain-spoken, confident, never hypey.";
    if (close) parts.push({ warn: false, t: close.trim() });
    return parts;
  }

  var fmt = function () {};

  host.innerHTML =
    '<div class="ml-shell">' +
      '<div class="ml-controls">' +
        '<div class="ml-ctitle">Sharpen the message</div>' +
        '<div class="ml-levers"></div>' +
        '<div class="ml-modes">' +
          '<button type="button" class="ml-mode ml-on" data-mode="live">Live message</button>' +
          '<button type="button" class="ml-mode" data-mode="score">Segment scorecard</button>' +
        '</div>' +
      '</div>' +
      '<div class="ml-stage">' +
        '<div class="ml-meters">' +
          '<div class="ml-meter"><span class="ml-mlabel">Message-market fit</span><span class="ml-mval" id="ml-score">10</span><div class="ml-bar"><i id="ml-bar"></i></div></div>' +
          '<div class="ml-meter"><span class="ml-mlabel">Segments resonating</span><span class="ml-mval" id="ml-seg">0 / 3</span></div>' +
        '</div>' +
        '<div id="ml-body"></div>' +
        '<p class="ml-rail">This model is a scripted teaching simulation - a real LLM words things differently. What is real is the lesson: a message aimed at everyone reaches no one, and sharpening the ICP, pain, offer, and channel is what earns attention. You still own the brand and the claim.</p>' +
      '</div>' +
    '</div>';

  var leverWrap = host.querySelector(".ml-levers");
  LEVERS.forEach(function (l) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "ml-lever";
    b.setAttribute("data-lever", l.id);
    b.innerHTML = '<span class="ml-sw"></span><span class="ml-ltext"><b>' + l.label + '</b><span>' + l.hint + '</span></span>';
    b.addEventListener("click", function () { state[l.id] = !state[l.id]; render(); });
    leverWrap.appendChild(b);
  });
  host.querySelectorAll(".ml-mode").forEach(function (m) {
    m.addEventListener("click", function () { state.mode = m.getAttribute("data-mode"); render(); });
  });

  function render() {
    host.querySelectorAll(".ml-lever").forEach(function (b) {
      b.classList.toggle("ml-active", !!state[b.getAttribute("data-lever")]);
    });
    host.querySelectorAll(".ml-mode").forEach(function (m) {
      m.classList.toggle("ml-on", m.getAttribute("data-mode") === state.mode);
    });
    var s = score();
    host.querySelector("#ml-score").textContent = s;
    host.querySelector("#ml-bar").style.width = s + "%";
    var r = reached();
    var segEl = host.querySelector("#ml-seg");
    segEl.textContent = r + " / 3";
    segEl.className = "ml-mval" + (r === 3 ? " ml-good" : "");

    var body = host.querySelector("#ml-body");
    if (state.mode === "score") {
      var rows = SEGMENTS.map(function (sg) {
        var ok = segOk(sg);
        return '<tr class="' + (ok ? "ml-r-ok" : "ml-r-no") + '"><td>' + sg.name + '</td><td>' + sg.why +
          '</td><td class="ml-rmark">' + (ok ? "✓" : "✗") + '</td></tr>';
      }).join("");
      body.innerHTML =
        '<div class="ml-scorehead">' + r + ' of 3 segments resonate <b>(' + Math.round((r / 3) * 100) + '%)</b></div>' +
        '<table class="ml-table"><thead><tr><th>Audience segment</th><th>Resonates when</th><th>Hit?</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<p class="ml-note">Each segment needs a different sharpening. Turn the levers on and watch coverage climb from 0 to all three - the same shape as your reach.</p>';
    } else {
      var d = draft();
      body.innerHTML =
        '<div class="ml-draftlabel">AI draft: Cadence positioning message</div>' +
        '<div class="ml-draft">' + d.map(function (p) {
          return '<p class="ml-line' + (p.warn ? " ml-warn" : "") + '">' + p.t + '</p>';
        }).join("") + '</div>';
    }
  }

  render();
})();
