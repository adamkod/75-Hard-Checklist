// 75 Hard Checklist - client-side only (localStorage)
// Tasks are the classic 75 Hard rules; you can edit them below.
const TASKS = [
  {id:'workout1', title:'2 workouts (45 min each) — one must be outdoors'},
  {id:'diet', title:'Follow a diet / no cheat meals / no alcohol'},
  {id:'water', title:'Drink 1 gallon (3.78L) of water'},
  {id:'reading', title:'Read 10 pages of non-fiction'},
  {id:'photo', title:'Take a progress photo'},
  {id:'supplement', title:'Stick to your supplements/plan'}, // optional extra
  {id:'noAlcohol', title:'No alcohol'} // keep explicit
];

const STORAGE_KEY = 'seventyFiveHard_v1';

function qs(sel){return document.querySelector(sel)}
function qsa(sel){return document.querySelectorAll(sel)}

let state = { dayNumber:1, days: {}, notes: {} };

function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try { state = JSON.parse(raw) } catch(e){ console.error(e) }
  }
  if(!state.days) state.days = {};
  if(!state.dayNumber) state.dayNumber = 1;
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }

function renderTasks(day){
  const ul = qs('#tasksList'); ul.innerHTML = '';
  TASKS.forEach(t=>{
    const li = document.createElement('li'); li.className='taskItem';
    const cb = document.createElement('input'); cb.type='checkbox'; cb.id='cb_'+t.id;
    cb.checked = (day && day.tasks && day.tasks[t.id]) || false;
    cb.addEventListener('change', ()=>{ toggleTask(t.id, cb.checked) });
    const lab = document.createElement('label'); lab.htmlFor = cb.id; lab.textContent = t.title;
    li.appendChild(cb); li.appendChild(lab);
    ul.appendChild(li);
  });
  updateProgress();
}

function toggleTask(taskId, value){
  const dnum = state.dayNumber;
  state.days[dnum] = state.days[dnum] || { tasks: {}, photos: [] };
  state.days[dnum].tasks[taskId] = value;
  // if photo checkbox toggled off, maybe remove photo? no
  saveState(); renderTasks(state.days[dnum]); renderDaysGrid();
}

function updateProgress(){
  const day = state.days[state.dayNumber] || {tasks:{}};
  const completed = TASKS.reduce((s,t)=> s + (day.tasks[t.id] ? 1 : 0), 0);
  qs('#completedCount').textContent = completed;
  qs('#progressBar').value = completed;
  const daysDone = Object.values(state.days).filter(d=>{
    // count day as done if all core tasks (first 5) are checked
    return TASKS.slice(0,5).every(t => d.tasks && d.tasks[t.id]);
  }).length;
  qs('#daysCompleted').textContent = daysDone;
}

function renderDaysGrid(){
  const grid = qs('#daysGrid'); grid.innerHTML = '';
  for(let i=1;i<=75;i++){
    const div = document.createElement('div'); div.className='dayCell';
    div.textContent = i;
    if(state.days[i] && TASKS.slice(0,5).every(t=> state.days[i].tasks && state.days[i].tasks[t.id])){
      div.classList.add('done');
    }
    div.addEventListener('click', ()=>{ state.dayNumber = i; qs('#dayNumber').value = i; saveState(); renderForDay(i); });
    grid.appendChild(div);
  }
}

function renderForDay(dayNumber){
  state.dayNumber = dayNumber;
  qs('#dayNumber').value = dayNumber;
  const day = state.days[dayNumber] || { tasks: {}, photos: [], notes: '' };
  renderTasks(day);
  // photos
  const photosList = qs('#photosList'); photosList.innerHTML = '';
  (day.photos || []).forEach((dataURL, idx)=>{
    const img = document.createElement('img'); img.src = dataURL; img.className='photoThumb';
    img.title = 'Day '+dayNumber+' photo';
    photosList.appendChild(img);
  });
  qs('#notes').value = day.notes || '';
  updateProgress();
}

function newDay(){
  const current = state.dayNumber || 1;
  const next = Math.min(75, current+1);
  state.dayNumber = next;
  saveState();
  renderForDay(next);
}

function handlePhotoUpload(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    const dataURL = e.target.result;
    const day = state.days[state.dayNumber] = state.days[state.dayNumber] || { tasks: {}, photos: [], notes: '' };
    day.photos = day.photos || [];
    day.photos.push(dataURL);
    saveState(); renderForDay(state.dayNumber);
  };
  reader.readAsDataURL(file);
}

function exportCSV(){
  const rows = [["day","taskId","taskTitle","completed","notes","photosCount"]];
  for(let i=1;i<=75;i++){
    const d = state.days[i] || {tasks:{}, notes:'', photos:[]};
    TASKS.forEach(t=>{
      rows.push([i, t.id, t.title.replace(/,/g,' '), d.tasks[t.id] ? '1' : '0', (d.notes||'').replace(/\n/g,' '), (d.photos||[]).length]);
    });
  }
  const csv = rows.map(r=> r.map(c=>`"\${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = '75hard_export.csv'; a.click();
  URL.revokeObjectURL(url);
}

function resetAll(){
  if(!confirm('Reset all progress? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = { dayNumber:1, days:{}, notes:{} };
  renderForDay(1);
}

function init(){
  loadState();
  qs('#newDayBtn').addEventListener('click', newDay);
  qs('#dayNumber').addEventListener('change', (e)=>{ const v = Number(e.target.value); if(v>=1 && v<=75){ state.dayNumber = v; saveState(); renderForDay(v); }});
  qs('#photoInput').addEventListener('change', (e)=> handlePhotoUpload(e.target.files[0]));
  qs('#notes').addEventListener('input', (e)=>{ const day = state.days[state.dayNumber] = state.days[state.dayNumber] || {tasks:{}, photos:[], notes:''}; day.notes = e.target.value; saveState(); });
  qs('#exportBtn').addEventListener('click', exportCSV);
  qs('#resetBtn').addEventListener('click', resetAll);
  renderDaysGrid();
  renderForDay(state.dayNumber || 1);
}

init();
