/* Tesorería Multiorganizacional V3 - sin dependencias externas */
const KEY="tesoreria-multiorg-v3";
const state={view:"resumen", tab:"movimientos", data:null};

const blank=()=>({
  version:3,
  organization:null,
  members:[],
  accounts:[],
  movements:[],
  contributions:[],
  attachments:[],
  settings:{currency:"CLP",year:new Date().getFullYear(),periodStart:3,periodEnd:12}
});

function load(){try{const x=JSON.parse(localStorage.getItem(KEY));state.data=x&&x.version===3?x:blank()}catch(e){state.data=blank()}}
function save(){localStorage.setItem(KEY,JSON.stringify(state.data));render()}
function money(n){return new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(Number(n)||0)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function id(){return crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2)}
function today(){return new Date().toISOString().slice(0,10)}
function fmtDate(d){if(!d)return "";const [y,m,day]=d.split("-");return `${day}/${m}/${y}`}
function org(){return state.data.organization}
function members(){return state.data.members}
function accountName(idv){return state.data.accounts.find(a=>a.id===idv)?.name||"—"}
function memberName(idv){return state.data.members.find(a=>a.id===idv)?.name||"—"}
function totals(){
 let inc=0,out=0,other=0;
 state.data.movements.forEach(m=>{if(m.type==="Ingreso")inc+=+m.amount||0;else if(m.type==="Egreso")out+=+m.amount||0});
 state.data.movements.forEach(m=>{if(m.status==="Pendiente")other+=+m.amount||0});
 return {inc,out,balance:inc-out,pending:other};
}
function year(){return state.data.settings.year}

const navItems=[
 ["resumen","📊","Resumen"],["integrantes","👥","Integrantes"],["movimientos","💳","Movimientos"],
 ["cuotas","🧾","Cuotas"],["informes","📋","Informes"],["config","⚙️","Config"]
];

function renderNav(){document.getElementById("nav").innerHTML=navItems.map(x=>`<button class="${state.view===x[0]?"active":""}" data-view="${x[0]}">${x[1]} ${x[2]}</button>`).join("")}
document.addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b){state.view=b.dataset.view;render()}});
document.getElementById("resetBtn").onclick=()=>{if(confirm("Esto eliminará TODOS los datos locales de esta suite. ¿Continuar?")){localStorage.removeItem(KEY);location.reload()}};

function render(){renderNav();document.getElementById("orgHeader").textContent=org()?`${org().name} · ${year()}`:"Suite limpia · sin datos precargados";const el=document.getElementById("app");el.innerHTML=views[state.view]();bind();window.scrollTo(0,0)}
function shell(title,sub,body){return `<section class="pagehead"><h1>${title}</h1><p>${sub}</p></section>${body}`}
function noOrg(){return `<div class="card notice warning"><b>Primero crea una organización.</b><p>La aplicación comienza completamente vacía. Luego podrás registrar integrantes, cuentas, cuotas, ingresos, egresos, respaldos e informes.</p><button class="btn primary" data-action="neworg">+ Crear organización</button></div>`}

