// Application JS (split from HTML)
// ---------------- CONFIG ----------------
const ADMIN_PASSWORD = 'admin123'; // temporário - recomendo Firebase Auth
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDq1-T7ADK2B1tOnJQfBegCBWZ2OJcyp5w",
  authDomain: "lista-presenca-tecnicos.firebaseapp.com",
  databaseURL: "https://lista-presenca-tecnicos-default-rtdb.firebaseio.com",
  projectId: "lista-presenca-tecnicos",
  storageBucket: "lista-presenca-tecnicos.firebasestorage.app",
  messagingSenderId: "859660776766",
  appId: "1:859660776766:web:c57292bf8332d99bd5286f",
  measurementId: "G-HC4FMZXN1Y"
};
// ----------------------------------------

const INITIAL = {
  Lucas:[
    'CIP _ RAFAEL GIELINSKI','CIP _ ADILSON DOS SANTOS MARQUES','CIP _ ADONIS TOLEDO PEDROSO',
    'CIP _ ADRIANO JOAO LINO ROCHA','CIP _ DIEGO FELIZARDO DE OLIVEIRA','CIP _ ENEIAS ODIM DA LUZ',
    'CIP _ ERICO LEANDRO ROSA','CIP _ JOSE CARLOS ZACARIAS','CIP _ LEONARDO FERNANDES LUCAS',
    'CIP _ LUCIANO ANDRÉ DE OLIVEIRA','CIP _ ROBSON QUADROS DE LIMA','CIP _ SANDRO MATHEUS SOARES',
    'CIP _ ADINILSON PETROLINI DE SOUSA'
  ],
  Israel:[
    'CIP _ ADRIANO CRUZ','CIP _ ARLYSOM PIMENTEL DO NASCIMENTO','CIP _ CLEITON SAMONEK',
    'CIP _ EDUARDO DE LIMA RIBEIRO ALEGRO','CIP _ GIL VICENTE ADAO','CIP _ GILSON RISKE',
    'CIP _ GIOVAN PUERTA PEREIRA DINO','CIP _ JHONATAN WILLIAN PORTO KOCHOLIK','CIP _ LUCAS MARINHAK',
    'CIP _ MAGNUM QUADROS CUSTODIA','CIP _ MAURICIO CARLOS LUCAS','CIP _ RENATO GODINHO DOS SANTOS',
    'CIP _ RICHARD BRAYAN SOUZA TIOTONIO','CIP _ TIAGO DOS SANTOS','CIP _ WELLINGTON FORMIGHIERI DA SILVA',
    'CIP _ WELLINGTON MOYSES BATISTA GLOVAT','CIP _ WERYCLES GILBERTO DE OLIVEIRA PEREIRA'
  ],
  Litoral:[
    'CIP _ ADRIANO ANIGNSKI FRAGOSO','CIP _ ALAN GOMES DE OLIVEIRA','CIP _ ANDERSON FRANCISCO AGOSTINHO',
    'CIP _ CRISTIANO ALAN VIEIRA','CIP _ DEIVIDY FERREIRA DO AMARA','CIP _ DIONATAN EVERTON WOZNHAK FRANCA DA',
    'CIP _ IVANIR QUARESMA','CIP _ KLEBER FERREIRA','CIP _ LUCAS FERREIRA DA SILVA',
    'CIP _ NATAN HENRIQUE BETIM','CIP _ ROBSON MARCELO DE OLIVEIRA BRAVO'
  ]
};

// state & refs
let DATA = makeDefault();
window.DATA = DATA;
let isAdmin = false;

const adminToggle = document.getElementById('adminToggle');
const adminIndicator = document.getElementById('adminIndicator');
const openAdd = document.getElementById('openAdd');
const openRemove = document.getElementById('openRemove');
const openMove = document.getElementById('openMove');

const dateInput = document.getElementById('date');
const supervisorsDiv = document.getElementById('supervisors');
const csvBtn = document.getElementById('csvBtn');
const resetBtn = document.getElementById('resetBtn');
const filterBar = document.getElementById('filterBar');

const totalEl = document.getElementById('total');
const activeEl = document.getElementById('active');
const inactiveEl = document.getElementById('inactive');
const pctEl = document.getElementById('pct');
const chartActive = document.getElementById('chartActive');
const chartInactive = document.getElementById('chartInactive');

