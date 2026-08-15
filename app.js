/* TESORERÍA MULTIORGANIZACIONAL — NUEVA BASE, SIN DATOS */
(() => {
  "use strict";

  const DB_NAME = "TesoreriaMultiorganizacionalCleanDB";
  const DB_VERSION = 1;
  const STORES = [
    "organizaciones","instituciones","tesoreros","cajas","integrantes",
    "membresias","conceptos","ingresos","egresos","auditoria","preferencias"
  ];

  const state = {
    db:null, view:"dashboard", currentOrgId:null, role:"Administrador",
    data:Object.fromEntries(STORES.map(s => [s, []])),
    ready:false, theme:"claro"
  };

  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
  const money = n => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(Number(n)||0);
  const dateFmt = d => d ? new Intl.DateTimeFormat("es-CL",{dateStyle:"medium"}).format(new Date(d+"T00:00:00")) : "—";
  const today = () => new Date().toISOString().slice(0,10);

  function showBoot(text, error=false) {
    $("bootText").textContent = text;
    $("bootRetry").hidden = !error;
    $("bootReset").hidden = !error;
  }

  function openDB() {
    return new Promise((resolve,reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB no está disponible en este entorno."));
      let request;
      try { request = indexedDB.open(DB_NAME, DB_VERSION); }
      catch (e) { return reject(e); }

      request.onupgradeneeded = event => {
        const db = event.target.result;
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            const opts = store === "preferencias" ? {keyPath:"id"} : {keyPath:"id",autoIncrement:true};
            db.createObjectStore(store, opts);
          }
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () => reject(request.error || new Error("No se pudo abrir IndexedDB."));
      request.onblocked = () => reject(new Error("La base de datos está bloqueada por otra ventana. Cierra otras pestañas de Tesorería y reintenta."));
    });
  }

  function requestStore(store, mode, action) {
    return new Promise((resolve,reject) => {
      if (!state.db) return reject(new Error("Base de datos no inicializada."));
      let tx;
      try { tx = state.db.transaction(store, mode); }
      catch (e) { return reject(e); }
      const objectStore = tx.objectStore(store);
      let req;
      try { req = action(objectStore); } catch (e) { reject(e); return; }
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error(`Error en ${store}.`));
      tx.onerror = () => reject(tx.error || new Error(`Error de transacción en ${store}.`));
    });
  }

  const getAll = store => requestStore(store,"readonly",s => s.getAll());
  const put = (store,obj) => requestStore(store,"readwrite",s => s.put(obj));
  const clearStore = store => requestStore(store,"readwrite",s => s.clear());

  async function loadAll() {
    for (const store of STORES) state.data[store] = await getAll(store);
    if (!state.currentOrgId || !state.data.organizaciones.some(o => o.id === state.currentOrgId)) {
      state.currentOrgId = state.data.organizaciones[0]?.id ?? null;
    }
    const pref = state.data.preferencias.find(x => x.id === 1);
    state.theme = pref?.tema === "oscuro" ? "oscuro" : "claro";
    applyTheme();
  }

  async function audit(action, entity, detail="") {
    try {
      await put("auditoria",{fecha:new Date().toISOString(),rol:state.role,accion:action,entidad:entity,detalle:detail});
    } catch {}
  }

  function currentOrg() {
    return state.data.organizaciones.find(o => o.id === state.currentOrgId) || null;
  }

  function orgFilter(store) {
    return state.data[store].filter(x => Number(x.id_organizacion) === Number(state.currentOrgId));
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    $("themeBtn").textContent = state.theme === "oscuro" ? "☀" : "☼";
  }

  function toast(text) {
    const el = $("toast"); el.textContent = text; el.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function modal(html) {
    $("modalContent").innerHTML = html;
    $("modal").hidden = false;
  }
  function closeModal(){ $("modal").hidden = true; $("modalContent").innerHTML = ""; }

  function renderOrgSelect() {
    const s = $("orgSelect");
    const orgs = state.data.organizaciones;
    s.innerHTML = orgs.length
      ? orgs.map(o => `<option value="${esc(o.id)}">${esc(o.nombre || "Organización")}</option>`).join("")
      : `<option value="">Sin organizaciones</option>`;
    s.value = state.currentOrgId ?? "";
  }

  function setView(view) {
    state.view = view;
    document.querySelectorAll("[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    render();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function render() {
    renderOrgSelect();
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === state.view));
    document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.toggle("active", b.dataset.view === state.view));
    const views = {
      dashboard:viewDashboard, organizations:viewOrganizations, members:viewMembers,
      income:viewIncome, expenses:viewExpenses, boxes:viewBoxes,
      reports:viewReports, backups:viewBackups, audit:viewAudit, settings:viewSettings
    };
    $("main").innerHTML = views[state.view]();
  }

  function pageHead(title,subtitle="",actions="") {
    return `<div class="page-head"><div><h1>${title}</h1>${subtitle?`<p>${subtitle}</p>`:""}</div><div class="actions">${actions}</div></div>`;
  }

  function viewDashboard() {
    const o = currentOrg();
    if (!o) return pageHead("Panel general","La suite está limpia y lista para recibir datos.") +
      `<div class="empty"><h3>No hay organizaciones cargadas</h3><p>Importa un JSON desde <b>Respaldos</b> o crea la primera organización manualmente.</p><button class="btn primary" onclick="App.setView('organizations')">Crear organización</button></div>`;

    const income = orgFilter("ingresos").reduce((a,x)=>a+(Number(x.monto)||0),0);
    const expense = orgFilter("egresos").reduce((a,x)=>a+(Number(x.monto)||0),0);
    const boxes = orgFilter("cajas");
    const real = boxes.reduce((a,x)=>a+(Number(x.saldo_real)||0),0);
    const theoretical = boxes.reduce((a,x)=>a+(Number(x.saldo_teorico)||0),0);
    const members = orgFilter("membresias").length;
    const pending = orgFilter("egresos").filter(x=>x.rendido===false).reduce((a,x)=>a+(Number(x.monto)||0),0);

    return `
      <div class="hero"><h2>${esc(o.nombre)}</h2><p>${esc(o.tipo||"Organización")} · Panel financiero local</p>
        <div class="actions" style="margin-top:16px">
          <button class="btn gold" onclick="App.newMovement('egreso')">＋ Registrar egreso</button>
          <button class="btn" onclick="App.newMovement('ingreso')">＋ Registrar ingreso</button>
          <button class="btn" onclick="App.setView('reports')">▤ Informes</button>
        </div>
      </div>
      <div class="grid g4">
        ${stat("Saldo real",money(real),"Disponible")}
        ${stat("Saldo teórico",money(theoretical),"Calculado")}
        ${stat("Ingresos",money(income),"Acumulado")}
        ${stat("Egresos",money(expense),"Acumulado")}
      </div>
      <div class="grid g2" style="margin-top:14px">
        <div class="card"><div class="split"><h3>Resumen</h3><span class="tag">${members} integrantes</span></div>
          <div class="kpi-row" style="margin-top:12px">
            <div class="kpi"><span class="label">Neto</span><b>${money(income-expense)}</b></div>
            <div class="kpi"><span class="label">Sin rendir</span><b>${money(pending)}</b></div>
          </div>
        </div>
        <div class="card"><h3>Estado de la suite</h3>
          <div class="notice"><b>Base local activa.</b><br><span class="muted">Los datos se guardan en IndexedDB de este dispositivo.</span></div>
        </div>
      </div>`;
  }

  function stat(label,value,tag) {
    return `<div class="card stat"><div class="label">${label}</div><div class="value">${value}</div><small>${tag}</small></div>`;
  }

  function viewOrganizations() {
    const rows = state.data.organizaciones;
    return pageHead("Organizaciones","Cada organización funciona de forma independiente.",
      `<button class="btn primary" onclick="App.orgModal()">＋ Nueva organización</button>`) +
      (rows.length ? `<div class="grid g3">${rows.map(o=>`
        <div class="card">
          <div class="split"><h3>${esc(o.nombre)}</h3><span class="tag">${esc(o.tipo||"")}</span></div>
          <p class="muted">${esc(o.descripcion||"Sin descripción")}</p>
          <div class="actions"><button class="btn small primary" onclick="App.selectOrg(${o.id})">Abrir</button><button class="btn small" onclick="App.orgModal(${o.id})">Editar</button><button class="btn small danger" onclick="App.deleteOrg(${o.id})">Eliminar</button></div>
        </div>`).join("")}</div>` :
        `<div class="empty"><h3>Sin organizaciones</h3><p>No hay datos precargados.</p></div>`);
  }

  function viewMembers() {
    const rows = orgFilter("integrantes");
    if (!currentOrg()) return emptyPage("Integrantes","Selecciona o importa una organización primero.");
    return pageHead("Integrantes",currentOrg().nombre,
      `<button class="btn primary" onclick="App.memberModal()">＋ Nuevo integrante</button>`) +
      (rows.length ? table(["Nombre","RUT","Correo","Teléfono","Estado","Acciones"],rows.map(x=>[
        esc(x.nombre),esc(x.rut||"—"),esc(x.correo||"—"),esc(x.telefono||"—"),
        `<span class="tag ${x.activo===false?"bad":"ok"}">${x.activo===false?"Inactivo":"Activo"}</span>`,
        `<button class="btn small" onclick="App.memberModal(${x.id})">Editar</button> <button class="btn small danger" onclick="App.deleteRecord('integrantes',${x.id})">Eliminar</button>`
      ])) : `<div class="empty">No hay integrantes cargados.</div>`);
  }

  function viewIncome() {
    const rows = orgFilter("ingresos");
    if (!currentOrg()) return emptyPage("Ingresos","Selecciona o importa una organización primero.");
    return pageHead("Ingresos",currentOrg().nombre,
      `<button class="btn primary" onclick="App.newMovement('ingreso')">＋ Nuevo ingreso</button>`) +
      (rows.length ? table(["Fecha","Concepto","Monto","Medio","Responsable","Acciones"],rows.sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")).map(x=>[
        dateFmt(x.fecha),esc(x.concepto||"—"),`<b class="num">${money(x.monto)}</b>`,esc(x.medio||"—"),esc(x.responsable||"—"),
        `<button class="btn small" onclick="App.movementModal('ingreso',${x.id})">Editar</button> <button class="btn small danger" onclick="App.deleteRecord('ingresos',${x.id})">Eliminar</button>`
      ])) : `<div class="empty">No hay ingresos cargados.</div>`);
  }

  function viewExpenses() {
    const rows = orgFilter("egresos");
    if (!currentOrg()) return emptyPage("Egresos","Selecciona o importa una organización primero.");
    return pageHead("Egresos",currentOrg().nombre,
      `<button class="btn primary" onclick="App.newMovement('egreso')">＋ Nuevo egreso</button>`) +
      (rows.length ? table(["Fecha","Concepto","Monto","Medio","Rendido","Responsable","Acciones"],rows.sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")).map(x=>[
        dateFmt(x.fecha),esc(x.concepto||"—"),`<b>${money(x.monto)}</b>`,esc(x.medio||"—"),
        `<span class="tag ${x.rendido===false?"warn":"ok"}">${x.rendido===false?"Pendiente":"Sí"}</span>`,esc(x.responsable||"—"),
        `<button class="btn small" onclick="App.movementModal('egreso',${x.id})">Editar</button> <button class="btn small danger" onclick="App.deleteRecord('egresos',${x.id})">Eliminar</button>`
      ])) : `<div class="empty">No hay egresos cargados.</div>`);
  }

  function viewBoxes() {
    const rows = orgFilter("cajas");
    if (!currentOrg()) return emptyPage("Cajas","Selecciona o importa una organización primero.");
    return pageHead("Cajas y responsables",currentOrg().nombre,
      `<button class="btn primary" onclick="App.boxModal()">＋ Nueva caja</button>`) +
      (rows.length ? `<div class="grid g3">${rows.map(x=>`
        <div class="card"><div class="split"><h3>${esc(x.nombre||"Caja")}</h3><span class="tag">${esc(x.responsable||"")}</span></div>
        <p class="muted">Saldo real: <b>${money(x.saldo_real)}</b><br>Saldo teórico: <b>${money(x.saldo_teorico)}</b></p>
        <div class="actions"><button class="btn small" onclick="App.boxModal(${x.id})">Editar</button><button class="btn small danger" onclick="App.deleteRecord('cajas',${x.id})">Eliminar</button></div></div>`).join("")}</div>` :
      `<div class="empty">No hay cajas cargadas.</div>`);
  }

  function viewReports() {
    if (!currentOrg()) return emptyPage("Informes","Selecciona o importa una organización primero.");
    const o=currentOrg(), inc=orgFilter("ingresos"), eg=orgFilter("egresos");
    const totalI=inc.reduce((a,x)=>a+Number(x.monto||0),0), totalE=eg.reduce((a,x)=>a+Number(x.monto||0),0);
    return pageHead("Informes","Informes imprimibles y preparados para guardar como PDF.",
      `<button class="btn primary no-print" onclick="window.print()">▣ Guardar / imprimir PDF</button>`) +
      `<section class="report-sheet" id="report">
        <div class="report-header"><div><h2>${esc(o.nombre)}</h2><div class="muted">${esc(o.tipo||"Organización")}</div></div><div><b>Informe de tesorería</b><br>${dateFmt(today())}</div></div>
        <div class="grid g4">
          ${stat("Total ingresos",money(totalI),"Registrados")}
          ${stat("Total egresos",money(totalE),"Registrados")}
          ${stat("Saldo neto",money(totalI-totalE),"Ingresos − egresos")}
          ${stat("Movimientos",inc.length+eg.length,"Total")}
        </div>
        <h3 style="margin-top:22px">Movimientos</h3>
        ${inc.length||eg.length ? table(["Fecha","Tipo","Concepto","Monto","Responsable"],[...inc.map(x=>[dateFmt(x.fecha),'<span class="tag ok">Ingreso</span>',esc(x.concepto||"—"),money(x.monto),esc(x.responsable||"—")]),...eg.map(x=>[dateFmt(x.fecha),'<span class="tag bad">Egreso</span>',esc(x.concepto||"—"),money(x.monto),esc(x.responsable||"—")])]) : `<div class="empty">No hay movimientos.</div>`}
      </section>`;
  }

  function viewBackups() {
    return pageHead("Respaldos","Importa o exporta toda la información en formato JSON.",
      `<button class="btn primary" onclick="App.importJSON()">＋ Importar JSON</button><button class="btn" onclick="App.exportJSON()">↧ Exportar JSON</button>`) +
      `<div class="grid g2">
        <div class="card"><h3>Importación</h3><p class="muted">La carga reemplaza los datos existentes de los módulos incluidos en el archivo. No se mezclan datos silenciosamente.</p>
          <div class="notice">El JSON debe contener arreglos con los nombres de las colecciones de la aplicación.</div>
        </div>
        <div class="card"><h3>Estado de la base</h3><div class="list">${STORES.map(s=>`<div class="list-item"><div class="split"><b>${s}</b><span class="tag">${state.data[s].length} registros</span></div></div>`).join("")}</div>
        </div>
      </div>`;
  }

  function viewAudit() {
    const rows = [...state.data.auditoria].sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||""));
    return pageHead("Auditoría","Registro local de acciones de la suite.") +
      (rows.length ? table(["Fecha","Rol","Acción","Entidad","Detalle"],rows.map(x=>[
        new Date(x.fecha).toLocaleString("es-CL"),esc(x.rol),esc(x.accion),esc(x.entidad),esc(x.detalle)
      ])) : `<div class="empty">No hay eventos de auditoría.</div>`);
  }

  function viewSettings() {
    return pageHead("Configuración","Preferencias locales y mantenimiento de la base.") +
      `<div class="grid g2">
        <div class="card"><h3>Preferencias</h3>
          <div class="field"><label>Tema</label><select id="settingTheme"><option value="claro">Claro</option><option value="oscuro">Oscuro</option></select></div>
          <div class="modal-foot"><button class="btn primary" onclick="App.saveTheme()">Guardar</button></div>
        </div>
        <div class="card"><h3>Base de datos</h3><p class="muted">IndexedDB: <b>${DB_NAME}</b><br>Versión: ${DB_VERSION}<br>Datos precargados: <b>ninguno</b></p>
          <div class="danger-box"><b>Acción destructiva</b><p>Elimina la base IndexedDB completa de esta suite y la vuelve a crear vacía.</p><button class="btn danger" onclick="App.wipe()">Borrar toda la suite</button></div>
        </div>
      </div>`;
  }

  function emptyPage(title,text){return pageHead(title,text)+`<div class="empty">${text}</div>`;}
  function table(headers,rows){
    return `<div class="card table-wrap"><table class="table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function orgModal(id) {
    const x = id ? state.data.organizaciones.find(v=>v.id===id) : {};
    modal(`<h2>${id?"Editar organización":"Nueva organización"}</h2>
      <div class="form-grid">
        <div class="field full"><label>Nombre *</label><input id="f_name" value="${esc(x.nombre)}"></div>
        <div class="field"><label>Tipo</label><input id="f_type" value="${esc(x.tipo)}" placeholder="Curso, club, asociación…"></div>
        <div class="field"><label>Año</label><input id="f_year" type="number" value="${esc(x.año_actual||new Date().getFullYear())}"></div>
        <div class="field full"><label>Descripción</label><textarea id="f_desc">${esc(x.descripcion)}</textarea></div>
      </div>
      <div class="modal-foot"><button class="btn" onclick="App.closeModal()">Cancelar</button><button class="btn primary" onclick="App.saveOrg(${id||"null"})">Guardar</button></div>`);
  }

  async function saveOrg(id) {
    const nombre=$("f_name").value.trim(); if(!nombre) return toast("Ingresa el nombre.");
    const obj={...(id?state.data.organizaciones.find(x=>x.id===id):{}),nombre,tipo:$("f_type").value.trim(),año_actual:Number($("f_year").value)||new Date().getFullYear(),descripcion:$("f_desc").value.trim()};
    await put("organizaciones",obj); await audit(id?"Editó":"Creó","Organización",nombre); await loadAll(); closeModal(); render(); toast("Organización guardada.");
  }

  function memberModal(id) {
    const x=id?state.data.integrantes.find(v=>v.id===id):{};
    modal(`<h2>${id?"Editar integrante":"Nuevo integrante"}</h2><div class="form-grid">
      <div class="field full"><label>Nombre *</label><input id="m_name" value="${esc(x.nombre)}"></div>
      <div class="field"><label>RUT</label><input id="m_rut" value="${esc(x.rut)}"></div>
      <div class="field"><label>Teléfono</label><input id="m_phone" value="${esc(x.telefono)}"></div>
      <div class="field"><label>Correo</label><input id="m_mail" type="email" value="${esc(x.correo)}"></div>
      <div class="field"><label>Estado</label><select id="m_active"><option value="true" ${x.activo!==false?"selected":""}>Activo</option><option value="false" ${x.activo===false?"selected":""}>Inactivo</option></select></div>
    </div><div class="modal-foot"><button class="btn" onclick="App.closeModal()">Cancelar</button><button class="btn primary" onclick="App.saveMember(${id||"null"})">Guardar</button></div>`);
  }

  async function saveMember(id) {
    const nombre=$("m_name").value.trim(); if(!nombre||!state.currentOrgId)return toast("Falta nombre u organización.");
    const obj={...(id?state.data.integrantes.find(x=>x.id===id):{}),nombre,rut:$("m_rut").value.trim(),telefono:$("m_phone").value.trim(),correo:$("m_mail").value.trim(),activo:$("m_active").value==="true",id_organizacion:state.currentOrgId};
    await put("integrantes",obj); await audit(id?"Editó":"Creó","Integrante",nombre); await loadAll(); closeModal(); render(); toast("Integrante guardado.");
  }

  function movementModal(type,id) {
    const store=type==="ingreso"?"ingresos":"egresos", x=id?state.data[store].find(v=>v.id===id):{};
    modal(`<h2>${id?"Editar":"Nuevo"} ${type}</h2><div class="form-grid">
      <div class="field"><label>Fecha *</label><input id="mv_date" type="date" value="${esc(x.fecha||today())}"></div>
      <div class="field"><label>Monto *</label><input id="mv_amount" type="number" min="0" step="1" value="${esc(x.monto||"")}"></div>
      <div class="field full"><label>Concepto *</label><input id="mv_concept" value="${esc(x.concepto)}"></div>
      <div class="field"><label>Medio de pago</label><input id="mv_method" value="${esc(x.medio)}" placeholder="Transferencia, efectivo…"></div>
      <div class="field"><label>Responsable</label><input id="mv_resp" value="${esc(x.responsable)}"></div>
      ${type==="egreso"?`<div class="field"><label>Rendido</label><select id="mv_rendered"><option value="true" ${x.rendido!==false?"selected":""}>Sí</option><option value="false" ${x.rendido===false?"selected":""}>Pendiente</option></select></div>`:""}
      <div class="field full"><label>Observaciones</label><textarea id="mv_obs">${esc(x.observaciones)}</textarea></div>
    </div><div class="modal-foot"><button class="btn" onclick="App.closeModal()">Cancelar</button><button class="btn primary" onclick="App.saveMovement('${type}',${id||"null"})">Guardar</button></div>`);
  }

  async function saveMovement(type,id) {
    const store=type==="ingreso"?"ingresos":"egresos";
    const fecha=$("mv_date").value,monto=Number($("mv_amount").value),concepto=$("mv_concept").value.trim();
    if(!state.currentOrgId||!fecha||monto<=0||!concepto)return toast("Completa organización, fecha, monto y concepto.");
    const old=id?state.data[store].find(x=>x.id===id):{};
    const obj={...old,id_organizacion:state.currentOrgId,fecha,monto,concepto,medio:$("mv_method").value.trim(),responsable:$("mv_resp").value.trim(),observaciones:$("mv_obs").value.trim()};
    if(type==="egreso")obj.rendido=$("mv_rendered").value==="true";
    await put(store,obj); await audit(id?"Editó":"Registró",type,concepto); await loadAll(); closeModal(); render(); toast("Movimiento guardado.");
  }

  function newMovement(type){ if(!currentOrg()) return toast("Primero crea o selecciona una organización."); movementModal(type,null); }

  function boxModal(id) {
    const x=id?state.data.cajas.find(v=>v.id===id):{};
    modal(`<h2>${id?"Editar caja":"Nueva caja"}</h2><div class="form-grid">
      <div class="field full"><label>Nombre *</label><input id="b_name" value="${esc(x.nombre)}" placeholder="Caja principal"></div>
      <div class="field"><label>Responsable</label><input id="b_resp" value="${esc(x.responsable)}"></div>
      <div class="field"><label>Saldo real</label><input id="b_real" type="number" value="${esc(x.saldo_real||0)}"></div>
      <div class="field"><label>Saldo teórico</label><input id="b_theory" type="number" value="${esc(x.saldo_teorico||0)}"></div>
      <div class="field"><label>Restringida</label><select id="b_restrict"><option value="false" ${!x.restringida?"selected":""}>No</option><option value="true" ${x.restringida?"selected":""}>Sí</option></select></div>
    </div><div class="modal-foot"><button class="btn" onclick="App.closeModal()">Cancelar</button><button class="btn primary" onclick="App.saveBox(${id||"null"})">Guardar</button></div>`);
  }

  async function saveBox(id) {
    if(!state.currentOrgId)return toast("Selecciona una organización.");
    const nombre=$("b_name").value.trim();if(!nombre)return toast("Ingresa el nombre.");
    const old=id?state.data.cajas.find(x=>x.id===id):{};
    const obj={...old,id_organizacion:state.currentOrgId,nombre,responsable:$("b_resp").value.trim(),saldo_real:Number($("b_real").value)||0,saldo_teorico:Number($("b_theory").value)||0,restringida:$("b_restrict").value==="true"};
    await put("cajas",obj); await audit(id?"Editó":"Creó","Caja",nombre); await loadAll();closeModal();render();toast("Caja guardada.");
  }

  async function deleteRecord(store,id) {
    if(!confirm("¿Eliminar este registro?"))return;
    await requestStore(store,"readwrite",s=>s.delete(id));
    await audit("Eliminó",store,String(id)); await loadAll();render();toast("Registro eliminado.");
  }

  async function deleteOrg(id) {
    const o=state.data.organizaciones.find(x=>x.id===id);if(!o)return;
    if(!confirm(`Se eliminará "${o.nombre}" y sus registros asociados. ¿Continuar?`))return;
    const related=["cajas","integrantes","membresias","conceptos","ingresos","egresos"];
    for(const store of related){
      for(const x of state.data[store].filter(r=>Number(r.id_organizacion)===Number(id))){
        await requestStore(store,"readwrite",s=>s.delete(x.id));
      }
    }
    await requestStore("organizaciones","readwrite",s=>s.delete(id));
    await audit("Eliminó","Organización",o.nombre); await loadAll();render();toast("Organización eliminada.");
  }

  async function exportJSON() {
    const dump={
      version:1, app:"Tesorería Multiorganizacional", fecha_respaldo:new Date().toISOString(),
      organizaciones:state.data.organizaciones, instituciones:state.data.instituciones, tesoreros:state.data.tesoreros,
      cajas:state.data.cajas, integrantes:state.data.integrantes, membresias:state.data.membresias,
      conceptos:state.data.conceptos, ingresos:state.data.ingresos, egresos:state.data.egresos,
      preferencias:state.data.preferencias
    };
    const blob=new Blob([JSON.stringify(dump,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Tesoreria_Respaldo_${today()}.json`;a.click();URL.revokeObjectURL(a.href);
    await audit("Exportó","Respaldo","JSON");toast("Respaldo exportado.");
  }

  function importJSON(){ $("jsonInput").click(); }

  async function handleImport(file) {
    if(!file)return;
    try{
      const data=JSON.parse(await file.text());
      if(!data || typeof data!=="object")throw new Error("JSON inválido.");
      if(!confirm("La importación reemplazará los datos de las colecciones incluidas. ¿Continuar?"))return;
      for(const store of STORES){
        if(store==="auditoria")continue;
        if(Array.isArray(data[store])){
          await clearStore(store);
          for(const row of data[store]) await put(store,row);
        }
      }
      await loadAll(); await audit("Importó","Respaldo",file.name); await loadAll(); render(); toast("JSON importado correctamente.");
    }catch(e){
      console.error(e);toast("No se pudo importar el JSON: "+(e.message||"archivo inválido"));
    }finally{$("jsonInput").value="";}
  }

  async function wipe() {
    if(!confirm("Esto eliminará TODA la base de datos de Tesorería en este dispositivo."))return;
    if(!confirm("Última confirmación. Se perderán organizaciones, integrantes, movimientos, cajas, preferencias y auditoría. ¿Continuar?"))return;
    try{
      state.db?.close();
      await new Promise((resolve,reject)=>{
        const r=indexedDB.deleteDatabase(DB_NAME);
        r.onsuccess=()=>resolve(); r.onerror=()=>reject(r.error); r.onblocked=()=>reject(new Error("La base está bloqueada. Cierra otras ventanas de Tesorería."));
      });
      location.reload();
    }catch(e){alert("No fue posible borrar la base: "+e.message);}
  }

  async function saveTheme(){
    state.theme=$("settingTheme").value==="oscuro"?"oscuro":"claro";
    await put("preferencias",{id:1,tema:state.theme});applyTheme();render();toast("Preferencia guardada.");
  }

  async function boot() {
    try{
      showBoot("Preparando la base de datos local…");
      state.db=await openDB();
      showBoot("Base local abierta. Verificando datos…");
      await loadAll();
      state.ready=true;
      $("boot").hidden=true;$("app").hidden=false;
      render();
      if(location.protocol==="https:" && "serviceWorker" in navigator){
        navigator.serviceWorker.register("./sw.js").catch(err=>console.warn("Service worker:",err));
      }
    }catch(e){
      console.error(e);
      showBoot("No se pudo iniciar la base local. "+(e.message||"Error desconocido"),true);
    }
  }

  $("bootRetry").addEventListener("click",()=>location.reload());
  $("bootReset").addEventListener("click",async()=>{try{state.db?.close();indexedDB.deleteDatabase(DB_NAME);location.reload()}catch{location.reload()}});
  $("themeBtn").addEventListener("click",async()=>{state.theme=state.theme==="oscuro"?"claro":"oscuro";await put("preferencias",{id:1,tema:state.theme});applyTheme();});
  $("roleBtn").addEventListener("click",()=>{const roles=["Administrador","Tesorero","Presidente","Miembro"];const i=roles.indexOf(state.role);state.role=roles[(i+1)%roles.length];$("roleBtn").textContent=state.role;toast("Rol: "+state.role);});
  $("orgSelect").addEventListener("change",e=>{state.currentOrgId=e.target.value?Number(e.target.value):null;render();});
  $("wipeBtn").addEventListener("click",wipe);
  $("jsonInput").addEventListener("change",e=>handleImport(e.target.files[0]));
  $("modal").addEventListener("click",e=>{if(e.target.hasAttribute("data-close-modal"))closeModal();});
  document.addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b)setView(b.dataset.view);});

  window.App={
    setView,closeModal,orgModal,saveOrg,memberModal,saveMember,movementModal,newMovement,saveMovement,
    boxModal,saveBox,deleteRecord,deleteOrg,selectOrg:id=>{state.currentOrgId=id;setView("dashboard")},
    exportJSON,importJSON,wipe,saveTheme
  };

  window.addEventListener("error",e=>{if(state.ready)console.error("App:",e.error||e.message);});
  window.addEventListener("unhandledrejection",e=>console.error("App promise:",e.reason));
  boot();
})();
