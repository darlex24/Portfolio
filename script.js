// Paste your public Calendly link here (e.g. "https://calendly.com/your-name/30min").
// Until then, "Book a call" opens an email instead.
const CALENDLY_URL = "https://calendly.com/daraakinyemi24/30min";
const EMAIL_FALLBACK = "mailto:daraakinyemi24@gmail.com?subject=Let%27s%20book%20a%20call";
const BOOKING_URL = CALENDLY_URL || EMAIL_FALLBACK;

(function () {
  // Load Calendly's popup widget only when someone actually clicks "Book a call".
  let calendly;
  const loadCalendly = () => calendly || (calendly = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://assets.calendly.com/assets/external/widget.js";
    js.async = true;
    js.onload = () => window.Calendly ? resolve(window.Calendly) : reject();
    js.onerror = reject;
    document.head.appendChild(js);
  }));

  document.querySelectorAll("[data-book]").forEach(a => {
    a.href = BOOKING_URL;
    if (!CALENDLY_URL) return;
    a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("click", e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let new-tab clicks through
      e.preventDefault();
      loadCalendly()
        .then(C => C.initPopupWidget({ url: CALENDLY_URL + (CALENDLY_URL.includes("?") ? "&" : "?") + "hide_gdpr_banner=1&background_color=10204a&text_color=f7ebcb&primary_color=e3b95b" }))
        .catch(() => window.open(CALENDLY_URL, "_blank", "noopener"));
    });
  });
  document.getElementById("year").textContent = new Date().getFullYear();

  // Top bar background after the hero
  const bar = document.querySelector(".topbar");
  const onScroll = () => bar.classList.toggle("scrolled", window.scrollY > window.innerHeight * 0.6);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Explore menu
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  const setMenu = open => { menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", e => { e.stopPropagation(); setMenu(menu.hidden); });
  menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("click", e => { if (!menu.hidden && !menu.contains(e.target)) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  // On phones and tablets, start the scroller centred on the building
  const scroller = document.getElementById("heroScroll");
  const BUILDING_CENTRE = 0.68; // share of the drawing's width
  const centre = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    if (max > 0) scroller.scrollLeft = Math.min(max, Math.max(0, scroller.scrollWidth * BUILDING_CENTRE - scroller.clientWidth / 2));
  };
  const heroImg = document.querySelector(".scene-img");
  heroImg.complete ? centre() : heroImg.addEventListener("load", centre);
  window.addEventListener("resize", centre);

  // "Discovered" counter: each section you reach lights up the badge
  const toast = document.getElementById("toast");
  const found = document.getElementById("found");
  const sections = [...document.querySelectorAll("[data-discover]")];
  document.getElementById("total").textContent = sections.length;
  const seen = new Set();
  let toastTimer;
  const say = msg => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), Math.max(2200, msg.length * 55));
  };
  const badge = document.querySelector(".badge");
  const discover = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting || seen.has(en.target.id)) return;
      seen.add(en.target.id);
      found.textContent = seen.size;
      badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
      document.querySelectorAll(`.spot[href="#${en.target.id}"]`).forEach(s => s.classList.add("seen"));
      if (seen.size === sections.length) say("All 6 nodes online. Ready to build something? Book a call ⚡");
      else if (seen.size === 1) say("Node 1 of 6 online. Keep exploring.");
    });
  }, { threshold: 0.25 });
  sections.forEach(s => discover.observe(s));

  // Hidden easter eggs in the HQ
  const eggs = [...document.querySelectorAll(".egg")];
  const eggsFound = new Set();
  eggs.forEach((egg, i) => egg.addEventListener("click", () => {
    eggsFound.add(i);
    egg.classList.add("found");
    if (eggsFound.size === eggs.length) say(egg.dataset.egg + " That's all " + eggs.length + " secrets found ⚡");
    else say(egg.dataset.egg + " (" + eggsFound.size + "/" + eggs.length + " secrets)");
  }));

  // Gentle reveal on scroll
  const items = document.querySelectorAll(".section-head, .card, .services, .steps li, .chips, .about-photo, .about-text, .contact-card");
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); reveal.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach((el, i) => { el.classList.add("reveal"); el.style.transitionDelay = (i % 4) * 80 + "ms"; reveal.observe(el); });

  // Background music: a soft synth loop made live in the browser (no audio file to download).
  // Browsers only allow sound after a click, so it starts from the speaker button.
  const soundBtn = document.getElementById("soundBtn");
  const music = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const BPM = 92, STEP = 60 / BPM / 4;
    // Am9, Fmaj7, Cmaj7, G6: two bars each
    const CHORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [48, 52, 55, 59, 64], [55, 59, 62, 64, 67]];
    const BASS = [45, 41, 36, 43];
    const ARP = [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 2, 3, 1, 4, 2];
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    let ctx, master, send, noise, timer, step = 0, next = 0, on = false;

    function setup() {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp); comp.connect(ctx.destination);
      const delay = ctx.createDelay(1); delay.delayTime.value = STEP * 3;
      const fb = ctx.createGain(); fb.gain.value = 0.38;
      const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 2400;
      send = ctx.createGain(); send.gain.value = 0.5;
      send.connect(delay); delay.connect(tone); tone.connect(fb); fb.connect(delay); tone.connect(master);
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    function env(g, t, a, peak, hold, rel) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.setValueAtTime(peak, t + a + hold);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
    }
    function pad(notes, t, dur) {
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 2;
      f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(1300, t + dur * 0.5); f.frequency.linearRampToValueAtTime(600, t + dur);
      const g = ctx.createGain(); env(g, t, 0.9, 0.05, dur - 1.6, 1.2);
      f.connect(g); g.connect(master);
      notes.slice(0, 4).forEach(n => [-7, 7].forEach(cents => {
        const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = hz(n); o.detune.value = cents;
        o.connect(f); o.start(t); o.stop(t + dur + 0.2);
      }));
    }
    function pluck(n, t, level) {
      const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = hz(n);
      const g = ctx.createGain(); env(g, t, 0.005, level, 0.02, 0.28);
      o.connect(g); g.connect(master); g.connect(send); o.start(t); o.stop(t + 0.4);
    }
    function bass(n, t) {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = hz(n);
      const g = ctx.createGain(); env(g, t, 0.01, 0.16, STEP * 3, 0.25);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + STEP * 4 + 0.3);
    }
    function kick(t) {
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      const g = ctx.createGain(); env(g, t, 0.003, 0.32, 0.02, 0.28);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.4);
    }
    function hat(t, level) {
      const s = ctx.createBufferSource(); s.buffer = noise;
      const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7500;
      const g = ctx.createGain(); env(g, t, 0.002, level, 0.005, 0.05);
      s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.1);
    }
    function tick() {
      while (next < ctx.currentTime + 0.15) {
        const bar = Math.floor(step / 16), s = step % 16, ci = Math.floor(bar / 2) % 4;
        const chord = CHORDS[ci];
        if (s === 0 && bar % 2 === 0) pad(chord, next, STEP * 32);
        if (s % 2 === 0 || s === 7 || s === 15) pluck(chord[ARP[s]] + 12, next, s % 4 === 0 ? 0.07 : 0.045);
        if (s === 0 || s === 6 || s === 10) bass(BASS[ci] + (s === 10 ? 12 : 0), next);
        if (bar >= 2 && (s === 0 || s === 8 || (s === 11 && bar % 4 === 3))) kick(next);
        if (bar >= 2 && s % 4 === 2) hat(next, 0.035);
        if (bar >= 4 && s % 2 === 1) hat(next, 0.012);
        next += STEP; step++;
      }
    }
    return {
      get on() { return on; },
      start() {
        if (!ctx) setup();
        ctx.resume();
        if (!timer) { next = ctx.currentTime + 0.05; timer = setInterval(tick, 25); }
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.6);
        on = true;
      },
      stop() {
        if (!ctx) return;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
        on = false;
        setTimeout(() => { if (!on) { clearInterval(timer); timer = null; ctx.suspend(); } }, 1200);
      },
      pause() { if (ctx && on) ctx.suspend(); },
      resume() { if (ctx && on) ctx.resume(); }
    };
  })();

  const store = { get: () => { try { return localStorage.getItem("hq-sound"); } catch (e) { return null; } },
                  set: v => { try { localStorage.setItem("hq-sound", v); } catch (e) {} } };
  const paint = () => {
    soundBtn.setAttribute("aria-pressed", String(music.on));
    soundBtn.setAttribute("aria-label", music.on ? "Mute background music" : "Play background music");
  };
  if (!music) soundBtn.hidden = true;
  else {
    soundBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (music.on) { music.stop(); store.set("off"); }
      else { music.start(); store.set("on"); say("♪ HQ radio on. Tap the speaker again to mute."); }
      paint();
    });
    // If they turned music on last visit, resume it on their first tap anywhere
    if (store.get() === "on") {
      const resume = e => {
        if (e.target.closest && e.target.closest("#soundBtn")) return;
        if (!music.on) { music.start(); paint(); }
      };
      document.addEventListener("pointerdown", resume, { once: true });
    }
    document.addEventListener("visibilitychange", () => document.hidden ? music.pause() : music.resume());
  }
})();
