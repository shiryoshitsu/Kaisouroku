// Kaisouroku entry loader. Entries are listed in entries.json.
(async function () {
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const prettyDate = (date) => {
    const prettyDate = (date) => {
    if (!date) return "--";
    // Safely changes "2026-10-25" into "2026.10.25"
    return String(date).replace(/-/g, ".");
  };


    return Number.isNaN(d.getTime()) ? date : `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
  };
  function markdown(source) {
    // Small, dependency-free Markdown renderer for posts you write yourself.
    const inline = (s) => esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
    const lines = source.replace(/\r/g, "").split("\n");
    let html = "", paragraph = [], list = false;
    const flush = () => { if (paragraph.length) { html += `<p>${inline(paragraph.join(" "))}</p>`; paragraph=[]; } };
    for (const line of lines) {
      const t=line.trim();
      if (!t) { flush(); if(list){html += "</ul>";list=false;} continue; }
      const h=t.match(/^(#{1,3})\s+(.+)$/);
      if(h){flush();if(list){html+="</ul>";list=false;}const n=h[1].length;html+=`<h${n}>${inline(h[2])}</h${n}>`;continue;}
      if(/^[-*]\s+/.test(t)){flush();if(!list){html+="<ul>";list=true;}html+=`<li>${inline(t.replace(/^[-*]\s+/,""))}</li>`;continue;}
      if(list){html+="</ul>";list=false;} paragraph.push(t);
    }
    flush();if(list)html+="</ul>";return html;
  }
  let entries=[];
  try {
      let entries=[];
  try {
    // Dynamically builds the correct path whether you are on the homepage or an entry page
    const repoPath = window.location.pathname.split('/').slice(0, 2).join('/');
    const jsonUrl = `${window.location.origin}${repoPath}/entries.json`;

    const response = await fetch(jsonUrl, { cache: "no-store" });
    if(!response.ok) throw new Error("Could not load entries.json");
    entries=await response.json();
    entries.sort((a,b)=>b.date.localeCompare(a.date));
  } catch(error) {

    if(!response.ok) throw new Error("Could not load entries.json");
    entries=await response.json();
    entries.sort((a,b)=>b.date.localeCompare(a.date));
  } catch(error) {
    console.error(error);
    const target=$("#latest-entries") || $("#archive-list");
    if(target) target.innerHTML="<p>Entries could not be loaded. Please check that entries.json is in the website's main folder.</p>";
    return;
  }
  const last=entries[0]?.date;
  if($("#last-updated")) $("#last-updated").textContent="LAST UPDATED: "+(last?prettyDate(last):"--");
  const card=(e)=>`<article class="diary-entry"><time datetime="${esc(e.date)}">${esc(prettyDate(e.date))}</time><p><a href="entry.html?id=${encodeURIComponent(e.slug)}">${esc(e.title)}</a> <span class="entry-category">[${esc(e.category)}]</span></p><p class="small-copy">${esc(e.summary||"")}</p></article>`;
  if($("#latest-entries")) $("#latest-entries").innerHTML=entries.length?entries.slice(0,5).map(card).join(""):"<p>No entries yet.</p>";
  if($("#archive-list")) {
    const groups={}; entries.forEach(e=>{const y=e.date.slice(0,4);(groups[y] ||= []).push(e);});
    $("#archive-list").innerHTML=Object.keys(groups).sort().reverse().map(year=>`<section class="content-box archive-year"><h2>${esc(year)}</h2>${groups[year].map(card).join("")}</section>`).join("") || "<p>No entries yet.</p>";
  }
  if($("#updates-list")) $("#updates-list").innerHTML=entries.slice(0,3).map(e=>`<li><time>${esc(prettyDate(e.date))}</time>${esc(e.title)}</li>`).join("") || "<li>No updates yet.</li>";
  const params=new URLSearchParams(location.search), slug=params.get("id");
  if(slug && $("#post-content")) {
    const entry=entries.find(e=>e.slug===slug);
    if(!entry){$("#post-title").textContent="Entry not found";$("#post-content").innerHTML='<p>This entry may have been moved or removed.</p>';return;}
    $("#post-title").textContent=entry.title;$("#post-date").textContent=prettyDate(entry.date);$("#post-category").textContent=entry.category;document.title=entry.title+" | Kaisouroku";
    try {const r=await fetch(entry.file,{cache:"no-store"});if(!r.ok)throw new Error("Missing post file");$("#post-content").innerHTML=markdown(await r.text());}
    catch(err){console.error(err);$("#post-content").innerHTML="<p>Couldn't load this entry. Check the file path in entries.json.</p>";}
  }
})();
