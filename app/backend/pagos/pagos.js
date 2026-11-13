/* Academia OS · backend/pagos/pagos.js
   Pagos + cartera. Usa AOS.estado() para que coincida con clases y clientes. */
(function(){
  const PRECIO={ '4':40000, '8':65000, '12':85000, 'mensual':90000 };
  window.AOSPagos={
    precio(p){ return PRECIO[p]||0; },
    fmt(v){ return '$'+v.toLocaleString('es-CO'); },
    /* la profesora recibió el pago en efectivo.
       `base` guarda las clases ya usadas: el paquete nuevo arranca en 0 */
    pagarPresencial(id){
      const c=window.AOS.get(id);
      if(!c) return null;
      window.AOS.update(id,{est:'pagado', base:window.AOS.totalRaw(c)});
      return window.AOS.get(id);
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
 