const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

function makeDefault(){
  const out={};
  Object.keys(INITIAL).forEach(s=> out[s] = INITIAL[s].map(n=>({name:n,status:'pendente',time:'',note:''})));
  return out;
}

function todayISO(){ return (new Date()).toISOString().slice(0,10); }
dateInput.value = todayISO();

// filters
let currentFilter = null;
function buildFilterButtons(){
  filterBar.innerHTML = '';
  const btnAll = document.createElement('button'); btnAll.textContent='Todos'; btnAll.className='ghost';
  btnAll.onclick = ()=>{ currentFilter = null; render(); };
  filterBar.appendChild(btnAll);
  Object.keys(INITIAL).forEach(s=>{
    const b = document.createElement('button'); b.textContent = s; b.className='ghost';
    b.onclick = ()=>{ currentFilter = (currentFilter===s? null: s); render(); };
    filterBar.appendChild(b);
  });
}
buildFilterButtons();

// render
function render(){
  window.DATA = DATA;
  supervisorsDiv.innerHTML = '';
  let total=0, active=0, inactive=0;
  Object.keys(DATA).forEach(s=>{
    if(currentFilter && currentFilter !== s) return;
    DATA[s].forEach(t=>{ total++; if(t.status==='nao' || t.status==='pendente') inactive++; else active++; });
  });
  totalEl.textContent = String(total);
  activeEl.textContent = String(active);
  inactiveEl.textContent = String(inactive);
  const pct = total ? Math.round((active/total)*100) : 0;
  pctEl.textContent = pct + '%';
  chartActive.style.width = pct + '%';
  chartInactive.style.width = (100 - pct) + '%';

  Array.from(filterBar.children).forEach(b => b.classList.toggle('filter-active', b.textContent === currentFilter));

  Object.keys(DATA).filter(s=>!currentFilter||currentFilter===s).forEach(s=>{
    const supList = DATA[s];
    const supTotal = supList.length;
    const supActive = supList.reduce((acc,t)=> acc + ((t.status && t.status!=='nao' && t.status!=='pendente')?1:0), 0);
    const supPct = supTotal ? Math.round((supActive/supTotal)*100) : 0;

    const card = document.createElement('div'); card.className='card';
    const title = document.createElement('div'); title.className='sup-title';
    const titleText = document.createElement('div'); titleText.textContent = s; title.appendChild(titleText);
    const pctSmall = document.createElement('div'); pctSmall.className='small-muted'; pctSmall.style.marginLeft='auto';
    pctSmall.textContent = supActive + '/' + supTotal + ' • ' + supPct + '%'; title.appendChild(pctSmall);

    const miniChart = document.createElement('div'); miniChart.className='chart'; miniChart.style.height='12px'; miniChart.style.marginTop='6px';
    const a = document.createElement('div'); a.className='active'; a.style.width = supPct + '%'; a.style.height='100%';
    const i = document.createElement('div'); i.className='inactive'; i.style.width = (100 - supPct) + '%'; i.style.height='100%';
    miniChart.appendChild(a); miniChart.appendChild(i);

    card.appendChild(title); card.appendChild(miniChart);

    supList.forEach((t, idx)=>{
      const box = document.createElement('div'); box.className='tech';
      const row = document.createElement('div'); row.className='row';
      const left = document.createElement('div'); left.style.flex='1';

      // name + status pill (preview)
      const nm = document.createElement('div'); nm.className = 'name'; nm.textContent = t.name || '(sem nome)';
      const sp = document.createElement('span');
      sp.className = !t.status || t.status==='pendente' ? 'status-pill p-pendente'
        : t.status==='trabalha' ? 'status-pill p-trab'
        : t.status==='nao' ? 'status-pill p-nao'
        : t.status==='entra_mais_tarde' ? 'status-pill p-entra'
        : 'status-pill p-sai';
      sp.textContent = !t.status || t.status==='pendente' ? 'Pendente'
        : t.status==='trabalha' ? 'Trabalha'
        : t.status==='nao' ? 'Não'
        : t.status==='entra_mais_tarde' ? 'Entra'
        : 'Sai';

      left.appendChild(nm);
      left.appendChild(sp);

      const noteSmall = document.createElement('div'); noteSmall.className='small-muted'; noteSmall.textContent = t.note || ''; left.appendChild(noteSmall);
      row.appendChild(left);

      const right = document.createElement('div'); right.style.width='120px'; right.style.textAlign='right';
      const moveBtn = document.createElement('button'); moveBtn.className='ghost'; moveBtn.textContent='Mover';
      moveBtn.title = 'Mover técnico (requer admin)';
      moveBtn.onclick = ()=> { requireAdmin(()=> openMoveModal(s, idx)); };
      right.appendChild(moveBtn); row.appendChild(right); box.appendChild(row);

      const btns = document.createElement('div'); btns.className='buttons';
      const bTr = makeBtn('Trabalha','trabalha', t.status === 'trabalha'); bTr.title='Marca como trabalhando';
      const bNa = makeBtn('Não Trabalha','nao', t.status === 'nao'); bNa.title='Marca como não trabalha';
      const bEn = makeBtn('Entra mais tarde','entra_mais_tarde', t.status === 'entra_mais_tarde'); bEn.title='Marca que entra mais tarde';
      const bSa = makeBtn('Sai mais cedo','sai_mais_cedo', t.status === 'sai_mais_cedo'); bSa.title='Marca que sai mais cedo';

      bTr.onclick = ()=> setStatus(s, idx, 'trabalha');
      bNa.onclick = ()=> setStatus(s, idx, 'nao');
      bEn.onclick = ()=> setStatus(s, idx, 'entra_mais_tarde');
      bSa.onclick = ()=> setStatus(s, idx, 'sai_mais_cedo');

      btns.appendChild(bTr); btns.appendChild(bNa); btns.appendChild(bEn); btns.appendChild(bSa);
      box.appendChild(btns);

      if(t.status === 'entra_mais_tarde' || t.status === 'sai_mais_cedo'){
        const flex = document.createElement('div'); flex.className='flex'; flex.style.marginTop='8px';
        const time = document.createElement('input'); time.type='time'; time.value = t.time || '';
        time.onchange = (e)=> { t.time = e.target.value; scheduleSave(); render(); };
        flex.appendChild(time); box.appendChild(flex);
      }

      const note = document.createElement('textarea'); note.placeholder='Observação / motivo'; note.value = t.note || '';
      note.onchange = (e)=> { t.note = e.target.value; scheduleSave(); };
      note.style.marginTop='8px'; box.appendChild(note);

      card.appendChild(box);
    });

    supervisorsDiv.appendChild(card);
  });
}

