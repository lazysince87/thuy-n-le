import { items } from './data.js';
import { icon, renderDetail } from './render.js';
import { hats } from './crewmate.js';

document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});
document.getElementById('year').textContent=new Date().getFullYear();
const stage=document.getElementById('avatar-stage');
const avatar=document.getElementById('avatar-button');
const speech=document.getElementById('crew-speech');
const status=document.getElementById('status-message');
const storageKey='thuy-crewmate-profile-v1';
const palette={red:['#d92936','#9b142b'],cyan:['#51c8df','#2788a8'],purple:['#8463c5','#523591'],yellow:['#f6d351','#c69b32'],lime:['#91cb4c','#5e8e32'],pink:['#ed91b9','#b15282']};
let saved={};
try{const value=JSON.parse(localStorage.getItem(storageKey)||'{}');if(value&&typeof value==='object')saved=value;}catch{}
const preferences={hat:Object.hasOwn(hats,saved.hat)?saved.hat:'duck',color:Object.hasOwn(palette,saved.color)?saved.color:'red',outfit:saved.outfit==='space'?'space':'suit'};
const visited=new Set(Array.isArray(saved.visited)?saved.visited.filter(id=>items.some(item=>item.id===id)):[]);
const persist=()=>{try{localStorage.setItem(storageKey,JSON.stringify({...preferences,visited:[...visited]}));}catch{}};
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let sound=false,audioContext;
function beep(frequency=540){
 if(!sound)return;
 try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,audioContext.currentTime);oscillator.frequency.exponentialRampToValueAtTime(frequency*.7,audioContext.currentTime+.08);gain.gain.setValueAtTime(.025,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.12);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+.12);}catch{}
}
let speechTimer;
function say(text){clearTimeout(speechTimer);speech.textContent=String(text).toLowerCase();speech.classList.add('visible');speechTimer=setTimeout(()=>speech.classList.remove('visible'),2300);}
const effectTimers=new Map();
function effect(name,duration){clearTimeout(effectTimers.get(name));stage.classList.remove(name);requestAnimationFrame(()=>{stage.classList.add(name);effectTimers.set(name,setTimeout(()=>stage.classList.remove(name),duration));});}
function syncAvatar(){
 const [color,shadow]=palette[preferences.color];
 stage.style.setProperty('--crew-color',color);stage.style.setProperty('--crew-shadow',shadow);stage.dataset.outfit=preferences.outfit;
 stage.querySelector('.crew-hat').innerHTML=hats[preferences.hat];
 stage.querySelector('.crewmate').setAttribute('aria-label',`${preferences.color} crewmate wearing ${preferences.outfit==='suit'?'a suit':'a space suit'}${preferences.hat==='none'?'':` and a ${preferences.hat} hat`}`);
 stage.querySelector('.stage-coordinate').textContent=preferences.color.toUpperCase()+' · 01';
 for(const name of ['hat','color','outfit'])document.querySelectorAll(`button[data-${name}]`).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset[name]===preferences[name])));
}
syncAvatar();
function setupTabs(selector,key,prefix,onSelect){
 const buttons=[...document.querySelectorAll(selector)];
 function activate(button,focus=false){buttons.forEach(other=>{const active=other===button;other.setAttribute('aria-selected',String(active));other.tabIndex=active?0:-1;document.getElementById(prefix+other.dataset[key]).hidden=!active;});if(focus)button.focus();onSelect?.(button.dataset[key]);}
 buttons.forEach((button,index)=>{
  button.addEventListener('click',()=>{activate(button);beep(460);});
  button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index-1+buttons.length)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();activate(buttons[next],true);buttons[next].scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});beep(460);});
 });
}
setupTabs('[data-tab]','tab','panel-',()=>{requestAnimationFrame(drawWires);});
setupTabs('[data-wardrobe]','wardrobe','options-');
document.querySelectorAll('button[data-hat],button[data-color],button[data-outfit]').forEach(button=>button.addEventListener('click',()=>{
 const name=['hat','color','outfit'].find(key=>button.dataset[key]!==undefined);
 preferences[name]=button.dataset[name];syncAvatar();persist();effect('equipping',650);beep(680);
 const messages={hat:{duck:'Quack. Professionally.',sprout:'Growth mindset.',cone:'Work in progress.',none:'Fresh out of hats.'},outfit:{suit:'Business crewmate.',space:'Ready for launch.'}};
 say(name==='color'?(preferences.color==='red'?'Red. The usual.':`Trying ${preferences.color}.`):messages[name][preferences[name]]);
}));
let waveCount=0;
avatar.addEventListener('click',()=>{effect('waving',1300);say(['Hey, I’m Thuy!','Definitely here to build.','Nice to meet you, crewmate.'][waveCount++%3]);beep(750);});
stage.addEventListener('pointermove',event=>{if(reducedMotion.matches)return;const rect=stage.getBoundingClientRect();stage.style.setProperty('--visor-x',`${((event.clientX-rect.left)/rect.width-.5)*4}px`);stage.style.setProperty('--visor-y',`${((event.clientY-rect.top)/rect.height-.5)*3}px`);});
stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--visor-x','0px');stage.style.setProperty('--visor-y','0px');});
const ventButton=document.getElementById('vent-button');
ventButton.addEventListener('click',()=>{
 if(ventButton.disabled)return;
 if(reducedMotion.matches){say('A quick trip through the vents.');beep(240);return;}
 ventButton.disabled=true;avatar.disabled=true;effect('venting',1850);speech.classList.remove('visible');beep(240);
 setTimeout(()=>{ventButton.disabled=false;avatar.disabled=false;say('Back to building.');beep(580);},1850);
});
function syncMotion(){document.body.classList.toggle('motion-off',reducedMotion.matches);}
syncMotion();reducedMotion.addEventListener('change',syncMotion);
const soundButton=document.getElementById('sound-button');
soundButton.addEventListener('click',()=>{sound=!sound;soundButton.setAttribute('aria-pressed',String(sound));soundButton.innerHTML=`${icon('sound')} Sound ${sound?'on':'off'}`;beep(640);});

