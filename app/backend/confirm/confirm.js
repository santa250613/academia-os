/* Academia OS · backend/confirm/confirm.js
   Ventana emergente de confirmación reutilizable.

   Uso:
     const ok = await AOSConfirm.ask({
       titulo:'¿Quitar del grupo?',
       mensaje:'Laura saldrá de Bachata.',
       confirmar:'Sí, quitar'
     });
     if(ok){ ...acción... }

   - Cancelar, Esc o tocar fuera de la ventana = NO se hace nada.
   - El foco inicia en "Cancelar" para que un Enter accidental no elimine. */
(function(){
  window.AOSConfirm={
    ask({titulo='¿Estás seguro?',mensaje='',confirmar='Eliminar',cancelar='Cancelar',peligro=true}={}){
      return new Promise(resolve=>{
        const d=document.createElement('dialog');
        d.className='aos-dialog';
        d.setAttribute('aria-labelledby','aosc-t');
        d.innerHTML=
          `<div class="aos-dialog-body">
            <h2 id="aosc-t"></h2>
            <p></p>
            <div class="aos-actions">
              <button type="button" class="btn" data-v="0"></button>
              <button type="button" class="btn ${peligro?'danger':'add'}" data-v="1"></button>
            </div>
          </div>`;
        /* textContent: los nombres de alumnos nunca se interpretan como HTML */
        d.querySelector('h2').textContent=titulo;
        d.querySelector('p').textContent=mensaje;
        const [bNo,bSi]=d.querySelectorAll('button');
        bNo.textContent=cancelar; bSi.textContent=confirmar;

        let result=false;
        d.addEventListener('click',e=>{
          const b=e.target.closest('button[data-v]');
          if(b){ result=b.dataset.v==='1'; d.close(); }
          else if(e.target===d){ d.close(); }          // clic en el fondo oscuro = cancelar
        });
        d.addEventListener('close',()=>{ d.remove(); resolve(result); }); // Esc también llega aquí
        document.body.appendChild(d);
        d.showModal();
        bNo.focus();
      });
    }
  };
})();