function makeBtn(label, status, active){
  const b = document.createElement('button'); b.className = 'btn-status'; b.textContent = label;
  if(active) b.classList.add('active');
  if(status === 'trabalha') b.classList.add('btn-trabalha');
  if(status === 'nao') b.classList.add('btn-nao');
  if(status === 'entra_mais_tarde') b.classList.add('btn-entra');
  if(status === 'sai_mais_cedo') b.classList.add('btn-sai');
  return b;
}

function setStatus(s, idx, status){
  DATA[s][idx].status = status;
  if(status !== 'entra_mais_tarde' && status !== 'sai_mais_cedo') DATA[s][idx].time = '';
  scheduleSave();
  render();
}

// CSV
function exportCSV(){
  const rows = [['Date','Supervisor','Technician','Status','TimeAdjustment','Note']];
  const date = dateInput.value;
  Object.keys(DATA).forEach(s=>{ DATA[s].forEach(t => rows.push([date,s,t.name,t.status || '',t.time||'',t.note||''])); });
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\r\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'presenca_' + date + '.csv'; a.click(); URL.revokeObjectURL(url);
}
csvBtn.addEventListener('click', exportCSV);
resetBtn.addEventListener('click', ()=>{ DATA = makeDefault(); scheduleSave(); render(); });

// modal helpers
function openModal(title, bodyNode, confirmLabel='Confirmar', onConfirm){
  modalTitle.textContent = title; modalBody.innerHTML = ''; modalBody.appendChild(bodyNode);
  modalBackdrop.style.display = 'flex'; modalBackdrop.setAttribute('aria-hidden','false'); modalConfirm.textContent = confirmLabel;
  function cleanup(){ modalBackdrop.style.display = 'none'; modalBackdrop.setAttribute('aria-hidden','true'); modalConfirm.onclick=null; modalCancel.onclick=null; }
  modalCancel.onclick = ()=>{ cleanup(); };
  modalConfirm.onclick = ()=>{ try{ onConfirm(); } finally { cleanup(); } };
}

