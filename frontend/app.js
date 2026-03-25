let running = false;
let total = 0;
let startTime = 0;
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

async function loop() {
  if (!running) return;

  const res = await fetch("/api/chunk");
  const blob = await res.blob();

  total += blob.size;

  const seconds = (Date.now() - startTime) / 1000;
  const speed = total / seconds;

  updateUI(total, speed);
  animate();

  setTimeout(loop, 100);
}

function updateUI(bytes, speed) {
  const gb = (bytes / 1e9).toFixed(2);
  const mbps = ((speed * 8) / 1e6).toFixed(2);

  counter.innerText = `${gb} GB | ${mbps} Mbps`;
}

function animate() {
  const icons = ["🍒","🍋","💎","7️⃣","🍀"];
  document.querySelectorAll(".slot").forEach(el => {
    el.innerText = icons[Math.floor(Math.random()*icons.length)];
  });
}

function start() {
  running = true;
  startTime = Date.now();
  loop();
}

function stop() {
  running = false;
}