function updateProgress(){
 document.getElementById('explored-count').textContent=`${visited.size} / ${items.length}`;
 document.getElementById('explored-fill').style.width=`${visited.size/items.length*100}%`;
 document.getElementById('explored-progress').setAttribute('aria-valuenow',String(visited.size));
 document.getElementById('explored-hint').textContent=visited.size===items.length?'All tasks complete. Thanks for getting to know me!':'Open a card to get the full story.';
 document.querySelectorAll('[data-detail]').forEach(button=>button.classList.toggle('visited',visited.has(button.dataset.detail)));
}
updateProgress();
const dialog=document.getElementById('detail-dialog');
let previousFocus;
function openDialog(html,trigger){previousFocus=trigger;document.getElementById('dialog-content').innerHTML=html;dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;dialog.querySelector('.dialog-close').focus();beep(400);}
document.querySelectorAll('[data-detail]').forEach(button=>button.addEventListener('click',()=>{
 const item=items.find(item=>item.id===button.dataset.detail);if(!item)return;
 visited.add(item.id);updateProgress();persist();openDialog(renderDetail(item),button);
}));
document.getElementById('about-button').addEventListener('click',event=>openDialog(`<div class="detail-body"><p class="eyebrow">Behind the visor</p><div class="about-photo"><img src="/assets/portrait.webp" alt="Thuy Le" width="84" height="84"><div><h2 id="detail-title">Hi, I’m Thuy.</h2><p class="detail-subtitle">Software engineer · UF Computer Science</p></div></div><p class="about-copy">I love building things, figuring out why they break, and making them better. Currently at Fifth Third Bank; previously at Cloudflare and CACI.</p><p class="detail-description">B.S. in Computer Science, graduating May 2027. Minors in Mathematics and Digital Arts & Science, with a Certificate in AI.</p><a class="project-link" href="mailto:lecrystal1808@gmail.com">Let’s connect ${icon('arrow-up-right')}</a></div>`,event.currentTarget));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');previousFocus?.focus();});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});

let selectedWire=null;
const connected=new Set();
const board=document.getElementById('wire-board');
const wireButtons=[...document.querySelectorAll('[data-wire]')];
function updateWires(){
 wireButtons.forEach(button=>{const done=connected.has(button.dataset.wire),selected=button.classList.contains('wire-left')&&button.dataset.wire===selectedWire;button.classList.toggle('connected',done);button.classList.toggle('selected',selected&&!done);button.setAttribute('aria-pressed',String(done||selected));button.disabled=done;});
 document.getElementById('wire-progress').textContent=`${connected.size} / 3`;
 if(connected.size===3){document.getElementById('wire-hint').textContent='Task complete. Systems are online!';say('Task complete!');beep(900);}else document.getElementById('wire-hint').textContent=selectedWire?'Now select its matching tool.':'Select a language, then its matching tool.';
 drawWires();
}
function drawWires(){
 const rect=board.getBoundingClientRect();if(!rect.width)return;
 const lines=document.getElementById('wire-lines');lines.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);lines.innerHTML='';
 for(const id of connected){const start=board.querySelector(`.wire-left[data-wire="${id}"] .wire-plug`).getBoundingClientRect(),end=board.querySelector(`.wire-right[data-wire="${id}"] .wire-plug`).getBoundingClientRect();const x1=start.x+start.width/2-rect.x,y1=start.y+start.height/2-rect.y,x2=end.x+end.width/2-rect.x,y2=end.y+end.height/2-rect.y;const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',`M${x1} ${y1} C${x1+50} ${y1},${x2-50} ${y2},${x2} ${y2}`);path.setAttribute('class',`wire-line ${id}`);lines.appendChild(path);}
}
wireButtons.forEach(button=>button.addEventListener('click',()=>{
 const id=button.dataset.wire;
 if(button.classList.contains('wire-left')){selectedWire=selectedWire===id?null:id;updateWires();beep(500);return;}
 if(!selectedWire){document.getElementById('wire-hint').textContent='Choose a language on the left first.';return;}
 if(selectedWire!==id){document.getElementById('wire-hint').textContent='Those don’t connect. Try another tool.';status.textContent='Those don’t connect. Try another tool.';beep(180);return;}
 connected.add(id);selectedWire=null;status.textContent=`Connection made. ${connected.size} of 3 wires fixed.`;updateWires();beep(700);
}));
document.getElementById('reset-wires').addEventListener('click',()=>{selectedWire=null;connected.clear();status.textContent='Wiring task reset.';updateWires();});
new ResizeObserver(drawWires).observe(board);
