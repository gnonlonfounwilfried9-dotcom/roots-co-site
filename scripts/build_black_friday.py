# -*- coding: utf-8 -*-
"""ROOTS & Co : genere black-friday.html (page Black Friday, offres Dell + lot HP).

Source des prix : PROJET_BLACK_FRIDAY_complet.pptx (scripts/bf_items.json), prix en euros HT.
FCFA HT = euros HT x 655,957, arrondi a l'unite, aucun coefficient (regle ROOTS du 25/09/2026).
Lot HP : prix donnes directement en FCFA HT dans le dossier.
Lancer : python scripts/build_black_friday.py puis python bust.py puis python scripts/verif.py
"""
import io, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from site_parts import footer_html, b64, WA_BASE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RATE = 655.957
IMG = {
    "tower": "assets/produits/dell-pro-tower.png",
    "slim": "assets/produits/dell-qcs1250-slim.png",
    "plus": "assets/produits/dell-qbt1250-plustower.png",
    "pa13": "assets/produits/dell-pa13250.png",
    "pa14": "assets/produits/dell-pa14250.png",
    "db14": "assets/produits/dell-db14250.png",
    "pv15": "assets/produits/dell-pv15250.png",
    "pro14": "assets/produits/dell-pro-14.png",
    "xps": "assets/produits/dell-xps-14.png",
    "rack": "assets/produits/dell-poweredge-server.png",
    "t160": "assets/produits/dell-poweredge-t160.png",
    "t360": "assets/produits/dell-poweredge-t360.png",
    "hp": "assets/produits/hp-pro-tower-290-g9.png",
}
IMGMAP = {
    "487781": "tower", "452608": "tower", "452610": "tower", "451601": "tower",
    "451568": "slim", "451488": "slim", "451668": "plus",
    "488561": "pa13", "495624": "pa14", "495625": "pa14", "504225": "db14",
    "491059": "pv15", "491062": "pv15", "715988": "pv15", "715987": "pv15", "715985": "pv15",
    "495628": "pro14", "503550": "pro14", "495626": "pro14",
    "505183": "xps", "504937": "xps",
    "1038225320": "rack", "1038225371": "rack",
    "1038225532": "t360", "1038225244": "t160", "1038225245": "t160",
}
KEYEN = {"Processeur": "Processor", "RAM": "Memory", "Stockage": "Storage", "Écran": "Screen", "Système": "System",
         "Format": "Form factor", "Garantie": "Warranty", "Connectivité": "Connectivity", "Carte graphique": "Graphics",
         "Châssis": "Chassis", "Alimentation": "Power supply", "Garantie pièces": "Parts warranty"}
WORDS = {"DELL": "Dell", "PRO": "Pro", "TOWER": "Tower", "SLIM": "Slim", "PLUS": "Plus", "ESSENTIAL": "Essential",
         "PREMIUM": "Premium", "POWEREDGE": "PowerEdge"}


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def nice_name(n):
    def one(w):
        a, sep, b = w.partition("-")
        return WORDS.get(a, a) + sep + b
    return " ".join(one(w) for w in n.split())


def money(v):
    return "{:,}".format(int(v)).replace(",", " ")


def clean(v):
    v = v.replace(" – ", ", ").replace(" — ", ", ").replace("200-240 V", "200 à 240 V")
    return v.strip()


def parse_spec(spec):
    out = []
    for p in [x.strip() for x in spec.split(" | ") if x.strip()]:
        if " : " in p:
            k, v = p.split(" : ", 1)
            out.append((k.strip(), clean(v)))
        else:
            out.append((None, clean(p)))
    return out


def cat_of(name, spec):
    n = name.upper()
    if "POWEREDGE" in n: return "server"
    if re.search(r"TOWER|SLIM", n) and "Écran" not in spec: return "desk"
    return "laptop"


