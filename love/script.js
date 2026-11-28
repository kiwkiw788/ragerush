/* ============================================================
   จดหมายสำหรับคุณ — แก้ไขข้อความตรงนี้ได้เลย 💌
   ============================================================ */
const CONFIG = {
  herName: "ที่รัก",        // ชื่อของคนรับจดหมาย
  yourName: "เรา คนที่รักคุณที่สุด", // ชื่อของคนเขียน (เรียกตัวเองว่า "เรา")
  lines: [                  // ข้อความในจดหมาย (เพิ่ม/ลดได้)
    "สุขสันต์ครบรอบ2ปี2เดือนนะ",
    "รักคุณที่สุด",
    "ขอให้อยู่กับเราไปนานๆเลยนะ",
    "รักที่สุดในโลก",
    "คิดถึงมากๆด้วย",
    "ขอให้แฟนมีความสุขยิ้มเยอะๆทุกวันเราก็มีความสุขตาม"
  ],
  finalLine: "จุ้บๆ คนน่ารัก"
};

/* ---------------- ตัวแปร ---------------- */
const $ = (id) => document.getElementById(id);
const envelope = $("envelope");
const stage = $("stage");
const tapHint = $("tapHint");
const lead = $("lead");
const progress = $("progress");
const letterLayer = $("letterLayer");
const paperBody = $("paperBody");
const paperSign = $("paperSign");
const heartsLayer = $("heartsLayer");
const soundToggle = $("soundToggle");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const TAPS_TO_OPEN = 3;
const HINT = ["แตะที่ซอง ∼ 3 ครั้ง", "อีก 2 ครั้งนะ~ ♡", "อีก 1 ครั้ง... ♥", "กำลังเปิดจดหมาย..."];
let taps = 0;
let soundOn = true;
let audioCtx = null;

/* ---------------- เสียงเบา ๆ (ไม่มีไฟล์เสียงภายนอก) ---------------- */
function tone(freq, duration = 0.12, delay = 0, gain = 0.05) {
  if (!soundOn) return;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const vol = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    vol.gain.setValueAtTime(0.0001, t);
    vol.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(vol).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  } catch (_) { /* เบราว์เซอร์บางตัวไม่รองรับ — ไม่เป็นไร */ }
}

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "🔊" : "🔇";
  soundToggle.setAttribute("aria-pressed", String(soundOn));
  if (soundOn) tone(880, 0.1);
});

/* ---------------- หัวใจพื้นหลัง ---------------- */
(function makeSky() {
  const sky = $("sky");
  const chars = ["♥", "♡", "💗", "✦", "♥"];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 20; i++) {
    const s = document.createElement("span");
    s.textContent = chars[i % chars.length];
    s.style.left = (Math.random() * 96) + "%";
    s.style.setProperty("--size", (12 + Math.random() * 20) + "px");
    s.style.setProperty("--opacity", (0.2 + Math.random() * 0.4).toFixed(2));
    s.style.setProperty("--duration", (13 + Math.random() * 15) + "s");
    s.style.setProperty("--delay", (-Math.random() * 20) + "s");
    frag.appendChild(s);
  }
  sky.appendChild(frag);
})();

/* ---------------- เอฟเฟกต์หัวใจ ---------------- */
function burstAt(x, y, count = 26) {
  const glyphs = ["♥", "💗", "♡", "✦", "💕"];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const h = document.createElement("span");
    h.className = "heart-bit";
    h.textContent = glyphs[i % glyphs.length];
    h.style.left = x + "px";
    h.style.top = y + "px";
    h.style.setProperty("--x", (Math.random() * 560 - 280) + "px");
    h.style.setProperty("--y", (-120 - Math.random() * 380) + "px");
    h.style.setProperty("--r", (Math.random() * 360 - 180) + "deg");
    h.style.setProperty("--k", (0.7 + Math.random() * 0.9).toFixed(2));
    h.style.setProperty("--s", (14 + Math.random() * 22) + "px");
    h.style.setProperty("--t", (1.3 + Math.random() * 1.1) + "s");
    frag.appendChild(h);
    setTimeout(() => h.remove(), 2700);
  }
  heartsLayer.appendChild(frag);
}

