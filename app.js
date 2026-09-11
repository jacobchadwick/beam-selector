const CASES = [
  {id:"ss-udl",name:"Simple span \u00b7 uniform",form:"M = wL²/8",loadKind:"udl",mTex:"M_max = w L² / 8",vTex:"V_max = w L / 2",dTex:"Δ_max = 5 w L⁴ / (384 E I)",note:"Max moment and deflection at midspan. Classic floor / platform beam."},
  {id:"ss-p",name:"Simple span \u00b7 mid point",form:"M = PL/4",loadKind:"point",mTex:"M_max = P L / 4",vTex:"V_max = P / 2",dTex:"Δ_max = P L³ / (48 E I)",note:"Concentrated load at midspan. Equipment, hoist, pipe rack point."},
  {id:"cant-udl",name:"Cantilever \u00b7 uniform",form:"M = wL²/2",loadKind:"udl",mTex:"M_max = w L² / 2",vTex:"V_max = w L",dTex:"Δ_tip = w L⁴ / (8 E I)",note:"Root moment. Walkway overhangs and jibs."},
  {id:"cant-p",name:"Cantilever \u00b7 tip point",form:"M = PL",loadKind:"point",mTex:"M_max = P L",vTex:"V_max = P",dTex:"Δ_tip = P L³ / (3 E I)",note:"Worst common case. Tip load, all moment at the weld / cap plate."},
  {id:"fix-udl",name:"Fixed-fixed \u00b7 uniform",form:"M = wL²/12",loadKind:"udl",mTex:"M_end = w L² / 12",vTex:"V_max = w L / 2",dTex:"Δ_max = w L⁴ / (384 E I)",note:"Only if both ends can actually develop fixity. Midspan M = wL²/24."},
  {id:"fix-p",name:"Fixed-fixed \u00b7 mid point",form:"M = PL/8",loadKind:"point",mTex:"M_end = M_mid = P L / 8",vTex:"V_max = P / 2",dTex:"Δ_max = P L³ / (192 E I)",note:"Four times stiffer than simple span for the same P and L."}
];
let current = CASES[0];
function svgFor(id, big) {
  const W = big ? 640 : 200, H = big ? 200 : 80;
  const yb = big ? 130 : 48;
  const x1 = big ? 70 : 22, x2 = big ? 570 : 178;
  const mid = (x1+x2)/2;
  const loadH = big ? 28 : 12;
  let loads = "";
  if (id.includes("udl")) {
    for (let i=0;i<11;i++){
      const x = x1 + (x2-x1)*i/10;
      loads += `<line x1="${x}" y1="${yb-loadH-8}" x2="${x}" y2="${yb-8}" stroke="#f0a03a" stroke-width="${big?2:1.2}"/>`;
    }
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
  const beam = `<line x1="${x1}" y1="${yb}" x2="${x2}" y2="${yb}" stroke="#3b8fe8" stroke-width="${big?8:4}" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${loads}${beam}${supports}</svg>`;
}
function fillSections() {
  const sel = document.getElementById("section");
  sel.innerHTML = SHAPES.map(s => `<option value="${s.name}">${s.name}  ·  ${s.wt} plf  ·  d=${s.d}"</option>`).join("");
  sel.value = "W12x26";
}
function fillCases() {
  const box = document.getElementById("cases");
  box.innerHTML = CASES.map(c => `<div class="case ${c.id===current.id?"active":""}" data-id="${c.id}">${svgFor(c.id,false)}<div class="name">${c.name}</div><div class="form">${c.form}</div></div>`).join("");
  box.querySelectorAll(".case").forEach(el => {
    el.onclick = () => {
      current = CASES.find(c => c.id === el.dataset.id);
      document.querySelectorAll(".case").forEach(x => x.classList.toggle("active", x===el));
      syncLoadLabel();
      render();
    };
  });
}
function syncLoadLabel() {
  document.getElementById("loadLbl").textContent = current.loadKind === "udl" ? "Uniform w (plf)" : "Point P (lb)";
}
function getShape(name){ return SHAPES.find(s => s.name === name); }
function analyze(shape, cse, Lft, rawLoad, fy, Eksi, defN, addSW) {
  const L_in = Lft * 12, E = Eksi, I = shape.Ix;
  let M, V, delta;
  if (cse.loadKind === "udl") {
    const w = (Number(rawLoad) + (addSW ? shape.wt : 0)) / 12;
    const L = L_in;
    if (cse.id === "ss-udl") { M = w*L*L/8; V = w*L/2; delta = 5*w*Math.pow(L,4)/(384*E*1000*I); }
    else if (cse.id === "cant-udl") { M = w*L*L/2; V = w*L; delta = w*Math.pow(L,4)/(8*E*1000*I); }
    else if (cse.id === "fix-udl") { M = w*L*L/12; V = w*L/2; delta = w*Math.pow(L,4)/(384*E*1000*I); }
  } else {
    const P = Number(rawLoad), L = L_in;
    if (cse.id === "ss-p") { M = P*L/4; V = P/2; delta = P*Math.pow(L,3)/(48*E*1000*I); }
    else if (cse.id === "cant-p") { M = P*L; V = P; delta = P*Math.pow(L,3)/(3*E*1000*I); }
    else if (cse.id === "fix-p") { M = P*L/8; V = P/2; delta = P*Math.pow(L,3)/(192*E*1000*I); }
    if (addSW) {
      const w = shape.wt/12;
      if (cse.id === "ss-p") { M += w*L*L/8; V += w*L/2; delta += 5*w*Math.pow(L,4)/(384*E*1000*I); }
      if (cse.id === "cant-p") { M += w*L*L/2; V += w*L; delta += w*Math.pow(L,4)/(8*E*1000*I); }
      if (cse.id === "fix-p") { M += w*L*L/12; V += w*L/2; delta += w*Math.pow(L,4)/(384*E*1000*I); }
    }
  }
  const allowM = (fy * shape.Zx) / 1.67;
  const M_kipin = M / 1000;
  const allowV = (0.6 * fy * shape.d * shape.tw) / 1.50;
  const V_kip = V / 1000;
  const allowD = L_in / defN;
  const fb = M_kipin / shape.Sx;
  const utilM = M_kipin / allowM;
  const utilV = V_kip / allowV;
  const utilD = delta / allowD;
  const pass = utilM <= 1 && utilV <= 1 && utilD <= 1;
  return { M_kipin, V_kip, delta, allowM, allowV, allowD, fb, utilM, utilV, utilD, pass };
}
function fmt(n, d=2){ return Number.isFinite(n) ? n.toFixed(d) : "—"; }
function render() {
  document.getElementById("bigSvg").innerHTML = svgFor(current.id, true).replace(/<svg[^>]*>|<\/svg>/g,"");
  document.getElementById("formulaBox").innerHTML =
    `<div><b>${current.name}</b> — ${current.note}</div>${current.mTex}<br>${current.vTex}<br>${current.dTex}<br>σ = M / Sx &nbsp;&nbsp; ASD Mn/Ωb = Fy Zx / 1.67`;
  const shape = getShape(document.getElementById("section").value);
  const Lft = Number(document.getElementById("L").value);
  const load = Number(document.getElementById("load").value);
  const fy = Number(document.getElementById("fy").value);
  const E = Number(document.getElementById("E").value);
  const defN = Number(document.getElementById("deflim").value);
  const addSW = document.getElementById("selfw").value === "1";
  const r = analyze(shape, current, Lft, load, fy, E, defN, addSW);
  const v = document.getElementById("verdict");
  v.className = "verdict " + (r.pass ? "pass" : "fail");
  v.innerHTML = `<h3>${r.pass ? "PASS" : "FAIL"} — ${shape.name}</h3><div>${r.pass ? "Demand inside ASD bending, shear, and L/"+defN+" deflection." : "At least one check is over 1.00. Pick a bigger section or shorten the span."}</div>`;
  document.getElementById("checks").innerHTML = `
    <div class="chk"><div><div class="k">Bending</div>M = ${fmt(r.M_kipin/12,1)} kip-ft &nbsp;·&nbsp; allow ${fmt(r.allowM/12,1)} kip-ft &nbsp;·&nbsp; fb = ${fmt(r.fb,1)} ksi</div>
      <span class="pill ${r.utilM<=1?"ok":"no"}">${fmt(r.utilM*100,0)}%</span>
      <div class="math">M_allow = Fy Zx / 1.67 = ${fy} × ${shape.Zx} / 1.67 = ${fmt(r.allowM/12,1)} kip-ft</div></div>
    <div class="chk"><div><div class="k">Shear</div>V = ${fmt(r.V_kip,2)} kip &nbsp;·&nbsp; allow ${fmt(r.allowV,1)} kip</div>
      <span class="pill ${r.utilV<=1?"ok":"no"}">${fmt(r.utilV*100,0)}%</span>
      <div class="math">V_allow = 0.6 Fy d tw / 1.50</div></div>
    <div class="chk"><div><div class="k">Deflection</div>Δ = ${fmt(r.delta,3)} in &nbsp;·&nbsp; allow L/${defN} = ${fmt(r.allowD,3)} in &nbsp;·&nbsp; L/Δ = ${r.delta>0?fmt((Lft*12)/r.delta,0):"∞"}</div>
      <span class="pill ${r.utilD<=1?"ok":"no"}">${fmt(r.utilD*100,0)}%</span>
      <div class="math">${current.dTex} &nbsp; E=${E} ksi &nbsp; Ix=${shape.Ix} in⁴</div></div>
    <div class="chk"><div><div class="k">Section</div>${shape.name} &nbsp; ${shape.wt} plf &nbsp; d=${shape.d}" &nbsp; Sx=${shape.Sx} in³ &nbsp; Zx=${shape.Zx} in³</div>
      <span class="pill ok">A992-ish</span></div>`;
  const winners = SHAPES.filter(s => analyze(s, current, Lft, load, fy, E, defN, addSW).pass).sort((a,b) => a.wt - b.wt || a.d - b.d);
  const rec = document.getElementById("rec");
  if (!winners.length) {
    rec.innerHTML = "<div>No W in this table clears the checks. Shorten the span, drop the load, or go past W36×182.</div>";
  } else {
    const best = winners[0];
    const next = winners.slice(0,5).map(s => s.name + " ("+s.wt+" plf)").join(" · ");
    rec.innerHTML = `<div>Lightest that passes: <b>${best.name}</b> — ${best.wt} plf, ${best.d}" deep</div><div class="tiny" style="margin-top:6px">Next lightest in table: ${next}</div><div class="tiny">You selected ${shape.name} (${shape.wt} plf). ${shape.wt>best.wt+0.1 ? "That is "+fmt(shape.wt-best.wt,0)+" plf heavier than needed under these assumptions." : shape.name===best.name ? "That is the lightest table hit." : "Check depth / flange constraints."}</div>`;
  }
}
fillSections();
fillCases();
syncLoadLabel();
["section","L","load","fy","E","deflim","selfw"].forEach(id => {
  document.getElementById(id).addEventListener("input", render);
  document.getElementById(id).addEventListener("change", render);
});
document.getElementById("go").onclick = render;
render();
