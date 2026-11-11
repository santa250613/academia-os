/* Academia OS · backend/pagos/pagos.js
   Estados de pago + cartera. Pago presencial y recordatorios de cobro. */
(function(){
  const PRECIO={ '4':40000, '8':65000, '12':85000, 'mensual':90000 };
  window.AOSPagos={
    precio(p){ return PRECIO[p]||0; },
    fmt(v){ return '$'+v.toLocaleString('es-CO'); },
    /* la profesora recibió el pago en efectivo presencial */
    pagarPresencial(id){
      const c=window.AOS.get(id);
      if(!c) return null;
      window.AOS.update(id,{est:'pagado'});
      return c;
    },
    vencidos(){ return window.AOS.all().filter(x=>x.est==='vencido'); },
    /* cartera semanal simulada: pagado vs pendiente en $k */
    carteraPorSemana(){
      const cs=window.AOS.all();
      let pagado=0, pend=0;
      cs.forEach(x=>{ if(x.est==='pagado') pagado+=PRECIO[x.paq]; else pend+=PRECIO[x.paq]; });
      return {pagado,pend};
    }
  };
})();