const views={
 resumen:()=>shell("Resumen de tesorería","Visión general de aportes, movimientos, responsables y saldos.",!org()?noOrg():(()=>{
  const t=totals(), own=t.balance, cash=state.data.accounts.reduce((s,a)=>s+(+a.balance||0),0);
  return `<div class="notice"><b>${esc(org().name)}</b> · ${year()} · período ${state.data.settings.periodStart}–${state.data.settings.periodEnd}. Los saldos se calculan automáticamente desde los movimientos registrados.</div>
  <div class="grid">
   <div class="card kpi purple"><div class="label">SALDO TEÓRICO</div><div class="value">${money(own)}</div><div class="small">Ingresos − egresos registrados.</div></div>
   <div class="card kpi green"><div class="label">SALDO EN CUENTAS/CAJA</div><div class="value">${money(cash)}</div><div class="small">Saldo informado de cuentas y efectivo.</div></div>
   <div class="card kpi orange"><div class="label">INGRESOS</div><div class="value">${money(t.inc)}</div><div class="small">${state.data.movements.filter(m=>m.type==="Ingreso").length} movimientos.</div></div>
   <div class="card kpi red"><div class="label">EGRESOS</div><div class="value">${money(t.out)}</div><div class="small">${state.data.movements.filter(m=>m.type==="Egreso").length} movimientos.</div></div>
  </div>
  <div class="grid2">
   <div class="card"><h3>Resumen por cuenta</h3>${accountTable()}</div>
   <div class="card"><h3>Últimos movimientos</h3>${movementTable(5)}</div>
  </div>`;
 })()),
 integrantes:()=>shell("Integrantes","Personas, cargos, datos de contacto y responsables de dinero.",!org()?noOrg():`
 <div class="actions"><button class="btn primary" data-action="newmember">+ Nuevo integrante</button><button class="btn" data-action="memberreport">📄 PDF integrantes</button></div>
 <div class="card"><div class="tablewrap">${membersTable()}</div></div>`),
 movimientos:()=>shell("Ingresos y egresos","Registro separado, trazable y con respaldo de cada movimiento.",!org()?noOrg():`
 <div class="actions"><button class="btn primary" data-action="income">+ Registrar ingreso</button><button class="btn danger" data-action="expense">− Registrar egreso</button><button class="btn" data-action="movementreport">📄 PDF movimientos</button></div>
 <div class="card"><div class="formgrid">
  <div><label>Desde</label><input id="fFrom" type="date"></div><div><label>Hasta</label><input id="fTo" type="date"></div>
  <div><label>Tipo</label><select id="fType"><option value="">Todos</option><option>Ingreso</option><option>Egreso</option></select></div>
  <div><label>Categoría</label><select id="fCat"><option value="">Todas</option><option>Cuota</option><option>Aporte extraordinario</option><option>Ingreso extraordinario</option><option>Otro ingreso</option><option>Compra</option><option>Servicio</option><option>Reembolso</option><option>Otro egreso</option></select></div>
 </div></div>
 <div class="card"><div class="tablewrap">${movementTable()}</div></div>`),
 cuotas:()=>shell("Cuotas y aportes","Define cuotas anuales, mensuales, extraordinarias u otros aportes y controla quién ha pagado.",!org()?noOrg():`
 <div class="actions"><button class="btn primary" data-action="newcontribution">+ Crear cuota/aporte</button><button class="btn" data-action="contribreport">📄 PDF cuotas</button></div>
 <div class="card"><div class="tablewrap">${contributionTable()}</div></div>`),
 informes:()=>shell("Informes","Documentos claros, imprimibles y descargables en PDF.",!org()?noOrg():`
 <div class="grid2">
  <div class="card"><h3>Informe general</h3><p class="small">Resumen tipo planilla: ingresos, egresos, saldo y detalle completo.</p><button class="btn primary" data-action="generalreport">⬇ Descargar PDF general</button><button class="btn" data-action="generalcsv">⬇ CSV para Excel</button></div>
  <div class="card"><h3>Informes específicos</h3><div class="actions"><button class="btn" data-action="movementreport">Movimientos</button><button class="btn" data-action="memberreport">Integrantes</button><button class="btn" data-action="contribreport">Cuotas</button></div></div>
 </div>
 <div class="card"><h3>Vista previa general</h3>${reportPreview()}</div>`),
 config:()=>shell("Configuración","Organización, representantes, cuentas bancarias, respaldos y copias de seguridad.",!org()?noOrg():`
 <div class="tabs"><button class="${state.tab==="org"?"active":""}" data-tab="org">Organización</button><button class="${state.tab==="accounts"?"active":""}" data-tab="accounts">Bancos y cuentas</button><button class="${state.tab==="backup"?"active":""}" data-tab="backup">Respaldos</button></div>
 ${state.tab==="org"?orgForm():state.tab==="accounts"?accountsView():backupView()}`)
};

