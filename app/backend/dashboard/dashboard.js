/* Academia OS · backend/dashboard/dashboard.js
   KPIs, asistencia de hoy, últimos 8 clientes, gráficas y recordatorios.
   Se vuelve a pintar solo cuando check.html registra a alguien. */
(function(){
  const CLASSES=AOS.classes(), P=AOSPagos, esc=AOS.esc;
  const $=id=>document.getElementById(id);
  let chAsis=null, chCar=null, msgs=[];

  function render(){
    const cs=AOS.all();
    const cnt={al_dia:0,vencido:0,por_iniciar:0};
    cs.forEach(x=>cnt[AOS.estado(x)]++);
    const hoy=AOSAsis.delDia(AOS.hoy());
    const totalAsis=cs.reduce((a,x)=>a+x.asis.reduce((p,q)=>p+q,0),0);
    const totalPos=cs.reduce((a,x)=>a+x.asis.length,0)||1;

    /* KPIs: mismas reglas de estado que en clases y clientes */
    $('kpis').innerHTML=[
      ['Clientes registrados',cs.length,'acc'],
      ['Al día',cnt.al_dia,'ok'],
      ['Mensualidad vencida',cnt.vencido,'bad'],
      ['Asistieron hoy',hoy.length,'acc'],
      ['Asistencia global',Math.round(totalAsis/totalPos*100)+'%','']
    ].map(k=>`<div class="kpi ${k[2]}"><div class="n">${k[1]}</div><div class="t">${k[0]}</div></div>`).join('');

    /* asistencia de hoy */
    $('hoyBody').innerHTML=hoy.length?hoy.map(o=>`<tr>
      <td data-label="Nombre">${esc(o.x.n)}</td>
      <td data-label="Clase">${o.x.clase?esc(CLASSES[o.x.clase]):'<span class="m-sub">Sin clase</span>'}</td>
      <td data-label="Hora">${esc(o.reg.h)}</td>
      <td data-label="Pago"><span class="pill ${AOS.pillClass(o.x)}">${AOS.estadoLabel(o.x)}</span></td></tr>`).join('')
      :'<tr><td colspan="4" class="m-sub" style="text-align:center">Aún no se registra nadie hoy.</td></tr>';

    /* últimos 8 clientes agregados */
    $('tbody').innerHTML=cs.slice(-8).reverse().map(x=>
     `<tr><td data-label="Nombre">${esc(x.n)}<br><span class="m-sub">${AOS.packLabel(x.paq)}${x.clase?' · '+CLASSES[x.clase]:''}</span></td>
      <td data-label="Estado"><span class="pill ${AOS.pillClass(x)}">${AOS.estadoLabel(x)}</span></td>
      <td data-label="Cuota">${P.fmt(P.precio(x.paq))}</td>
      <td data-label="Asistencias">${AOSAsis.total(x)}</td></tr>`).join('');

    /* recordatorios */
    msgs=[...P.vencidos().map(x=>({t:'pago',x})), ...cs.map(x=>({t:'clase',x}))].map(m=>{
      const nom=m.x.n.split(' ')[0];
      m.txt=m.t==='pago'
       ?`Hola ${nom} 💃 recuerda que tu mensualidad está vencida. Renueva en recepción o por link de pago. ¡Te esperamos! — Academia OS`
       :`Hola ${nom} 💃 mañana tu clase ${m.x.clase?CLASSES[m.x.clase]:'de baile'}. Marca tu ingreso con el sticker NFC al llegar. ¡Nos bailamos! — Academia OS`;
      return m;
    });
    $('msgs').innerHTML=msgs.map((m,i)=>
     `<div class="msg-row"><div style="min-width:0">${m.t==='pago'?'<span class="wa">💰 Pago</span>':'<span>🩰 Clase</span>'} · ${esc(m.x.n)}
        <div class="m-sub">WhatsApp → +57 ${esc(m.x.tel||'3XX XXX XXXX')} · ${esc(m.txt.slice(0,52))}…</div></div>
      <button class="btn ghost" data-i="${i}">Copiar</button></div>`).join('');

    charts();
  }

  /* copiar mensaje (antes el onclick con JSON dentro de comillas dobles se rompía) */
  $('msgs').addEventListener('click',e=>{
    const b=e.target.closest('button[data-i]'); if(!b) return;
    navigator.clipboard.writeText(msgs[b.dataset.i].txt);
    b.textContent='✓'; setTimeout(()=>b.textContent='Copiar',1500);
  });

  function charts(){
    if(typeof Chart==='undefined') return;           // sin internet no hay Chart.js
    const asis=AOSAsis.porSemana(), car=P.carteraPorSemana();
    const carData=[[40,35,60,Math.round(car.pagado/1000)],[36,50,20,Math.round(car.pend/1000)]];
    if(chAsis){
      chAsis.data.datasets[0].data=asis; chAsis.update();
      chCar.data.datasets[0].data=carData[0]; chCar.data.datasets[1].data=carData[1]; chCar.update();
      return;
    }
    chAsis=new Chart($('chAsis'),{type:'line',
      data:{labels:['Sem 1','Sem 2','Sem 3','Sem 4'],
       datasets:[{label:'Asistencia %',data:asis,borderColor:'#7c5cff',backgroundColor:'rgba(124,92,255,.15)',fill:true,tension:.4,pointRadius:5}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8a93ab'}}},
       scales:{x:{ticks:{color:'#8a93ab'},grid:{color:'#262d42'}},y:{max:100,ticks:{color:'#8a93ab',callback:v=>v+'%'},grid:{color:'#262d42'}}}}});
    chCar=new Chart($('chCartera'),{type:'bar',
      data:{labels:['Sem 1','Sem 2','Sem 3','Sem 4'],
       datasets:[
         {label:'Pagado ($k)',data:carData[0],backgroundColor:'#2dd4a7',borderRadius:8},
         {label:'Pendiente ($k)',data:carData[1],backgroundColor:'#ff6b81',borderRadius:8}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8a93ab'}}},
       scales:{x:{stacked:true,ticks:{color:'#8a93ab'},grid:{display:false}},y:{stacked:true,ticks:{color:'#8a93ab',callback:v=>'$'+v+'k'},grid:{color:'#262d42'}}}}});
  }

  render();
  AOS.onChange(render);
})();
