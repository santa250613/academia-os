/* Academia OS · backend/asistencias/asistencias.js
   Grupos por clase + asistencia por fecha (Asistió / Falta). */
(function(){
  window.AOSAsis={
    /* alumnos de una clase, activos primero, pendientes de pago al final */
    grupo(clase){
      const rank=x=>window.AOS.isPending(x)?1:0;
      return window.AOS.all().filter(x=>x.clase===clase)
        .sort((a,b)=>rank(a)-rank(b)||a.n.localeCompare(b.n,'es'));
    },
    /* estado de un alumno en una fecha:
       {estado:'asistio', hora} | {estado:'falta'} | {estado:'futuro'} */
    estadoDia(x,fecha){
      const reg=(x.log||[]).find(l=>l.d===fecha);
      if(reg) return {estado:'asistio',hora:reg.h};
      return {estado: fecha>window.AOS.hoy() ? 'futuro' : 'falta'};
    },
    /* quiénes se registraron en una fecha (para el dashboard) */
    delDia(fecha){
      return window.AOS.all()
        .map(x=>({x,reg:(x.log||[]).find(l=>l.d===fecha)}))
        .filter(o=>o.reg)
        .sort((a,b)=>a.reg.h.localeCompare(b.reg.h));
    },
    porSemana(){ // tasa global por semana
      const cs=window.AOS.all();
      if(!cs.length) return [0,0,0,0];
      return cs[0].asis.map((_,w)=>Math.round(cs.reduce((a,x)=>a+x.asis[w],0)/cs.length*100));
    },
    total(c){ return c.asis.reduce((a,b)=>a+b,0)+' / '+c.asis.length; }
  };
})();