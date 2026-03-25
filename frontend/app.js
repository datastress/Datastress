// ============================
// DataStress v2 - fix bugs
// ============================

// STATUS
let running = false;

// TOTAL
let totalBytes = 0;        // acumulado total desde início
let sessionBytes = 0;      // bytes na sessão atual

// TEMPO
let sessionStart = 0;

// LOOP TIMEOUT (para evitar loops duplicados)
let loopTimeout = null;

// ============================
// LOOP PRINCIPAL
// ============================
async function loop() {
  if (!running) return;

  try {
    const res = await fetch("/api/chunk");
    const blob = await res.blob();

    totalBytes += blob.size;
    sessionBytes += blob.size;

    const elapsed = (Date.now() - sessionStart) / 1000;
    const speed = sessionBytes / elapsed;

    updateUI(totalBytes, speed);
    animateSlots();

    // NEXT LOOP
    loopTimeout = setTimeout(loop, 50);
  } catch (err) {
    console.error("Erro no loop:", err);
    loopTimeout = setTimeout(loop, 1000); // tenta de novo
  }
}

// ============================
// ATUALIZA UI
// ============================
function updateUI(bytes, speed) {
  let value, unit;

  if (bytes > 1e9) {
    value = (bytes / 1e9).toFixed(2);
    unit = "GB";
  } else if (bytes > 1e6) {
    value = (bytes / 1e6).toFixed(2);
    unit = "MB";
  } else {
    value = (bytes / 1e3).toFixed(2);
    unit = "KB";
  }

  // Mbps real
  const mbps = ((speed * 8) / 1e6).toFixed(2);

  counter.innerText = `${value} ${unit} | ${mbps} Mbps`;
}

// ============================
// SLOT MACHINE ANIMATION
// ============================
function animateSlots() {
  const icons = ["🍒","🍋","💎","7️⃣","🍀","🔥"];
  document.querySelectorAll(".slot").forEach(el => {
    el.innerText = icons[Math.floor(Math.random() * icons.length)];
  });
}

// ============================
// CONTROLES START / STOP
// ============================
function start() {
  if (running) return; // evita start duplo

  running = true;
  sessionBytes = 0;
  sessionStart = Date.now();

  loop();
}

function stop() {
  running = false;
  clearTimeout(loopTimeout); // garante que não continua rodando
}

// ============================
// LOGIN / REGISTER (BASE)
// ============================
let token = null;

async function register() {
  await fetch("/api/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });
  alert("Registered");
}

async function login() {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();
  token = data.token;

  alert("Logged in");
}
