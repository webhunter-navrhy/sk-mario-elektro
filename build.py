"""Zostaví index.html + style.css + main.js s cache bustingom (?v=hash).
Texty podľa vlastného popisu Mario Elektro na Zlatých stránkach (podklady/zlatestranky/profil.html),
fotky sú ilustračné (podklady/stock, spracuj_foto.py)."""
import hashlib, re
from pathlib import Path
from PIL import Image
D = Path(__file__).parent

MARQUEE = ['Novostavby', 'Domy a byty', 'Kancelárie', 'Prerábky', 'Výmena starých rozvodov', 'Prípojky',
           'Rozvádzače', 'Bleskozvody', 'Obhliadka zdarma', 'Telefón nonstop', 'Trnava a okolie']
# (názov, popis, fotka na hover)
SLUZBY = [
    ('Kompletné elektroinštalácie', 'Novostavby, rodinné domy, byty, kancelárske a&nbsp;iné priestory. Celé rozvody od rozvádzača po poslednú zásuvku.', 'vodice'),
    ('Prerábky a rekonštrukcie', 'Prerobenie elektroinštalácie pri rekonštrukcii bytu či domu, celé alebo len po častiach.', 'spoje'),
    ('Výmena starých rozvodov', 'Staré rozvody nahradím novými a&nbsp;bezpečnými.', 'stare'),
    ('Elektrické prípojky', 'Prípojka elektriny k&nbsp;domu alebo inému objektu.', 'pripojka'),
    ('Rozvádzače', 'Nové rozvádzače aj výmena starých, istenie a&nbsp;zapojenie obvodov.', 'istice'),
    ('Zásuvky, vypínače, dátové zásuvky', 'Montáž zásuviek, vypínačov a&nbsp;dátových zásuviek pre internet a&nbsp;počítače.', 'montaz'),
    ('Svietidlá a spotrebiče', 'Montáž svietidiel, zapojenie spotrebičov, varnej dosky a&nbsp;ďalšieho.', 'svietidla'),
    ('Príprava pre alarm, kamery a vrátnik', 'Príprava pre alarm, kamery a&nbsp;domový vrátnik, predpríprava pre elektrickú bránu.', 'zvazok'),
    ('Bleskozvody', 'Montáž bleskozvodov.', 'dom'),
    ('Montáž klimatizácie', 'V&nbsp;prístupných podmienkach.', 'interier'),
    ('Opravy', 'Keď niečo nefunguje, nájdem príčinu a&nbsp;opravím to.', 'rozvadzac'),
]
# (súbor, popis, veľkosť: t = vysoká, w = široká, b = veľká, '' = 1×1)
GALERIA = [
    ('montaz', 'Práca v rozvádzači', 'b'),
    ('svietidla', 'Svietidlá', ''),
    ('spoje', 'Spájanie vodičov', ''),
    ('istice', 'Ističe a stýkače', 'w'),
    ('zvazok', 'Káble', 't'),
    ('dom', 'Rodinný dom', 'w'),
    ('vodice', 'Vodiče', 't'),
    ('interier', 'Osvetlenie interiéru', 'w'),
]

size = lambda n: Image.open(D / 'img' / f'{n}.jpg').size
blesk = '<svg class="mq__z" aria-hidden="true"><use href="#blesk"/></svg>'
marquee = ''.join(f'<span>{t}</span>{blesk}' for t in MARQUEE) * 2

def row(i, n, p, f):
    return (f'<li class="sl__row rv" data-img="img/{f}.jpg" tabindex="0">'
            f'<span class="sl__i mono">{i + 1:02d}</span><h3>{n}</h3><p>{p}</p>'
            f'<span class="sl__a" aria-hidden="true">→</span></li>')
sluzby = '\n        ' + '\n        '.join(row(i, *s) for i, s in enumerate(SLUZBY)) + '\n      '

def fig(n, popis, k):
    w, h = size(n)
    return (f'<figure class="gi gi--{k or "n"} rv"><img src="img/{n}.jpg" alt="{popis} (ilustračné foto)" loading="lazy" '
            f'width="{w}" height="{h}"><figcaption class="mono">{popis}</figcaption></figure>')
galeria = '\n      ' + '\n      '.join(fig(*g) for g in GALERIA) + '\n    '

css = (D / 'fonts/fonts.css').read_text() + '\n' + (D / 'style.src.css').read_text()
(D / 'style.css').write_text(css)
js = (D / 'main.src.js').read_text()
(D / 'main.js').write_text(js)
h = lambda b: hashlib.md5(b).hexdigest()[:8]
html = (D / 'src.html').read_text()
for k, v in dict(marquee=marquee, sluzby=sluzby, galeria=galeria).items():
    html = html.replace('{{' + k + '}}', v)
html = re.sub(r'\{\{([wh]):(\w+)\}\}', lambda m: str(size(m[2])[0 if m[1] == 'w' else 1]), html)
html = html.replace('{{css}}', h(css.encode())).replace('{{js}}', h(js.encode()))
assert '{{' not in html, html[html.find('{{'):html.find('{{') + 40]
(D / 'index.html').write_text(html)
print('ok')