function accountTable(){if(!state.data.accounts.length)return `<div class="empty">No hay cuentas. Agrega caja, banco u otra cuenta.</div>`;return `<div class="tablewrap"><table class="table"><thead><tr><th>Cuenta</th><th>Tipo</th><th>Banco</th><th>N° / alias</th><th>Saldo</th></tr></thead><tbody>${state.data.accounts.map(a=>`<tr><td>${esc(a.name)}</td><td>${esc(a.kind)}</td><td>${esc(a.bank||"—")}</td><td>${esc(a.number||"—")}</td><td class="money">${money(a.balance)}</td></tr>`).join("")}</tbody></table></div>`}
function membersTable(){if(!members().length)return `<div class="empty">No hay integrantes registrados.</div>`;return `<table class="table"><thead><tr><th>Nombre</th><th>RUT</th><th>Cargo</th><th>Teléfono</th><th>Email</th><th>Banco/cuenta</th><th></th></tr></thead><tbody>${members().map(m=>`<tr><td><b>${esc(m.name)}</b></td><td>${esc(m.rut||"—")}</td><td>${esc(m.role||"—")}</td><td>${esc(m.phone||"—")}</td><td>${esc(m.email||"—")}</td><td>${esc(m.bank||"—")} ${m.accountNo?esc(m.accountNo):""}</td><td><button class="btn" data-edit-member="${m.id}">Editar</button></td></tr>`).join("")}</tbody></table>`}
function movementTable(limit=9999){let arr=[...state.data.movements].sort((a,b)=>b.date.localeCompare(a.date));if(limit<9999)arr=arr.slice(0,limit);if(!arr.length)return `<div class="empty">No hay movimientos registrados.</div>`;return `<table class="table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Responsable</th><th>Cuenta</th><th>Detalle</th><th>Monto</th><th>Respaldo</th><th></th></tr></thead><tbody>${arr.map(m=>`<tr><td>${fmtDate(m.date)}</td><td><span class="badge ${m.type==="Ingreso"?"in":"out"}">${m.type}</span></td><td>${esc(m.category)}</td><td>${esc(memberName(m.responsibleId))}</td><td>${esc(accountName(m.accountId))}</td><td>${esc(m.description||"")}</td><td class="money ${m.type==="Ingreso"?"income":"expense"}">${m.type==="Ingreso"?"+":"−"} ${money(m.amount)}</td><td>${m.attachmentName?`📎 ${esc(m.attachmentName)}`:"—"}</td><td><button class="btn" data-edit-movement="${m.id}">Editar</button></td></tr>`).join("")}</tbody></table>`}
function contributionTable(){if(!state.data.contributions.length)return `<div class="empty">No hay cuotas/aportes definidos. Crea una cuota anual, mensual o extraordinaria.</div>`;return `<table class="table"><thead><tr><th>Concepto</th><th>Tipo</th><th>Período</th><th>Monto</th><th>Pagos</th><th></th></tr></thead><tbody>${state.data.contributions.map(c=>{const pays=state.data.movements.filter(m=>m.type==="Ingreso"&&m.contributionId===c.id);return `<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.kind)}</td><td>${esc(c.period||"—")}</td><td class="money">${money(c.amount)}</td><td>${pays.length}</td><td><button class="btn" data-pay-contribution="${c.id}">Registrar pago</button></td></tr>`}).join("")}</tbody></table>`}
function reportPreview(){const t=totals();return `<div class="grid"><div><b>Ingresos</b><div class="value">${money(t.inc)}</div></div><div><b>Egresos</b><div class="value">${money(t.out)}</div></div><div><b>Saldo</b><div class="value">${money(t.balance)}</div></div><div><b>Movimientos</b><div class="value">${state.data.movements.length}</div></div></div>`}

