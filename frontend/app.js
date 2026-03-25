let running=false, totalBytes=0, sessionBytes=0, startTime=0, token=null, loopId=null;

function updateCounterUI(bytes,speed){
  let value, unit;
  if(bytes>1e9){value=(bytes/1e9).toFixed(2);unit="GB";}
  else if(bytes>1e6){value=(bytes/1e6).toFixed(2);unit="MB";}
  else{value=(bytes/1e3).toFixed(2);unit="KB";}
  const mbps = ((speed*8)/1e6).toFixed(2);
  document.getElementById("counter").innerText = `${value} ${unit} | ${mbps} Mbps`;
}

function animateSlots(){
  const icons=["🍒","🍋","💎","7️⃣","🍀","🔥"];
  document.querySelectorAll(".slot").forEach(el=>{
    el.innerText=icons[Math.floor(Math.random()*icons.length)];
  });
}

async function loop(){
  if(!running) return;
  try{
    const res = await fetch("/api/chunk",{headers:{Authorization:token}});
    const blob = await res.blob();
    totalBytes += blob.size;
    sessionBytes += blob.size;

    const elapsed=(Date.now()-startTime)/1000;
    const speed=sessionBytes/elapsed;
    updateCounterUI(totalBytes,speed);
    animateSlots();
    loopId=requestAnimationFrame(loop);
  } catch(e){
    console.error(e);
    setTimeout(loop,1000);
  }
}

function start(){
  if(running) return;
  running=true;
  sessionBytes=0;
  startTime=Date.now();
  loop();
}

function stop(){
  running=false;
  cancelAnimationFrame(loopId);
}

// Auth
async function register(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;
  await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  alert("Registered");
}

async function login(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;
  const res=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  const data=await res.json();
  token=data.token;
  alert("Logged in");
}

// Payments
function upgradeStripe(){ window.open("/api/premium/stripe","_blank"); }
function upgradePayPal(){ window.open("/api/premium/paypal","_blank"); }
function upgradeMBWay(){ window.open("/api/premium/mbway","_blank"); }
