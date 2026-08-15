(() => {
  'use strict';
  const DB_NAME='TesoreriaMultiorganizacional';
  const DB_VERSION=2;
  const STORES=['organizations','people','memberships','movements','quotas','accounts','settings','audit'];
  const state={db:null,ready:false,orgId:'',route:'dashboard'};
  const uid=()=>globalThis.crypto?.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
  const req=(request)=>new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('IndexedDB error'));});
  async function open(){if(!('indexedDB' in window))throw new Error('Este navegador no dispone de IndexedDB.');return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;STORES.forEach(s=>{if(!db.objectStoreNames.contains(s)){const os=db.createObjectStore(s,{keyPath:'id'});if(s==='movements'){os.createIndex('orgId','orgId');os.createIndex('date','date')}if(s==='people'){os.createIndex('rut','rut')}if(s==='memberships'){os.createIndex('orgId','orgId');os.createIndex('personId','personId')}}});};r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>db.close();resolve(db)};r.onerror=()=>reject(r.error||new Error('No se pudo abrir IndexedDB'));r.onblocked=()=>reject(new Error('La base está bloqueada por otra pestaña. Cierra otras pestañas de Tesorería y vuelve a abrir.'));});}
  function all(store){return req(state.db.transaction(store,'readonly').objectStore(store).getAll())}
  function get(store,id){return req(state.db.transaction(store,'readonly').objectStore(store).get(id))}
  function put(store,obj){return new Promise((resolve,reject)=>{const tx=state.db.transaction(store,'readwrite');tx.objectStore(store).put(obj);tx.oncomplete=()=>resolve(obj);tx.onerror=()=>reject(tx.error||new Error('No se pudo guardar'));tx.onabort=()=>reject(tx.error||new Error('Transacción cancelada'))})}
  function remove(store,id){return new Promise((resolve,reject)=>{const tx=state.db.transaction(store,'readwrite');tx.objectStore(store).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('No se pudo eliminar'))})}
  function clearAll(){return new Promise((resolve,reject)=>{const tx=state.db.transaction(STORES,'readwrite');STORES.forEach(s=>tx.objectStore(s).clear());tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('No se pudo limpiar la base'))})}
  async function setting(key, fallback=null){const row=await get('settings',key);return row?row.value:fallback}
  async function saveSetting(key,value){return put('settings',{id:key,value,updatedAt:new Date().toISOString()})}
  async function audit(action,detail){try{await put('audit',{id:uid(),action,detail,at:new Date().toISOString()})}catch{}}
  window.TDB={DB_NAME,DB_VERSION,STORES,state,uid,open,all,get,put,remove,clearAll,setting,saveSetting,audit};
})();
