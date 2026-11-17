/* Academia OS · backend/clientes/clientes.js
   FUENTE ÚNICA DE DATOS (localStorage por origen).
   Forma: { c: [clientes], regs: { 'YYYY-MM-DD': [{n,t,ts}] } }

   Cliente: { id, n, tel, est, paq, clase, asis[4], log[], extra, base }
     est   : estado de pago guardado ('pagado' | 'vencido' | 'por iniciar')
     asis  : asistencia por semana (histórico, alimenta las gráficas)
     log   : [{d:'YYYY-MM-DD', h:'hh:mm'}] registros reales por NFC
     extra : clases adicionales en una semana ya marcada (para contar bien el paquete)
     base  : clases ya consumidas al momento del último pago (reinicia el paquete)

   REGLA ÚNICA DE ESTADO (la usan dashboard, clientes y clases):
     AOS.estado(x) -> 'al_dia' | 'vencido' | 'por_iniciar'
     Si pagó pero ya usó todas las clases de su paquete, cuenta como 'vencido'.
*/
(function(){
  const KEY='aos_clientes';
  const CLASSES={bachata:'Bachata · viernes 6:00 pm', salsa:'Salsa caleña · 7:40 pm'};
  const LABEL={al_dia:'Al día', vencido:'Mensualidad vencida', por_iniciar:'Por iniciar'};

  const SEED=[
   ['Laura Gómez','3001112233','pagado','mensual','bachata',[1,1,1,0]],
   ['Andrés Ruiz','3002223344','pagado','8','salsa',[1,0,1,1]],
   ['Camila Torres','3003334455','vencido','4','bachata',[1,1,0,0]],
   ['Kevin Salas','3004445566','vencido','8','salsa',[0,1,0,0]],
   ['Sara Muñoz','3005556677','pagado','12','bachata',[1,1,1,1]],
   ['Julián Pérez','3006667788','por iniciar','4','salsa',[1,0,1,1]],
   ['Valentina Ríos','3007778899','pagado','mensual','salsa',[1,1,0,1]],
   ['Mateo Vargas','3008889900','vencido','4','bachata',[0,0,0,1]],
   ['Isabela Carvajal','3009990011','pagado','8','bachata',[1,1,1,1]],
   ['Nicolás Ospina','3000011223','por iniciar','8','salsa',[0,1,1,0]],
   ['Daniela Álvarez','3001122334','pagado','12','salsa',[1,1,1,0]],
   ['Sebastián Mejía','3002233445','vencido','12','bachata',[1,0,0,0]],
   ['Mariana Cortés','3003345566','pagado','4','salsa',[1,1,1,1]],
   ['Tomás Quintero','3004456677','por iniciar','4','bachata',[0,0,1,0]],
   ['Sofía Restrepo','3005567788','pagado','8','salsa',[1,1,1,1]],
  ].map((x,i)=>({id:'c'+(1000+i),n:x[0],tel:x[1],est:x[2],paq:x[3],clase:x[4],asis:x[5],log:[],extra:0,base:0}));

  function seed(){ if(!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify({c:SEED,regs:{}})); }
  function load(){ seed(); return JSON.parse(localStorage.getItem(KEY)); }
  function save(d){ localStorage.setItem(KEY, JSON.stringify(d)); }
  const soloNum=s=>String(s).replace(/\D/g,'');
  /* suma (+1) o resta (-1) una clase usada: semana actual primero, luego "extra" */
  function contar(x,delta){
    const last=x.asis.length-1;
    if(delta>0){ if(x.asis[last]===0) x.asis[last]=1; else x.extra=(x.extra||0)+1; }
    else { if((x.extra||0)>0) x.extra--; else x.asis[last]=0; }
  }

  window.AOS={
    /* ---------- datos ---------- */
    all(){ return load().c; },
    regs(){ return load().regs; },
    get(id){ return this.all().find(x=>x.id===id); },
    update(id,patch){ const d=load(); const x=d.c.find(y=>y.id===id); Object.assign(x,patch); save(d); return x; },
    save(){ save(load()); },
    classes(){ return CLASSES; },

    /* ---------- utilidades ---------- */
    /* fecha LOCAL (no UTC): a las 7:40 pm en Colombia toISOString ya marcaría el día siguiente */
    hoy(){
      const d=new Date();
      return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    },
    esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
    /* avisa a esta página cuando otra pestaña (ej. check.html) cambia los datos */
    onChange(cb){ window.addEventListener('storage',e=>{ if(e.key===KEY) cb(); }); },

    /* ---------- paquete ---------- */
    packLabel(p){ return p==='mensual'?'Mensual ilimitado':p+' clases/mes'; },
    packNum(p){ return p==='mensual'?20:parseInt(p,10); },
    totalRaw(x){ return (x.asis?x.asis.reduce((a,b)=>a+b,0):0)+(x.extra||0); },
    /* clases usadas en el paquete vigente (desde el último pago) */
    usadas(x){ return Math.max(0,this.totalRaw(x)-(x.base||0)); },
    /* pagó, pero ya consumió todas las clases del paquete */
    agotado(x){ return x.est==='pagado' && this.usadas(x)>=this.packNum(x.paq); },
    restantes(x){
      if(this.estado(x)==='vencido') return 0;
      return Math.max(0, this.packNum(x.paq)-this.usadas(x));
    },

    /* ---------- ESTADO ÚNICO ---------- */
    estado(x){
      if(x.est==='vencido') return 'vencido';
      if(this.agotado(x)) return 'vencido';
      if(x.est==='por iniciar') return 'por_iniciar';
      return 'al_dia';
    },
    estadoLabel(x){ return LABEL[this.estado(x)]; },
    /* detalle del motivo cuando está vencido */
    motivo(x){
      if(x.est==='vencido') return 'pago vencido';
      if(this.agotado(x)) return 'paquete agotado';
      return '';
    },
    /* clase CSS de la pastilla según estado */
    pillClass(x){ const e=this.estado(x); return e==='al_dia'?'ok':e==='vencido'?'bad':'warn'; },
    isPending(x){ return this.estado(x)!=='al_dia'; },
    pendiente(x){ return this.isPending(x); },
    estadoGrupo(x){ return this.estadoLabel(x); },

    /* ---------- clase asignada ---------- */
    setClase(id,clase){ return this.update(id,{clase:clase||null}); },
    removeFromClass(id){ return this.update(id,{clase:null}); },
    addClass(id,clase){ return this.update(id,{clase}); },

    /* ---------- eliminar cliente (definitivo) ----------
       Quita al cliente y sus registros de ingreso. La confirmación se pide en la
       pantalla con AOSConfirm antes de llamar a esta función. */
    eliminar(id){
      const d=load(); const x=d.c.find(y=>y.id===id);
      if(!x) return null;
      d.c=d.c.filter(y=>y.id!==id);
      Object.keys(d.regs).forEach(f=>{
        d.regs[f]=d.regs[f].filter(r=>soloNum(r.t)!==soloNum(x.tel));
        if(!d.regs[f].length) delete d.regs[f];
      });
      save(d); return x;
    },

    /* ---------- ASISTENCIA (la llama check.html al escanear el NFC) ----------
       Busca al cliente por celular. Si no existe, lo crea "por iniciar".
       Devuelve { cliente, nuevo, repetido } */
    registrarAsistencia(reg){
      const d=load(), hoy=this.hoy();
      const hora=reg.ts||new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'});
      let x=d.c.find(y=>soloNum(y.tel)===soloNum(reg.t));
      let nuevo=false;
      if(!x){
        x={id:'n'+Date.now(),n:reg.n,tel:reg.t,est:'por iniciar',paq:'4',clase:null,asis:[0,0,0,0],log:[],extra:0,base:0};
        d.c.push(x); nuevo=true;
      }
      x.log=x.log||[];
      const repetido=x.log.some(l=>l.d===hoy);
      if(!repetido){
        x.log.push({d:hoy,h:hora});
        contar(x,1);
        d.regs[hoy]=d.regs[hoy]||[];
        d.regs[hoy].push({n:x.n,t:x.tel,ts:hora});
      }
      save(d);
      return {cliente:x,nuevo,repetido};
    },

    /* ---------- ASISTENCIA MANUAL (desde Clases) ----------
       Para quien no lleva el celular o cuando la profesora prefiere marcarla ella.
       presente=true  -> marca "Asistió" en esa fecha
       presente=false -> quita la asistencia (vuelve a "Falta")
       Cuenta igual que el NFC: descuenta o devuelve una clase del paquete.
       Devuelve {cliente,cambio} (cambio=false si ya estaba así) o null si no se puede. */
    marcarManual(id,fecha,presente){
      if(fecha>this.hoy()) return null;                 // no se marca el futuro
      const d=load(); const x=d.c.find(y=>y.id===id);
      if(!x) return null;
      x.log=x.log||[];
      const i=x.log.findIndex(l=>l.d===fecha);
      let cambio=false;
      if(presente && i<0){
        const hora=fecha===this.hoy()?new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}):'—';
        x.log.push({d:fecha,h:hora,m:true});            // m:true = registrada a mano
        contar(x,1);
        d.regs[fecha]=d.regs[fecha]||[];
        d.regs[fecha].push({n:x.n,t:x.tel,ts:hora,m:true});
        cambio=true;
      } else if(!presente && i>=0){
        x.log.splice(i,1);
        contar(x,-1);
        if(d.regs[fecha]){
          d.regs[fecha]=d.regs[fecha].filter(r=>soloNum(r.t)!==soloNum(x.tel));
          if(!d.regs[fecha].length) delete d.regs[fecha];
        }
        cambio=true;
      }
      save(d);
      return {cliente:x,cambio};
    }
  };
})();