(function(){
  'use strict';

  function getTheme(appId){
    switch(appId){
      case 'app-1': return { title: 'Formulario App 1', color: '#2563eb' }; // azul
      case 'app-2': return { title: 'Formulario App 2', color: '#16a34a' }; // verde
      case 'app-3': return { title: 'Formulario App 3', color: '#dc2626' }; // rojo
      default:      return { title: 'Formulario Genérico', color: '#7c3aed' }; // violeta
    }
  }

  function html(strings){ return strings.raw[0]; }

  function render(shadow, theme, options){
    shadow.innerHTML = '';
    var style = document.createElement('style');
    style.textContent = [
      ':host{font-family: ui-sans-serif,system-ui,Segoe UI,Roboto,Ubuntu,Arial;display:block;}',
      '.container{border:1px solid #e5e7eb;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.07);}',
      'h2{margin:0 0 12px 0;font-size:1.25rem;}',
      '.label{display:block;margin-bottom:6px;font-weight:600;}',
      '.input{width:92%;padding:10px;border:1px solid #d1d5db;border-radius:8px;}',
      '.row{margin-bottom:12px;}',
      '.button{background:'+theme.color+';border:none;color:white;padding:10px 14px;border-radius:8px;cursor:pointer;}',
      '.muted{color:#6b7280;font-size:0.9rem;}',
      /* Modal */
      '.backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999;}',
      '.modal{background:#fff;border-radius:12px;max-width:560px;width:92%;padding:16px;border:1px solid #e5e7eb;box-shadow:0 10px 25px rgba(0,0,0,0.2);}',
      '.modal h3{margin:0 0 8px 0;font-size:1.15rem;}',
      '.modal .content{max-height:50vh;overflow:auto;line-height:1.45;}',
      '.modal .actions{display:flex;justify-content:flex-end;margin-top:12px;}',
      '.modal button{border:1px solid #d1d5db;background:#f9fafb;border-radius:8px;padding:8px 12px;cursor:pointer;}',
      '.legal-link{color:'+theme.color+';text-decoration:underline;cursor:pointer;}'
    ].join('');

    var container = document.createElement('div');
    container.className = 'container';

    var title = document.createElement('h2');
    title.textContent = theme.title;

    var form = document.createElement('form');
    form.innerHTML = html`
      <div class="row">
        <label class="label" for="firstName">Nombres</label>
        <input id="firstName" name="firstName" type="text" class="input" placeholder="Tus nombres" required>
      </div>
      <div class="row">
        <label class="label" for="lastName">Apellidos</label>
        <input id="lastName" name="lastName" type="text" class="input" placeholder="Tus apellidos" required>
      </div>
      <div class="row">
        <label class="label" for="email">Email</label>
        <input id="email" name="email" type="email" class="input" placeholder="tucorreo@ejemplo.com" required>
      </div>
      <div class="row">
        <label class="label" for="phone">Teléfono</label>
        <input id="phone" name="phone" type="tel" class="input" placeholder="+51 999 999 999" pattern="[0-9+\s-]{6,20}" required>
        <div class="muted">Formato libre, se aceptan dígitos, espacios, + y guiones.</div>
      </div>
      <div class="row" style="display:flex;gap:8px;align-items:flex-start;">
        <input id="terms" name="terms" type="checkbox" required style="margin-top:3px;">
        <label for="terms" class="muted">Acepto los <a href="#" class="legal-link">términos legales</a>.</label>
      </div>
      <div style="margin-top:12px"><button class="button" type="submit">Enviar</button></div>
    `;

    // Modal (creado pero oculto)
    var backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    backdrop.style.display = 'none';
    backdrop.innerHTML = html`
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="legal-title">
        <h3 id="legal-title">Términos legales (mock)</h3>
        <div class="content">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc congue, velit sit amet tincidunt aliquet, erat ligula tristique orci, a consequat velit dolor sed massa. Cras non nisi ut ipsum tempus feugiat. Curabitur a leo at orci gravida ultricies. Suspendisse potenti. Donec eget consectetur mauris. Integer vel neque non arcu tristique elementum.</p>
          <p>Este contenido es de demostración y no constituye asesoría legal.</p>
        </div>
        <div class="actions">
          <button type="button" class="close-btn">Cerrar</button>
        </div>
      </div>
    `;

    // Eventos de modal
    function openModal(){ backdrop.style.display = 'flex'; }
    function closeModal(){ backdrop.style.display = 'none'; }
    backdrop.addEventListener('click', function(ev){
      // cerrar si clic fuera del cuadro
      if (ev.target === backdrop) closeModal();
    });
    backdrop.querySelector('.close-btn').addEventListener('click', closeModal);

    // Link a términos
    // ojo: el link está dentro del form DOM (no shadow?), sí, dentro del shadow
    // buscamos por clase dentro del form:
    form.addEventListener('click', function(ev){
      var a = ev.target.closest('a.legal-link');
      if (a){
        ev.preventDefault();
        openModal();
      }
    });

    // Manejo de envío
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(form);
      var data = Object.fromEntries(fd.entries());
      // Normalizamos el checkbox a booleano
      data.terms = !!fd.get('terms');

      if (options.onSubmit) {
        try { options.onSubmit({ applicationId: options.applicationId, data: data }); } catch(e){ /* noop */ }
      }
      alert('Mock: datos capturados. Revisa la consola.');
      console.log('[FormifyMock] submit', { applicationId: options.applicationId, data: data });
    });

    shadow.appendChild(style);
    shadow.appendChild(container);
    container.appendChild(title);
    container.appendChild(form);
    shadow.appendChild(backdrop);
  }

  function mount(opts){
    if (!opts) throw new Error('opts requeridos');
    var target = opts.target;
    var applicationId = opts.applicationId || 'default';

    var el = (typeof target === 'string') ? document.querySelector(target) : target;
    if (!el) throw new Error('Target container no encontrado');

    var host = document.createElement('formify-mock');
    var shadow = host.attachShadow({ mode: 'open' });

    // Limpia y monta
    el.innerHTML = '';
    el.appendChild(host);

    var theme = getTheme(applicationId);
    render(shadow, theme, { applicationId: applicationId, onSubmit: opts.onSubmit });
  }

  window.FormifyMockWidget = { mount: mount };
})();
