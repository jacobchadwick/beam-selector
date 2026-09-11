const CASES = [
  {id:"ss-udl",name:"Simple span \u00b7 uniform",form:"M = wL²/8",loadKind:"udl",pos:false,mTex:"M_max = w L² / 8",vTex:"V_max = w L / 2",dTex:"Δ_max = 5 w L⁴ / (384 E I)",note:"Max moment and deflection at midspan."},
  {id:"ss-p",name:"Simple span \u00b7 point",form:"M = Pab/L",loadKind:"point",pos:true,posLabel:"a from left (ft)",mTex:"M_max = P a b / L   (b = L\u2212a)",vTex:"V_L = P b / L    V_R = P a / L",dTex:"Δ_load = P a² b² / (3 E I L)",note:"Slide a to put the point load anywhere between supports."},
  {id:"cant-udl",name:"Cantilever \u00b7 uniform",form:"M = wL²/2",loadKind:"udl",pos:false,mTex:"M_max = w L² / 2",vTex:"V_max = w L",dTex:"Δ_tip = w L⁴ / (8 E I)",note:"Root moment. Walkway overhangs and jibs."},
  {id:"cant-p",name:"Cantilever \u00b7 point",form:"M = P a",loadKind:"point",pos:true,posLabel:"a from fixed end (ft)",mTex:"M_fixed = P a",vTex:"V_fixed = P",dTex:"Δ_tip = P a² (3L\u2212a) / (6 E I)",note:"a = L is a tip load. a < L is a load parked inboard of the tip."},
  {id:"fix-udl",name:"Fixed-fixed \u00b7 uniform",form:"M = wL²/12",loadKind:"udl",pos:false,mTex:"M_end = w L² / 12",vTex:"V_max = w L / 2",dTex:"Δ_max = w L⁴ / (384 E I)",note:"Only if both ends can actually develop fixity."},
  {id:"fix-p",name:"Fixed-fixed \u00b7 point",form:"M = Pab²/L²",loadKind:"point",pos:true,posLabel:"a from left (ft)",mTex:"M_left = P a b² / L²    M_right = P a² b / L²",vTex:"R_L = P b² (3a+b) / L³",dTex:"Δ_load = P a³ b³ / (3 E I L³)",note:"Move the point load off center. End moments change with a."}
];
let current = CASES[0];
function clampA(Lft) {
  const el = document.getElementById("pos");
  let a = Number(el.value);
  const lo = 0.05, hi = Math.max(0.1, Lft - 0.05);
  if (!Number.isFinite(a) || a < lo) a = current.id.startsWith("cant") ? Lft : Lft/2;
  if (a > hi) a = hi;
  el.value = (+a.toFixed(2));
  return Number(el.value);
}
function svgFor(id, big, aRatio) {
  const W = big ? 640 : 200, H = big ? 200 : 80;
  const yb = big ? 130 : 48;
  const x1 = big ? 70 : 22, x2 = big ? 570 : 178;
  const r = (aRatio == null) ? 0.5 : Math.min(0.95, Math.max(0.05, aRatio));
  const mid = x1 + (x2-x1)*r;
  const loadH = big ? 28 : 12;
  let loads = "";
  if (id.includes("udl")) {
    for (let i=0;i<11;i++){ const x = x1 + (x2-x1)*i/10; loads += `<line x1="${x}" y1="${yb-loadH-8}" x2="${x}" y2="${yb-8}" stroke="#f0a03a" stroke-width="${big?2:1.2}"/>`; }
    loads += `<line x1="${x1}" y1="${yb-loadH-8}" x2="${x2}" y2="${yb-loadH-8}" stroke="#f0a03a" stroke-width="${big?2:1.2}"/>`;
  } else {
    loads += `<line x1="${mid}" y1="${yb-loadH-16}" x2="${mid}" y2="${yb-8}" stroke="#f0a03a" stroke-width="${big?3:1.6}"/><polygon points="${mid-7},${yb-loadH-4} ${mid+7},${yb-loadH-4} ${mid},${yb-6}" fill="#f0a03a"/>`;
  }
  let supports = "";
  if (id.startsWith("ss")) {
    supports = `<polygon points="${x1-10},${yb+6} ${x1+10},${yb+6} ${x1},${yb+22}" fill="#8b97a8"/><rect x="${x2-12}" y="${yb+6}" width="24" height="8" fill="#8b97a8"/><circle cx="${x2}" cy="${yb+22}" r="5" fill="none" stroke="#8b97a8" stroke-width="2"/><circle cx="${x2+9}" cy="${yb+22}" r="5" fill="none" stroke="#8b97a8" stroke-width="2"/>`;
  } else if (id.startsWith("cant")) {
    supports = `<rect x="${x1-18}" y="${yb-28}" width="12" height="56" fill="#8b97a8"/><line x1="${x1-18}" y1="${yb-28}" x2="${x1-18}" y2="${yb+28}" stroke="#c9d6e8" stroke-width="3"/>`;
  } else {
    supports = `<rect x="${x1-16}" y="${yb-26}" width="10" height="52" fill="#8b97a8"/><rect x="${x2+6}" y="${yb-26}" width="10" height="52" fill="#8b97a8"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${loads}<line x1="${x1}" y1="${yb}" x2="${x2}" y2="${yb}" stroke="#3b8fe8" stroke-width="${big?8:4}" stroke-linecap="round"/>${supports}</svg>`;
}
function familyList() { return document.getElementById("family").value; }
function shapesInFamily() { return SHAPES.filter(s => s.family === familyList()); }
function fillSections(keepName) {
  const sel = document.getElementById("section");
  const list = shapesInFamily();
  const prev = keepName || sel.value;
  sel.innerHTML = list.map(s => `<option value="${s.name}">${s.name}  \u00b7  ${s.wt} plf  \u00b7  d=${s.d}"</option>`).join("");
  if (list.some(s => s.name === prev)) sel.value = prev;
  else sel.value = list[Math.min(4, list.length-1)].name;
}
function fillCases() {
  const box = document.getElementById("cases");
  box.innerHTML = CASES.map(c => `<div class="case ${c.id===current.id?"active":""}" data-id="${c.id}">${svgFor(c.id,false,0.5)}<div class="name">${c.name}</div><div class="form">${c.form}</div></div>`).join("");
  box.querySelectorAll(".case").forEach(el => {
    el.onclick = () => {
      current = CASES.find(c => c.id === el.dataset.id);
      document.querySelectorAll(".case").forEach(x => x.classList.toggle("active", x===el));
      syncLoadLabel(); render();
    };
  });
}
function syncLoadLabel() {
  document.getElementById("loadLbl").textContent = current.loadKind === "udl" ? "Uniform w (plf)" : "Point P (lb)";
  const row = document.getElementById("posRow");
  document.getElementById("posLbl").textContent = current.posLabel || "a (ft)";
  row.style.display = current.pos ? "block" : "none";
}
function getShape(name){ return SHAPES.find(s => s.name === name); }
function shearArea(shape) { return shape.family === "HSS" ? 2 * shape.d * shape.tw : shape.d * shape.tw; }
function analyze(shape, cse, Lft, rawLoad, fy, Eksi, defN, addSW, aFt) {
  const L = Lft * 12, E = Eksi, I = shape && shape.Ix;
  if (!shape || !I) return null;
  let M = 0, V = 0, delta = 0;
  let a = Math.min(Math.max(aFt || Lft/2, 0.05), Math.max(0.1, Lft-0.05));
  const a_in = a * 12, b_in = L - a_in;
  if (cse.loadKind === "udl") {
    const w = (Number(rawLoad) + (addSW ? shape.wt : 0)) / 12;
    if (cse.id === "ss-udl") { M = w*L*L/8; V = w*L/2; delta = 5*w*Math.pow(L,4)/(384*E*1000*I); }
    else if (cse.id === "cant-udl") { M = w*L*L/2; V = w*L; delta = w*Math.pow(L,4)/(8*E*1000*I); }
    else if (cse.id === "fix-udl") { M = w*L*L/12; V = w*L/2; delta = w*Math.pow(L,4)/(384*E*1000*I); }
  } else {
    const P = Number(rawLoad);
    if (cse.id === "ss-p") { M = P * a_in * b_in / L; V = Math.max(P * b_in / L, P * a_in / L); delta = P * a_in*a_in * b_in*b_in / (3 * E * 1000 * I * L); }
    else if (cse.id === "cant-p") { M = P * a_in; V = P; delta = P * a_in*a_in * (3*L - a_in) / (6 * E * 1000 * I); }
    else if (cse.id === "fix-p") {
      M = Math.max(P * a_in * b_in*b_in / (L*L), P * a_in*a_in * b_in / (L*L));
      V = Math.max(P * b_in*b_in * (3*a_in + b_in) / (L*L*L), P * a_in*a_in * (a_in + 3*b_in) / (L*L*L));
      delta = P * Math.pow(a_in,3) * Math.pow(b_in,3) / (3 * E * 1000 * I * Math.pow(L,3));
    }
    if (addSW) {
      const w = shape.wt/12;
      if (cse.id === "ss-p") { M += w*L*L/8; V += w*L/2; delta += 5*w*Math.pow(L,4)/(384*E*1000*I); }
      if (cse.id === "cant-p") { M += w*L*L/2; V += w*L; delta += w*Math.pow(L,4)/(8*E*1000*I); }
      if (cse.id === "fix-p") { M += w*L*L/12; V += w*L/2; delta += w*Math.pow(L,4)/(384*E*1000*I); }
    }
  }
  const allowM = (fy * shape.Zx) / 1.67;
  const M_kipin = M / 1000;
  const allowV = (0.6 * fy * shearArea(shape)) / 1.50;
  const V_kip = V / 1000;
  const allowD = L / defN;
  const fb = M_kipin / shape.Sx;
  const utilM = allowM > 0 ? M_kipin / allowM : 99;
  const utilV = allowV > 0 ? V_kip / allowV : 99;
  const utilD = allowD > 0 ? delta / allowD : 99;
  const pass = utilM <= 1 && utilV <= 1 && utilD <= 1 && Number.isFinite(utilM);
  return { M_kipin, V_kip, delta, allowM, allowV, allowD, fb, utilM, utilV, utilD, pass, a };
}
function fmt(n, d=2){ return Number.isFinite(n) ? n.toFixed(d) : "\u2014"; }
function inputs() {
  const Lft = Number(document.getElementById("L").value);
  return { shape: getShape(document.getElementById("section").value), Lft, load: Number(document.getElementById("load").value), fy: Number(document.getElementById("fy").value), E: Number(document.getElementById("E").value), defN: Number(document.getElementById("deflim").value), addSW: document.getElementById("selfw").value === "1", aFt: current.pos ? clampA(Lft) : Lft/2 };
}
function render() {
  const inn = inputs();
  const ratio = inn.Lft > 0 ? inn.aFt / inn.Lft : 0.5;
  document.getElementById("bigSvg").innerHTML = svgFor(current.id, true, current.pos ? ratio : 0.5).replace(/<svg[^>]*>|<\/svg>/g,"");
  document.getElementById("formulaBox").innerHTML = `<div><b>${current.name}</b> \u2014 ${current.note}</div>${current.mTex}<br>${current.vTex}<br>${current.dTex}` + (current.pos ? `<br>a = ${fmt(inn.aFt,2)} ft` : "");
  if (!inn.shape) return;
  const r = analyze(inn.shape, current, inn.Lft, inn.load, inn.fy, inn.E, inn.defN, inn.addSW, inn.aFt);
  if (!r) return;
  const v = document.getElementById("verdict");
  v.className = "verdict " + (r.pass ? "pass" : "fail");
  v.innerHTML = `<h3>${r.pass ? "PASS" : "FAIL"} \u2014 ${inn.shape.name}</h3><div>${r.pass ? "Demand inside ASD bending, shear, and L/"+inn.defN+" deflection." : "At least one check is over 1.00."}</div>`;
  document.getElementById("checks").innerHTML = `<div class="chk"><div><div class="k">Bending</div>M = ${fmt(r.M_kipin/12,1)} kip-ft \u00b7 allow ${fmt(r.allowM/12,1)} kip-ft \u00b7 fb = ${fmt(r.fb,1)} ksi</div><span class="pill ${r.utilM<=1?"ok":"no"}">${fmt(r.utilM*100,0)}%</span><div class="math">M_allow = Fy Zx / 1.67</div></div>
    <div class="chk"><div><div class="k">Shear</div>V = ${fmt(r.V_kip,2)} kip \u00b7 allow ${fmt(r.allowV,1)} kip</div><span class="pill ${r.utilV<=1?"ok":"no"}">${fmt(r.utilV*100,0)}%</span><div class="math">V_allow = 0.6 Fy Av / 1.50</div></div>
    <div class="chk"><div><div class="k">Deflection</div>Δ = ${fmt(r.delta,3)} in \u00b7 allow L/${inn.defN} = ${fmt(r.allowD,3)} in</div><span class="pill ${r.utilD<=1?"ok":"no"}">${fmt(r.utilD*100,0)}%</span><div class="math">E=${inn.E} ksi \u00b7 Ix=${inn.shape.Ix} in\u2074</div></div>
    <div class="chk"><div><div class="k">Section</div>${inn.shape.name} \u00b7 ${inn.shape.wt} plf \u00b7 d=${inn.shape.d}" \u00b7 Sx=${inn.shape.Sx} \u00b7 Zx=${inn.shape.Zx}</div><span class="pill ok">${inn.shape.family}</span></div>`;
  const winners = shapesInFamily().map(s => ({s, r: analyze(s, current, inn.Lft, inn.load, inn.fy, inn.E, inn.defN, inn.addSW, inn.aFt)})).filter(x => x.r && x.r.pass).sort((a,b) => a.s.wt - b.s.wt || a.s.d - b.s.d);
  const rec = document.getElementById("rec");
  if (!winners.length) { rec.innerHTML = "<div>No section in this family clears the checks.</div>"; return; }
  const best = winners[0].s;
  const next = winners.slice(0,5).map(x => x.s.name+" ("+x.s.wt+" plf)").join(" \u00b7 ");
  rec.innerHTML = `<div>Lightest that passes: <b>${best.name}</b> \u2014 ${best.wt} plf, ${best.d}" deep</div><div class="tiny" style="margin-top:6px">Next: ${next}</div><button class="run" id="useBest" style="margin-top:10px">Use ${best.name}</button>`;
  document.getElementById("useBest").onclick = () => { document.getElementById("section").value = best.name; render(); };
}
document.getElementById("family").addEventListener("change", () => { fillSections(); render(); });
["section","L","load","fy","E","deflim","selfw","pos"].forEach(id => {
  const el = document.getElementById(id); if (!el) return;
  el.addEventListener("input", render); el.addEventListener("change", render);
});
document.getElementById("go").onclick = render;
fillSections(); fillCases(); syncLoadLabel(); render();