function floatHearts(count = 14) {
  const glyphs = ["♥", "💗", "♡", "💕"];
  for (let i = 0; i < count; i++) {
    const h = document.createElement("span");
    h.className = "heart-float";
    h.textContent = glyphs[i % glyphs.length];
    h.style.left = (12 + Math.random() * 76) + "%";
    h.style.top = (55 + Math.random() * 40) + "%";
    h.style.setProperty("--x", (Math.random() * 120 - 60) + "px");
    h.style.setProperty("--r", (Math.random() * 80 - 40) + "deg");
    h.style.setProperty("--s", (18 + Math.random() * 22) + "px");
    h.style.setProperty("--t", (1.6 + Math.random() * 1.5) + "s");
    heartsLayer.appendChild(h);
    setTimeout(() => h.remove(), 3400);
  }
}

/* ---------------- มินิเกม: เคาะซอง 3 ครั้ง ---------------- */
function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

envelope.addEventListener("click", () => {
  if (envelope.classList.contains("opened")) return;

  taps++;
  tone([660, 784, 988][taps - 1] || 660, 0.13);

  // สะบัดซอง
  envelope.classList.remove("tap-wiggle");
  void envelope.offsetWidth;
  envelope.classList.add("tap-wiggle");

  // หัวใจเล็ก ๆ ตอนเคาะ
  const c = centerOf(envelope);
  burstAt(c.x, c.y, 5);

  [...progress.children].forEach((p, i) => p.classList.toggle("on", i < taps));
  progress.setAttribute("aria-label", `เคาะไปแล้ว ${taps} จาก ${TAPS_TO_OPEN} ครั้ง`);
  tapHint.textContent = HINT[taps] || HINT[3];

  if (taps >= TAPS_TO_OPEN) openLetter();
});

function openLetter() {
  envelope.classList.add("opened");
  tone(523, 0.22, 0.05);
  tone(659, 0.22, 0.17);
  tone(784, 0.32, 0.29, 0.06);

  const delay = reduceMotion.matches ? 60 : 900;
  setTimeout(() => {
    renderLetter();
    letterLayer.hidden = false;
    document.body.classList.add("letter-open");
    lead.textContent = "เปิดอ่านได้เลยนะ 💗";
    envelope.classList.add("fade-out");
    const c = centerOf(paperBody);
    burstAt(c.x, Math.max(c.y, 120), reduceMotion.matches ? 8 : 32);
    $("hugBtn").focus({ preventScroll: true });
  }, delay);
}

/* ---------------- สารในจดหมาย ---------------- */
function renderLetter() {
  $("letterTo").textContent = CONFIG.herName;
  paperSign.textContent = `— ${CONFIG.yourName}`;
  paperBody.replaceChildren();

  const lines = [...CONFIG.lines, CONFIG.finalLine];
  lines.forEach((text, i) => {
    const p = document.createElement("p");
    p.textContent = text;
    if (i === lines.length - 1) p.className = "big";
    if (!reduceMotion.matches) p.style.animationDelay = (0.35 + i * 0.6) + "s";
    paperBody.appendChild(p);
  });
  if (!reduceMotion.matches) paperSign.style.animationDelay = (0.35 + lines.length * 0.6) + "s";
  else paperSign.style.animationDelay = "0s";
}

/* ---------------- ปุ่มในจดหมาย ---------------- */
$("hugBtn").addEventListener("click", () => {
  floatHearts(16);
  tone(880, 0.16);
  tone(1174, 0.2, 0.12, 0.04);
  const b = $("hugBtn");
  const old = b.textContent;
  b.textContent = "กอดอีกนะ! 💗";
  clearTimeout(b._reset);
  b._reset = setTimeout(() => { b.textContent = old; }, 1600);
});

$("replayBtn").addEventListener("click", () => {
  letterLayer.hidden = true;
  document.body.classList.remove("letter-open");
  taps = 0;
  [...progress.children].forEach((p) => p.classList.remove("on"));
  progress.setAttribute("aria-label", "เคาะไปแล้ว 0 จาก 3 ครั้ง");
  envelope.classList.remove("opened", "fade-out", "tap-wiggle");
  tapHint.textContent = HINT[0];
  lead.innerHTML = 'เคาะซองจดหมาย <strong>3 ครั้ง</strong> นะ<br>แล้วจะมีอะไรน่ารัก ๆ ให้ดู 💗';
  paperBody.replaceChildren();
  envelope.focus({ preventScroll: true });
});

/* กด Esc เพื่อปิดจดหมาย (สะดวกบน PC) */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !letterLayer.hidden) $("replayBtn").click();
});