// admin
function requireAdmin(onSuccess){
  if(isAdmin){ onSuccess(); return; }
  const body = document.createElement('div');
  const inp = document.createElement('input'); inp.type='password'; inp.placeholder='Senha de administrador'; inp.style.width='100%'; inp.style.padding='8px';
  body.appendChild(inp);
  openModal('Acesso administrador', body, 'Entrar', ()=>{
    if(inp.value === ADMIN_PASSWORD){
      isAdmin = true; adminIndicator.style.display='inline-block'; adminToggle.textContent='Bloquear Admin'; onSuccess();
    } else { alert('Senha incorreta'); }
  });
}
adminToggle.onclick = ()=>{
  if(isAdmin){ isAdmin=false; adminIndicator.style.display='none'; adminToggle.textContent='Entrar Admin'; }
  else { requireAdmin(()=>{ render(); }); }
};

// add/remove/move
openAdd.onclick = ()=>{ requireAdmin(()=> openAddModal()); };
function openAddModal(){
  const body = document.createElement('div');
  const supSel = document.createElement('select'); supSel.style.width='100%'; supSel.style.padding='8px'; supSel.style.marginBottom='8px';
  Object.keys(INITIAL).forEach(s=>{ const opt=document.createElement('option'); opt.value=s; opt.textContent=s; supSel.appendChild(opt); });
  const nameInp = document.createElement('input'); nameInp.placeholder='Nome do técnico'; nameInp.style.width='100%'; nameInp.style.padding='8px';
  body.appendChild(supSel); body.appendChild(nameInp);
  openModal('Adicionar Técnico', body, 'Adicionar', ()=>{
    const sup=supSel.value; const name = nameInp.value && nameInp.value.trim();
    if(!name) return alert('Informe um nome válido.');
    DATA[sup].push({ name, status:'pendente', time:'', note:'' }); scheduleSave(); render();
  });
}

openRemove.onclick = ()=>{ requireAdmin(()=> openRemoveModal()); };
function openRemoveModal(){
  const body = document.createElement('div');
  const supSel = document.createElement('select'); supSel.style.width='100%'; supSel.style.padding='8px'; supSel.style.marginBottom='8px';
  Object.keys(INITIAL).forEach(s=>{ const opt=document.createElement('option'); opt.value=s; opt.textContent=s; supSel.appendChild(opt); });
  const listDiv = document.createElement('div'); listDiv.className='list-select';
  function refreshList(){ listDiv.innerHTML=''; const arr = DATA[supSel.value]||[]; if(arr.length===0){ listDiv.textContent='Sem técnicos.'; return; } arr.forEach((t,i)=>{ const el=document.createElement('div'); el.className='list-item'; el.textContent=(i+1)+' — '+t.name; el.dataset.idx=i; el.onclick=()=>{ Array.from(listDiv.children).forEach(c=>c.style.background=''); el.style.background='#eef7f6'; listDiv.dataset.chosenIdx=i; }; listDiv.appendChild(el); }); }
  supSel.onchange = refreshList; refreshList();
  body.appendChild(supSel); body.appendChild(listDiv);
  openModal('Excluir Técnico', body, 'Excluir', ()=>{ const idx=parseInt(listDiv.dataset.chosenIdx,10); if(Number.isNaN(idx)) return alert('Escolha um técnico.'); DATA[supSel.value].splice(idx,1); scheduleSave(); render(); });
}

function openMoveModal(fromSup, idx){
  const body = document.createElement('div');
  const info = document.createElement('div'); info.className='small-muted'; info.style.marginBottom='8px';
  info.textContent = 'Mover: ' + (DATA[fromSup][idx]?.name || '(sem nome)') + ' — de ' + fromSup;
  const toSel = document.createElement('select'); toSel.style.width='100%'; toSel.style.padding='8px'; toSel.style.marginBottom='8px';
  Object.keys(INITIAL).forEach(s=>{ if(s===fromSup) return; const opt=document.createElement('option'); opt.value=s; opt.textContent=s; toSel.appendChild(opt); });
  body.appendChild(info); body.appendChild(toSel);
  openModal('Mover Técnico', body, 'Mover', ()=>{ const to = toSel.value; if(!to) return; const item = DATA[fromSup].splice(idx,1)[0]; DATA[to].push(item); scheduleSave(); render(); });
}

