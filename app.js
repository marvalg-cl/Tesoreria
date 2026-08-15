
(() => {
"use strict";

/* Tesorería Multiorganizacional — versión limpia
   Persistencia: IndexedDB. No depende de localStorage.
   Todo el arranque está protegido para evitar pantallas de carga infinitas.
*/

const DB_NAME="tesoreria_multi_v2", DB_VERSION=1, STORE="app";
const state={db:null, data:{organizations:[],people:[],movements:[],attachments:[],settings:{treasurer:{}}}, orgId:null, view:"dashboard", search:"", modal:null, reportType:"global"};

const ORG_TYPES=["Curso","Colegio","Club deportivo","Junta de vecinos","Iglesia","Organización social","Centro de padres","Agrupación cultural","Fundación","Corporación","Comité","Otro"];
const PERSON_ROLES=["Alumno/a","Socio/a","Jugador/a","Integrante","Apoderado/a","Tutor/a","Responsable","Delegado/a","Dirigente","Presidente/a","Vicepresidente/a","Tesorero/a","Secretario/a","Representante","Otro"];
const MOV_TYPES=["Ingreso","Gasto"];
const INCOME_CATS=["Cuota obligatoria anual","Cuota extraordinaria","Aporte voluntario","Actividad / evento","Donación","Reembolso recibido","Otro ingreso"];
const EXPENSE_CATS=["Actividad / evento","Materiales","Alimentación","Transporte","Premio / regalo","Servicio","Reembolso","Comisión / cargo","Otro gasto"];
const METHODS=["Efectivo","Transferencia","Depósito","Tarjeta / digital","Otro"];
const RECEIVERS=["Presidente/a","Tesorero/a","Secretario/a","Representante","Integrante","Proveedor","Otro"];
const AUTH_ROLES=["Presidente/a","Tesorero/a","Secretario/a","Representante","Responsable de organización","Otro"];

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const money=n=>new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(Number(n)||0);
const uid=p=>`${p||"id"}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
const today=()=>new Date().toISOString().slice(0,10);
const fmtDate=s=>{if(!s)return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`};
const sum=(arr,key)=>arr.reduce((a,x)=>a+(Number(x[key])||0),0);
function initials(n){return String(n||"?").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function icon(name){
 const paths={
 home:`<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>`,
 org:`<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M2 21h20"/>`,
 people:`<circle cx="9" cy="8" r="3"/><path d="M3 21v-1a6 6 0 0 1 12 0v1"/><circle cx="18" cy="9" r="2"/><path d="M17 15a5 5 0 0 1 4 5v1"/>`,
 movement:`<path d="M5 7h14M5 12h14M5 17h9"/><path d="m16 15 3 2-3 2"/>`,
 report:`<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 13h8M8 17h6"/>`,
 settings:`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h2.6V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14h-.2a1.7 1.7 0 0 0-1.6 1z"/>`,
 plus:`<path d="M12 5v14M5 12h14"/>`,
 download:`<path d="M12 3v12"/><path d="m7 10 5 5 5-5M4 21h16"/>`,
 upload:`<path d="M12 21V9"/><path d="m7 14 5-5 5 5M4 3h16"/>`,
 trash:`<path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/>`,
 print:`<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>`,
 eye:`<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>`,
 edit:`<path d="m4 16-.8 4.8L8 20l11-11-4-4zM13 6l5 5"/>`,
 file:`<path d="M6 2h8l4 4v16H6zM14 2v5h5M9 13h6M9 17h6"/>`,
 bank:`<path d="m3 10 9-6 9 6H3zM5 10v8m4-8v8m6-8v8m4-8v8M3 21h18"/>`,
 refresh:`<path d="M20 11a8 8 0 0 0-14-5L4 8"/><path d="M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2"/><path d="M20 20v-4h-4"/>`,
 search:`<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>`,
 close:`<path d="m6 6 12 12M18 6 6 18"/>`,
 attach:`<path d="m21 11-8.5 8.5a6 6 0 0 1-8.5-8.5L12.5 2.5a4 4 0 0 1 5.7 5.7L9.7 16.7a2 2 0 1 1-2.8-2.8l8.5-8.5"/>`,
 send:`<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>`,
 check:`<path d="m5 12 4 4L19 6"/>`
 };
 return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.file}</svg>`;
}

function openDB(){
 return new Promise((resolve,reject)=>{
   const req=indexedDB.open(DB_NAME,DB_VERSION);
   req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};
   req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
 });
}
function dbGet(key){
 return new Promise((res,rej)=>{const t=state.db.transaction(STORE,"readonly"),r=t.objectStore(STORE).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})
}
function dbPut(key,val){
 return new Promise((res,rej)=>{const t=state.db.transaction(STORE,"readwrite"),r=t.objectStore(STORE).put(val,key);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})
}
async function save(){await dbPut("data",state.data)}
async function clearAll(){await dbPut("data",{organizations:[],people:[],movements:[],attachments:[],settings:{treasurer:{}}});state.data=await dbGet("data");state.orgId=null}
async function boot(){
 try{
   state.db=await openDB();
   state.data=await dbGet("data")||{organizations:[],people:[],movements:[],attachments:[],settings:{treasurer:{}}};
   if(!state.data.settings)state.data.settings={treasurer:{}};
   if(!state.data.organizations)state.data.organizations=[];
   if(!state.data.people)state.data.people=[];
   if(!state.data.movements)state.data.movements=[];
   if(!state.data.attachments)state.data.attachments=[];
   state.orgId=state.data.organizations[0]?.id||null;
   render();
   if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
 }catch(e){
   document.querySelector("#app").innerHTML=`<div class="content" style="margin:40px"><div class="card card-pad"><h2>No se pudo iniciar la aplicación</h2><p>${esc(e.message||"Error desconocido")}</p><button class="btn btn-primary" onclick="location.reload()">Reintentar</button></div></div>`;
 }
}

function org(){return state.data.organizations.find(x=>x.id===state.orgId)||null}
function orgMov(){return state.data.movements.filter(x=>x.orgId===state.orgId)}
function balance(){
 const m=orgMov(); return {in:sum(m.filter(x=>x.type==="Ingreso"),"amount"),out:sum(m.filter(x=>x.type==="Gasto"),"amount")}
}
function realBalance(){const b=balance();return b.in-b.out}
function peopleOrg(){return state.data.people.filter(p=>(p.organizations||[]).includes(state.orgId))}
function selectedTreasurer(){return state.data.settings?.treasurer||{}}

function shell(){
 const nav=[
  ["dashboard","Resumen","home"],["organizations","Organizaciones","org"],["people","Personas","people"],
  ["movements","Movimientos","movement"],["reports","Informes","report"],["settings","Config.","settings"]
 ];
 const o=org();
 return `<div class="app-shell">
 <aside class="sidebar">
   <div class="side-logo">${icon("bank")}</div>
   <nav class="nav">${nav.map(n=>`<button class="nav-item ${state.view===n[0]?"active":""}" data-nav="${n[0]}" title="${n[1]}">${icon(n[2])}<span>${n[1]}</span></button>`).join("")}</nav>
   <div class="side-bottom"><button class="nav-item" data-action="export-json" title="Respaldar datos">${icon("download")}<span>Respaldo</span></button></div>
 </aside>
 <header class="topbar">
   <div class="brand"><div class="brand-mark">${icon("bank")}</div><div><div class="brand-title">Tesorería Multiorganizacional</div><div class="brand-sub">Control comunitario claro y trazable</div></div></div>
   <div class="org-select"><select id="org-switch" aria-label="Organización"><option value="">Seleccionar organización…</option>${state.data.organizations.map(x=>`<option value="${x.id}" ${x.id===state.orgId?"selected":""}>${esc(x.name)}</option>`).join("")}</select></div>
   <div class="top-actions"><button class="icon-btn optional" data-action="import-json" title="Importar JSON">${icon("upload")}</button><button class="icon-btn" data-action="refresh" title="Actualizar">${icon("refresh")}</button></div>
 </header>
 <main class="main"><div class="content" id="view"></div></main>
 </div>`
}

function render(){document.querySelector("#app").innerHTML=shell();renderView();bindGlobal()}
function renderView(){
 const v={dashboard:dashboardView,organizations:organizationsView,people:peopleView,movements:movementsView,reports:reportsView,settings:settingsView}[state.view]||dashboardView;
 $("#view").innerHTML=v();
}
function bindGlobal(){
 $$("[data-nav]").forEach(b=>b.onclick=()=>{state.view=b.dataset.nav;render()});
 const sw=$("#org-switch");if(sw)sw.onchange=()=>{state.orgId=sw.value||null;renderView();bindView()}
 $$("[data-action]").forEach(b=>b.onclick=()=>actions(b.dataset.action));
 bindView();
}
function bindView(){
 $$("[data-action]").forEach(b=>{if(!b.dataset.bound)b.onclick=()=>actions(b.dataset.action);b.dataset.bound="1"});
 $$("[data-edit-org]").forEach(b=>b.onclick=()=>openOrg(b.dataset.editOrg));
 $$("[data-person]").forEach(b=>b.onclick=()=>openPerson(b.dataset.person));
 $$("[data-movement]").forEach(b=>b.onclick=()=>openMovement(b.dataset.movement));
 $$("[data-report]").forEach(b=>b.onclick=()=>{state.reportType=b.dataset.report;openReport()});
}
async function actions(a){
 if(a==="new-org")openOrg(); else if(a==="new-person")openPerson(); else if(a==="new-movement")openMovement();
 else if(a==="import-json")importJSON(); else if(a==="export-json")exportJSON(); else if(a==="export-excel")exportExcel();
 else if(a==="print")window.print(); else if(a==="refresh"){state.data=await dbGet("data");render()}
 else if(a==="wipe"){if(confirm("Esto eliminará TODOS los datos de Tesorería de este dispositivo. ¿Continuar?")){await clearAll();state.view="dashboard";render();toast("Suite vaciada. Puedes comenzar desde cero.")}}
 else if(a==="save-treasurer")saveTreasurer();
 else if(a==="install")installPWA();
}

function dashboardView(){
 const o=org(), b=balance(), real=realBalance(), m=orgMov().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const last=m.slice(0,6);
 return `<div class="page-head"><div><div class="eyebrow">Panel de control</div><h1>${o?esc(o.name):"Tesorería Multiorganizacional"}</h1><p class="lead">${o?`${esc(o.type||"Organización")} · ${peopleOrg().length} personas registradas`:"Crea o importa una organización para comenzar."}</p></div><div class="actions"><button class="btn btn-primary" data-action="new-movement">${icon("plus")} Movimiento</button></div></div>
 <div class="grid grid-4">
  <div class="card metric in"><div class="metric-label">Ingresos registrados</div><div class="metric-value">${money(b.in)}</div><div class="metric-note">Todo lo recibido por esta organización</div></div>
  <div class="card metric out"><div class="metric-label">Gastos registrados</div><div class="metric-value">${money(b.out)}</div><div class="metric-note">Gastos con responsable y respaldo cuando exista</div></div>
  <div class="card metric real"><div class="metric-label">Monto real en tesorería</div><div class="metric-value">${money(real)}</div><div class="metric-note">Ingresos reales − gastos reales registrados</div></div>
  <div class="card metric"><div class="metric-label">Personas</div><div class="metric-value">${peopleOrg().length}</div><div class="metric-note">Integrantes, socios, tutores y responsables</div></div>
 </div>
 <div class="card card-pad" style="margin-top:16px"><div class="section-title"><h2>Acciones rápidas</h2></div><div class="quick">
 <button class="btn" data-action="new-movement">${icon("plus")}Registrar movimiento</button><button class="btn" data-action="new-person">${icon("people")}Nueva persona</button><button class="btn" data-nav="reports">${icon("report")}Ver informes</button><button class="btn" data-action="export-excel">${icon("download")}Planilla Excel</button></div></div>
 <div class="grid grid-2" style="margin-top:16px">
  <div class="card card-pad"><div class="section-title"><h2>Últimos movimientos</h2><button class="btn btn-soft" data-nav="movements">Ver todos</button></div>${last.length?`<div class="table-wrap"><table class="master-table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Medio</th><th>Monto</th></tr></thead><tbody>${last.map(m=>`<tr data-movement="${m.id}"><td>${fmtDate(m.date)}</td><td><span class="badge ${m.type==="Ingreso"?"in":"out"}">${m.type}</span></td><td>${esc(m.concept)}</td><td>${esc(m.method)}</td><td class="${m.type==="Ingreso"?"amount-in":"amount-out"}">${money(m.amount)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Aún no hay movimientos. Registra el primero desde “Movimiento”.</div>`}</div>
  <div class="card card-pad"><div class="section-title"><h2>Resumen de tesorería</h2></div><p style="margin-top:0;color:var(--muted)">El <b>Monto real en tesorería</b> se calcula únicamente con los ingresos y gastos registrados. No representa un saldo bancario teórico.</p>${last.slice(0,4).map(m=>`<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #edf0f1"><span>${esc(m.concept)}</span><b class="${m.type==="Ingreso"?"amount-in":"amount-out"}">${m.type==="Ingreso"?"+":"−"}${money(m.amount)}</b></div>`).join("")||`<div class="empty">Sin gastos recientes.</div>`}</div>
 </div>`
}

function organizationsView(){
 return `<div class="page-head"><div><div class="eyebrow">Organizaciones</div><h1>Mis organizaciones</h1><p class="lead">Una misma persona puede participar en múltiples organizaciones.</p></div><button class="btn btn-primary" data-action="new-org">${icon("plus")}Nueva organización</button></div>
 <div class="grid grid-3">${state.data.organizations.map(o=>{const m=state.data.movements.filter(x=>x.orgId===o.id),i=sum(m.filter(x=>x.type==="Ingreso"),"amount"),g=sum(m.filter(x=>x.type==="Gasto"),"amount");return `<div class="card card-pad"><div class="section-title"><div><div class="eyebrow">${esc(o.type||"Organización")}</div><h2 style="margin:4px 0">${esc(o.name)}</h2></div><button class="icon-btn" data-edit-org="${o.id}" title="Editar">${icon("edit")}</button></div><p class="help">${esc(o.address||"Sin dirección registrada")}</p><div class="grid grid-2" style="margin-top:13px"><div><small>Ingresos</small><br><b class="amount-in">${money(i)}</b></div><div><small>Gastos</small><br><b class="amount-out">${money(g)}</b></div></div><button class="btn btn-dark" style="width:100%;margin-top:14px" data-org-open="${o.id}">Abrir organización</button></div>`}).join("")||`<div class="card card-pad empty" style="grid-column:1/-1">No hay organizaciones. Crea una nueva o importa un JSON.</div>`}</div>`
}

function peopleView(){
 let list=peopleOrg(); const q=state.search.trim().toLowerCase();if(q)list=list.filter(p=>JSON.stringify(p).toLowerCase().includes(q));
 return `<div class="page-head"><div><div class="eyebrow">Personas</div><h1>Integrantes, tutores y responsables</h1><p class="lead">La ficha es reutilizable: una persona puede estar en varias organizaciones.</p></div><button class="btn btn-primary" data-action="new-person">${icon("plus")}Nueva persona</button></div>
 <div class="searchbar"><input id="people-search" value="${esc(state.search)}" placeholder="Buscar nombre, RUT, teléfono, WhatsApp, correo…"><button class="btn btn-soft" data-action="clear-search">Limpiar</button></div>
 <div class="card">${list.map(p=>`<div class="person-card" data-person="${p.id}"><div class="avatar">${p.photo?`<img src="${p.photo}" alt="">`:initials(p.name)}</div><div><div class="person-name">${esc(p.name)}</div><div class="person-meta">${esc(p.rut||"Sin RUT")} · ${(p.roles||[]).map(esc).join(", ")||"Sin rol"} · ${esc(p.phone||"Sin teléfono")}</div></div><button class="btn btn-soft">Abrir</button></div>`).join("")||`<div class="empty">No hay personas en esta organización.</div>`}</div>`
}

function movementsView(){
 const o=org();let list=orgMov().sort((a,b)=>String(b.date).localeCompare(String(a.date)));const q=state.search.trim().toLowerCase();if(q)list=list.filter(m=>JSON.stringify(m).toLowerCase().includes(q));
 const cols=["Fecha","Tipo","Concepto","Categoría","Medio","Recibe / proveedor","Autoriza","Responsable","Comprobante","Monto"];
 return `<div class="page-head"><div><div class="eyebrow">Planilla maestra</div><h1>${o?esc(o.name):"Movimientos"}</h1><p class="lead">Vista horizontal completa, equivalente a una planilla general.</p></div><div class="actions"><button class="btn btn-soft" data-action="export-excel">${icon("download")}Exportar Excel</button><button class="btn btn-primary" data-action="new-movement">${icon("plus")}Nuevo movimiento</button></div></div>
 <div class="searchbar"><input id="movement-search" value="${esc(state.search)}" placeholder="Buscar concepto, persona, categoría, medio…"><button class="btn btn-soft" data-action="clear-search">Limpiar</button></div>
 <div class="card"><div class="table-wrap"><table class="master-table"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${list.map(m=>`<tr data-movement="${m.id}"><td>${fmtDate(m.date)}</td><td><span class="badge ${m.type==="Ingreso"?"in":"out"}">${m.type}</span></td><td>${esc(m.concept)}</td><td>${esc(m.category)}</td><td>${esc(m.method)}</td><td>${esc(m.receiver||m.provider||"")}</td><td>${esc(m.authorizer||"")}</td><td>${esc(m.responsible||"")}</td><td>${m.attachments?.length?"Sí":"No"}</td><td class="${m.type==="Ingreso"?"amount-in":"amount-out"}">${money(m.amount)}</td></tr>`).join("")||`<tr><td colspan="10" class="empty">No hay movimientos registrados.</td></tr>`}</tbody></table></div></div>`
}

function reportsView(){
 const o=org(),m=orgMov(),i=m.filter(x=>x.type==="Ingreso"),g=m.filter(x=>x.type==="Gasto");
 const annual=i.filter(x=>x.category==="Cuota obligatoria anual"),extra=i.filter(x=>x.category==="Cuota extraordinaria");
 return `<div class="page-head"><div><div class="eyebrow">Informes</div><h1>Informes y documentos</h1><p class="lead">Diseñados para lectura rápida, impresión y envío. El informe distingue cuotas obligatorias y extraordinarias.</p></div><div class="actions"><button class="btn btn-primary" data-report="global">${icon("report")}Informe global</button><button class="btn btn-dark" data-report="master">${icon("file")}Planilla general</button></div></div>
 <div class="grid grid-3">
 <div class="card card-pad"><h2>Global</h2><p class="help">Organización, tesorería, cuotas, ingresos, gastos y últimos movimientos.</p><button class="btn btn-primary" style="width:100%" data-report="global">Generar / imprimir</button></div>
 <div class="card card-pad"><h2>Individual</h2><p class="help">Detalle de una persona: datos, roles, aportes obligatorios y extraordinarios.</p><button class="btn btn-primary" style="width:100%" data-action="choose-person-report">Seleccionar persona</button></div>
 <div class="card card-pad"><h2>Planilla general</h2><p class="help">Todos los movimientos en formato horizontal, listo para Excel.</p><button class="btn btn-primary" style="width:100%" data-action="export-excel">Exportar Excel</button></div>
 </div>
 <div class="card card-pad" style="margin-top:16px"><div class="section-title"><h2>Vista rápida</h2><button class="btn btn-soft" data-report="global">Abrir informe</button></div>
 <div class="report-kpis"><div class="report-kpi">Ingresos<b class="amount-in">${money(sum(i,"amount"))}</b></div><div class="report-kpi">Gastos<b class="amount-out">${money(sum(g,"amount"))}</b></div><div class="report-kpi">Obligatorias<b>${money(sum(annual,"amount"))}</b></div><div class="report-kpi">Extraordinarias<b>${money(sum(extra,"amount"))}</b></div></div></div>`
}

function settingsView(){
 const t=selectedTreasurer();
 return `<div class="page-head"><div><div class="eyebrow">Configuración</div><h1>Datos y respaldo</h1><p class="lead">Los datos se guardan en IndexedDB. Puedes exportar/importar un respaldo JSON y comenzar desde cero.</p></div></div>
 <div class="grid grid-2">
 <div class="card card-pad"><div class="section-title"><h2>Datos del tesorero/a</h2></div><div class="form-grid">
 <div class="field"><label>Nombre</label><input id="tr-name" value="${esc(t.name||"")}"></div><div class="field"><label>RUT</label><input id="tr-rut" value="${esc(t.rut||"")}" placeholder="12.345.678-9"></div>
 <div class="field"><label>Teléfono</label><input id="tr-phone" value="${esc(t.phone||"+569")}" inputmode="tel" data-phone></div><div class="field"><label>WhatsApp</label><input id="tr-wa" value="${esc(t.whatsapp||"+569")}" inputmode="tel" data-phone></div>
 <div class="field full"><label>Correo</label><input id="tr-email" value="${esc(t.email||"")}" type="email"></div></div><button class="btn btn-primary" style="margin-top:14px" data-action="save-treasurer">${icon("check")}Guardar datos</button></div>
 <div class="card card-pad"><h2>Respaldo y mantenimiento</h2><p class="help">El respaldo JSON contiene organizaciones, personas, movimientos y archivos adjuntos almacenados como datos internos.</p><div class="actions" style="margin-top:14px"><button class="btn btn-dark" data-action="export-json">${icon("download")}Exportar JSON</button><button class="btn" data-action="import-json">${icon("upload")}Importar JSON</button></div><hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><button class="btn btn-danger" data-action="wipe">${icon("trash")}Borrar toda la suite</button><p class="help">Esta acción elimina los datos de este dispositivo. No afecta respaldos externos.</p></div>
 </div>`
}

function selectOpts(arr,val){return arr.map(x=>`<option value="${esc(x)}" ${x===val?"selected":""}>${esc(x)}</option>`).join("")}
function multiselect(name,arr,vals=[]){return `<select id="${name}" multiple size="5">${arr.map(x=>`<option value="${esc(x)}" ${vals.includes(x)?"selected":""}>${esc(x)}</option>`).join("")}</select><div class="help">En computador: Ctrl/Cmd para varias. En celular, toca las opciones seleccionadas según tu navegador.</div>`}

function openOrg(id){
 const o=state.data.organizations.find(x=>x.id===id)||{id:uid("org"),name:"",type:"Curso",rut:"",address:"",email:"",phone:"+569",bank:{holder:"",rut:"",bank:"",accountType:"Cuenta corriente",accountNumber:"",email:""}};
 state.modal={type:"org",id:o.id};
 showModal(`<h2>${id?"Editar":"Nueva"} organización</h2>`,`
 <div class="form-grid">
 <div class="field full"><label>Nombre de la organización</label><input id="o-name" value="${esc(o.name)}" placeholder="Nombre completo de la organización"></div>
 <div class="field"><label>Tipo de organización</label><select id="o-type">${selectOpts(ORG_TYPES,o.type)}</select></div>
 <div class="field"><label>RUT de la organización</label><input id="o-rut" value="${esc(o.rut)}" data-rut placeholder="12.345.678-9"></div>
 <div class="field full"><label>Dirección</label><input id="o-address" value="${esc(o.address)}"></div>
 <div class="field"><label>Teléfono</label><input id="o-phone" value="${esc(o.phone||"+569")}" data-phone inputmode="tel"></div>
 <div class="field"><label>Correo</label><input id="o-email" value="${esc(o.email||"")}" type="email"></div>
 </div>
 <h3 style="margin-top:22px">Datos bancarios para reembolsos y transferencias</h3>
 <div class="form-grid">
 <div class="field"><label>Nombre titular</label><input id="b-holder" value="${esc(o.bank?.holder||"")}"></div>
 <div class="field"><label>RUT titular</label><input id="b-rut" value="${esc(o.bank?.rut||"")}" data-rut></div>
 <div class="field"><label>Banco</label><select id="b-bank">${selectOpts(["Banco de Chile","BancoEstado","Santander","BCI","Scotiabank","Itaú","Banco Falabella","Banco Ripley","Mercado Pago","Tenpo","Mach","Otro"],o.bank?.bank||"")}</select></div>
 <div class="field"><label>Tipo de cuenta</label><select id="b-type">${selectOpts(["Cuenta corriente","Cuenta vista","Cuenta RUT","Cuenta de ahorro","Cuenta digital","Otro"],o.bank?.accountType||"")}</select></div>
 <div class="field"><label>Número de cuenta</label><input id="b-number" value="${esc(o.bank?.accountNumber||"")}" inputmode="numeric"></div>
 <div class="field"><label>Correo para transferencias</label><input id="b-email" value="${esc(o.bank?.email||"")}" type="email"></div>
 </div>`,
 `<button class="btn" data-close>Cancelar</button><button class="btn btn-primary" data-save-org>${icon("check")}Guardar organización</button>`);
 bindFormFormatting();
 $$("[data-save-org]").forEach(b=>b.onclick=()=>saveOrg(o));
}
async function saveOrg(old){
 const o={...old,name:$("#o-name").value.trim(),type:$("#o-type").value,rut:normalizeRut($("#o-rut").value),address:$("#o-address").value.trim(),phone:normalizePhone($("#o-phone").value),email:$("#o-email").value.trim(),bank:{holder:$("#b-holder").value.trim(),rut:normalizeRut($("#b-rut").value),bank:$("#b-bank").value,accountType:$("#b-type").value,accountNumber:$("#b-number").value.trim(),email:$("#b-email").value.trim()}};
 if(!o.name)return toast("Ingresa el nombre de la organización.");
 const ix=state.data.organizations.findIndex(x=>x.id===o.id);if(ix>=0)state.data.organizations[ix]=o;else state.data.organizations.push(o);state.orgId=o.id;await save();closeModal();render();toast("Organización guardada.");
}

function openPerson(id){
 const p=state.data.people.find(x=>x.id===id)||{id:uid("person"),name:"",rut:"",address:"",phone:"+569",whatsapp:"+569",email:"",instagram:"",roles:["Integrante"],organizations:state.orgId?[state.orgId]:[],photo:"",notes:"",guardian:{name:"",rut:"",relation:"",phone:"+569",whatsapp:"+569",email:"",address:""}};
 state.modal={type:"person",id:p.id};
 showModal(`<h2>${id?"Ficha de persona":"Nueva persona"}</h2>`,`
 <div class="photo-box"><div class="photo-preview" id="photo-preview">${p.photo?`<img src="${p.photo}" alt="">`:initials(p.name)}</div><div><b>Fotografía</b><p class="help">Opcional. Puede repetirse la misma persona en varias organizaciones.</p><input id="p-photo" type="file" accept="image/*"></div></div>
 <div class="form-grid" style="margin-top:15px">
 <div class="field full"><label>Nombre completo</label><input id="p-name" value="${esc(p.name)}"></div>
 <div class="field"><label>RUT</label><input id="p-rut" value="${esc(p.rut)}" data-rut></div>
 <div class="field"><label>Dirección</label><input id="p-address" value="${esc(p.address)}"></div>
 <div class="field"><label>Teléfono celular</label><input id="p-phone" value="${esc(p.phone||"+569")}" data-phone inputmode="tel"><div class="help">+569 está precargado. Ingresa los 8 dígitos.</div></div>
 <div class="field"><label>WhatsApp</label><input id="p-wa" value="${esc(p.whatsapp||"+569")}" data-phone inputmode="tel"></div>
 <div class="field"><label>Correo</label><input id="p-email" value="${esc(p.email||"")}" type="email"></div>
 <div class="field"><label>Instagram</label><input id="p-instagram" value="${esc(p.instagram||"")}" placeholder="@usuario"></div>
 <div class="field full"><label>Roles</label>${multiselect("p-roles",PERSON_ROLES,p.roles||[])}</div>
 <div class="field full"><label>Organizaciones a las que pertenece</label>${`<select id="p-orgs" multiple size="5">${state.data.organizations.map(x=>`<option value="${esc(x.id)}" ${ (p.organizations||[]).includes(x.id)?"selected":""}>${esc(x.name)}</option>`).join("")}</select><div class="help">La ficha puede pertenecer a varias organizaciones.</div>`}<div class="help">La ficha puede pertenecer a varias organizaciones.</div></div>
 </div>
 <h3 style="margin-top:22px">Tutor / apoderado / responsable</h3>
 <div class="form-grid">
 <div class="field"><label>Nombre</label><input id="g-name" value="${esc(p.guardian?.name||"")}"></div>
 <div class="field"><label>RUT</label><input id="g-rut" value="${esc(p.guardian?.rut||"")}" data-rut></div>
 <div class="field"><label>Relación</label><select id="g-rel">${selectOpts(["Madre","Padre","Tutor/a","Apoderado/a","Responsable","Familiar","Otro"],p.guardian?.relation||"")}</select></div>
 <div class="field"><label>Teléfono</label><input id="g-phone" value="${esc(p.guardian?.phone||"+569")}" data-phone></div>
 <div class="field"><label>WhatsApp</label><input id="g-wa" value="${esc(p.guardian?.whatsapp||"+569")}" data-phone></div>
 <div class="field"><label>Correo</label><input id="g-email" value="${esc(p.guardian?.email||"")}" type="email"></div>
 <div class="field full"><label>Dirección</label><input id="g-address" value="${esc(p.guardian?.address||"")}"></div>
 </div>`,
 `<button class="btn" data-close>Cancelar</button><button class="btn btn-primary" data-save-person>${icon("check")}Guardar ficha</button>`);
 bindFormFormatting();
 $("#p-photo").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$("#photo-preview").innerHTML=`<img src="${r.result}" alt="">`;$("#p-photo").dataset.data=r.result};r.readAsDataURL(f)};
 $$("[data-save-person]").forEach(b=>b.onclick=()=>savePerson(p));
}
async function savePerson(old){
 const p={...old,name:$("#p-name").value.trim(),rut:normalizeRut($("#p-rut").value),address:$("#p-address").value.trim(),phone:normalizePhone($("#p-phone").value),whatsapp:normalizePhone($("#p-wa").value),email:$("#p-email").value.trim(),instagram:$("#p-instagram").value.trim(),roles:[...$("#p-roles").selectedOptions].map(x=>x.value),organizations:[...$("#p-orgs").selectedOptions].map(x=>x.value),guardian:{name:$("#g-name").value.trim(),rut:normalizeRut($("#g-rut").value),relation:$("#g-rel").value,phone:normalizePhone($("#g-phone").value),whatsapp:normalizePhone($("#g-wa").value),email:$("#g-email").value.trim(),address:$("#g-address").value.trim()}};
 if($("#p-photo").dataset.data)p.photo=$("#p-photo").dataset.data;
 if(!p.name)return toast("Ingresa el nombre.");
 const ix=state.data.people.findIndex(x=>x.id===p.id);if(ix>=0)state.data.people[ix]=p;else state.data.people.push(p);await save();closeModal();render();toast("Ficha guardada.");
}

function openMovement(id){
 const m=state.data.movements.find(x=>x.id===id)||{id:uid("mov"),orgId:state.orgId,type:"Ingreso",date:today(),concept:"",category:"Cuota obligatoria anual",amount:"",method:"Efectivo",receiver:"",provider:"",authorizer:"",responsible:"",notes:"",attachments:[]};
 const cats=m.type==="Ingreso"?INCOME_CATS:EXPENSE_CATS;
 showModal(`<h2>${id?"Detalle de movimiento":"Registrar movimiento"}</h2>`,`
 <div class="form-grid">
 <div class="field"><label>Tipo</label><select id="m-type">${selectOpts(MOV_TYPES,m.type)}</select></div>
 <div class="field"><label>Fecha</label><input id="m-date" type="date" value="${m.date||today()}"></div>
 <div class="field full"><label>Concepto</label><input id="m-concept" value="${esc(m.concept)}" placeholder="Ej.: Cuota marzo, actividad, compra de materiales…"></div>
 <div class="field"><label>Categoría</label><select id="m-category">${selectOpts(cats,m.category)}</select></div>
 <div class="field"><label>Monto</label><input id="m-amount" type="number" min="0" step="1" value="${m.amount||""}" inputmode="numeric"></div>
 <div class="field"><label>Medio</label><select id="m-method">${selectOpts(METHODS,m.method)}</select></div>
 <div class="field"><label>Quién recibe / proveedor</label><select id="m-receiver">${selectOpts(RECEIVERS,m.receiver||m.provider||"")}</select></div>
 <div class="field"><label>Quién autoriza</label><select id="m-authorizer">${selectOpts(AUTH_ROLES,m.authorizer||"")}</select></div>
 <div class="field"><label>Responsable del gasto / movimiento</label><select id="m-responsible">${selectOpts(PERSON_ROLES,m.responsible||"")}</select></div>
 <div class="field full"><label>Respaldo / comprobante</label><input id="m-files" type="file" multiple accept="image/*,.pdf,.jpg,.jpeg,.png"><div class="help">Puedes adjuntar boleta, comprobante, transferencia, foto u otro respaldo.</div></div>
 <div class="field full"><label>Observaciones</label><textarea id="m-notes" rows="3">${esc(m.notes||"")}</textarea></div>
 </div>`,
 `<button class="btn" data-close>Cancelar</button><button class="btn btn-primary" data-save-movement>${icon("check")}Guardar movimiento</button>`);
 $("#m-type").onchange=()=>{const c=$("#m-category");c.innerHTML=selectOpts($("#m-type").value==="Ingreso"?INCOME_CATS:EXPENSE_CATS,c.value)};
 $$("[data-save-movement]").forEach(b=>b.onclick=()=>saveMovement(m));
}
async function saveMovement(old){
 const files=[...($("#m-files")?.files||[])];
 const atts=[];
 for(const f of files){if(f.size>8*1024*1024){toast(`Archivo demasiado grande: ${f.name}`);continue}const data=await fileToDataURL(f);atts.push({id:uid("att"),name:f.name,type:f.type,size:f.size,data})}
 const m={...old,orgId:state.orgId,type:$("#m-type").value,date:$("#m-date").value,concept:$("#m-concept").value.trim(),category:$("#m-category").value,amount:Number($("#m-amount").value)||0,method:$("#m-method").value,receiver:$("#m-receiver").value,authorizer:$("#m-authorizer").value,responsible:$("#m-responsible").value,notes:$("#m-notes").value.trim(),attachments:[...(old.attachments||[]),...atts]};
 if(!m.concept||!m.amount)return toast("Completa concepto y monto.");
 const ix=state.data.movements.findIndex(x=>x.id===m.id);if(ix>=0)state.data.movements[ix]=m;else state.data.movements.push(m);
 await save();closeModal();render();toast("Movimiento guardado.");
}

function normalizeRut(v){v=String(v||"").toUpperCase().replace(/[^0-9K]/g,"");if(!v)return"";const body=v.slice(0,-1),dv=v.slice(-1);return body?`${Number(body).toLocaleString("es-CL")}-${dv}`:v}
function normalizePhone(v){let x=String(v||"").replace(/\D/g,"");if(x.startsWith("569"))return"+569"+x.slice(3,11);if(x.startsWith("56"))return"+56"+x.slice(2,11);if(x.length<=8)return"+569"+x.slice(0,8);return"+"+x.slice(0,12)}
function bindFormFormatting(){
 $$("[data-rut]").forEach(i=>i.addEventListener("blur",()=>i.value=normalizeRut(i.value)));
 $$("[data-phone]").forEach(i=>{if(!i.value)i.value="+569";i.addEventListener("input",()=>{let x=i.value.replace(/\D/g,"");if(x.startsWith("569"))x=x.slice(3);i.value="+569"+x.slice(0,8)})});
}
function fileToDataURL(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})}

function showModal(title,body,foot){const d=document.createElement("div");d.className="modal-backdrop";d.id="modal";d.innerHTML=`<div class="modal"><div class="modal-head">${title}<button class="icon-btn" data-close>${icon("close")}</button></div><div class="modal-body">${body}</div><div class="modal-foot">${foot}</div></div>`;document.body.appendChild(d);$$("[data-close]").forEach(b=>b.onclick=closeModal);d.addEventListener("click",e=>{if(e.target===d)closeModal()})}
function closeModal(){const m=$("#modal");if(m)m.remove();state.modal=null}
function toast(msg){let t=$("#toast");if(t)t.remove();t=document.createElement("div");t.id="toast";t.className="toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3200)}

function exportJSON(){
 const blob=new Blob([JSON.stringify({...state.data,exportedAt:new Date().toISOString(),schema:"tesoreria-multi-v2"},null,2)],{type:"application/json"});
 downloadBlob(blob,`tesoreria-respaldo-${today()}.json`);
}
function importJSON(){
 const i=document.createElement("input");i.type="file";i.accept=".json,application/json";i.onchange=async()=>{const f=i.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!d||!Array.isArray(d.organizations)||!Array.isArray(d.people)||!Array.isArray(d.movements))throw new Error("El JSON no tiene la estructura esperada.");state.data={organizations:d.organizations,people:d.people,movements:d.movements,attachments:d.attachments||[],settings:d.settings||{treasurer:{}}};await save();state.orgId=state.data.organizations[0]?.id||null;render();toast("Respaldo importado y datos actualizados.")}catch(e){toast("No se pudo importar: "+e.message)}};i.click();
}
function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}

function excelCell(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function exportExcel(){
 const o=org(), rows=orgMov().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
 const headers=["Fecha","Tipo","Organización","Concepto","Categoría","Medio","Quién recibe / proveedor","Quién autoriza","Responsable","Monto","Respaldo","Observaciones"];
 let body=rows.map(m=>`<Row>${[m.date,m.type,o?.name||"",m.concept,m.category,m.method,m.receiver||m.provider||"",m.authorizer||"",m.responsible||"",Number(m.amount)||0,(m.attachments||[]).length?"Sí":"No",m.notes||""].map((v,i)=>`<Cell${i===9?' ss:StyleID="money"':''}><Data ss:Type="${i===9?'Number':'String'}">${excelCell(v)}</Data></Cell>`).join("")}</Row>`).join("");
 const xml=`<?xml version="1.0" encoding="UTF-8"?>
 <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles><Style ss:ID="header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#34454C" ss:Pattern="Solid"/></Style><Style ss:ID="money"><NumberFormat ss:Format="#,##0"/></Style></Styles>
 <Worksheet ss:Name="GENERAL"><Table><Row>${headers.map(h=>`<Cell ss:StyleID="header"><Data ss:Type="String">${excelCell(h)}</Data></Cell>`).join("")}</Row>${body}</Table></Worksheet></Workbook>`;
 downloadBlob(new Blob([xml],{type:"application/vnd.ms-excel"}),`Tesoreria-General-${(o?.name||"sin-organizacion").replace(/[^a-z0-9áéíóúñ]+/gi,"_")}.xls`);
}

function openReport(){
 const o=org(),m=orgMov(),i=m.filter(x=>x.type==="Ingreso"),g=m.filter(x=>x.type==="Gasto"),annual=i.filter(x=>x.category==="Cuota obligatoria anual"),extra=i.filter(x=>x.category==="Cuota extraordinaria"),tre=selectedTreasurer();
 const recent=g.sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8);
 showModal(`<h2>Informe ${state.reportType==="master"?"— Planilla general":"— Resumen de tesorería"}</h2>`,
 `<div class="report-preview" id="report-print">
 <h2>${esc(o?.name||"Tesorería Multiorganizacional")}</h2><div class="report-sub">${esc(o?.type||"")} · RUT ${esc(o?.rut||"")} · ${esc(o?.address||"")}</div>
 <div class="report-kpis"><div class="report-kpi">Ingresos<b>${money(sum(i,"amount"))}</b></div><div class="report-kpi">Gastos<b>${money(sum(g,"amount"))}</b></div><div class="report-kpi">Monto real en tesorería<b>${money(sum(i,"amount")-sum(g,"amount"))}</b></div><div class="report-kpi">Personas<b>${peopleOrg().length}</b></div></div>
 <h3>Cuotas obligatorias anuales</h3><p><b>Total: ${money(sum(annual,"amount"))}</b> · Registros: ${annual.length}</p>
 <h3>Cuotas extraordinarias</h3><p><b>Total: ${money(sum(extra,"amount"))}</b> · Registros: ${extra.length}</p>
 <h3>Detalle de los últimos gastos</h3><table class="report-table"><thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Medio</th><th>Responsable</th><th>Monto</th></tr></thead><tbody>${recent.map(x=>`<tr><td>${fmtDate(x.date)}</td><td>${esc(x.concept)}</td><td>${esc(x.category)}</td><td>${esc(x.method)}</td><td>${esc(x.responsible)}</td><td>${money(x.amount)}</td></tr>`).join("")||`<tr><td colspan="6">Sin gastos registrados.</td></tr>`}</tbody></table>
 <h3>Datos bancarios de la organización</h3><p>${esc(o?.bank?.bank||"")} · ${esc(o?.bank?.accountType||"")} · ${esc(o?.bank?.accountNumber||"")} · Titular: ${esc(o?.bank?.holder||"")}</p>
 <hr><p><b>Tesorero/a:</b> ${esc(tre.name||"")} · ${esc(tre.rut||"")} · ${esc(tre.phone||"")} · ${esc(tre.email||"")}</p>
 </div>`,
 `<button class="btn" data-close>Cerrar</button><button class="btn btn-dark" data-action="print">${icon("print")}Imprimir / Guardar PDF</button>`);
}

async function saveTreasurer(){
 state.data.settings.treasurer={name:$("#tr-name").value.trim(),rut:normalizeRut($("#tr-rut").value),phone:normalizePhone($("#tr-phone").value),whatsapp:normalizePhone($("#tr-wa").value),email:$("#tr-email").value.trim()};
 await save();toast("Datos del tesorero guardados.");
}
async function installPWA(){
 if(window.__deferredInstall){window.__deferredInstall.prompt();await window.__deferredInstall.userChoice;window.__deferredInstall=null}
 else toast("Si el navegador no muestra el instalador, usa el menú del navegador → Instalar aplicación.");
}

document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-nav]");if(nav){state.view=nav.dataset.nav;render();return}
 const ob=e.target.closest("[data-org-open]");if(ob){state.orgId=ob.dataset.orgOpen;state.view="dashboard";render();return}
 const clear=e.target.closest('[data-action="clear-search"]');if(clear){state.search="";renderView();bindView();return}
 const pc=e.target.closest("[data-person]");if(pc){openPerson(pc.dataset.person);return}
 const mv=e.target.closest("[data-movement]");if(mv){openMovement(mv.dataset.movement);return}
});
document.addEventListener("input",e=>{
 if(e.target.id==="people-search"||e.target.id==="movement-search"){state.search=e.target.value;renderView();bindView();const el=document.getElementById(e.target.id);if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}}
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();window.__deferredInstall=e});
window.addEventListener("error",e=>console.error("Tesorería:",e.error||e.message));
boot();
})();
