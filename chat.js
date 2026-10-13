/* Meny på mobil */
(function () {
  const b = document.querySelector(".menu-btn"), top = document.querySelector(".top");
  if (!b || !top) return;
  b.addEventListener("click", () => {
    const o = top.classList.toggle("open");
    b.setAttribute("aria-expanded", String(o));
    b.textContent = o ? "Stäng" : "Meny";
  });
})();

/* Skicka meddelanden till mottagningen (via FormSubmit, som vidarebefordrar till e-post) */
(function () {
  const CONTACT_EMAIL = "dm.mira@outlook.com";
  const ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_EMAIL;
  async function send(subject, data) {
    const body = Object.assign({ _subject: subject, _template: "table", _captcha: "false" }, data, { Sida: location.href });
    try {
      const r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body)
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && String(j.success) === "true") return { ok: true };
      return { ok: false, msg: j.message || "" };
    } catch (e) {
      return { ok: false, msg: "" };
    }
  }
  function mailto(subject, text) {
    return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
  }
  window.ApoSend = send;
  window.ApoMailto = mailto;
  window.ApoContact = CONTACT_EMAIL;
})();

/* Chatt */
(function () {
  const $ = (id) => document.getElementById(id);
  const log = $("chatLog"), chips = $("chatChips"), inp = $("chatIn"), panel = $("chatPanel"), openBtn = $("chatBtn");
  if (!log || !panel || !openBtn) return;

  /* Tjänster */
  const SVC = {
    vikt: {
      re: /vikt|övervikt|fetma|gå ner|banta|bmi|glp|wegovy|ozempic|mounjaro|saxenda|viktminsk/,
      name: "viktbedömning", price: "795 kr", dur: "videobesök på 30 minuter", book: "boka.html?s=vikt",
      text: "Viktbedömning är ett videobesök på 30 minuter för vuxna med övervikt eller fetma. Läkaren går igenom din hälsa, vikt och tidigare försök och ger dig en plan. Om läkaren bedömer att läkemedel är lämpligt kan du få recept, och läkemedlet köper du själv på apotek. Priset är 795 kr."
    },
    intyg: {
      re: /sjukintyg|sjukskriv|sjuk intyg|försäkringskassan|sjukanmäl|läkarintyg till (jobbet|arbetsgivaren)/,
      name: "sjukintyg", price: "495 kr", dur: "videobesök på 20 minuter", book: "boka.html?s=intyg",
      text: "Sjukintyg är ett videobesök på 20 minuter där läkaren bedömer din arbetsförmåga och avgör om ett intyg kan utfärdas. Intyget utfärdas digitalt. Priset är 495 kr.\n\nFörsäkringskassan kräver läkarintyg från dag 8 i sjukperioden. Vissa arbetsgivare kräver intyg tidigare."
    },
    kort: {
      re: /körkort|lastbil|buss|behörighet|transportstyrelsen/,
      name: "läkarintyg för körkort", price: "995 kr", dur: "undersökning på mottagningen", book: "boka.html?s=kort",
      text: "Läkarintyg för körkort med högre behörighet, till exempel lastbil och buss, görs som en undersökning på mottagningen med hälsoundersökning och syntest. Från 45 års ålder krävs läkarintyg när behörigheten förlängs. Priset är 995 kr. Om läkaren utfärdar intyget kan det skickas digitalt till Transportstyrelsen."
    },
    jour: {
      re: /journalgenomgång|min journal|journalen|journal /,
      name: "journalgenomgång", price: "2 500 kr", dur: "videobesök på 60 minuter", book: "boka.html?s=jour",
      text: "Journalgenomgång är ett videobesök på 60 minuter där läkaren förklarar din journal: diagnoser, provsvar, läkemedel och medicinska termer. Det ingår ingen ny bedömning, recept eller sjukskrivning. Priset är 2 500 kr."
    },
    conc: {
      re: /concierge|medlem|abonnemang|prenumer|egen läkare|personlig läkare/,
      name: "läkarconcierge", price: "3 000 kr per månad", dur: "medlemskap månad för månad", book: "boka.html?s=conc",
      text: "Läkarconcierge är ett medlemskap för 3 000 kr per månad. Du skriver till läkaren via säker chatt och får svar inom en arbetsdag, och du har ett videobesök på upp till 30 minuter varje månad. Det finns ingen bindningstid. Medlemskapet ersätter inte akutvård."
    },
    match: {
      re: /matchläkare|match|idrott|evenemang|turnering| cup |tävling/,
      name: "matchläkare", price: "1 400 kr per timme", dur: "på plats under uppdraget", book: "tjanster.html?inq=match", bookLabel: "Skicka förfrågan om matchläkare",
      text: "Matchläkare kostar 1 400 kr per timme. Läkaren är på plats under hela uppdraget och tar hand om skador och akuta tillstånd. Skicka en förfrågan med datum, plats och antal timmar, så bekräftar vi. Restid och resekostnad avtalas i förväg."
    },
    lag: {
      re: /lagläkare|förening|laget|klubb|vårt lag/,
      name: "lagläkare", price: "enligt överenskommelse", dur: "läkare som följer laget över tid", book: "tjanster.html?inq=lag", bookLabel: "Diskutera villkor för lagläkare",
      text: "Lagläkare är en namngiven läkare som följer ert lag över tid, vid matcher, träningar och med medicinsk rådgivning. Omfattning och pris bestäms tillsammans. Beskriv vad ni behöver, så återkommer vi med ett förslag."
    }
  };

  /* Avsikter */
  const I = {
    acute: /112|bröstsmärt|ont i bröstet|andnöd|svårt att andas|kan inte andas|medvetslös|förgift|stroke|förlamn|blöder kraftigt|akut/,
    selfharm: /självmord|ta livet av|ta mitt liv|skada mig själv|vill inte leva|vill dö/,
    symptom: /ont i | har ont|smärta|feber|hosta|yrsel| yr |kräk|utslag|symtom|mår dåligt|infektion|svullen|klåda/,
    handoff: /prata med (en |någon |läkaren|läkare|människa|person)|kontakta (er|dig|läkaren|någon)|ta över|riktig person|en människa|ring mig|mejla|maila|skicka (min )?fråga/,
    greet: /^ (hej|hejsan|hallå|tjena|tja|god morgon|god dag|god kväll|hello|hi)( |$)/,
    thanks: /tack/,
    cancel: /avboka|omboka|boka om|ändra (min )?tid|flytta (min )?tid|ångra|kan inte komma|förhinder/,
    refund: /återbetal|pengar(na)? tillbaka|refund|ersättning för/,
    frikort: /frikort|högkostnad|regionen|landsting|remiss|försäkring/,
    pay: /betal|swish|faktura|klarna|kvitto|kortbetal/,
    hours: /öppet|öppettid|mottagningstid|vilka tider|när kan|när har|kväll|helg|lördag|söndag|vardag|morgon|dagtid|lunch/,
    region: /bor i |bor utanför|hela sverige|annan stad|annan ort|patienter från|utomlands|utlandet/,
    location: /var ligger|adress|hitta till|var sker|var är|hemifrån|på plats|mottagningen/,
    duration: /hur lång|hur länge|hur många minuter/,
    video: /video|kamera|länk|teams|zoom|app |appen|ladda ner|installera/,
    doctor: / vem |vilken läkare|legitimerad|daniel|erfarenhet|utbild|om läkaren/,
    language: /engelska|english|persiska|farsi|spanska|språk|tolk/,
    child: /barn|min son|min dotter|under 18|tonåring/,
    rx: /recept|läkemedel|medicin|tabletter|spruta|förnya/,
    privacy: /integritet|personuppgift|gdpr|sekretess|säker|tystnadsplikt/,
    price: /pris|kost|kronor| kr |avgift|dyrt|billig/,
    book: /boka|bokning| tid | tider |ledig/,
    included: /ingår|vad får jag|vad händer|hur går|innebär|hur fungerar/,
    health: /jag har (haft )?(diabetes|högt blodtryck|gallsten|sömnapné|depression|cancer)|har haft|diagnos|gravid|ammar|tar (läkemedel|medicin)/
  };

  const norm = (s) => " " + s.toLowerCase().replace(/[^a-zåäöéü0-9]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  const HOURS = "Videobesök finns måndag till fredag 18.00–21.00 och söndag 10.00–19.00. Lediga tider ser du när du bokar.";
  const PRICES = "Priser:\n• Viktbedömning 795 kr (video, 30 min)\n• Sjukintyg 495 kr (video, 20 min)\n• Läkarintyg för körkort 995 kr (på mottagningen)\n• Journalgenomgång 2 500 kr (video, 60 min)\n• Läkarconcierge 3 000 kr per månad\n• Matchläkare 1 400 kr per timme\n• Lagläkare enligt överenskommelse\n\nDu ser alltid priset innan du bokar.";
  const DURS = "Viktbedömning tar 30 minuter, sjukintyg 20 minuter och journalgenomgång 60 minuter. Allt sker via video. Körkortsundersökningen görs på mottagningen.";

  function reply(q) {
    const l = norm(q);
    const has = (k) => I[k].test(l);
    const svcKey = Object.keys(SVC).find((k) => SVC[k].re.test(l));
    const svc = svcKey ? SVC[svcKey] : null;
    const bookBtn = svc ? [svc.bookLabel || "Boka " + svc.name, svc.book] : ["Gå till bokningen", "boka.html"];

    if (has("selfharm")) return { a: "Det du skriver låter allvarligt. Ring 112 om du är i fara just nu. Du kan också ringa Självmordslinjen på 90101, eller 1177 för sjukvårdsrådgivning. Den här chatten kan inte ge vård." };
    if (has("acute")) return { a: "Vid akuta besvär ska du ringa 112. För sjukvårdsrådgivning, ring 1177. Den här chatten kan inte bedöma symtom och vi tar inte emot akuta ärenden." };
    if (has("handoff")) return { handoff: true };
    if (has("symptom")) return { a: "Jag kan inte bedöma symtom i chatten. Är det akut, ring 112. Annars kan du ringa 1177 för sjukvårdsrådgivning. Behöver du ett sjukintyg kan du boka ett videobesök.", btn: ["Boka sjukintyg", "boka.html?s=intyg"] };
    if (has("cancel")) return { a: "Du avbokar eller bokar om via länkarna i bekräftelsemejlet du fick när du bokade. Hittar du inte mejlet, titta i skräpposten eller hör av dig till oss.", offer: true };
    if (has("refund")) return { a: "Frågor om återbetalning svarar vi på personligen. Skicka din fråga till oss, så återkommer vi.", offer: true };
    if (has("frikort")) return { a: "Apocura är en privat mottagning utan avtal med regionen. Högkostnadsskydd och frikort gäller därför inte, och du betalar det pris som står på sidan. Remiss behövs inte. Har du en privat sjukvårdsförsäkring kan du fråga ditt försäkringsbolag om den ersätter besöket." };
    if (has("pay") && !svc) return { a: "Du betalar med kort när du bokar, och du ser priset innan du betalar. Matchläkare och lagläkare betalar du först när uppdraget är bekräftat.", btn: bookBtn };
    if (has("hours")) return { a: (/lördag/.test(l) ? "Vi har inga tider på lördagar just nu. " : "") + HOURS, btn: bookBtn };
    if (has("region")) return { a: /utomlands|utlandet/.test(l) ? "Videobesöken är till för dig som befinner dig i Sverige. Är du utomlands, skicka din fråga till oss först." : "Ja. Videobesöken kan du göra var du än bor i Sverige. Det enda som görs på mottagningen är läkarintyg för körkort.", btn: /utomlands|utlandet/.test(l) ? null : bookBtn, offer: /utomlands|utlandet/.test(l) };
    if (has("location")) return { a: svcKey === "kort" ? "Körkortsundersökningen görs på mottagningen. Adressen får du när du bokar." : "Videobesöken gör du där du befinner dig, i mobilen eller datorn. Det enda som görs på mottagningen är läkarintyg för körkort, och adressen får du när du bokar." };
    if (has("language")) return { a: "Besöket kan hållas på svenska, engelska, persiska eller spanska. Nämn gärna vilket språk du önskar när du bokar." };
    if (has("child")) return { a: "Viktbedömning är för dig som är 18 år eller äldre. Gäller frågan ett barn, skicka den till oss först så svarar läkaren om vi kan hjälpa till.", offer: true };
    if (svc) {
      const Name = svc.name.charAt(0).toUpperCase() + svc.name.slice(1);
      let a = (has("price") || has("duration")) && !has("included") ? Name + " kostar " + svc.price + " (" + svc.dur + ")." : svc.text;
      if (svcKey === "vikt" && has("rx")) a += "\n\nVilket läkemedel som kan vara aktuellt avgör läkaren vid besöket utifrån din hälsa. Det går inte att välja läkemedel i förväg.";
      if (has("health")) a += "\n\nSjukdomar och läkemedel fyller du i i bokningens kontroll, så att läkaren kan ta hänsyn till dem. Skriv inga hälsouppgifter här i chatten.";
      return { a, btn: bookBtn };
    }
    if (has("duration")) return { a: DURS, btn: bookBtn };
    if (has("price")) return { a: PRICES, btn: ["Se vad som ingår", "tjanster.html"] };
    if (has("book") || has("pay")) return { a: "Så bokar du:\n1. Välj tjänst.\n2. Svara på några korta frågor.\n3. Välj en ledig tid och slutför bokningen.\n\nDu får en bekräftelse med länk till videobesöket på e-post.", btn: bookBtn };
    if (has("rx")) return { a: "Om recept är lämpligt avgör läkaren vid besöket, efter en medicinsk bedömning. Det går inte att beställa ett visst läkemedel i förväg. Vill du förnya ett recept du redan har, vänd dig i första hand till den som skrev ut det." };
    if (has("video")) return { a: "Du får en länk till videobesöket i bekräftelsemejlet. Den öppnas direkt i webbläsaren i mobilen eller datorn, utan att du behöver installera något. Du behöver kamera, mikrofon och en lugn plats." };
    if (has("doctor")) return { a: "Läkaren är Daniel Mira, legitimerad läkare under specialistutbildning i allmänmedicin. Han arbetar i primärvård och på närakut och genomför besöken hos Apocura själv.", btn: ["Läs om läkaren", "lakaren.html"] };
    if (has("privacy")) return { a: "Skriv inga hälsouppgifter i chatten. Uppgifter om din hälsa lämnar du i bokningen och vid besöket, och de journalförs enligt patientdatalagen." };
    if (has("included")) return { a: "Välj vilken tjänst du undrar över, så berättar jag vad som ingår.", chips: ["Viktbedömning", "Sjukintyg", "Körkortsintyg", "Journalgenomgång", "Läkarconcierge"] };
    if (has("greet")) return { a: "Hej! Vad kan jag hjälpa dig med? Du kan fråga om tjänster, priser, tider eller hur bokningen går till." };
    if (has("thanks")) return { a: "Varsågod. Hör av dig om du undrar något mer." };
    return { a: "Det kan jag inte svara på här. Vill du att vi svarar personligen? Då skickar jag din fråga vidare.", offer: true };
  }

  /* Historik som följer med mellan sidorna under besöket */
  const KEY = "apoChat";
  let hist = [];
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ hist: hist.slice(-40), open: !panel.hidden })); } catch (e) {} };
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { return null; } };

  function render(m) {
    const d = document.createElement("div");
    d.className = "msg " + m.who;
    d.textContent = m.t;
    if (m.btn) {
      const a = document.createElement("a");
      a.className = "btn sm msg-btn";
      a.href = m.btn[1];
      a.textContent = m.btn[0];
      d.append(a);
    }
    log.append(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function add(t, who, btn) {
    const m = { t, who, btn: btn || null };
    hist.push(m);
    save();
    return render(m);
  }
  function actions(list) {
    const row = document.createElement("div");
    row.className = "msg-actions";
    list.forEach(([label, fn]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.onclick = () => { row.remove(); fn(); };
      row.append(b);
    });
    log.append(row);
    log.scrollTop = log.scrollHeight;
  }

  function transcript() {
    return hist.map((m) => (m.who === "me" ? "Besökare: " : "Assistent: ") + m.t).join("\n\n");
  }

  function handoff() {
    add("Jag skickar din fråga till mottagningen. Skriv din e-postadress så svarar vi dit. Skriv inga hälsouppgifter.", "bot");
    const f = document.createElement("form");
    f.className = "handoff";
    f.innerHTML =
      '<label>Din e-postadress<input type="email" name="email" required autocomplete="email" placeholder="namn@exempel.se"></label>' +
      '<label>Din fråga<textarea name="q" rows="3" required></textarea></label>' +
      '<div class="row"><button class="btn sm" type="submit">Skicka</button><button class="btn alt sm" type="button" data-x>Avbryt</button></div>' +
      '<p class="status" role="status"></p>';
    const lastQ = [...hist].reverse().find((m) => m.who === "me");
    if (lastQ && !I.handoff.test(norm(lastQ.t))) f.q.value = lastQ.t;
    f.querySelector("[data-x]").onclick = () => { f.remove(); add("Okej. Fråga gärna något annat.", "bot"); };
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const st = f.querySelector(".status"), btn = f.querySelector('button[type="submit"]');
      btn.disabled = true;
      st.textContent = "Skickar …";
      const res = await window.ApoSend("Fråga från chatten på hemsidan", {
        "E-post": f.email.value,
        "Fråga": f.q.value,
        "Hela samtalet": transcript(),
        _replyto: f.email.value
      });
      if (res.ok) {
        f.remove();
        add("Tack! Din fråga är skickad. Vi svarar till " + f.email.value + " så snart vi kan.", "bot");
      } else {
        btn.disabled = false;
        st.textContent = "";
        const a = document.createElement("a");
        a.href = window.ApoMailto("Fråga från hemsidan", f.q.value + "\n\nSvara till: " + f.email.value);
        a.textContent = "skicka den med e-post i stället";
        st.append("Det gick inte att skicka just nu. Försök igen, eller ", a, ".");
      }
    });
    log.append(f);
    log.scrollTop = log.scrollHeight;
    f.email.focus();
  }

  function answer(q) {
    const typing = document.createElement("div");
    typing.className = "msg bot typing";
    typing.setAttribute("aria-label", "Skriver");
    typing.innerHTML = "<i></i><i></i><i></i>";
    log.append(typing);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => {
      typing.remove();
      const r = reply(q);
      if (r.handoff) { handoff(); return; }
      add(r.a, "bot", r.btn);
      if (r.offer) actions([["Skicka frågan till oss", handoff]]);
      if (r.chips) actions(r.chips.map((c) => [c, () => ask(c)]));
    }, 450);
  }
  function ask(t) { add(t, "me"); chips.hidden = true; answer(t); }

  ["Vad kostar det?", "Vilka tider finns?", "Hur bokar jag?", "Prata med läkaren"].forEach((t) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t;
    b.onclick = () => ask(t);
    chips.append(b);
  });
  $("chatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = inp.value.trim();
    if (!v) return;
    inp.value = "";
    ask(v);
  });

  const GREETING = "Hej! Jag svarar på frågor om våra tjänster, priser, tider och bokning. Om jag inte kan svara skickar jag frågan vidare till mottagningen.";
  function toggle(open) {
    panel.hidden = !open;
    openBtn.setAttribute("aria-expanded", String(open));
    openBtn.textContent = open ? "Stäng chatten" : "Fråga oss";
    if (open) {
      if (!hist.length) add(GREETING, "bot");
      if (window.matchMedia("(min-width: 700px)").matches) inp.focus();
    }
    save();
  }
  openBtn.addEventListener("click", () => toggle(panel.hidden));
  $("chatX").addEventListener("click", () => { toggle(false); openBtn.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { toggle(false); openBtn.focus(); } });

  const st = load();
  if (st && Array.isArray(st.hist)) { hist = st.hist; hist.forEach(render); if (hist.some((m) => m.who === "me")) chips.hidden = true; if (st.open) toggle(true); }
})();
