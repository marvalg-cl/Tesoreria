(() => {
  "use strict";

  const DB_NAME = "TesoreriaMultiorganizacionalCleanV2";
  const DB_VERSION = 1;
  const STORES = ["organizations","members","incomes","expenses","cashboxes","audit"];

  const state = { db:null, ready:false };

  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(Number(n)||0);
  const toast = msg => {
    const el=$("toast"); el.textContent=msg; el.classList.add("show");
    setTimeout(()=>el.classList.remove("show"),2200);
  };

  function showWarning(msg){
    $("dbWarning").textContent=msg;
    $("dbWarning").classList.remove("hidden");
  }

  function openDB(){
    return new Promise((resolve,reject)=>{
      if(!("indexedDB" in window)){ reject(new Error("Este navegador no dispone de IndexedDB.")); return; }
      let settled=false;
      const fail=e=>{ if(!settled){settled=true; reject(e instanceof Error?e:new Error("No se pudo abrir IndexedDB."));} };
      let req;
      try { req=indexedDB.open(DB_NAME,DB_VERSION); } catch(e){ fail(e); return; }
      req.onupgradeneeded=()=>{
        const db=req.result;
        STORES.forEach(name=>{
          if(!db.objectStoreNames.contains(name)){
            if(name==="organizations") db.createObjectStore(name,{keyPath:"id"});
            else db.createObjectStore(name,{keyPath:"id"});
          }
        });
      };
      req.onsuccess=()=>{ if(settled)return; settled=true; const db=req.result; db.onversionchange=()=>db.close(); resolve(db); };
      req.onerror=()=>fail(req.error);
      req.onblocked=()=>fail(new Error("La base local está bloqueada por otra pestaña. Cierre otras pestañas de Tesorería y vuelva a abrir."));
    });
  }

  function withTimeout(promise, ms){
    return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error("La base local tardó demasiado en responder.")),ms))]);
  }

  function getAll(store){
    return new Promise((resolve,reject)=>{
      try{
        const tx=state.db.transaction(store,"readonly"), req=tx.objectStore(store).getAll();
        req.onsuccess=()=>resolve(req.result||[]);
        req.onerror=()=>reject(req.error);
      }catch(e){reject(e)}
    });
  }

  function put(store,obj){
    return new Promise((resolve,reject)=>{
      try{
        const tx=state.db.transaction(store,"readwrite");
        tx.objectStore(store).put(obj);
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
        tx.onabort=()=>reject(tx.error||new Error("Transacción cancelada"));
      }catch(e){reject(e)}
    });
  }

  function clearAll(){
    return new Promise((resolve,reject)=>{
      try{
        const tx=state.db.transaction(STORES,"readwrite");
        STORES.forEach(s=>tx.objectStore(s).clear());
        tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
      }catch(e){reject(e)}
    });
  }

  function closeDB(){ try{state.db?.close()}catch{} }

  async function refresh(){
    if(!state.ready) return;
    try{
      const orgs=await getAll("organizations");
      const ins=await getAll("incomes");
      const outs=await getAll("expenses");
      $("countOrg").textContent=orgs.length;
      $("countIn").textContent=ins.length;
      $("countOut").textContent=outs.length;
      const totalIn=ins.reduce((a,x)=>a+Number(x.amount||0),0);
      const totalOut=outs.reduce((a,x)=>a+Number(x.amount||0),0);
      $("balance").textContent=money(totalIn-totalOut);
      const sel=$("orgSelect"), current=sel.value;
      sel.innerHTML='<option value="">Sin organizaciones</option>';
      orgs.sort((a,b)=>String(a.name).localeCompare(String(b.name),"es")).forEach(o=>{
        const op=document.createElement("option"); op.value=o.id; op.textContent=o.name; sel.appendChild(op);
      });
      if(orgs.some(o=>o.id===current)) sel.value=current;
      $("statusText").textContent = state.ready ? "Base local disponible. Sin datos precargados." : "Preparando…";
    }catch(e){ showWarning("No se pudieron leer los datos: "+e.message); }
  }

  function openModal(){ $("modal").classList.remove("hidden"); $("orgName").focus(); }
  function closeModal(){ $("modal").classList.add("hidden"); $("orgForm").reset(); }

  async function saveOrg(e){
    e.preventDefault();
    const name=$("orgName").value.trim();
    if(!name)return;
    const id=crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2);
    await put("organizations",{id,name,identifier:$("orgId").value.trim(),createdAt:new Date().toISOString()});
    closeModal(); await refresh(); toast("Organización guardada.");
  }

  async function importJSON(file){
    const text=await file.text();
    const data=JSON.parse(text);
    const map = {
      organizations: data.organizations || data.organizaciones || [],
      members: data.members || data.integrantes || [],
      incomes: data.incomes || data.ingresos || [],
      expenses: data.expenses || data.egresos || [],
      cashboxes: data.cashboxes || data.cajas || [],
      audit: data.audit || []
    };
    let total=0;
    for(const store of STORES){
      for(const raw of map[store]){
        const obj={...raw};
        if(!obj.id) obj.id=crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2);
        await put(store,obj); total++;
      }
    }
    await refresh(); toast(`Importación completada: ${total} registros.`);
  }

  async function exportJSON(){
    const data={version:2,exportedAt:new Date().toISOString()};
    for(const store of STORES) data[store]=await getAll(store);
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="tesoreria-datos.json"; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  async function resetSuite(){
    const ok=confirm("¿Borrar TODA la suite de Tesorería?\\n\\nSe eliminarán todas las organizaciones, integrantes, ingresos, egresos, cajas y auditoría de este dispositivo. Esta acción no se puede deshacer.");
    if(!ok)return;
    try{
      await clearAll(); await refresh(); toast("Suite borrada. Base completamente limpia.");
    }catch(e){
      showWarning("No se pudo borrar la suite: "+e.message);
    }
  }

  function wire(){
    $("newOrgBtn").onclick=openModal;
    $("orgNav").onclick=openModal;
    $("cancelModal").onclick=closeModal;
    $("orgForm").onsubmit=saveOrg;
    $("importBtn").onclick=()=>$("fileInput").click();
    $("fileInput").onchange=async e=>{
      const f=e.target.files[0]; if(!f)return;
      try{await importJSON(f)}catch(err){showWarning("JSON inválido o incompatible: "+err.message)}
      e.target.value="";
    };
    $("exportBtn").onclick=async()=>{try{await exportJSON()}catch(e){showWarning("No se pudo exportar: "+e.message)}};
    $("resetBtn").onclick=resetSuite;
  }

  async function boot(){
    wire();

    // La interfaz NO depende de que IndexedDB termine. Esto evita el bloqueo infinito
    // que tenía la versión anterior en "Verificando datos...".
    $("statusText").textContent="Interfaz lista. Abriendo base local…";

    try{
      const db=await withTimeout(openDB(),3000);
      state.db=db; state.ready=true;
      $("statusText").textContent="Base local disponible. Sin datos precargados.";
      await refresh();
    }catch(e){
      showWarning("IndexedDB no pudo iniciarse: "+e.message+" Puedes recargar la página; la interfaz sigue disponible.");
      $("statusText").textContent="Interfaz cargada. Base local no disponible.";
    }
  }

  // Registrar SW sin bloquear jamás el arranque.
  if("serviceWorker" in navigator){
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }

  // Nunca dejamos una pantalla de carga bloqueando la aplicación.
  boot().catch(e=>showWarning("Error de inicio: "+e.message));
})();