function orgForm(){const o=org()||{};return `<div class="card"><h2>Datos de la organización</h2><div class="formgrid">
<label>Nombre legal / nombre de la organización<input id="orgName" value="${esc(o.name)}" required></label>
<label>RUT (opcional)<input id="orgRut" value="${esc(o.rut||"")}" placeholder="12.345.678-9"></label>
<label>Tipo de organización<select id="orgType">${["Curso","Club deportivo","Centro de madres","Centro de padres","Club de adulto mayor","Junta de vecinos","Organización comunitaria","Fundación","Corporación","Otra"].map(x=>`<option ${o.type===x?"selected":""}>${x}</option>`).join("")}</select></label>
<label>Año<input id="setYear" type="number" value="${year()}"></label>
<label>Dirección<input id="orgAddress" value="${esc(o.address||"")}"></label>
<label>Comuna / ciudad<input id="orgCity" value="${esc(o.city||"")}"></label>
<label>Teléfono<input id="orgPhone" value="${esc(o.phone||"")}"></label>
<label>Correo electrónico<input id="orgEmail" type="email" value="${esc(o.email||"")}"></label>
<label>Página web<input id="orgWeb" value="${esc(o.web||"")}" placeholder="https://..."></label>
<label>Instagram / red social<input id="orgSocial" value="${esc(o.social||"")}" placeholder="@usuario o URL"></label>
<label>Período desde mes<input id="pStart" type="number" min="1" max="12" value="${state.data.settings.periodStart}"></label>
<label>Período hasta mes<input id="pEnd" type="number" min="1" max="12" value="${state.data.settings.periodEnd}"></label>
<label class="full">Observaciones<textarea id="orgNotes">${esc(o.notes||"")}</textarea></label>
</div><h3>Representantes</h3><div id="reps">${(o.representatives||[]).map((r,i)=>`<div class="formgrid rep"><label>Nombre<input data-rep-name="${i}" value="${esc(r.name)}"></label><label>Cargo<input data-rep-role="${i}" value="${esc(r.role)}"></label><label>RUT<input data-rep-rut="${i}" value="${esc(r.rut||"")}"></label><label>Contacto<input data-rep-contact="${i}" value="${esc(r.contact||"")}"></label></div>`).join("")}</div><button class="btn" data-action="addrep">+ Agregar representante</button> <button class="btn primary" data-action="saveorg">Guardar organización</button></div>`}
function accountsView(){return `<div class="actions"><button class="btn primary" data-action="newaccount">+ Nueva cuenta</button></div><div class="card">${accountTable()}<p class="small">Incluye caja, cuenta corriente, cuenta vista, ahorro u otra. Los bancos se eligen desde una lista y puedes usar “Otro”.</p></div>`}
function backupView(){return `<div class="card"><h2>Copias y respaldos</h2><p>Exporta toda la suite a JSON para conservar datos y respaldos. Puedes volver a importarla en otro dispositivo.</p><div class="actions"><button class="btn primary" data-action="exportjson">⬇ Exportar respaldo JSON</button><button class="btn" data-action="importjson">⬆ Importar respaldo JSON</button><button class="btn" data-action="exportcsv">⬇ Exportar movimientos CSV</button></div><hr><h3>Respaldos de movimientos</h3><p class="small">Las imágenes/archivos adjuntos se almacenan junto al movimiento. El respaldo JSON conserva también esos datos.</p></div>`}

