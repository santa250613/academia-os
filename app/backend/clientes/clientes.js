/* Academia OS · backend/clientes/clientes.js
   Fuente única de datos (localStorage por origen).
   Forma: { c: [clientes], regs: { 'YYYY-MM-DD': [{n,t,ts}] } }
*/
(function(){
  const KEY='aos_clientes';
  const CLASSES={bachata:'Bachata · viernes 6:00 pm', salsa:'Salsa caleña · 7:40 pm'};

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
  ].map((x,i)=>({id:'c'+(1000+i),n:x[0],tel:x[1],est:x[2],paq:x[3],clase:x[4],asis:x[5]}));

  function seed(){ if(!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify({c:SEED,regs:{}})); }
  function load(){ seed(); return JSON.parse(localStorage.getItem(KEY)); }
  function save(d){ localStorage.setItem(KEY, JSON.stringify(d)); }

  window.AOS={
    all(){ return load().c; },
    regs(){ return load().regs; },
    get(id){ return this.all().find(x=>x.id===id); },
    update(id,patch){ const d=load(); const x=d.c.find(y=>y.id===id); Object.assign(x,patch); save(d); return x; },
    save(){ save(load()); },
    /* el cliente llegó: lo crea la página NFC (check.html) */
    addFromReg(reg){
      const d=load();
      if(d.c.some(x=>x.n.toLowerCase()===reg.n.toLowerCase()&&x.tel===reg.t)) return null;
      const nc={id:'n'+Date.now(),n:reg.n,tel:reg.t,est:'por iniciar',paq:'4',clase:null,asis:[0,0,0,0]};
      d.c.push(nc); save(d); return nc;
    },
    packLabel(p){ return p==='mensual'?'Mensual ilimitado':p+' clases/mes'; },
    classes(){ return CLASSES; },
    isPending(x){ return x.est==='vencido'||x.est==='por iniciar'; }
  };
})();
