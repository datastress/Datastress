let running = false;

let totalBytes = 0;        // total global
let sessionBytes = 0;      // sessão atual

let startTime = 0;
let sessionStart = 0;

async function loop() {
  if (!running) return;

  const res = await fetch("/api/chunk");
  const blob = await res.blob();

  totalBytes += blob.size;
  sessionBytes += blob.size;

  const elapsed = (Date.now() - sessionStart) / 1000;
  const speed = sessionBytes / elapsed;

  updateUI(totalBytes, speed);
  animateSlots();

  setTimeout(loop, 50);
}

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

  const mbps = ((speed * 8) / 1e6).toFixed(2);

  counter.innerText = `${value} ${unit} | ${mbps} Mbps`;
}

function animateSlots() {
  const icons = ["🍒","🍋","💎","7️⃣","🍀","🔥"];
  document.querySelectorAll(".slot").forEach(el => {
    el.innerText = icons[Math.floor(Math.random()*icons.length)];
  });
}

function start() {
  running = true;

  sessionBytes = 0;
  sessionStart = Date.now();

  loop();
}

function stop() {
  running = false;
}