function modal(title,html){const d=document.createElement("dialog");d.style.cssText="border:0;border-radius:18px;max-width:720px;width:calc(100% - 24px);padding:0;box-shadow:0 20px 70px #0005";d.innerHTML=`<div class="card" style="margin:0"><div class="two"><h2>${title}</h2><button class="btn" data-close>✕</button></div>${html}</div>`;document.body.appendChild(d);d.showModal();d.querySelector("[data-close]").onclick=()=>d.close();d.addEventListener("close",()=>d.remove());return d}
function memberForm(m={}){return `<form id="memberForm"><div class="formgrid"><label>Nombre completo<input id="mName" required value="${esc(m.name||"")}"></label><label>RUT<input id="mRut" value="${esc(m.rut||"")}"></label><label>Cargo/rol<input id="mRole" value="${esc(m.role||"")}"></label><label>Teléfono<input id="mPhone" value="${esc(m.phone||"")}"></label><label>Email<input id="mEmail" type="email" value="${esc(m.email||"")}"></label><label>Banco<input id="mBank" value="${esc(m.bank||"")}"></label><label>Tipo de cuenta<input id="mAccountType" value="${esc(m.accountType||"")}"></label><label>N° de cuenta<input id="mAccountNo" value="${esc(m.accountNo||"")}"></label><label class="full">Observaciones<textarea id="mNotes">${esc(m.notes||"")}</textarea></label></div><button class="btn primary">Guardar integrante</button></form>`}
function movementForm(m={},forcedType=""){const type=m.type||forcedType||"Ingreso";return `<form id="movementForm"><div class="formgrid">
<label>Tipo<select id="mvType"><option ${type==="Ingreso"?"selected":""}>Ingreso</option><option ${type==="Egreso"?"selected":""}>Egreso</option></select></label>
<label>Fecha<input id="mvDate" type="date" value="${m.date||today()}"></label>
<label>Categoría<select id="mvCat">${["Cuota","Aporte extraordinario","Ingreso extraordinario","Otro ingreso","Compra","Servicio","Reembolso","Otro egreso"].map(x=>`<option ${m.category===x?"selected":""}>${x}</option>`).join("")}</select></label>
<label>Monto<input id="mvAmount" type="number" min="0" step="1" required value="${m.amount||""}"></label>
<label>Responsable<select id="mvResponsible"><option value="">— Seleccionar —</option>${members().map(x=>`<option value="${x.id}" ${m.responsibleId===x.id?"selected":""}>${esc(x.name)} · ${esc(x.role||"")}</option>`).join("")}</select></label>
<label>Cuenta/caja<select id="mvAccount"><option value="">— Seleccionar —</option>${state.data.accounts.map(x=>`<option value="${x.id}" ${m.accountId===x.id?"selected":""}>${esc(x.name)} · ${esc(x.kind)}</option>`).join("")}</select></label>
<label>Cuota/aporte asociado<select id="mvContribution"><option value="">— No asociado —</option>${state.data.contributions.map(x=>`<option value="${x.id}" ${m.contributionId===x.id?"selected":""}>${esc(x.name)} · ${money(x.amount)}</option>`).join("")}</select></label>
<label>Estado<select id="mvStatus"><option ${m.status!=="Pendiente"?"selected":""}>Registrado</option><option ${m.status==="Pendiente"?"selected":""}>Pendiente</option></select></label>
<label class="full">Detalle / glosa<input id="mvDesc" value="${esc(m.description||"")}"></label>
<label class="full">Respaldo (imagen/PDF/archivo)<input id="mvFile" type="file" accept="image/*,.pdf,.jpg,.jpeg,.png"></label>
</div><p class="small">${m.attachmentName?`Respaldo actual: ${esc(m.attachmentName)}`:"Puedes adjuntar una fotografía del comprobante, boleta, transferencia o documento."}</p><button class="btn primary">Guardar movimiento</button></form>`}
function contributionForm(c={}){return `<form id="contributionForm"><div class="formgrid"><label>Nombre<input id="cName" required value="${esc(c.name||"")}"></label><label>Tipo<select id="cKind">${["Cuota mensual","Cuota anual","Aporte extraordinario","Otro aporte"].map(x=>`<option ${c.kind===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Período<input id="cPeriod" placeholder="Ej. 2026, Marzo, Marzo-Diciembre" value="${esc(c.period||"")}" ></label><label>Monto<input id="cAmount" type="number" min="0" required value="${c.amount||""}"></label><label class="full">Descripción<textarea id="cDesc">${esc(c.description||"")}</textarea></label></div><button class="btn primary">Guardar cuota/aporte</button></form>`}
function accountForm(a={}){const banks=["BancoEstado","Banco de Chile","Santander","BCI","Scotiabank","Itaú","Banco Falabella","Banco Ripley","Tenpo","Mercado Pago","Otro"];return `<form id="accountForm"><div class="formgrid"><label>Nombre de la cuenta/caja<input id="aName" required value="${esc(a.name||"")}"></label><label>Tipo<select id="aKind">${["Caja efectivo","Cuenta corriente","Cuenta vista","Cuenta de ahorro","Cuenta digital","Otra"].map(x=>`<option ${a.kind===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Banco<select id="aBank"><option value="">— No aplica —</option>${banks.map(x=>`<option ${a.bank===x?"selected":""}>${x}</option>`).join("")}</select></label><label>Número / alias<input id="aNumber" value="${esc(a.number||"")}"></label><label>Saldo inicial<input id="aBalance" type="number" value="${a.balance??0}"></label><label class="full">Observaciones<textarea id="aNotes">${esc(a.notes||"")}</textarea></label></div><button class="btn primary">Guardar cuenta</button></form>`}

function bind(){
 document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;render()});
 document.querySelectorAll("[data-edit-member]").forEach(b=>b.onclick=()=>{const m=members().find(x=>x.id===b.dataset.editMember);const d=modal("Editar integrante",memberForm(m));d.querySelector("form").onsubmit=e=>{e.preventDefault();Object.assign(m,{name:mName.value,rut:mRut.value,role:mRole.value,phone:mPhone.value,email:mEmail.value,bank:mBank.value,accountType:mAccountType.value,accountNo:mAccountNo.value,notes:mNotes.value});save();d.close()}});
 document.querySelectorAll("[data-edit-movement]").forEach(b=>b.onclick=()=>{const m=state.data.movements.find(x=>x.id===b.dataset.editMovement);const d=modal("Editar movimiento",movementForm(m));movementSubmit(d,m)});
 document.querySelectorAll("[data-pay-contribution]").forEach(b=>b.onclick=()=>{const c=state.data.contributions.find(x=>x.id===b.dataset.payContribution);const d=modal("Registrar pago de cuota",movementForm({type:"Ingreso",category:c.kind==="Aporte extraordinario"?"Aporte extraordinario":"Cuota",contributionId:c.id,amount:c.amount},"Ingreso"));movementSubmit(d,null)});
 document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>action(b.dataset.action));
}
function movementSubmit(d,m){
 d.querySelector("form").onsubmit=async e=>{e.preventDefault();let file=document.getElementById("mvFile").files[0], att=m?.attachmentName?{attachmentName:m.attachmentName,attachmentData:m.attachmentData}:{};if(file){if(file.size>3*1024*1024){alert("El archivo supera 3 MB. Usa una imagen/PDF más pequeño.");return}att={attachmentName:file.name,attachmentType:file.type,attachmentData:await readFile(file)}}const obj={id:m?.id||id(),type:mvType.value,date:mvDate.value,category:mvCat.value,amount:+mvAmount.value,responsibleId:mvResponsible.value,accountId:mvAccount.value,contributionId:mvContribution.value,status:mvStatus.value,description:mvDesc.value,...att};if(m)Object.assign(m,obj);else state.data.movements.push(obj);save();d.close()};
}
function readFile(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})}

