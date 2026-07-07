/* =========================================================================
   Invitación de boda — Salva y Rocío
   Lógica: animación de portada, cuenta atrás y formulario RSVP
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------------
     1) FECHA DE LA BODA (cámbiala aquí si hace falta)
     --------------------------------------------------------------------- */
  const WEDDING_DATE = new Date('2026-10-10T16:00:00');

  /* ---------------------------------------------------------------------
     2) ANIMACIÓN DE LA PORTADA — dos corazones
     Secuencia: idle → falling (caen) → meeting (se acercan) →
                hugging (se abrazan) → walking (se van de la mano) → entered
     --------------------------------------------------------------------- */
  const gate      = document.getElementById('gate');
  const gateInner = document.getElementById('gateInner');
  const content   = document.getElementById('content');

  const el = (id) => document.getElementById(id);
  const idleTulip = el('idleTulip');
  const ground    = el('ground');
  const gateHint  = el('gateHint');
  const eyebrow   = document.querySelector('.gate-eyebrow');
  const names     = document.querySelector('.gate-names');

  const leftFig   = el('leftFig');
  const rightFig  = el('rightFig');
  const leftBob   = el('leftBob');
  const rightBob  = el('rightBob');
  const childFig  = el('childFig');
  const childBob  = el('childBob');

  const poses = {
    leftWalk:  el('leftWalk'),  leftHug:  el('leftHug'),  leftHold:  el('leftHold'),
    rightWalk: el('rightWalk'), rightHug: el('rightHug'), rightHold: el('rightHold'),
    childWalk: el('childWalk'),
  };
  const hearts = [
    { node: el('heart1'), delay: 0,   dur: 2.2 },
    { node: el('heart2'), delay: 0.5, dur: 2.6 },
    { node: el('heart3'), delay: 1.0, dur: 2.3 },
    { node: el('heart4'), delay: 1.5, dur: 2.8 },
    { node: el('heart5'), delay: 0.8, dur: 2.5 },
  ];

  const DROP       = -440;  // altura desde la que caen los padres
  const CHILD_DROP  = -300;  // altura desde la que cae la hija
  const GROUP       = -470;  // desplazamiento al irse caminando
  const NEAR        = 30;    // acercamiento al encontrarse
  const HUG         = 46;    // acercamiento al abrazarse

  let stage = 'idle';
  const timers = [];

  function applyStage(s) {
    stage = s;
    const gone    = s !== 'idle';
    const falling = s === 'falling';
    const meeting = s === 'meeting';
    const hug     = s === 'hugging';
    const walking = s === 'walking';
    const landed  = meeting || hug || walking;

    /* tulipán inicial: se encoge y desaparece al empezar */
    idleTulip.style.opacity   = gone ? 0 : 1;
    idleTulip.style.transform = gone ? 'translateY(-16px) scale(.6)' : 'scale(1)';
    idleTulip.style.animation = s === 'idle' ? 'wiggle 3.2s ease-in-out infinite' : 'none';

    /* suelo */
    ground.style.opacity = gone ? 1 : 0;

    /* los textos de la portada aparecen al tocar el tulipán */
    eyebrow.style.opacity = gone ? 1 : 0;
    names.style.opacity   = gone ? 1 : 0;

    /* transición de movimiento según fase */
    const figTr = walking ? 'transform 2.4s linear, opacity .3s ease'
      : falling ? 'transform 1s cubic-bezier(.45,0,.75,.4), opacity .3s ease'
      : hug     ? 'transform .8s cubic-bezier(.34,1.35,.5,1), opacity .3s ease'
      :           'transform .8s ease-in-out, opacity .3s ease';   /* meeting */

    /* posiciones horizontales */
    const group = walking ? GROUP : 0;
    let lx = 0; if (meeting) lx = NEAR; if (hug || walking) lx = HUG;
    let rx = 0; if (meeting) rx = -NEAR; if (hug || walking) rx = -HUG;
    const y = (s === 'idle') ? DROP : 0;

    leftFig.style.transition  = figTr;
    leftFig.style.opacity     = gone ? 1 : 0;
    leftFig.style.transform   = `translate(${lx + group}px, ${y}px) rotate(${falling ? -8 : 0}deg)`;

    rightFig.style.transition = figTr;
    rightFig.style.opacity    = gone ? 1 : 0;
    rightFig.style.transform  = `translate(${rx + group}px, ${y}px) rotate(${falling ? 8 : 0}deg)`;

    /* balanceo al andar (piernas + brazos) */
    leftFig.classList.toggle('swinging',  meeting || walking);
    rightFig.classList.toggle('swinging', meeting || walking);

    /* rebote del cuerpo al caminar */
    const strolling = meeting || walking;
    leftBob.style.animation  = strolling ? 'strollBob .5s ease-in-out infinite'     : 'none';
    rightBob.style.animation = strolling ? 'strollBob .5s ease-in-out .12s infinite' : 'none';

    /* poses visibles */
    const walkPose = falling || meeting;
    poses.leftWalk.style.opacity  = walkPose ? 1 : 0;
    poses.leftHug.style.opacity   = hug      ? 1 : 0;
    poses.leftHold.style.opacity  = walking  ? 1 : 0;
    poses.rightWalk.style.opacity = walkPose ? 1 : 0;
    poses.rightHug.style.opacity  = hug      ? 1 : 0;
    poses.rightHold.style.opacity = walking  ? 1 : 0;

    /* corazoncitos al abrazarse */
    hearts.forEach(h => {
      h.node.style.animation = hug ? `floatHeart ${h.dur}s ease-in ${h.delay}s infinite` : 'none';
    });

    /* la hija: aparece cayendo cuando sus padres se abrazan, y luego anda con ellos */
    const childIn = hug || walking;
    childFig.style.transition = walking
      ? 'transform 2.4s linear, opacity .3s ease'
      : 'transform .9s cubic-bezier(.34,1.35,.5,1), opacity .3s ease';
    childFig.style.opacity   = childIn ? 1 : 0;
    childFig.style.transform = `translate(${group}px, ${childIn ? 0 : CHILD_DROP}px)`;
    childFig.classList.toggle('swinging', walking);
    childBob.style.animation = walking ? 'strollBob .5s ease-in-out .06s infinite' : 'none';
    poses.childWalk.style.opacity = childIn ? 1 : 0;

    /* pista de la portada */
    gateHint.style.opacity   = gone ? 0 : 1;
    gateHint.style.animation = s === 'idle' ? 'pulseHint 2.2s ease-in-out infinite' : 'none';
    gateInner.style.cursor   = s === 'idle' ? 'pointer' : 'default';
  }

  function enter() {
    if (stage !== 'idle') return;

    /* música: arranca con el toque (los navegadores lo exigen así) */
    const music = el('bgMusic');
    if (music) {
      if (!music.src) music.src = music.dataset.src;
      music.volume = 0.65;
      music.play().catch(() => {});
    }

    const step = (s, ms) => timers.push(setTimeout(() => applyStage(s), ms));
    applyStage('falling');           // caen desde arriba
    step('meeting',  1150);          // aterrizan y se acercan andando
    step('hugging',  2350);          // se abrazan
    step('walking',  3650);          // se van de la mano
    // mostrar el contenido tras verlos alejarse
    timers.push(setTimeout(() => {
      gate.classList.add('leaving');
      content.hidden = false;
      revealOnScroll();
    }, 5300));
    timers.push(setTimeout(() => { gate.style.display = 'none'; }, 6800));
  }

  gateInner.addEventListener('click', enter);
  applyStage('idle');

  /* ---------------------------------------------------------------------
     3) CUENTA ATRÁS
     --------------------------------------------------------------------- */
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    let d = Math.max(0, WEDDING_DATE - new Date());
    const days  = Math.floor(d / 86400000); d -= days * 86400000;
    const hours = Math.floor(d / 3600000);  d -= hours * 3600000;
    const mins  = Math.floor(d / 60000);    d -= mins * 60000;
    const secs  = Math.floor(d / 1000);
    const set = (id, v) => { const n = el(id); if (n) n.textContent = pad(v); };
    set('cd-days', days); set('cd-hours', hours); set('cd-mins', mins); set('cd-secs', secs);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------------------------------------------------------------
     4) APARICIÓN AL HACER SCROLL
     --------------------------------------------------------------------- */
  let observer;
  function revealOnScroll() {
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); } });
      }, { threshold: 0.15 });
    }
    document.querySelectorAll('.reveal:not(.in)').forEach(n => observer.observe(n));
  }

  /* ocultar la pista de deslizar al primer scroll (en cualquier contenedor) */
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    const fadeOut = () => {
      const current = getComputedStyle(scrollHint).opacity;
      scrollHint.style.animation = 'none';
      scrollHint.animate(
        [{ opacity: current }, { opacity: 0 }],
        { duration: 1100, easing: 'ease', fill: 'forwards' }
      );
    };
    const hideHint = () => {
      const sc = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (sc > 20) {
        fadeOut();
        document.removeEventListener('scroll', hideHint, true);
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('touchmove', onWheel);
      }
    };
    const onWheel = () => {
      fadeOut();
      document.removeEventListener('scroll', hideHint, true);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onWheel);
    };
    document.addEventListener('scroll', hideHint, { passive: true, capture: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onWheel, { passive: true });
  }

  /* ---------------------------------------------------------------------
     5) COPIAR NÚMERO DE CUENTA (regalo)
     --------------------------------------------------------------------- */
  const giftCopyBtn = el('giftCopyBtn');
  const giftIban    = el('giftIban');
  if (giftCopyBtn) {
    giftCopyBtn.addEventListener('click', async () => {
      const text = giftIban.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // respaldo si el navegador bloquea el portapapeles
        const t = document.createElement('textarea');
        t.value = text;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
      }
      giftCopyBtn.textContent = '¡Copiado!';
      giftCopyBtn.classList.add('copied');
      setTimeout(() => { giftCopyBtn.textContent = 'Copiar'; giftCopyBtn.classList.remove('copied'); }, 2000);
    });
  }

  /* ---------------------------------------------------------------------
     6) FORMULARIO RSVP
     --------------------------------------------------------------------- */
  const plusToggle = el('plusOneToggle');
  const plusInput  = el('plusOneInput');
  const btnYes     = el('btnYes');
  const btnNo      = el('btnNo');
  const form       = el('rsvpForm');
  let rsvp = null;

  plusToggle.addEventListener('click', () => {
    const on = plusToggle.classList.toggle('on');
    plusInput.hidden = !on;
  });

  btnYes.addEventListener('click', () => { rsvp = 'yes'; btnYes.classList.add('active'); btnNo.classList.remove('active'); });
  btnNo.addEventListener('click',  () => { rsvp = 'no';  btnNo.classList.add('active');  btnYes.classList.remove('active'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    /* envío invisible al Formulario de Google de los novios */
    const GOOGLE_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSeLLukJ8fo0IR8TS7yUBzsRtmSi5jbKirrt8vMKUSMVw0l2aw/formResponse';
    const data = new FormData();
    data.append('entry.278540770',  form.nombre.value.trim());                                        // Nombre
    data.append('entry.530210939',  rsvp === 'no' ? 'No' : 'Sí');                                     // ¿Asistirás?
    data.append('entry.1629134468', plusToggle.classList.contains('on') ? plusInput.value.trim() : ''); // Acompañante
    data.append('entry.692119722',  form.intolerancias.value.trim());                                 // Intolerancias

    /* Mensaje para los novios — pega aquí el entry.XXXX de la pregunta nueva del formulario */
    const MSG_ENTRY = 'entry.1140068820';
    if (MSG_ENTRY) data.append(MSG_ENTRY, form.mensaje.value.trim());                                 // Mensaje

    fetch(GOOGLE_FORM, { method: 'POST', mode: 'no-cors', body: data })
      .catch(() => {});   // no-cors: no podemos leer la respuesta, pero el envío llega

    /* mensaje de gracias en el mismo estilo */
    const fields = form.querySelector('.rsvp-fields');
    fields.innerHTML = '<p class="rsvp-thanks">¡Gracias' + (form.nombre.value.trim() ? ', ' + form.nombre.value.trim() : '') + '!<br>Confirmación enviada ♥</p>';
  });

});
