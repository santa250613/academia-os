/* Academia OS · backend/dashboard/dashboard.js
   KPIs, últimos 8 clientes, gráficas y recordatorios. */
(function(){
  const CLASSES=window.AOS.classes(), P=window.AOSPagos;
  const cs=window.AOS.all();
  const pagados=cs.filter(x=>x.est==='pagado').length,
        vencidos=cs.filter(x=>x.est==='vencido').length,
        nuevos=cs.filter(x=>x.est==='por iniciar').length;
  const totalAsis=cs.reduce((a,x)=>a+x.asis.reduce((p,q)=>p+q,0),0);
  const totalPos=cs.reduce((a,x)=>a+x.asis.length,0)||1;

  document.getElementById('kpis').innerHTML=[
    ['Clientes activos',cs.length,'acc'],
    ['Al día (pagado)',pagados,'ok'],
    ['Pago vencido',vencidos,'bad'],
    ['Asistencia global',Math.round(totalAsis/totalPos*100)+'%','']
  ].map(k=>`<div class="kpi ${k[2]}"><div class="n">${k[1]}</div><div class="t">${k[0]}</div></div>`).join('');

  // último 8 clientes agregados (los NFC nuevos quedan al final → son los "agregados")
  const ultimos=cs.slice(-8).reverse();
  document.getElementById('tbody').innerHTML=ultimos.map(x=>
   `<tr><td>${x.n}<br><span class="sub">${AOS.packLabel(x.paq)}${x.clase?' · '+CLASSES[x.clase]:''}</span></td>
    <td><span class="pill ${x.est==='pagado'?'ok':x.est==='vencido'?'bad':'warn'}">${x.est==='pagado'?'al día':x.est==='vencido'?'pago vencido':'por iniciar'}</span></td>
    <td>${P.fmt(P.precio(x.paq))}</td><td>${AOSAsis.total(x)}</td></tr>`).join('');

  // recordatorios automáticos
  const msgs=[...P.vencidos().map(x=>({t:'pago',x})), ...cs.map(x=>({t:'clase',x}))];
  document.getElementById('msgs').innerHTML=msgs.map(m=>{
    const txt=m.t==='pago'
     ?`Hola ${m.x.n.split(' ')[0]} 💃 recuerda que tu cuota está vencida. Renueva en recepción o por link de pago. ¡Te esperamos! — Academia OS`
     :`Hola ${m.x.n.split(' ')[0]} 💃 mañana tu clase ${m.x.clase?CLASSES[m.x.clase]:'de baile'}. Marca tu ingreso con el sticker NFC al llegar. ¡Nos bailamos! — Academia OS`;
    return `<div class="msg-row"><div>${m.t==='pago'?'<span class="wa">💰 Pago</span>':'<span>🩰 Clase</span>'} · ${m.x.n}
      <div class="to">WhatsApp → +57 ${m.x.tel||'3XX XXX XXXX'} · ${txt.slice(0,52)}…</div></div>
      <button class="btn ghost" onclick="copyM(this,${JSON.stringify(txt)})">Copiar</button></div>`;}).join('');
  window.copyM=(b,t)=>{navigator.clipboard.writeText(t);b.textContent='✓';setTimeout(()=>b.textContent='Copiar',1500)};

  // gráficas
  new Chart(document.getElementById('chAsis'),{type:'line',
    data:{labels:['Sem 1','Sem 2','Sem 3','Sem 4'],
     datasets:[{label:'Asistencia %',data:AOSAsis.porSemana(),borderColor:'#7c5cff',backgroundColor:'rgba(124,92,255,.15)',fill:true,tension:.4,pointRadius:5}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8a93ab'}}},
     scales:{x:{ticks:{color:'#8a93ab'},grid:{color:'#262d42'}},y:{max:100,ticks:{color:'#8a93ab',callback:v=>v+'%'},grid:{color:'#262d42'}}}}});

  const car=P.carteraPorSemana();
  new Chart(document.getElementById('chCartera'),{type:'bar',
    data:{labels:['Sem 1','Sem 2','Sem 3','Sem 4'],
     datasets:[
       {label:'Pagado ($k)',data:[40,35,60,Math.round(car.pagado/1000)],backgroundColor:'#2dd4a7',borderRadius:8},
       {label:'Pendiente ($k)',data:[36,50,20,Math.round(car.pend/1000)],backgroundColor:'#ff6b81',borderRadius:8}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8a93ab'}}},
     scales:{x:{stacked:true,ticks:{color:'#8a93ab'},grid:{display:false}},y:{stacked:true,ticks:{color:'#8a93ab',callback:v=>'$'+v+'k'},grid:{color:'#262d42'}}}}});
})();
