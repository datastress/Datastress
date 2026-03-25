let running = false;
let totalBytes = 0;
let sessionBytes = 0;
let sessionStart = 0;
let loopTimeout = null;
let token = null;
let freeLimit = 50 * 1024 * 1024; // 50 MB free session
let history = []; // store user consumption

async function loop() {
  if (!running) return;

  try {
    const res = await fetch("/api/chunk");
    const blob = await res.blob();

    totalBytes += blob.size;
    sessionBytes += blob.size;

    if (sessionBytes >= freeLimit) {
      running = false;
      showUpgradePopup();
      return;
    }

    const elapsed = (Date.now() - sessionStart) / 1000;
    const speed = sessionBytes / elapsed;

    updateUI(totalBytes, speed);
    animateSlots();

    loopTimeout = setTimeout(loop, 50);
  } catch (err) {
    console.error("Loop error:", err);
    loopTimeout = setTimeout(loop, 1000);
  }
}

function updateUI(bytes, speed) {
  let value, unit;
  if (bytes > 1e9) { value=(bytes/1e9).toFixed(2); unit="GB"; }
  else if (bytes > 1e6) { value=(bytes/1e6).toFixed(2); unit="MB"; }
  else { value=(bytes/1e3).toFixed(2); unit="KB"; }

  const mbps = ((speed*8)/1e6).toFixed(2);
  document.getElementById("counter").innerText = `${value} ${unit} | ${mbps} Mbps`;
}

function animateSlots() {
  const icons = ["🍒","🍋","💎","7️⃣","🍀","🔥"];
  document.querySelectorAll(".slot").forEach(el => {
    el.innerText = icons[Math.floor(Math.random()*icons.length)];
  });
}

function start() {
  if (running) return;
  running = true;
  sessionBytes = 0;
  sessionStart = Date.now();
  loop();
}

function stop() {
  running = false;
  clearTimeout(loopTimeout);
}

function showUpgradePopup() {
  document.getElementById("upgradePopup").style.display = "block";
}

function goPremium() {
  alert("Premium purchase placeholder - integrate Stripe/PayPal here");
}

// ==================
// LOGIN / REGISTER
// ==================
async function register() {
  await fetch("/api/register", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email:document.getElementById("email").value,
      password:document.getElementById("password").value
    })
  });
  alert("Registered");
}

async function login() {
  const res = await fetch("/api/login", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email:document.getElementById("email").value,
      password:document.getElementById("password").value
    })
  });
  const data = await res.json();
  token = data.token;
  alert("Logged in");
}

// ==================
// Record user session history
// ==================
function saveHistory(userId, bytes) {
  history.push({user:userId, bytes:bytes, date:new Date()});
}
