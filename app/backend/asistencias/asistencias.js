/* Academia OS · backend/asistencias/asistencias.js
   Grupos por clase + orden: activos primero, pendientes de pago al final. */
(function(){
  window.AOSAsis={
    /* alumnos de una clase específica, activos primero */
    grupo(clase){
      let cs=window.AOS.all().filter(x=>x.clase===clase);
      const rank=x=>window.AOS.isPending(x)?1:0;   // pendientes al final
      return cs.sort((a,b)=>rank(a)-rank(b));
    },
    porSemana(){ // tasa global
      const cs=window.AOS.all();
      if(!cs.length) return [0,0,0,0];
      return cs[0].asis.map((_,w)=>Math.round(cs.reduce((a,x)=>a+x.asis[w],0)/cs.length*100));
    },
    total(c){ return c.asis.reduce((a,b)=>a+b,0)+' / '+c.asis.length; }
  };
})();
