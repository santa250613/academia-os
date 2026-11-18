/* Academia OS · backend/pagos/pagos.js
   Pagos + cartera. Usa AOS.estado() para que coincida con clases y clientes. */
(function(){
  const PRECIO={ '4':40000, '8':65000, '12':85000, 'mensual':90000 };
  window.AOSPagos={
    precio(p){ return PRECIO[p]||0; },
    fmt(v){ return '$'+v.toLocaleString('es-CO'); },
    /* la profesora recibió el pago en efectivo.
       Regla: las clases que la persona ya vio SIN estar al día (por iniciar o vencida,
       marcadas con p:true) cuentan en el paquete nuevo: ya vio clase aunque pagara después.
       - por iniciar : la clase de prueba es GRATIS, no cuenta: al elegir paquete arranca en 0
       - vencido/agotado : las clases del paquete anterior se descartan (base),
         pero las asistidas estando vencida se mantienen */
    pagarPresencial(id){
      const A=window.AOS, c=A.get(id);
      if(!c) return null;
      const patch={est:'pagado'};
      const estado=A.estado(c);
      const log=(c.log||[]).map(l=>({...l}));
      const vistas=log.filter(l=>l.p).length;
      log.forEach(l=>{ if(l.p) l.p=false; });          // ya quedaron contadas
      patch.log=log;
      if(estado==='por_iniciar') patch.base=A.totalRaw(c);                    // clase gratis: empieza en 0
      else if(estado==='vencido') patch.base=Math.max(0,A.totalRaw(c)-vistas); // conserva las vistas vencida
      A.update(id,patch);
      return A.get(id);
    },
    /* clientes con mensualidad vencida (incluye paquete agotado) */
    vencidos(){ return window.AOS.all().filter(x=>window.AOS.estado(x)==='vencido'); },
    /* cartera: pagado = al día; pendiente = vencido o por iniciar */
    carteraPorSemana(){
      let pagado=0, pend=0;
      window.AOS.all().forEach(x=>{
        const v=PRECIO[x.paq]||0;
        if(window.AOS.estado(x)==='al_dia') pagado+=v; else pend+=v;
      });
      return {pagado,pend};
    }
  };
})();
