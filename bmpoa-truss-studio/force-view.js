(() => {
  const fa = document.documentElement.lang === 'fa';
  const tr = (en, farsi) => fa ? farsi : en;
  const number = new Intl.NumberFormat(fa ? 'fa-IR' : 'en-US', {maximumSignificantDigits: 9});
  const f = value => number.format(value);
  const byId = id => document.getElementById(id);
  const scene = byId('force-scene');
  const run = byId('force-run'), loadCase = byId('force-case'), unit = byId('force-unit');
  const member = byId('force-member'), results = byId('force-results'), status = byId('force-status');
  const svgNS = 'http://www.w3.org/2000/svg';
  const lbfToKN = 0.0044482216152605;
  const loadLabels = {
    '72-bar': [
      tr('1 · Vertical load on nodes 17–20', '۱ · بار قائم در گره‌های ۱۷ تا ۲۰'),
      tr('2 · Three directional components at node 17', '۲ · بار سه‌مؤلفه‌ای در گره ۱۷')
    ],
    '120-bar': [tr('1 · Vertical loads on dome nodes 1–37', '۱ · بارهای قائم در گره‌های ۱ تا ۳۷ گنبد')]
  };

  let selection, dataset, model, design, forces, center, radius, peak, memberIndex = 0;
  let azimuth, elevation, zoom, gesture;
  const initial = new URLSearchParams(location.hash.slice(1));
  let restoreInitial = true;

  function resetCamera() {
    azimuth = -0.95;
    elevation = 0.43;
    zoom = 1;
  }
  resetCamera();

  function svg(tag, attrs) {
    const node = document.createElementNS(svgNS, tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    return node;
  }
  function options(select, pairs) {
    select.replaceChildren(...pairs.map(([value, label]) => new Option(label, value)));
  }
  function failed() {
    results.hidden = true;
    run.disabled = loadCase.disabled = true;
    status.textContent = tr('Member-force results unavailable. Reload to retry.', 'نتایج نیروهای اعضا در دسترس نیست. صفحه را دوباره باز کنید.');
  }
  function scaled(value) { return unit.value === 'kN' ? value * lbfToKN : value; }
  function forceText(value) {
    const signed = value > 0 ? '+' + f(scaled(value)) : f(scaled(value));
    return signed + ' ' + unit.value;
  }
  // Tiny equilibrium round-off is neutral in the plot. The readout keeps the computed value.
  function forceSign(value) {
    return Math.abs(value) <= Math.max(1e-9, peak * 1e-12) ? 0 : Math.sign(value);
  }
  function lineColor(value) {
    const sign = forceSign(value);
    if (!sign) return '#a3b1c1';
    const strength = Math.min(1, Math.abs(value) / peak);
    const dark = sign > 0 ? [55, 129, 157] : [171, 100, 80];
    const bright = sign > 0 ? [81, 217, 255] : [255, 152, 102];
    return 'rgb(' + dark.map((v, i) => Math.round(v + strength * (bright[i] - v))).join(',') + ')';
  }
  function project(x, y, z) {
    const h = x * Math.cos(azimuth) + y * Math.sin(azimuth);
    return [
      -x * Math.sin(azimuth) + y * Math.cos(azimuth),
      h * Math.sin(elevation) - z * Math.cos(elevation),
      h * Math.cos(elevation) + z * Math.sin(elevation)
    ];
  }
  function draw() {
    if (!model || !forces || results.hidden) return;
    const factor = 158 * zoom / radius;
    const points = model.nodes.map(p => {
      const [x,y,depth] = project(p[0]-center[0], p[1]-center[1], p[2]-center[2]);
      return [280 + factor*x, 179 + factor*y, depth];
    });
    const shapes = [];
    model.members.forEach(([i,j], k) => {
      const a = points[i-1], b = points[j-1];
      const coords = {x1:a[0], y1:a[1], x2:b[0], y2:b[1]};
      const group = svg('g', {'data-index':k});
      if (k === memberIndex) group.append(svg('line', {...coords, stroke:'#fff6b3', 'stroke-width':7.5}));
      group.append(svg('line', {...coords, stroke:lineColor(forces[k]), 'stroke-width':3.2,'stroke-linecap':'round'}));
      group.append(svg('line', {...coords, stroke:'transparent','stroke-width':10,'pointer-events':'stroke'}));
      shapes.push({depth:(a[2]+b[2])/2, element:group});
    });
    const supports = new Set(model.supports);
    points.forEach(([x,y,depth], i) => {
      const supported = supports.has(i+1);
      const node = supported ? svg('rect',{x:x-3.3,y:y-3.3,width:6.6,height:6.6,fill:'#102c26',stroke:'#bdedab','stroke-width':1.5}) :
        svg('circle',{cx:x,cy:y,r:1.85,fill:'#cedbe3'});
      node.setAttribute('pointer-events','none');
      shapes.push({depth,element:node});
    });
    const axes = svg('g', {'pointer-events':'none', direction:'ltr'});
    [[1,0,0,'X','#ffab9d'],[0,1,0,'Y','#aee7ab'],[0,0,1,'Z','#a2cfff']].forEach(([x,y,z,name,color]) => {
      const [u,v] = project(x,y,z);
      axes.append(svg('line',{x1:46,y1:320,x2:46+24*u,y2:320+24*v,stroke:color,'stroke-width':1.5}));
      const text = svg('text',{x:46+34*u,y:324+34*v,fill:color,'font-size':12,'text-anchor':'middle'});
      text.textContent = name;
      axes.append(text);
    });
    scene.replaceChildren(...shapes.sort((a,b)=>a.depth-b.depth).map(s=>s.element), axes);
  }

  function inspect() {
    const value = forces[memberIndex], sign = forceSign(value);
    const [i,j] = model.members[memberIndex];
    const entries = [
      [tr('Axial force','نیروی محوری'), forceText(value), 'ltr'],
      [tr('Member state','وضعیت عضو'), sign === 0 ? tr('Near zero','نزدیک صفر') : sign > 0 ? tr('Tension','کشش') : tr('Compression','فشار')],
      [tr('End nodes','گره‌های ابتدا و انتها'), f(i) + ' → ' + f(j), 'ltr'],
      [tr('Section area','مساحت مقطع'), f(design.groupAreas[model.groups[memberIndex]-1]) + ' in²', 'ltr']
    ];
    byId('force-inspection').replaceChildren(...entries.map(([title,value,dir]) => {
      const card = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = title; dd.textContent = value;
      if (dir) dd.dir = dir;
      card.append(dt,dd);
      return card;
    }));
    member.value = String(memberIndex);
    draw();
  }
  function updateLanguageLink() {
    const link = document.querySelector('.language');
    const params = new URLSearchParams(link.hash.slice(1));
    params.set('seed',run.value); params.set('case',loadCase.value); params.set('unit',unit.value);
    params.set('member',member.value);
    link.hash = params.toString();
  }
  function loadForces(preferredMember) {
    const row = selection.runs.find(r => r.seed === run.value);
    design = model.designs[row.best_indices];
    forces = design?.cases[Number(loadCase.value)];
    if (!forces || forces.length !== model.members.length || !forces.every(Number.isFinite)) { failed(); return; }
    peak = Math.max(...forces.map(Math.abs));
    memberIndex = preferredMember !== null && preferredMember !== undefined && Number.isInteger(+preferredMember) &&
      +preferredMember >= 0 && +preferredMember < forces.length ? +preferredMember : forces.findIndex(v=>Math.abs(v)===peak);
    results.hidden = false;
    status.textContent = tr('Largest absolute force in this case','بیشترین قدرمطلق نیرو در این حالت بار') + ' · ' + f(scaled(peak)) + ' ' + unit.value;
    inspect();
    updateLanguageLink();
  }
  function refresh() {
    if (!selection || !dataset) return;
    try {
      const next = dataset.models[selection.model];
      if (next !== model) resetCamera();
      model = next;
      center = [0,1,2].map(axis => {
        const coords=model.nodes.map(p=>p[axis]);
        return (Math.min(...coords)+Math.max(...coords))/2;
      });
      radius = Math.max(...model.nodes.map(p=>Math.hypot(...p.map((v,i)=>v-center[i]))));
      const ranked = [...selection.runs].sort((a,b)=>Number(a.weight)-Number(b.weight) || Number(a.seed)-Number(b.seed));
      options(run, ranked.map(r=>[r.seed, f(r.seed).replace(/[٬,]/g,'') + ' · ' + f(r.weight) + ' lbf']));
      options(loadCase, loadLabels[selection.model].map((text,i)=>[String(i),text]));
      options(member, model.members.map((_,i)=>[String(i),f(i+1)]));
      if (restoreInitial) {
        for (const [select,key] of [[run,'seed'],[loadCase,'case'],[unit,'unit']]) {
          if ([...select.options].some(o=>o.value===initial.get(key))) select.value = initial.get(key);
        }
      }
      run.disabled = loadCase.disabled = false;
      loadForces(restoreInitial ? initial.get('member') : null);
      restoreInitial = false;
    } catch { failed(); }
  }
  run.onchange = loadCase.onchange = () => loadForces(null);
  unit.onchange = () => loadForces(memberIndex);
  member.onchange = () => { memberIndex = +member.value; inspect(); updateLanguageLink(); };

  scene.addEventListener('pointerdown', event => {
    if (gesture || event.button !== 0) return;
    const hit = event.target.closest('[data-index]');
    gesture = {id:event.pointerId,x:event.clientX,y:event.clientY,azimuth,elevation,hit,dragged:false};
    scene.setPointerCapture(event.pointerId);
  });
  scene.addEventListener('pointermove', event => {
    if (event.pointerId !== gesture?.id) return;
    const dx=event.clientX-gesture.x, dy=event.clientY-gesture.y;
    if (Math.hypot(dx,dy) < 4 && !gesture.dragged) return;
    gesture.dragged=true;
    azimuth=gesture.azimuth-dx*.009;
    elevation=Math.max(-1.52,Math.min(1.52,gesture.elevation+dy*.009));
    draw();
  });
  scene.addEventListener('pointerup', event => {
    if (event.pointerId !== gesture?.id) return;
    if (!gesture.dragged && gesture.hit) {
      memberIndex=Number(gesture.hit.getAttribute('data-index'));
      inspect(); updateLanguageLink();
    }
    gesture=null;
  });
  scene.addEventListener('lostpointercapture',()=>{gesture=null;});
  document.querySelector('.force-toolbar').addEventListener('click',event=>{
    const action=event.target.closest('button')?.dataset.camera;
    if (action==='reset') resetCamera();
    if (action==='left') azimuth-=Math.PI/12;
    if (action==='right') azimuth+=Math.PI/12;
    if (action==='in') zoom=Math.min(3,zoom*1.2);
    if (action==='out') zoom=Math.max(.55,zoom/1.2);
    draw();
  });

  document.addEventListener('truss-selection',event=>{selection=event.detail;refresh();});
  document.addEventListener('truss-unavailable',()=>{selection=null;failed();});
  fetch('member-forces.json').then(response=>{
    if (!response.ok) throw Error();
    return response.json();
  }).then(data=>{
    if (data.source_commit !== '723bdc81d198a7895ce5401c083620c709897307') throw Error();
    dataset=data;
    refresh();
  }).catch(failed);
})();
