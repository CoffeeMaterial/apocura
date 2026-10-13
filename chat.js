/* Meny på mobil */
(function(){const b=document.querySelector(".menu-btn"),top=document.querySelector(".top");if(!b||!top)return;b.addEventListener("click",()=>{const o=top.classList.toggle("open");b.setAttribute("aria-expanded",String(o));b.textContent=o?"Stäng":"Meny";});})();
(function(){
const CONTACT_EMAIL = ""; // Fyll i adressen som förfrågningar och överlämningar ska skickas till
const $=(id)=>document.getElementById(id);
function deliver(subject, body, copyBox, copyTxt, msgEl){
  if(CONTACT_EMAIL){ location.href="mailto:"+CONTACT_EMAIL+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body); if(msgEl) msgEl.textContent="Ditt mejlprogram öppnas. Skicka mejlet där."; }
  else { copyBox.hidden=false; copyTxt.value=body; copyTxt.select(); if(msgEl) msgEl.textContent=""; }
}
window.ApoDeliver=deliver;
/* Chatt */
const KB=[
 {k:["pris","kostar","kostnad","kr ","betala","avgift"],a:"Våra priser:\n• Viktbedömning 795 kr (30 min video)\n• Sjukintyg 495 kr (20 min video)\n• Läkarintyg för körkort, högre behörighet 995 kr (undersökning på plats)\n• Journalgenomgång 2 500 kr per timme\n• Läkarconcierge 3 000 kr per månad\n• Matchläkare 1 400 kr per timme\n• Lagläkare enligt överenskommelse\nPriset ser du alltid innan du betalar och det gäller bedömningen, inte ett visst utfall."},
 {k:["vikt","viktnedgång","övervikt","fetma"],a:"Viktbedömning (795 kr, 30 minuter via video) är en medicinsk bedömning där läkaren går igenom din hälsa och tidigare försök och berättar vilka behandlingar som kan passa. Ingår inte: läkemedel (betalas på apotek), provtagning och uppföljning. Uppföljning är frivillig, kostar 399 kr per månad och bestäms först efter bedömningen. Du får inte automatiskt recept, läkaren avgör vad som är lämpligt."},
 {k:["sjukintyg","sjukskriv","intyg för sjuk","försäkringskassan"],a:"Sjukintyg kostar 495 kr och är ett videobesök på 20 minuter. Läkaren gör en bedömning och avgör om ett intyg är lämpligt. Priset är detsamma oavsett om du får intyget eller inte."},
 {k:["körkort","körkortsintyg","behörighet"],a:"Läkarintyg för körkort (högre behörighet) kostar 995 kr och görs som en undersökning på mottagningen, inte på video. Adressen läggs in innan sidan publiceras."},
 {k:["journal","genomgång","förklara"],a:"Journalgenomgång (2 500 kr per timme, video) innebär att en läkare går igenom din journal och förklarar diagnoser, provsvar och behandlingar. Ingår inte: ny behandling, recept, sjukskrivning eller ny diagnos."},
 {k:["concierge","medlem","månad","abonnemang","prenumeration"],a:"Läkarconcierge (3 000 kr per månad) ger dig direktkontakt med läkare via säker chatt med svar inom en arbetsdag och ett videobesök på upp till 30 minuter varje månad. Ingen bindningstid, du säger upp när du vill. Ingår inte akut vård, hembesök, läkemedel eller intyg."},
 {k:["match","idrott","evenemang","turnering"],a:"Matchläkare kostar 1 400 kr per timme. Läkaren är på plats under hela uppdraget och bedömer och tar hand om skador och akuta tillstånd. Skicka en förfrågan med datum, plats och antal timmar, så bekräftar vi. Du betalar inget förrän uppdraget är bekräftat.",btn:["Skicka förfrågan om matchläkare","tjanster.html#matchlakare"]},
 {k:["lagläkare","lag ","förening","laget","avtal","villkor"],a:"Lagläkare är en namngiven läkare som följer ert lag över tid. Omfattning och villkor bestämmer vi tillsammans. Beskriv vad ni behöver så återkommer vi med ett förslag.",btn:["Diskutera villkor för lagläkare","tjanster.html#lagLakare"]},
 {k:["boka","bokning","tid","när","ledig"],a:"Så bokar du: 1) välj tjänst, 2) svara på några korta frågor, 3) välj en ledig tid och slutför bokningen. Du får en bekräftelse med videolänk på e-post.",btn:["Gå till bokningen","boka.html"]},
 {k:["recept","läkemedel","medicin","ozempic","wegovy"],a:"Läkaren gör alltid en egen medicinsk bedömning och avgör om recept är lämpligt. Det går inte att lova ett visst läkemedel i förväg, och priset gäller bedömningen."},
 {k:["video","hur fungerar","hur går","digital"],a:"Videobesöket sker i en länk du får i bekräftelsen, direkt i webbläsaren eller mobilen. Du behöver kamera och mikrofon. Läkaren pratar med dig och gör bedömningen, och allt annat sköts automatiskt före och efter besöket."},
 {k:["vem","läkare","legitimerad","daniel"],a:"Du träffar alltid läkaren själv. Daniel Mira är legitimerad läkare och specialistutbildar sig i allmänmedicin. Läs mer under rubriken Läkaren på sidan.",btn:["Läs om läkaren","lakaren.html"]},
 {k:["avboka","ångra","återbetal","pengar tillbaka"],a:"Det här har vi inte fastställt än, så jag vill inte lova något fel. Be gärna läkaren svara direkt."},
 {k:["säker","integritet","personuppgift","gdpr","sekretess"],a:"Du kan inte skriva hälsouppgifter i den här chatten. Hälsouppgifter lämnar du i bokningsflödet. Vi behandlar uppgifter enligt patientdatalagen. Fullständig information om hur uppgifterna hanteras publiceras innan vi tar emot patienter."}
];
const SYMP=["ont ","smärta","blöd","andas","bröstsmärta","feber","yr ","svimm","självmord","dö ","tabletter","symtom","mår dåligt","kräks"];
const log=$("chatLog"),chips=$("chatChips"),inp=$("chatIn");
function add(txt,who,btn){
  const d=document.createElement("div");d.className="msg "+who;d.textContent=txt;
  if(btn){const b=document.createElement("button");b.type="button";b.className="btn sm";b.style.marginTop="8px";b.style.display="block";b.textContent=btn[0];
    b.onclick=()=>{ location.href=btn[1]; };d.append(b);}
  log.append(d);log.scrollTop=log.scrollHeight;return d;
}
function handoff(){
  const t=[...log.querySelectorAll(".msg")].map(m=>(m.classList.contains("me")?"Besökare: ":"Assistent: ")+m.firstChild.textContent).join("\n");
  const d=add("Jag skickar vidare till läkaren som svarar så snart det går. Lägg till din e-postadress så vet vi vart vi ska svara.","bot");
  const f=document.createElement("input");f.type="email";f.placeholder="din@epost.se";f.style.cssText="display:block;width:100%;margin-top:8px;padding:8px;border-radius:8px;border:1px solid var(--line);font:inherit;box-sizing:border-box";
  const b=document.createElement("button");b.type="button";b.className="btn sm";b.style.marginTop="8px";b.textContent="Skicka till läkaren";
  const out=document.createElement("textarea");out.rows=6;out.hidden=true;out.readonly=true;out.style.cssText="width:100%;margin-top:8px;font:inherit;font-size:12px;box-sizing:border-box";
  b.onclick=()=>{ if(!f.value||!f.checkValidity()){f.focus();return;} deliver("Fråga från hemsidans chatt","Svara till: "+f.value+"\n\nSamtal:\n"+t,out,out,null); if(CONTACT_EMAIL) add("Ditt mejlprogram öppnas. Skicka mejlet där.","bot"); else {out.hidden=false;} };
  d.append(f,b,out);log.scrollTop=log.scrollHeight;
}
function answer(q){
  const l=" "+q.toLowerCase()+" ";
  if(/\b(människa|läkaren|riktig person|prata med|kontakta)\b/.test(l)||l.includes("ta över")){ handoff(); return; }
  if(SYMP.some(w=>l.includes(w))){ add("Jag kan inte ge medicinsk rådgivning i chatten. Vid akut fara ring 112. För sjukvårdsrådgivning ring 1177. Vill du boka ett läkarbesök kan jag visa hur det går till, eller så skickar jag din fråga vidare till läkaren.","bot",["Gå till bokningen","boka.html"]); return; }
  let best=null,sc=0;KB.forEach(e=>{const n=e.k.filter(w=>l.includes(w)).length;if(n>sc){sc=n;best=e;}});
  if(best){ add(best.a,"bot",best.btn); return; }
  add("Det kan jag inte svara säkert på. Vill du att läkaren tar över? Då skickar jag din fråga vidare.","bot");
  const b=document.createElement("button");b.type="button";b.className="btn sm";b.textContent="Prata med läkaren";b.style.alignSelf="flex-start";b.onclick=handoff;log.append(b);log.scrollTop=log.scrollHeight;
}
["Vad kostar det?","Hur bokar jag?","Vad ingår i viktbedömningen?","Vad är matchläkare?","Prata med läkaren"].forEach(t=>{
  const b=document.createElement("button");b.type="button";b.textContent=t;b.onclick=()=>{add(t,"me");answer(t);};chips.append(b);
});
$("chatForm").addEventListener("submit",(e)=>{e.preventDefault();const v=inp.value.trim();if(!v)return;add(v,"me");inp.value="";answer(v);});
function toggle(open){ $("chatPanel").hidden=!open; $("chatBtn").setAttribute("aria-expanded",String(open)); if(open){ if(!log.children.length) add("Hej! Jag svarar på frågor om våra tjänster, priser och hur bokningen går till. Om jag inte kan svara kan läkaren ta över.","bot"); inp.focus(); } }
$("chatBtn").addEventListener("click",()=>toggle($("chatPanel").hidden));
$("chatX").addEventListener("click",()=>toggle(false));
})();