def load():
    items = json.load(io.open(os.path.join(ROOT, "scripts", "bf_items.json"), encoding="utf-8"))
    merged = []
    for it in items:
        it['refs'] = [it['ref']]  # un article par ligne du dossier, les deux T160 restent separes
        merged.append(it)
    for it in merged:
        it["cat"] = cat_of(it["name"], it["spec"])
        it["reg_f"] = round(it["reg"] * RATE)
        it["promo_f"] = round(it["promo"] * RATE)
        it["pct"] = round((1 - it["promo"] / it["reg"]) * 100)
        it["save"] = it["reg_f"] - it["promo_f"]
        it["specs"] = parse_spec(it["spec"])
        it["img"] = IMGMAP[it["ref"].split("-")[0]]
    return merged


ICON = {
    "plus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    "check": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    "pin": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    "shield": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>',
    "tag": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12.5V4h8.5L21 13.5 13.5 21Z"/><circle cx="7.8" cy="8.3" r="1.4"/></svg>',
    "bolt": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7Z"/></svg>',
    "truck": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2z"/><path d="M13 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/></svg>',
    "chat": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4Z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    "search": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    "list": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
    "x": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    "arrow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
}

TOWER_SRV = ('<svg class="bfc-svg" viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
             '<rect x="62" y="12" width="76" height="126" rx="7"/><rect x="72" y="24" width="56" height="10" rx="2"/>'
             '<path d="M72 46h56M72 56h56M72 66h56M72 76h56M72 86h56"/><circle cx="88" cy="112" r="5"/><circle cx="106" cy="112" r="5"/>'
             '<path d="M112 124h16"/></svg>')


