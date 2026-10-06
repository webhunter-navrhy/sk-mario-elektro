(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* navigácia */
  const nav = $('#nav'), btn = $('#navBtn'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('is-sc', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  btn.addEventListener('click', () => {
    const o = !menu.classList.contains('open');
    menu.classList.toggle('open', o); btn.classList.toggle('open', o);
    btn.setAttribute('aria-expanded', o); document.body.classList.toggle('lock', o);
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); btn.classList.remove('open');
    btn.setAttribute('aria-expanded', false); document.body.classList.remove('lock');
  }));

  /* odhaľovanie pri scrolle */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* počítadlo 24/7 */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.to;
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), d = 1400;
    const tick = t => {
      const p = Math.min(1, (t - t0) / d), k = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * k);
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = 0; requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('.cnt').forEach(el => cio.observe(el));

  /* parallax fotky v predele */
  const px = $$('.px');
  if (!reduce && px.length) {
    const upd = () => px.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      img.style.transform = `translate3d(0, ${p * -12}%, 0) scale(1.15)`;
    });
    addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); upd();
  }

  /* služby: náhľad fotky pri kurzore */
  const prev = $('#slPrev');
  if (matchMedia('(hover: hover)').matches) {
    $$('.sl__row').forEach(r => {
      r.addEventListener('mouseenter', () => { prev.style.backgroundImage = `url(${r.dataset.img})`; prev.classList.add('on'); });
      r.addEventListener('mouseleave', () => prev.classList.remove('on'));
      r.addEventListener('mousemove', e => { prev.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 120}px, 0)`; });
    });
  }

  /* PÔDORYS: body, kábel z rozvádzača, zoznam do dopytu */
  const R = { x: 330, y: 455 };
  const BODY = [
    { id: 'r', n: 'R', x: R.x, y: R.y, t: 'Rozvádzač', m: 'Chodba', d: 'Nový rozvádzač alebo výmena starého. Odtiaľto vedie každý kábel v dome.' },
    { id: 'zas', n: '1', x: 130, y: 250, t: 'Zásuvky a vypínače', m: 'Obývačka', d: 'Montáž zásuviek a vypínačov pri novej elektroinštalácii aj pri výmene starých.' },
    { id: 'svi', n: '2', x: 360, y: 180, t: 'Svietidlá', m: 'Obývačka', d: 'Montáž a zapojenie svietidiel, stropných, závesných aj nástenných.' },
    { id: 'var', n: '3', x: 230, y: 77, t: 'Varná doska', m: 'Kuchyňa', d: 'Zapojenie varnej dosky a ďalších spotrebičov v kuchyni.' },
    { id: 'spo', n: '4', x: 525, y: 160, t: 'Zapojenie spotrebičov', m: 'Kúpeľňa', d: 'Zapojenie spotrebičov v domácnosti, aby všetko fungovalo bezpečne.' },
    { id: 'kli', n: '5', x: 740, y: 60, t: 'Klimatizácia', m: 'Spálňa', d: 'Montáž klimatizácie v prístupných podmienkach.' },
    { id: 'dat', n: '6', x: 620, y: 430, t: 'Dátové zásuvky', m: 'Pracovňa', d: 'Dátové zásuvky pre internet a počítače, tam, kde ich potrebujete.' },
    { id: 'ala', n: '7', x: 540, y: 290, t: 'Príprava pre alarm', m: 'Chodba', d: 'Elektroinštalácia pripravená pre zabezpečovací systém.' },
    { id: 'vra', n: '8', x: 480, y: 480, t: 'Domový vrátnik', m: 'Vstup', d: 'Príprava pre domový vrátnik pri vchode.' },
    { id: 'kam', n: '9', x: 780, y: 480, t: 'Kamery', m: 'Exteriér', d: 'Príprava pre kamery okolo domu.' },
    { id: 'bra', n: '10', x: 240, y: 528, t: 'Elektrická brána', m: 'Plot', d: 'Predpríprava pre elektrickú bránu, aby bol prívod pripravený.' },
    { id: 'pri', n: '11', x: 40, y: 300, t: 'Elektrická prípojka', m: 'Pri dome', d: 'Prípojka elektriny k domu.' },
    { id: 'ble', n: '12', x: 90, y: 40, t: 'Bleskozvod', m: 'Strecha', d: 'Montáž bleskozvodov.' },
  ];
  const CELY = ['Nová elektroinštalácia', 'Prerábka', 'Výmena starých rozvodov', 'Opravy'];
  const svg = $('#planSvg'), gBody = $('#body'), drot = $$('#drot .d');
  if (svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const vyber = new Set();
    let akt = 'r';
    BODY.forEach(b => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'bod' + (b.id === 'r' ? ' bod--r' : ''));
      g.setAttribute('transform', `translate(${b.x} ${b.y})`);
      g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${b.t} (${b.m})`); g.dataset.id = b.id;
      g.innerHTML = `<circle class="bod__hit" r="24"/><circle class="bod__pulz" r="14"/><circle class="bod__c" r="14"/><text class="bod__n" dy=".35em">${b.n}</text>`;
      gBody.appendChild(g);
      g.addEventListener('click', () => ukaz(b.id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ukaz(b.id); } });
    });
    const posun = [[-5, -5], [0, 0], [5, 5]];
    const kabel = b => {
      drot.forEach((p, i) => {
        const [dx, dy] = posun[i];
        const d = b.id === 'r' ? '' : `M${R.x + dx} ${R.y + dy} V${b.y + dy} H${b.x}`;
        p.setAttribute('d', d);
        p.classList.remove('kresli'); void p.getBoundingClientRect(); p.classList.add('kresli');
      });
    };
    const ukaz = id => {
      akt = id;
      const b = BODY.find(x => x.id === id);
      $$('.bod', gBody).forEach(g => g.classList.toggle('is-akt', g.dataset.id === id));
      $('#pIdx').textContent = `${b.n} · ${b.m}`;
      $('#pT').textContent = b.t; $('#pD').textContent = b.d;
      sync(); kabel(b);
    };
    const sync = () => {
      const on = vyber.has(akt);
      $('#pAdd').setAttribute('aria-pressed', on);
      $('#pAddT').textContent = on ? 'V zozname' : 'Pridať do dopytu';
      $$('.bod', gBody).forEach(g => g.classList.toggle('is-vyb', vyber.has(g.dataset.id)));
      $$('#pCely button').forEach(c => c.setAttribute('aria-pressed', vyber.has(c.dataset.id)));
      const zoz = $('#pZoz'); zoz.innerHTML = '';
      const polozky = [...vyber].map(id => (BODY.find(b => b.id === id) || { t: id.slice(2) }).t);
      $('#pCnt').textContent = polozky.length;
      if (!polozky.length) zoz.innerHTML = '<li class="prazdny">Zatiaľ nič. Kliknite na body v&nbsp;pôdoryse.</li>';
      polozky.forEach(t => { const li = document.createElement('li'); li.textContent = t; zoz.appendChild(li); });
    };
    $('#pAdd').addEventListener('click', () => { vyber.has(akt) ? vyber.delete(akt) : vyber.add(akt); sync(); });
    const cely = $('#pCely');
    CELY.forEach(t => {
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'chip'; c.dataset.id = 'c:' + t; c.textContent = t;
      c.setAttribute('aria-pressed', 'false');
      c.addEventListener('click', () => { vyber.has(c.dataset.id) ? vyber.delete(c.dataset.id) : vyber.add(c.dataset.id); sync(); });
      cely.appendChild(c);
    });
    $('#pSend').addEventListener('click', () => {
      const ta = $('#fSprava');
      const polozky = [...vyber].map(id => (BODY.find(b => b.id === id) || { t: id.slice(2) }).t);
      if (polozky.length) ta.value = 'Mám záujem o:\n' + polozky.map(t => '– ' + t).join('\n') + '\n\n' + ta.value.replace(/^Mám záujem o:[\s\S]*?\n\n/, '');
    });
    ukaz('r');
    // ukážka po príchode na sekciu: kábel k svietidlám
    const pio = new IntersectionObserver(es => { if (es[0].isIntersecting) { pio.disconnect(); if (akt === 'r') ukaz('svi'); } }, { threshold: .45 });
    pio.observe(svg);
  }

  /* formulár (ukážka) */
  const form = $('#form');
  form.addEventListener('submit', e => { e.preventDefault(); $('#fOk').hidden = false; });
  const file = $('.form__file input');
  file.addEventListener('change', () => { $('.form__file span').textContent = file.files.length ? `✓ ${file.files.length} ${file.files.length === 1 ? 'fotka' : file.files.length < 5 ? 'fotky' : 'fotiek'}` : '+ Priložiť fotku'; });
})();
