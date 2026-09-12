const CASES = [
  {id:"ss-udl",name:"Simple span \u00b7 uniform",form:"M = wL²/8",loadKind:"udl",pos:false,mTex:"M_max = w L² / 8",vTex:"V_max = w L / 2",dTex:"Δ_max = 5 w L⁴ / (384 E I)",note:"Max moment and deflection at midspan."},
  {id:"ss-p",name:"Simple span \u00b7 point",form:"M = Pab/L",loadKind:"point",pos:true,posLabel:"a from left (ft)",mTex:"M_max = P a b / L   (b = L\u2212a)",vTex:"V_L = P b / L    V_R = P a / L",dTex:"Δ_load = P a² b² / (3 E I L)",note:"Put the point load anywhere between supports."},
  {id:"cant-udl",name:"Cantilever \u00b7 uniform",form:"M = wL²/2",loadKind:"udl",pos:false,mTex:"M_max = w L² / 2",vTex:"V_max = w L",dTex:"Δ_tip = w L⁴ / (8 E I)",note:"Root moment. Walkway overhangs and jibs."},
  {id:"cant-p",name:"Cantilever \u00b7 point",form:"M = P a",loadKind:"point",pos:true,posLabel:"a from fixed end (ft)",mTex:"M_fixed = P a",vTex:"V_fixed = P",dTex:"Δ_tip = P a² (3L\u2212a) / (6 E I)",note:"a = L is a tip load. a < L is inboard of the tip."},
  {id:"fix-udl",name:"Fixed-fixed \u00b7 uniform",form:"M = wL²/12",loadKind:"udl",pos:false,mTex:"M_end = w L² / 12",vTex:"V_max = w L / 2",dTex:"Δ_max = w L⁴ / (384 E I)",note:"Only if both ends can actually develop fixity."},
  {id:"fix-p",name:"Fixed-fixed \u00b7 point",form:"M = Pab²/L²",loadKind:"point",pos:true,posLabel:"a from left (ft)",mTex:"M_left = P a b² / L²    M_right = P a² b / L²",vTex:"R_L = P b² (3a+b) / L³",dTex:"Δ_load = P a³ b³ / (3 E I L³)",note:"Move the point load off center. End moments change with a."}
];
let current = CASES[0];
let tableFamily = "W";
function parseA(Lft) {
  const raw = String(document.getElementById("pos").value).replace(",",".");
  let a = parseFloat(raw);
  if (!Number.isFinite(a)) a = Lft/2;
  const lo = 0.01, hi = Math.max(0.02, Lft);
  if (a < lo) a = lo;
  if (a > hi) a = hi;
  return a;
}
function snapCenter() {
  const Lft = Number(document.getElementById("L").value) || 16;
  document.getElementById("pos").value = String(+(Lft/2).toFixed(3));
  render();
}
function svgFor(id, big, aRatio) {
  const W = big ? 640 : 200, H = big ? 200 : 80;
  const yb = big ? 130 : 48;
  const x1 = big ? 70 : 22, x2 = big ? 570 : 178;
  const r = (aRatio == null) ? 0.5 : Math.min(0.98, Math.max(0.02, aRatio));
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
function shapesInFamily(fam) { return SHAPES.filter(s => s.family === (fam || familyList())); }
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
      syncLoadLabel();
      if (current.pos && !String(document.getElementById("pos").value).trim()) snapCenter();
      else render();
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
function n(x,d){ return Number.isFinite(x) ? Number(x).toFixed(d) : "\u2014"; }
function analyze(shape, cse, Lft, rawLoad, fy, Eksi, defN, addSW, aFt) {
  const L = Lft * 12, E = Eksi, I = shape && shape.Ix;
  if (!shape || !I) return null;
  let M = 0, V = 0, delta = 0;
  let a = Math.min(Math.max(aFt || Lft/2, 0.01), Math.max(0.02, Lft));
  const a_in = a * 12, b_in = Math.max(0.01, L - a_in);
  const lines = [];
  lines.push("GIVEN");
  lines.push("  section  " + shape.name + "   family " + shape.family);
  lines.push("  wt = " + shape.wt + " plf    d = " + shape.d + " in    tw = " + shape.tw + " in");
  lines.push("  Ix = " + shape.Ix + " in4    Sx = " + shape.Sx + " in3    Zx = " + shape.Zx + " in3");
  lines.push("  Fy = " + fy + " ksi    E = " + E + " ksi    L = " + Lft + " ft = " + L + " in");
  lines.push("  deflection limit = L/" + defN);
  if (cse.pos) lines.push("  a = " + n(a,3) + " ft = " + n(a_in,2) + " in    b = L-a = " + n(b_in/12,3) + " ft = " + n(b_in,2) + " in");
  if (cse.loadKind === "udl") {
    const wApplied = Number(rawLoad);
    const wTotPlf = wApplied + (addSW ? shape.wt : 0);
    const w = wTotPlf / 12;
    lines.push(""); lines.push("LOAD  (uniform)");
    lines.push("  w_applied = " + wApplied + " plf");
    lines.push("  self-weight " + (addSW ? ("ON  +" + shape.wt + " plf") : "OFF"));
    lines.push("  w_total = " + n(wTotPlf,2) + " plf = " + n(w,4) + " lb/in");
    if (cse.id === "ss-udl") {
      M = w*L*L/8; V = w*L/2; delta = 5*w*Math.pow(L,4)/(384*E*1000*I);
      lines.push(""); lines.push("SIMPLE SPAN \u00b7 UDL");
      lines.push("  M = w L^2 / 8 = " + n(w,4) + " x " + L + "^2 / 8 = " + n(M,1) + " lb-in = " + n(M/12000,3) + " kip-ft");
      lines.push("  V = w L / 2 = " + n(V,1) + " lb = " + n(V/1000,3) + " kip");
      lines.push("  D = 5 w L^4 / (384 E I)   [E in ksi so /1000]");
      lines.push("    = 5 x " + n(w,4) + " x " + L + "^4 / (384 x " + E + " x 1000 x " + I + ") = " + n(delta,4) + " in");
    } else if (cse.id === "cant-udl") {
      M = w*L*L/2; V = w*L; delta = w*Math.pow(L,4)/(8*E*1000*I);
      lines.push(""); lines.push("CANTILEVER \u00b7 UDL");
      lines.push("  M = w L^2 / 2 = " + n(M,1) + " lb-in = " + n(M/12000,3) + " kip-ft");
      lines.push("  V = w L = " + n(V,1) + " lb = " + n(V/1000,3) + " kip");
      lines.push("  D_tip = w L^4 / (8 E I) = " + n(delta,4) + " in");
    } else if (cse.id === "fix-udl") {
      M = w*L*L/12; V = w*L/2; delta = w*Math.pow(L,4)/(384*E*1000*I);
      lines.push(""); lines.push("FIXED-FIXED \u00b7 UDL");
      lines.push("  M_end = w L^2 / 12 = " + n(M,1) + " lb-in = " + n(M/12000,3) + " kip-ft");
      lines.push("  V = w L / 2 = " + n(V,1) + " lb = " + n(V/1000,3) + " kip");
      lines.push("  D = w L^4 / (384 E I) = " + n(delta,4) + " in");
    }
  } else {
    const P = Number(rawLoad);
    lines.push(""); lines.push("LOAD  (point)"); lines.push("  P = " + P + " lb");
    if (cse.id === "ss-p") {
      M = P * a_in * b_in / L; V = Math.max(P * b_in / L, P * a_in / L); delta = P * a_in*a_in * b_in*b_in / (3 * E * 1000 * I * L);
      lines.push(""); lines.push("SIMPLE SPAN \u00b7 POINT");
      lines.push("  M = P a b / L = " + P + " x " + n(a_in,2) + " x " + n(b_in,2) + " / " + L + " = " + n(M,1) + " lb-in = " + n(M/12000,3) + " kip-ft");
      lines.push("  V_L = P b / L = " + n(P*b_in/L,1) + " lb    V_R = P a / L = " + n(P*a_in/L,1) + " lb");
      lines.push("  V_max = " + n(V,1) + " lb = " + n(V/1000,3) + " kip");
      lines.push("  D_load = P a^2 b^2 / (3 E I L) = " + n(delta,4) + " in");
      lines.push("    = " + P + " x " + n(a_in,2) + "^2 x " + n(b_in,2) + "^2 / (3 x " + E + " x 1000 x " + I + " x " + L + ")");
    } else if (cse.id === "cant-p") {
      M = P * a_in; V = P; delta = P * a_in*a_in * (3*L - a_in) / (6 * E * 1000 * I);
      lines.push(""); lines.push("CANTILEVER \u00b7 POINT");
      lines.push("  M_fixed = P a = " + P + " x " + n(a_in,2) + " = " + n(M,1) + " lb-in = " + n(M/12000,3) + " kip-ft");
      lines.push("  V_fixed = P = " + P + " lb = " + n(P/1000,3) + " kip");
      lines.push("  D = P a^2 (3L - a) / (6 E I) = " + n(delta,4) + " in");
    } else if (cse.id === "fix-p") {
      const ML = P * a_in * b_in*b_in / (L*L);
      const MR = P * a_in*a_in * b_in / (L*L);
      M = Math.max(ML, MR);
      const VL = P * b_in*b_in * (3*a_in + b_in) / (L*L*L);
      const VR = P * a_in*a_in * (a_in + 3*b_in) / (L*L*L);
      V = Math.max(VL, VR);
      delta = P * Math.pow(a_in,3) * Math.pow(b_in,3) / (3 * E * 1000 * I * Math.pow(L,3));
      lines.push(""); lines.push("FIXED-FIXED \u00b7 POINT");
      lines.push("  M_left  = P a b^2 / L^2 = " + n(ML,1) + " lb-in");
      lines.push("  M_right = P a^2 b / L^2 = " + n(MR,1) + " lb-in");
      lines.push("  M_max = " + n(M,1) + " lb-in = " + n(M/12000,3) + " kip-ft");
      lines.push("  R_L = " + n(VL,1) + " lb    R_R = " + n(VR,1) + " lb    V_max = " + n(V/1000,3) + " kip");
      lines.push("  D_load = P a^3 b^3 / (3 E I L^3) = " + n(delta,4) + " in");
    }
    if (addSW) {
      const w = shape.wt/12;
      let Msw=0, Vsw=0, Dsw=0;
      if (cse.id === "ss-p") { Msw = w*L*L/8; Vsw = w*L/2; Dsw = 5*w*Math.pow(L,4)/(384*E*1000*I); }
      if (cse.id === "cant-p") { Msw = w*L*L/2; Vsw = w*L; Dsw = w*Math.pow(L,4)/(8*E*1000*I); }
      if (cse.id === "fix-p") { Msw = w*L*L/12; Vsw = w*L/2; Dsw = w*Math.pow(L,4)/(384*E*1000*I); }
      M += Msw; V += Vsw; delta += Dsw;
      lines.push(""); lines.push("SELF-WEIGHT added as UDL on same span case");
      lines.push("  w_sw = " + shape.wt + " plf = " + n(w,4) + " lb/in");
      lines.push("  +M_sw = " + n(Msw,1) + " lb-in    +V_sw = " + n(Vsw,1) + " lb    +D_sw = " + n(Dsw,4) + " in");
      lines.push("  combined M = " + n(M,1) + " lb-in = " + n(M/12000,3) + " kip-ft");
      lines.push("  combined V = " + n(V,1) + " lb = " + n(V/1000,3) + " kip");
      lines.push("  combined D = " + n(delta,4) + " in");
    }
  }
  const Av = shearArea(shape);
  const allowM = (fy * shape.Zx) / 1.67;
  const M_kipin = M / 1000;
  const allowV = (0.6 * fy * Av) / 1.50;
  const V_kip = V / 1000;
  const allowD = L / defN;
  const fb = M_kipin / shape.Sx;
  const utilM = allowM > 0 ? M_kipin / allowM : 99;
  const utilV = allowV > 0 ? V_kip / allowV : 99;
  const utilD = allowD > 0 ? delta / allowD : 99;
  const pass = utilM <= 1 && utilV <= 1 && utilD <= 1 && Number.isFinite(utilM);
  lines.push(""); lines.push("ASD CHECKS");
  lines.push("  Av = " + (shape.family==="HSS"?"2 d tw":"d tw") + " = " + n(Av,3) + " in2");
  lines.push("  M_allow = Fy Zx / 1.67 = " + fy + " x " + shape.Zx + " / 1.67 = " + n(allowM,2) + " kip-in = " + n(allowM/12,2) + " kip-ft");
  lines.push("  ratio_M = " + n(M_kipin,2) + " / " + n(allowM,2) + " = " + n(utilM,3) + "  (" + n(utilM*100,1) + "%)");
  lines.push("  fb = M / Sx = " + n(M_kipin,2) + " / " + shape.Sx + " = " + n(fb,2) + " ksi");
  lines.push("  V_allow = 0.6 Fy Av / 1.50 = 0.6 x " + fy + " x " + n(Av,3) + " / 1.50 = " + n(allowV,2) + " kip");
  lines.push("  ratio_V = " + n(V_kip,3) + " / " + n(allowV,2) + " = " + n(utilV,3) + "  (" + n(utilV*100,1) + "%)");
  lines.push("  D_allow = L/" + defN + " = " + L + "/" + defN + " = " + n(allowD,4) + " in");
  lines.push("  ratio_D = " + n(delta,4) + " / " + n(allowD,4) + " = " + n(utilD,3) + "  (" + n(utilD*100,1) + "%)");
  lines.push(""); lines.push("VERDICT  " + (pass ? "PASS" : "FAIL") + "   all three ratios must be <= 1.00");
  return { M_kipin, V_kip, delta, allowM, allowV, allowD, fb, utilM, utilV, utilD, pass, a, Av, lines };
}
function fmt(n0, d){ d = (d==null)?2:d; return Number.isFinite(n0) ? n0.toFixed(d) : "\u2014"; }
function inputs() {
  const Lft = Number(document.getElementById("L").value);
  return { shape: getShape(document.getElementById("section").value), Lft, load: Number(document.getElementById("load").value), fy: Number(document.getElementById("fy").value), E: Number(document.getElementById("E").value), defN: Number(document.getElementById("deflim").value), addSW: document.getElementById("selfw").value === "1", aFt: current.pos ? parseA(Lft) : Lft/2 };
}
function render() {
  const inn = inputs();
  const ratio = inn.Lft > 0 ? inn.aFt / inn.Lft : 0.5;
  document.getElementById("bigSvg").innerHTML = svgFor(current.id, true, current.pos ? ratio : 0.5).replace(/<svg[^>]*>|<\/svg>/g,"");
  document.getElementById("formulaBox").innerHTML = "<div><b>" + current.name + "</b> \u2014 " + current.note + "</div>" + current.mTex + "<br>" + current.vTex + "<br>" + current.dTex + (current.pos ? "<br>a = " + fmt(inn.aFt,2) + " ft" : "");
  if (!inn.shape) return;
  const r = analyze(inn.shape, current, inn.Lft, inn.load, inn.fy, inn.E, inn.defN, inn.addSW, inn.aFt);
  if (!r) return;
  const v = document.getElementById("verdict");
  v.className = "verdict " + (r.pass ? "pass" : "fail");
  v.innerHTML = "<h3>" + (r.pass ? "PASS" : "FAIL") + " \u2014 " + inn.shape.name + "</h3><div>" + (r.pass ? "Demand inside ASD bending, shear, and L/"+inn.defN+" deflection." : "At least one check is over 1.00.") + "</div>";
  document.getElementById("checks").innerHTML =
    '<div class="chk"><div><div class="k">Bending</div>M = ' + fmt(r.M_kipin/12,1) + " kip-ft \u00b7 allow " + fmt(r.allowM/12,1) + " kip-ft \u00b7 fb = " + fmt(r.fb,1) + ' ksi</div><span class="pill ' + (r.utilM<=1?"ok":"no") + '">' + fmt(r.utilM*100,0) + '%</span><div class="math">M_allow = Fy Zx / 1.67</div></div>' +
    '<div class="chk"><div><div class="k">Shear</div>V = ' + fmt(r.V_kip,2) + " kip \u00b7 allow " + fmt(r.allowV,1) + ' kip</div><span class="pill ' + (r.utilV<=1?"ok":"no") + '">' + fmt(r.utilV*100,0) + '%</span><div class="math">V_allow = 0.6 Fy Av / 1.50 \u00b7 Av = ' + fmt(r.Av,2) + " in\u00b2</div></div>" +
    '<div class="chk"><div><div class="k">Deflection</div>\u0394 = ' + fmt(r.delta,3) + " in \u00b7 allow L/" + inn.defN + " = " + fmt(r.allowD,3) + ' in</div><span class="pill ' + (r.utilD<=1?"ok":"no") + '">' + fmt(r.utilD*100,0) + '%</span><div class="math">E=' + inn.E + " ksi \u00b7 Ix=" + inn.shape.Ix + " in\u2074</div></div>" +
    '<div class="chk"><div><div class="k">Section</div>' + inn.shape.name + " \u00b7 " + inn.shape.wt + " plf \u00b7 d=" + inn.shape.d + '" \u00b7 Sx=' + inn.shape.Sx + " \u00b7 Zx=" + inn.shape.Zx + '</div><span class="pill ok">' + inn.shape.family + "</span></div>";
  document.getElementById("work").innerHTML = "<h3>Worked math</h3><pre>" + r.lines.join("\n") + "</pre>";
  const winners = shapesInFamily().map(s => ({s, r: analyze(s, current, inn.Lft, inn.load, inn.fy, inn.E, inn.defN, inn.addSW, inn.aFt)})).filter(x => x.r && x.r.pass).sort(function(a,b){ return a.s.wt - b.s.wt || a.s.d - b.s.d; });
  const rec = document.getElementById("rec");
  if (!winners.length) { rec.innerHTML = "<div>No section in this family clears the checks.</div>"; return; }
  const best = winners[0].s;
  const next = winners.slice(0,5).map(function(x){ return x.s.name+" ("+x.s.wt+" plf)"; }).join(" \u00b7 ");
  rec.innerHTML = "<div>Lightest that passes: <b>" + best.name + "</b> \u2014 " + best.wt + " plf, " + best.d + '" deep</div><div class="tiny" style="margin-top:6px">Next: ' + next + '</div><button class="run" id="useBest" style="margin-top:10px">Use ' + best.name + "</button>";
  document.getElementById("useBest").onclick = function(){ document.getElementById("section").value = best.name; render(); };
}
function setMenu(open) {
  document.getElementById("drawer").classList.toggle("on", open);
  document.getElementById("scrim").classList.toggle("on", open);
  document.getElementById("drawer").setAttribute("aria-hidden", open ? "false" : "true");
}
function renderTable() {
  const cur = document.getElementById("section").value;
  const list = shapesInFamily(tableFamily);
  const fams = ["W","C","L","HSS","BAR"];
  document.getElementById("tableTabs").innerHTML = fams.map(function(f){ return '<button class="tab ' + (f===tableFamily?"on":"") + '" data-f="' + f + '">' + f + " (" + SHAPES.filter(function(s){return s.family===f;}).length + ")</button>"; }).join("");
  document.getElementById("tableTabs").querySelectorAll(".tab").forEach(function(btn){ btn.onclick = function(){ tableFamily = btn.dataset.f; renderTable(); }; });
  const rows = list.map(function(s){ return '<tr class="' + (s.name===cur?"sel":"") + '" data-name="' + s.name + '"><td>' + s.name + "</td><td>" + s.wt + "</td><td>" + s.d + "</td><td>" + s.tw + "</td><td>" + s.Ix + "</td><td>" + s.Sx + "</td><td>" + s.Zx + "</td></tr>"; }).join("");
  document.getElementById("propTable").innerHTML = "<thead><tr><th>Shape</th><th>wt</th><th>d</th><th>tw</th><th>Ix</th><th>Sx</th><th>Zx</th></tr></thead><tbody>" + rows + "</tbody>";
  document.getElementById("propTable").querySelectorAll("tbody tr").forEach(function(tr){
    tr.onclick = function(){
      const name = tr.dataset.name;
      const sh = getShape(name);
      document.getElementById("family").value = sh.family;
      fillSections(name);
      document.getElementById("section").value = name;
      document.getElementById("tableSheet").classList.remove("on");
      render();
    };
  });
}
document.getElementById("family").addEventListener("change", function(){ fillSections(); render(); });
["section","L","load","fy","E","deflim","selfw"].forEach(function(id){
  const el = document.getElementById(id); if (!el) return;
  el.addEventListener("change", render);
  el.addEventListener("input", render);
});
const pos = document.getElementById("pos");
pos.addEventListener("input", render);
pos.addEventListener("blur", function(){
  const Lft = Number(document.getElementById("L").value) || 16;
  pos.value = String(+parseA(Lft).toFixed(3));
  render();
});
document.getElementById("centerA").onclick = snapCenter;
document.getElementById("go").onclick = render;
document.getElementById("menuBtn").onclick = function(){ setMenu(true); };
document.getElementById("scrim").onclick = function(){ setMenu(false); };
document.getElementById("openTables").onclick = function(){
  setMenu(false);
  tableFamily = familyList();
  renderTable();
  document.getElementById("tableSheet").classList.add("on");
};
document.getElementById("closeTables").onclick = function(){ document.getElementById("tableSheet").classList.remove("on"); };
fillSections(); fillCases(); syncLoadLabel(); snapCenter();
