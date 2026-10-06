// The exam start date is kept here so it is easy to confirm or change.
const EXAM_DATE = new Date(2026, 9, 22, 0, 0, 0); // October 22, 2026 (local time)
const STORAGE = { days: "closer-home-days-v1", tally: "closer-home-tally-v1", tallyDate: "closer-home-tally-date-v1" };

// Edit this array to change the daily encouragement cards.
const BOOSTS = [
  "You've survived every exam you've ever taken. This one's not going to be the exception.",
  "You don't need to feel confident to start. Confidence is going to show up around day 3, not day 1. Just start.",
  "Future-you, on the 23rd, is going to be so proud of today-you for not giving up on an hour that felt hard.",
  "You are not behind. You are exactly where you are, and that's a fine place to begin from.",
  "Every page you read today is one less page standing between you and walking through your front door.",
  "You've got this one specific superpower: you always show up eventually. Today's a good day to show up early instead.",
  "Nobody aces an exam by feeling motivated 100% of the time. They ace it by showing up on the 60% days too. This can be a 60% day. That's still a day that counts.",
  "I'm not worried about whether you'll pass. I'm just excited to see how you surprise yourself this time."
];

const DAY_MS = 86400000;
const today = new Date();
today.setHours(0, 0, 0, 0);
const daysLeft = Math.max(0, Math.ceil((EXAM_DATE - today) / DAY_MS));
const studyDays = Math.max(0, Math.ceil((EXAM_DATE - today) / DAY_MS));
document.querySelector("#days-left").textContent = daysLeft;
document.querySelector("#home-days").textContent = daysLeft;
document.querySelector("#progress-caption").textContent = `${studyDays} days of studying. Then a lifetime of being done with this particular stress.`;
document.querySelector("#date-note").textContent = daysLeft === 0 ? "October 22nd is here — you've made it." : "until October 22nd";

function readDays() { try { return JSON.parse(localStorage.getItem(STORAGE.days) || "[]"); } catch { return []; } }
function localDateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.querySelector("#celebration");
  const colors = ["#ec785f", "#f4bf58", "#91b994", "#e9a6a0", "#d9a8d5"];
  for (let i = 0; i < 18; i++) {
    const bit = document.createElement("i"); bit.className = "confetti";
    bit.style.setProperty("--x", `${48 + Math.random() * 8}%`); bit.style.setProperty("--y", `${42 + Math.random() * 10}%`);
    bit.style.setProperty("--dx", `${(Math.random() - .5) * 180}px`); bit.style.setProperty("--c", colors[i % colors.length]); layer.append(bit);
    setTimeout(() => bit.remove(), 1000);
  }
}
function renderPath() {
  const path = document.querySelector("#day-path"); path.replaceChildren();
  const marked = readDays();
  for (let i = 0; i < studyDays; i++) {
    const button = document.createElement("button");
    const date = new Date(today); date.setDate(date.getDate() + i);
    const dateKey = localDateKey(date);
    button.className = `day-marker${marked.includes(dateKey) ? " done" : ""}`;
    button.textContent = marked.includes(dateKey) ? "✓" : "☀";
    button.setAttribute("aria-label", `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}${marked.includes(dateKey) ? ", complete" : ", mark complete"}`);
    button.setAttribute("aria-pressed", String(marked.includes(dateKey)));
    button.addEventListener("click", () => {
      const updated = readDays();
      if (updated.includes(dateKey)) return;
      updated.push(dateKey); localStorage.setItem(STORAGE.days, JSON.stringify(updated));
      button.classList.add("done"); button.textContent = "✓"; button.setAttribute("aria-pressed", "true"); confetti(); updateProgress();
    }); path.append(button);
  }
  updateProgress();
}
function updateProgress() {
  const count = readDays().length, pct = studyDays ? Math.round(count / studyDays * 100) : 100;
  document.querySelector("#progress-count").textContent = `${count} ${count === 1 ? "day" : "days"} marked`;
  document.querySelector("#progress-percent").textContent = `${pct}%`;
  document.querySelector("#progress-fill").style.width = `${pct}%`;
}
renderPath();

