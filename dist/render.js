import { items, skillGroups } from './data.js';

export const escape = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
  home:'<path d="m3 10 9-7 9 7v10H7V10m3 10v-7h4v7"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7h.01M11 17v-7m0 3c0-4 6-4 6 0v4"/>',
  github:'<path d="M9 20c-5 1-5-2-7-2m14 4v-4a4 4 0 0 0-1-3c4-.5 7-2 7-6a5 5 0 0 0-1.5-3.5A5 5 0 0 0 20 2s-1.5 0-4 2a13 13 0 0 0-8 0C5.5 2 4 2 4 2a5 5 0 0 0-.5 3.5A5 5 0 0 0 2 9c0 4 3 5.5 7 6a4 4 0 0 0-1 3v4"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  'arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  task:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h4"/>',
  education:'<path d="m2 9 10-5 10 5-10 5-10-5m4 3v6c4 3 8 3 12 0v-6m4-3v8"/>',
  code:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>',
  bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
  sound:'<path d="M4 9h4l5-4v14l-5-4H4Zm13-1c3 2 3 6 0 8"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  play:'<path d="M8 5.5 19 12 8 18.5Z" fill="currentColor" stroke="none"/>'
};
export const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.chevron}</svg>`;
const labels={'fifth-third':'Internship',ta:'Teaching',education:'Education',quant:'Leadership',cloudflare:'Internship',caci:'Internship',sase:'Leadership',elite:'Development',freelance:'Freelance'};
const projectStacks={diary:['React','Gemini','RAG'],kubecomic:['Node.js','Kubernetes','Docker'],brokebites:['React Native','Spring Boot','MongoDB'],advisor:['Go','Python','RAG']};
const stack=genres=>`<p class="detail-stack">${genres.map(escape).join(' · ')}</p>`;
function body(item) {
 return `<div class="entry-details"><ul>${item.bullets.map(b=>`<li>${escape(b)}</li>`).join('')}</ul>${stack(item.genres)}${item.url?`<a class="project-link" href="${item.url}" target="_blank" rel="noopener noreferrer">${escape(item.linkLabel)} ${icon('arrow-up-right')}</a>`:''}</div>`;
}
function tile(item){
 const project=item.category==='projects';
 const subtitle=project?projectStacks[item.id].join(' · '):item.subtitle;
 return `<button type="button" class="task-card" data-detail="${item.id}" aria-haspopup="dialog" aria-controls="detail-dialog"><span class="task-card-top"><span class="task-symbol" aria-hidden="true">${icon(project?'code':item.id==='education'?'education':'task')}</span><span class="task-kind">${project?'Project':labels[item.id]||'Leadership'}</span><span class="task-check" data-check="${item.id}" aria-hidden="true">${icon('check')}</span></span><strong>${escape(item.title)}</strong><span class="task-role">${escape(subtitle)}</span><span class="task-bottom"><span>${escape(item.date)}</span>${icon('arrow-up-right')}</span></button>`;
}
function panel(id,title,list,subtitle){return `<section class="content-panel" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${id==='current'?'':' hidden'}><div class="panel-heading"><div><p class="eyebrow">${subtitle}</p><h2>${title}</h2></div><span class="panel-count">${String(list.length).padStart(2,'0')}</span></div><div class="task-grid">${list.map(tile).join('')}</div></section>`;}
export function renderPortfolio(){return `${panel('current','Currently on board',items.filter(i=>i.category==='current'),'Active assignments')}
 ${panel('experience','Where I’ve worked',items.filter(i=>i.category==='experience'),'Mission history')}
 ${panel('projects','Things I’ve built',items.filter(i=>i.category==='projects'),'Personal & team projects')}
 ${panel('leadership','My crew',items.filter(i=>['quant','sase'].includes(i.id)),'Leadership & involvement')}
 <section class="content-panel" id="panel-skills" role="tabpanel" aria-labelledby="tab-skills" hidden><div class="panel-heading"><div><p class="eyebrow">Tools of the trade</p><h2>Skills inventory</h2></div><span class="panel-count">${skillGroups.flatMap(g=>g.skills).length}</span></div><div class="skill-groups">${skillGroups.map(g=>`<div class="skill-group"><h3>${escape(g.title)}</h3><p>${g.skills.map(escape).join(' · ')}</p></div>`).join('')}</div><div class="wiring-task"><div class="wiring-heading"><span>${icon('bolt')} Optional task: fix the wiring</span><span id="wire-progress" aria-live="polite">0 / 3</span></div><p class="wiring-hint" id="wire-hint">Select a language, then its matching tool.</p><div class="wire-board" id="wire-board"><svg id="wire-lines" aria-hidden="true"></svg><div class="wire-column">${[['ts','TypeScript'],['java','Java'],['go','Go']].map(([id,label])=>`<button class="wire-node wire-left" data-wire="${id}" aria-pressed="false"><span class="wire-plug ${id}"></span>${label}</button>`).join('')}</div><div class="wire-column">${[['go','Infrastructure'],['ts','React'],['java','Spring Boot']].map(([id,label])=>`<button class="wire-node wire-right" data-wire="${id}" aria-pressed="false">${label}<span class="wire-plug ${id}"></span></button>`).join('')}</div></div><button class="text-button" id="reset-wires">Reset task</button></div></section>`;}
export function renderDetail(item){return `<div class="detail-body"><p class="eyebrow">${escape((item.category==='projects'?'Project':labels[item.id])||'Experience')}</p><h2 id="detail-title">${escape(item.title)}</h2><p class="detail-subtitle">${escape(item.subtitle)}</p><p class="detail-date">${escape(item.date)}</p>${item.id==='education'?`<p class="detail-description">${escape(item.description)}</p>`:''}${body(item)}</div>`;}