def card(it, i):
    refs = it["refs"]
    ref_txt = " et ".join(refs)
    ref_lbl_fr = "Réf. " + ref_txt if len(refs) == 1 else "Réf. " + ref_txt
    primary = [(k, v) for k, v in it["specs"] if k in ("Processeur", "RAM", "Stockage", "Écran", "Système")]
    rest = [(k, v) for k, v in it["specs"] if (k, v) not in primary]
    li = lambda k, v: ('<li><span%s>%s</span><b>%s</b></li>' % ((' data-en="%s"' % KEYEN[k]) if k in KEYEN else "", esc(k), esc(v))
                      if k else '<li class="solo"><b>%s</b></li>' % esc(v))
    prim_html = "".join(li(k, v) for k, v in primary)
    rest_html = "".join(li(k, v) for k, v in rest)
    warranty = next((v for k, v in it["specs"] if k and k.startswith("Garantie")), "")
    name = nice_name(it["name"])
    img = ('<div class="bfc-img bfc-ill">%s<span class="bfc-note" data-en="Illustration">Illustration</span></div>' % TOWER_SRV
           if it["img"] == "tower_srv"
           else '<div class="bfc-img"><img loading="lazy" decoding="async" src="%s" alt="%s"></div>' % (IMG[it["img"]], esc(name)))
    more = ('<div class="bfc-more-box"><ul class="bfc-spec">%s</ul></div>' % rest_html) if rest_html else ""
    detail_btn = ('<button type="button" class="bfc-more" aria-expanded="false"><span data-en="Details">Détails</span>'
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>') if rest_html else ""
    label = "%s (%s)" % (name, ref_txt)
    return (
        '<article class="bfc" data-cat="%(cat)s" data-pct="%(pct)d" data-promo="%(promo)d" data-reg="%(reg)d" data-ref="%(ref)s" '
        'data-label="%(label)s" data-name="%(search)s" style="--i:%(i)d">'
        '<div class="bfc-in"><span class="bfc-rib"><em data-en="Save">Remise</em> <b>%(pct)d</b>&nbsp;%%</span>'
        '%(img)s'
        '<div class="bfc-body"><div class="bfc-top"><span class="bfc-ref">%(refl)s</span>'
        '<span class="bfc-stock">%(pin)s<i data-en="In stock, France">Stock en France</i></span></div>'
        '<h3>%(name)s</h3>'
        '<ul class="bfc-spec">%(prim)s</ul>%(more)s'
        '<div class="bfc-price"><s>%(regm)s</s><div><strong class="cnt" data-to="%(promo)d">%(promom)s</strong><span>FCFA HT</span></div>'
        '<em><span data-en="You save">Vous économisez</span> %(savem)s FCFA</em></div>'
        '<div class="bfc-act"><button type="button" class="bfc-add" aria-pressed="false">'
        '<span class="a">%(plus)s<i data-en="Add to my request">Ajouter à ma demande</i></span>'
        '<span class="b">%(check)s<i data-en="Added, remove">Ajouté, retirer</i></span></button>%(btn)s</div>'
        '</div></div></article>'
    ) % dict(cat=it["cat"], pct=it["pct"], promo=it["promo_f"], reg=it["reg_f"], ref=refs[0], label=esc(label),
             search=esc((name + " " + ref_txt + " " + it["spec"]).lower()), i=i, img=img, refl=ref_lbl_fr, pin=ICON["pin"],
             name=esc(name), prim=prim_html, more=more, regm=money(it["reg_f"]) + " FCFA", promom=money(it["promo_f"]),
             savem=money(it["save"]), plus=ICON["plus"], check=ICON["check"], btn=detail_btn)


def main():
    items = load()
    maxpct = max(it["pct"] for it in items)
    n_offers = len(items) + 1  # + lot HP
    order = {"desk": 0, "laptop": 1, "server": 2}
    items.sort(key=lambda x: (order[x["cat"]], -x["pct"]))
    cards = "".join(card(it, i) for i, it in enumerate(items))
    cnt = {c: sum(1 for it in items if it["cat"] == c) for c in order}

    src = io.open(os.path.join(ROOT, "solaire.html"), encoding="utf-8").read()
    head = src[:src.find("</header>") + 9]
    head = re.sub(r"<meta name=\"description\"[^>]*>", '<meta name="description" content="Black Friday Roots and Co : ordinateurs, portables et serveurs Dell, lot de 10 HP Pro Tower 290 G9. Prix hors taxes en FCFA, offres limitées dans le temps.">', head, 1)
    head = re.sub(r"<title>.*?</title>", "<title>Black Friday &middot; Roots &amp; Co</title>", head, 1)
    head = re.sub(r'(<meta property="og:title" content=")[^"]*"', r'\1Black Friday &middot; Roots &amp; Co"', head, 1)
    head = re.sub(r'(<meta property="og:description" content=")[^"]*"', r'\1Black Friday : Dell et HP en promotion, prix HT en FCFA."', head, 1)
    head = head.replace('<link rel="stylesheet" href="assets/type.css', '<link rel="stylesheet" href="assets/bf.css"><link rel="stylesheet" href="assets/type.css', 1)
    head = head.replace("</head>", "</head>", 1)
    # lien actif dans la navigation
    scripts = src[src.find("<script", src.find("</footer>")):]
    scripts = scripts.replace("</body>", '<script src="assets/bf.js"></script></body>', 1)

    HP_REG, HP_LOT, HP_UNIT = 5300000, 5000000, 530000
    hp = (
        '<article class="bfl" id="lot-hp" data-ref="HP-290-G9-LOT10" data-lot="1" data-label="Lot de 10 HP Pro Tower 290 G9 Desktop" data-promo="%(lot)d">'
        '<div class="bfl-glow"></div><div class="bfl-ring"></div>'
        '<div class="bfl-vis"><span class="bfl-flag"><i data-en="Lot of 10">Lot de 10</i></span><img loading="lazy" decoding="async" src="%(img)s" alt="HP Pro Tower 290 G9 Desktop">'
        '<span class="bfl-stock">%(pin)s<i data-en="In stock, Lome">Stock disponible à Lomé</i></span></div>'
        '<div class="bfl-txt"><span class="bf-k" data-en="Star offer">L\'offre phare</span>'
        '<h2>HP Pro Tower 290 G9 <em>Desktop</em></h2>'
        '<ul class="bfl-spec"><li><span data-en="Processor">Processeur</span><b>Intel Core i5-12400, 12 threads, 2,5 GHz, 12e génération</b></li>'
        '<li><span data-en="Memory">RAM</span><b>8 Go</b></li><li><span data-en="Storage">Stockage</span><b>SSD NVMe 512 Go</b></li></ul>'
        '<div class="bfl-prices"><div class="bfl-old"><span data-en="Instead of">Au lieu de</span> <s>%(reg)s FCFA HT</s></div>'
        '<div class="bfl-big"><strong class="cnt" data-to="%(lot)d">%(lotm)s</strong><span>FCFA HT <i data-en="for the lot of 10">pour le lot de 10</i></span></div>'
        '<div class="bfl-sub"><span><b>%(unit)s</b> FCFA HT <i data-en="per unit">l\'unité à l\'achat séparé</i></span>'
        '<span class="bfl-save"><b>%(save)s</b> FCFA <i data-en="saved on the lot">économisés sur le lot</i></span></div></div>'
        '<button type="button" class="bfc-add bfl-add" aria-pressed="false"><span class="a">%(plus)s<i data-en="Add the lot to my request">Ajouter le lot à ma demande</i></span>'
        '<span class="b">%(check)s<i data-en="Lot added, remove">Lot ajouté, retirer</i></span></button></div></article>'
    ) % dict(lot=HP_LOT, img=IMG["hp"], pin=ICON["pin"], reg=money(HP_REG), lotm=money(HP_LOT), unit=money(HP_UNIT),
             save=money(HP_REG - HP_LOT), plus=ICON["plus"], check=ICON["check"])

    marquee_words = ["Black Friday", "Dell", "HP", "Ordinateurs", "Portables", "Serveurs", "Prix HT en FCFA", "Offres limitées dans le temps"]
    tape = "".join('<span>%s</span><i></i>' % w for w in marquee_words) * 2

    body = (
        '<main class="bf" id="bf" data-end="2026-11-20T23:59:59Z">'
        # ------------------------------------------------ hero
        '<section class="bfh"><div class="bfh-bg"><div class="bfh-aur a1"></div><div class="bfh-aur a2"></div><div class="bfh-floor"></div>'
        '<canvas class="bfh-cv" id="bfCv"></canvas></div>'
        '<div class="wrap bfh-in">'
        '<div class="crumb"><a href="index.html" data-en="Home">Accueil</a> '
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg> <span>Black Friday</span></div>'
        '<span class="bf-pill"><i></i><span data-en="19 and 20 November 2026">Les 19 et 20 novembre 2026</span></span>'
        '<h1 class="bfh-t" aria-label="Black Friday"><span class="w1" data-t="BLACK">BLACK</span><span class="w2" data-t="FRIDAY">FRIDAY</span></h1>'
        '<p class="bfh-sub" data-en="Dell and HP computers, laptops and servers at Black Friday prices. Prices excl. tax in FCFA, delivered in Lome and Cotonou.">Ordinateurs, portables et serveurs Dell et HP à prix Black Friday. Prix hors taxes en FCFA, livraison à Lomé et à Cotonou.</p>'
        '<div class="bfh-cd" id="bfCd" aria-live="off"><span class="lbl" data-en="The offer ends in">L\'offre se termine dans</span>'
        '<div class="bfh-tiles"><div><b id="cdD">00</b><small data-en="days">jours</small></div><div><b id="cdH">00</b><small data-en="hours">heures</small></div>'
        '<div><b id="cdM">00</b><small data-en="min">min</small></div><div><b id="cdS">00</b><small data-en="sec">sec</small></div></div>'
        '<span class="end" data-en="Friday 20 November 2026, midnight, Lome time">Vendredi 20 novembre 2026, minuit, heure de Lomé</span></div>'
        '<div class="bfh-cta"><a href="#offres" class="btn btn-primary bf-mag" data-en="See the offers">Voir les offres</a>'
        '<a href="#lot-hp" class="btn btn-ghost bf-mag" data-en="Lot of 10 HP">Le lot de 10 HP</a></div>'
        '<div class="bfh-kpi"><div><b class="cnt" data-to="%(n)d">%(n)d</b><small data-en="offers">offres</small></div>'
        '<div><b>jusqu\'à <i class="cnt" data-to="%(mp)d">%(mp)d</i>&nbsp;%%</b><small data-en="discount">de remise</small></div>'
        '<div><b>HT</b><small data-en="prices in FCFA">prix en FCFA</small></div>'
        '<div><b>2</b><small data-en="stocks: France and Lome">stocks : France et Lomé</small></div></div>'
        '</div>'
        '<div class="bfh-tapes" aria-hidden="true"><div class="tape t1"><div class="tt">%(tape)s</div></div><div class="tape t2"><div class="tt">%(tape)s</div></div></div>'
        '</section>'
        # ------------------------------------------------ lot HP
        '<section class="bfs bfs-lot"><div class="wrap">%(hp)s</div></section>'
        # ------------------------------------------------ offres
        '<section class="bfs bfs-offers" id="offres"><div class="wrap">'
        '<div class="bfs-head"><span class="bf-k" data-en="The offers">Les offres</span><h2 data-en="Dell, at Black Friday prices">Dell, à prix Black Friday</h2>'
        '<p data-en="Choose your machines, add them to your request, and send everything at once. We confirm stock and price in writing.">Choisissez vos machines, ajoutez-les à votre demande et envoyez le tout d\'un coup. Nous confirmons le stock et le prix par écrit.</p></div>'
        '<div class="bf-bar" id="bfBar"><div class="bf-chips" role="tablist">'
        '<button type="button" class="on" data-f="all"><span data-en="All">Tout</span><i>%(n_dell)d</i></button>'
        '<button type="button" data-f="desk"><span data-en="Desktops">Ordinateurs fixes</span><i>%(c_desk)d</i></button>'
        '<button type="button" data-f="laptop"><span data-en="Laptops">Portables</span><i>%(c_lap)d</i></button>'
        '<button type="button" data-f="server"><span data-en="Servers">Serveurs</span><i>%(c_srv)d</i></button></div>'
        '<div class="bf-tools"><label class="bf-search">%(search)s<input type="search" id="bfQ" placeholder="Rechercher une référence, un processeur" data-en-ph="Search a reference, a processor" autocomplete="off"></label>'
        '<label class="bf-sort"><select id="bfSort" aria-label="Trier"><option value="pct" data-en="Biggest discount first">Plus forte remise</option><option value="asc" data-en="Price, low to high">Prix croissant</option>'
        '<option value="desc" data-en="Price, high to low">Prix décroissant</option><option value="save" data-en="Biggest saving in FCFA">Plus grande économie</option></select></label></div></div>'
        '<div class="bf-count" id="bfCount" aria-live="polite"></div>'
        '<div class="bf-grid" id="bfGrid">%(cards)s</div>'
        '<p class="bf-empty" id="bfEmpty" hidden data-en="No offer matches your search.">Aucune offre ne correspond à votre recherche.</p>'
        '</div></section>'
        # ------------------------------------------------ comment ca marche
        '<section class="bfs bfs-how"><div class="wrap"><div class="bfs-head"><span class="bf-k" data-en="How it works">Comment ça marche</span>'
        '<h2 data-en="From your request to delivery">De votre demande à la livraison</h2></div>'
        '<div class="bf-steps">'
        '<div class="bf-step" style="--i:0"><span class="n">1</span>%(i_list)s<h3 data-en="You build your request">Vous composez votre demande</h3><p data-en="Add the machines you want. The total excl. tax updates as you go.">Ajoutez les machines voulues. Le total hors taxes se met à jour au fil de l\'eau.</p></div>'
        '<div class="bf-step" style="--i:1"><span class="n">2</span>%(i_chat)s<h3 data-en="You send it in one click">Vous l\'envoyez en un clic</h3><p data-en="By WhatsApp or through the quote form, with your selection already filled in.">Par WhatsApp ou par le formulaire de devis, avec votre sélection déjà remplie.</p></div>'
        '<div class="bf-step" style="--i:2"><span class="n">3</span>%(i_shield)s<h3 data-en="We confirm in writing">Nous confirmons par écrit</h3><p data-en="Stock, price and delivery time. Card payment only through a secure link sent after confirmation.">Stock, prix et délai. Paiement par carte uniquement via un lien sécurisé envoyé après confirmation.</p></div>'
        '<div class="bf-step" style="--i:3"><span class="n">4</span>%(i_truck)s<h3 data-en="Delivery in Lome and Cotonou">Livraison à Lomé et à Cotonou</h3><p data-en="Warranty stated on each product page, delivery time confirmed on the quote.">Garantie indiquée sur chaque fiche, délai de livraison confirmé sur le devis.</p></div>'
        '</div></div></section>'
        # ------------------------------------------------ conditions
        '<section class="bfs bfs-terms"><div class="wrap"><div class="bf-terms">'
        '<h2 data-en="Terms of the operation">Conditions de l\'opération</h2><ul>'
        '<li data-en="Offers valid on 19 and 20 November 2026 while stocks last. After that date, ask us for the prices in force.">Offres valables les 19 et 20 novembre 2026, dans la limite des stocks. Passée cette date, demandez-nous les prix en vigueur.</li>'
        '<li data-en="All prices are excluding tax (HT), in FCFA, at the fixed rate of 1 euro = 655.957 FCFA.">Tous les prix sont hors taxes (HT), en FCFA, au taux fixe de 1 euro = 655,957 FCFA.</li>'
        '<li data-en="Stock shown is the stock in France, except the HP lot, available in Lome. Delivery time is confirmed on the quote.">Le stock indiqué est celui de France, sauf le lot HP, disponible à Lomé. Le délai de livraison est confirmé sur le devis.</li>'
        '<li data-en="Pictures are for illustration and show the range. Warranty is the manufacturer warranty stated on each product.">Les visuels sont indicatifs et montrent la gamme. La garantie est celle du constructeur, indiquée sur chaque fiche.</li>'
        '<li data-en="No card details are ever entered on this site.">Aucune donnée de carte bancaire n\'est jamais saisie sur ce site.</li></ul></div></div></section>'
        # ------------------------------------------------ cta
        '<section class="bfs bfs-cta"><div class="wrap"><div class="bf-ctab"><div><h2 data-en="A tailored configuration for your team?">Une configuration sur mesure pour votre équipe ?</h2>'
        '<p data-en="Tell us your needs, we come back with a Black Friday quote.">Dites-nous votre besoin, nous revenons vers vous avec un devis Black Friday.</p></div>'
        '<a href="contact.html#devis" class="btn btn-primary bf-mag" data-en="Request a quote">Demander un devis</a></div></div></section>'
        '</main>'
        # ------------------------------------------------ dock
        '<div class="bf-dock" id="bfDock" hidden role="region" aria-label="Ma demande">'
        '<div class="bf-dock-list" id="bfList"></div>'
        '<div class="bf-dock-bar"><button type="button" class="bf-dock-toggle" id="bfToggle" aria-expanded="false">%(i_list)s<span><b id="bfN">0</b> <i data-en="items in my request">articles dans ma demande</i></span></button>'
        '<div class="bf-dock-tot"><small data-en="Estimated total excl. tax">Total HT estimé</small><strong id="bfTot">0</strong> <span>FCFA</span></div>'
        '<button type="button" class="btn btn-primary bf-send" id="bfWa" data-wb="%(wb)s">%(i_chat)s<span data-en="Send by WhatsApp">Envoyer par WhatsApp</span></button>'
        '<button type="button" class="btn btn-ghost bf-send2" id="bfForm"><span data-en="Use the quote form">Passer par le formulaire</span>%(i_arrow)s</button>'
        '<button type="button" class="bf-dock-x" id="bfClear" aria-label="Vider ma demande">%(i_x)s</button></div></div>'
    ) % dict(n=n_offers, mp=maxpct, tape=tape, hp=hp, n_dell=len(items), c_desk=cnt["desk"], c_lap=cnt["laptop"], c_srv=cnt["server"],
             cards=cards, search=ICON["search"], i_list=ICON["list"], i_chat=ICON["chat"], i_shield=ICON["shield"], i_truck=ICON["truck"],
             i_arrow=ICON["arrow"], i_x=ICON["x"], wb=b64(WA_BASE))

    html = head + "\n" + body + "\n" + footer_html() + "\n" + scripts
    io.open(os.path.join(ROOT, "black-friday.html"), "w", encoding="utf-8").write(html)
    print("black-friday.html", len(html), "octets,", len(items), "cartes Dell + lot HP, remise max", maxpct, "%")


if __name__ == "__main__":
    main()