// Stable daily selection, with a manual next-card cycle on tap.
let boostIndex = Math.floor(new Date().setHours(0, 0, 0, 0) / DAY_MS) % BOOSTS.length;
const boostCard = document.querySelector("#boost-card");
function showBoost() { boostCard.classList.remove("shuffle"); void boostCard.offsetWidth; boostCard.classList.add("shuffle"); document.querySelector("#boost-line").textContent = BOOSTS[boostIndex]; }
showBoost();
boostCard.addEventListener("click", () => { boostIndex = (boostIndex + 1) % BOOSTS.length; showBoost(); });

// Pomodoro timer: completion starts a 5-minute break, which can also be reset or paused.
const timerDisplay = document.querySelector("#timer-display"), timerToggle = document.querySelector("#timer-toggle"), timerFeedback = document.querySelector("#timer-feedback");
let timerSeconds = 25 * 60, timerId = null, onBreak = false;
function drawTimer() { timerDisplay.textContent = `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`; }
function finishTimer() {
  clearInterval(timerId); timerId = null;
  if (!onBreak) { timerFeedback.textContent = "That's one. You're already better at this than you were 25 minutes ago."; confetti(); onBreak = true; timerSeconds = 5 * 60; timerToggle.textContent = "Start break"; }
  else { timerFeedback.textContent = "Break's done. Take all the time you need before another round."; onBreak = false; timerSeconds = 25 * 60; timerToggle.textContent = "Start focus"; }
  drawTimer();
}
timerToggle.addEventListener("click", () => {
  if (timerId) { clearInterval(timerId); timerId = null; timerToggle.textContent = onBreak ? "Resume break" : "Resume focus"; timerFeedback.textContent = "Paused. Pick it back up whenever you like."; }
  else { timerToggle.textContent = "Pause"; timerFeedback.textContent = onBreak ? "A little break, just for you." : "One thing at a time. You've got this."; timerId = setInterval(() => { timerSeconds--; drawTimer(); if (timerSeconds <= 0) finishTimer(); }, 1000); }
});
document.querySelector("#timer-reset").addEventListener("click", () => { clearInterval(timerId); timerId = null; onBreak = false; timerSeconds = 25 * 60; timerToggle.textContent = "Start focus"; timerFeedback.textContent = "Your pace. Your call."; drawTimer(); });
drawTimer();

// Pages reset each local calendar day and persist in this browser only.
const todayKey = localDateKey(new Date());
if (localStorage.getItem(STORAGE.tallyDate) !== todayKey) { localStorage.setItem(STORAGE.tallyDate, todayKey); localStorage.setItem(STORAGE.tally, "0"); }
let tally = Math.max(0, Number(localStorage.getItem(STORAGE.tally)) || 0);
function drawTally() { document.querySelector("#tally-count").textContent = tally; localStorage.setItem(STORAGE.tally, String(tally)); }
drawTally();
document.querySelector("#tally-add").addEventListener("click", () => { tally++; drawTally(); const card = document.querySelector(".tally-card"); card.classList.remove("milestone"); void card.offsetWidth; if (tally % 5 === 0) { card.classList.add("milestone"); document.querySelector("#tally-feedback").textContent = `Five more pages, one lovely little milestone. (${tally} total)`; confetti(); } else document.querySelector("#tally-feedback").textContent = "Look at you, making your way through."; });
document.querySelector("#tally-subtract").addEventListener("click", () => { tally = Math.max(0, tally - 1); drawTally(); document.querySelector("#tally-feedback").textContent = "Adjusted. Your progress belongs to you."; });
document.querySelector("#remind-button").addEventListener("click", (event) => { const note = document.querySelector("#reminder-note"); note.hidden = !note.hidden; event.currentTarget.firstChild.textContent = note.hidden ? "Remind me why " : "Keep this close "; event.currentTarget.setAttribute("aria-expanded", String(!note.hidden)); });

// Change [your name] in the footer of index.html to personalize the sign-off.