openMove.onclick = ()=>{ requireAdmin(()=> openMoveChooser()); };
function openMoveChooser(){
  const body = document.createElement('div');
  const desc = document.createElement('div'); desc.className='small-muted'; desc.textContent='Toque no técnico para selecionar (origem).';
  const listDiv = document.createElement('div'); listDiv.className='list-select'; listDiv.style.maxHeight='300px';
  Object.keys(DATA).forEach(s=>{ DATA[s].forEach((t,i)=>{ const el=document.createElement('div'); el.className='list-item'; el.textContent = s + ' — ' + t.name; el.dataset.from = s; el.dataset.idx=i; el.onclick = ()=>{ modalBackdrop.style.display='none'; openMoveModal(el.dataset.from, parseInt(el.dataset.idx,10)); }; listDiv.appendChild(el); }); });
  body.appendChild(desc); body.appendChild(listDiv);
  openModal('Mover Técnico (selecione origem)', body, 'Fechar', ()=>{});
}

dateInput.addEventListener('change', ()=>{ DATA = makeDefault(); window.DATA = DATA; render(); startListening(); });

// Firebase sync
let firebaseApp = null;
let db = null;
let saveTimer = null;
let lastLocalSerialized = '';
let lastRemoteSerialized = '';
let currentListenKey = null;
let currentRef = null;

function serializeData(d){
  try{ return JSON.stringify(d); }catch(e){ return String(d); }
}

function scheduleSave(delay=900){
  if(saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{ saveTimer = null; saveToFirebase(); }, delay);
}

function initFirebaseIfNeeded(){
  if(firebaseApp || FIREBASE_CONFIG.apiKey.startsWith('YOUR_')) return;
  try{
    firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
  }catch(e){
    console.error('Erro init firebase', e);
  }
}

function getDateKey(){
  const el = document.getElementById('date');
  return el && el.value ? el.value : (new Date()).toISOString().slice(0,10);
}

function saveToFirebase(){
  initFirebaseIfNeeded();
  if(!db){
    console.warn('Firebase não configurado; salvamento local apenas.');
    return;
  }
  try{
    const key = getDateKey();
    const payload = DATA || {};
    const serialized = serializeData(payload);
    if(serialized === lastLocalSerialized) return;
    lastLocalSerialized = serialized;
    db.ref('attendance/' + key).set({data: payload, updatedAt: Date.now()}).catch(e=>console.error('Save failed',e));
    console.log('Saved attendance to Firebase for', key);
  }catch(e){ console.error(e); }
}

function startListening(){
  initFirebaseIfNeeded();
  if(!db) return;
  const key = getDateKey();
  if(currentRef && currentListenKey === key){
    return;
  }
  if(currentRef) currentRef.off();
  currentListenKey = key;
  const ref = db.ref('attendance/' + key);
  currentRef = ref;
  ref.on('value', snap => {
    if(!snap.exists()){
      DATA = makeDefault();
      window.DATA = DATA;
      lastRemoteSerialized = '';
      try{ render(); }catch(e){ console.error('Error rendering after empty remote', e); }
      console.log('No remote data for', key, '- using default state');
      return;
    }
    const val = snap.val();
    if(!val || !val.data) return;
    const serialized = serializeData(val.data);
    if(serialized === lastLocalSerialized) { lastRemoteSerialized = serialized; return; }
    DATA = val.data;
    window.DATA = DATA;
    lastRemoteSerialized = serialized;
    try{ render(); }catch(e){ console.error('Error rendering after remote update', e); }
    console.log('Applied remote update for', key);
  });
}

window.addEventListener('load', ()=>{
  setTimeout(()=>{ try{ startListening(); scheduleSave(1200); }catch(e){console.error(e);} }, 800);
});

window.__attendanceSync = {
  save: saveToFirebase,
  listen: startListening,
  lastLocal: ()=> lastLocalSerialized,
  lastRemote: ()=> lastRemoteSerialized
};

window.render = render;
window.setStatus = setStatus;

render();

if(FIREBASE_CONFIG.apiKey.startsWith('YOUR_')){
  console.warn('Firebase config not replaced yet. Realtime sync is disabled until you set FIREBASE_CONFIG.');
}