async function action(a){
 if(a==="neworg"){const d=modal("Crear organización",orgForm());d.querySelector("[data-action=saveorg]").onclick=()=>{saveOrg();d.close()};d.querySelector("[data-action=addrep]").onclick=()=>addRep(d)}
 if(a==="saveorg")saveOrg();
 if(a==="addrep")addRep();
 if(a==="newmember"){const d=modal("Nuevo integrante",memberForm());d.querySelector("form").onsubmit=e=>{e.preventDefault();state.data.members.push({id:id(),name:mName.value,rut:mRut.value,role:mRole.value,phone:mPhone.value,email:mEmail.value,bank:mBank.value,accountType:mAccountType.value,accountNo:mAccountNo.value,notes:mNotes.value});save();d.close()}}
 if(a==="income"||a==="expense"){const d=modal(a==="income"?"Registrar ingreso":"Registrar egreso",movementForm({},a==="income"?"Ingreso":"Egreso"));movementSubmit(d,null)}
 if(a==="newcontribution"){const d=modal("Nueva cuota o aporte",contributionForm());d.querySelector("form").onsubmit=e=>{e.preventDefault();state.data.contributions.push({id:id(),name:cName.value,kind:cKind.value,period:cPeriod.value,amount:+cAmount.value,description:cDesc.value});save();d.close()}}
 if(a==="newaccount"){const d=modal("Nueva cuenta bancaria o caja",accountForm());d.querySelector("form").onsubmit=e=>{e.preventDefault();state.data.accounts.push({id:id(),name:aName.value,kind:aKind.value,bank:aBank.value,number:aNumber.value,balance:+aBalance.value||0,notes:aNotes.value});save();d.close()}}
 if(a==="saveorg")saveOrg();
 if(a==="addrep")addRep();
 if(a==="exportjson")download("tesoreria-respaldo.json",JSON.stringify(state.data,null,2),"application/json");
 if(a==="importjson"){const inp=document.createElement("input");inp.type="file";inp.accept=".json";inp.onchange=async()=>{try{const x=JSON.parse(await inp.files[0].text());if(x.version!==3)throw Error();state.data=x;save();alert("Respaldo importado correctamente.")}catch(e){alert("No se pudo importar: archivo inválido o versión incompatible.")}};inp.click()}
 if(a==="exportcsv")download("movimientos-tesoreria.csv",csvMovements(),"text/csv;charset=utf-8");
 if(a==="generalreport")pdfGeneral();
 if(a==="movementreport")pdfMovements();
 if(a==="memberreport")pdfMembers();
 if(a==="contribreport")pdfContributions();
 if(a==="generalcsv")download("resumen-tesoreria.csv",csvGeneral(),"text/csv;charset=utf-8");
}
function addRep(d){const o=org();o.representatives=o.representatives||[];o.representatives.push({name:"",role:"",rut:"",contact:""});if(d)d.close(),render();else render()}
function saveOrg(){if(!org())state.data.organization={};const o=state.data.organization;o.name=document.getElementById("orgName")?.value?.trim()||o.name;o.rut=document.getElementById("orgRut")?.value||"";o.type=document.getElementById("orgType")?.value||"Otra";o.address=document.getElementById("orgAddress")?.value||"";o.city=document.getElementById("orgCity")?.value||"";o.phone=document.getElementById("orgPhone")?.value||"";o.email=document.getElementById("orgEmail")?.value||"";o.web=document.getElementById("orgWeb")?.value||"";o.social=document.getElementById("orgSocial")?.value||"";o.notes=document.getElementById("orgNotes")?.value||"";state.data.settings.year=+document.getElementById("setYear")?.value||year();state.data.settings.periodStart=+document.getElementById("pStart")?.value||3;state.data.settings.periodEnd=+document.getElementById("pEnd")?.value||12;o.representatives=[...document.querySelectorAll(".rep")].map((r,i)=>({name:r.querySelector(`[data-rep-name="${i}"]`)?.value||"",role:r.querySelector(`[data-rep-role="${i}"]`)?.value||"",rut:r.querySelector(`[data-rep-rut="${i}"]`)?.value||"",contact:r.querySelector(`[data-rep-contact="${i}"]`)?.value||""}));save();alert("Organización guardada.")}
function csvMovements(){const rows=[["Fecha","Tipo","Categoría","Responsable","Cuenta","Detalle","Monto","Estado","Respaldo"],...state.data.movements.map(m=>[m.date,m.type,m.category,memberName(m.responsibleId),accountName(m.accountId),m.description,m.amount,m.status,m.attachmentName||""])];return csv(rows)}
function csvGeneral(){const t=totals();return csv([["Resumen de tesorería"],["Organización",org()?.name||""],["RUT",org()?.rut||""],["Año",year()],["Ingresos",t.inc],["Egresos",t.out],["Saldo",t.balance],[],["Fecha","Tipo","Categoría","Responsable","Cuenta","Detalle","Monto"],...state.data.movements.map(m=>[m.date,m.type,m.category,memberName(m.responsibleId),accountName(m.accountId),m.description,m.amount])])}
function csv(rows){return rows.map(r=>r.map(x=>`"${String(x??"").replaceAll('"','""')}"`).join(";")).join("\n")}
function download(name,data,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

function pdfEscape(s){return String(s??"").replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")}
function makePDF(title,lines){const W=595,H=842,margin=38;let y=800,objs=[];let content="BT\n/F1 16 Tf\n"+margin+" "+y+' Td\n('+pdfEscape(title)+") Tj\n/F1 9 Tf\n0 -22 Td\n";for(const line of lines){const chunks=String(line).match(/.{1,92}/g)||[""];for(const c of chunks){if(y<45){content+="ET";objs.push({type:"content",data:content});content="BT\n/F1 9 Tf\n"+margin+" 800 Td\n";y=800}content+="("+pdfEscape(c)+") Tj\n0 -13 Td\n";y-=13}}content+="ET";objs.push({type:"content",data:content});
let pdf="%PDF-1.4\n", offsets=[0];const add=(s)=>{offsets.push(pdf.length);pdf+=s};
add("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
add("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n");
add("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+H+"] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n");
add("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n");
const c=objs[0].data;add(`5 0 obj << /Length ${c.length} >> stream\n${c}\nendstream endobj\n`);
const xref=pdf.length;pdf+="xref\n0 6\n0000000000 65535 f \n";for(let i=1;i<=5;i++)pdf+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";pdf+=`trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return pdf}
function pdfDownload(name,title,lines){const bytes=new TextEncoder().encode(makePDF(title,lines));download(name,bytes,"application/pdf")}
function pdfGeneral(){const t=totals(),lines=[`Organización: ${org()?.name||""}`,`RUT: ${org()?.rut||"No informado"}`,`Tipo: ${org()?.type||""}`,`Período: ${year()}`,`Dirección: ${org()?.address||""}`,``,`INGRESOS: ${money(t.inc)}`,`EGRESOS: ${money(t.out)}`,`SALDO TEÓRICO: ${money(t.balance)}`,``,`DETALLE DE MOVIMIENTOS`,`Fecha | Tipo | Categoría | Responsable | Cuenta | Monto`,...state.data.movements.sort((a,b)=>a.date.localeCompare(b.date)).map(m=>`${fmtDate(m.date)} | ${m.type} | ${m.category} | ${memberName(m.responsibleId)} | ${accountName(m.accountId)} | ${money(m.amount)}`)];pdfDownload("informe-general-tesoreria.pdf","INFORME GENERAL DE TESORERÍA",lines)}
function pdfMovements(){pdfDownload("informe-movimientos.pdf","INFORME DE INGRESOS Y EGRESOS",[...state.data.movements.sort((a,b)=>a.date.localeCompare(b.date)).map(m=>`${fmtDate(m.date)} | ${m.type} | ${m.category} | ${memberName(m.responsibleId)} | ${accountName(m.accountId)} | ${money(m.amount)} | ${m.description||""}`)])}
function pdfMembers(){pdfDownload("informe-integrantes.pdf","INFORME DE INTEGRANTES",members().map(m=>`${m.name} | RUT: ${m.rut||"—"} | Cargo: ${m.role||"—"} | Tel: ${m.phone||"—"} | Email: ${m.email||"—"} | Banco: ${m.bank||"—"} ${m.accountNo||""}`))}
function pdfContributions(){pdfDownload("informe-cuotas.pdf","INFORME DE CUOTAS Y APORTES",state.data.contributions.map(c=>`${c.name} | ${c.kind} | ${c.period||"—"} | ${money(c.amount)} | Pagos: ${state.data.movements.filter(m=>m.contributionId===c.id).length}`))}

load();render();
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
