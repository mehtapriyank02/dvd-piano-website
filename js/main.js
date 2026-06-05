
function pick(items){return items[Math.floor(Math.random()*items.length)]}
function setText(id,value){const el=document.getElementById(id); if(el) el.textContent=value}
function $(id){return document.getElementById(id)}
function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
function load(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
function beep(freq=440,duration=.18,type='sine'){
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  const ctx=new AC(), osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type=type; osc.frequency.value=freq; gain.gain.value=.12;
  gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+duration);
}
