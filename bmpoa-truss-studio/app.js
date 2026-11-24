const benchmark = document.querySelector('#benchmark');
const variant = document.querySelector('#variant');
const persian = document.documentElement.lang === 'fa';
const label = (en, fa) => persian ? fa : en;
const numbers = new Intl.NumberFormat(persian ? 'fa-IR' : 'en-US', {maximumFractionDigits: 3});
const format = value => numbers.format(value);
let rows = [];

function stats(weights) {
  const sorted = [...weights].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, weight) => sum + weight, 0) / sorted.length;
  const variance = sorted.reduce((sum, weight) => sum + (weight - mean) ** 2, 0) / (sorted.length - 1);
  return {mean, median: sorted[Math.floor(sorted.length / 2)], deviation: Math.sqrt(variance)};
}

function render() {
  const modelRows = rows.filter(row => row.benchmark === benchmark.value + '-steel-dynamic-discrete');
  const selected = modelRows.filter(row => row.algorithm === variant.value);
  const summary = stats(selected.map(row => Number(row.weight)));
  const run = selected[0];
  const cards = [
    [label('Feasibility', 'اجراهای دارای طرح مجاز'), label('5/5', '۵ از ۵')],
    [label('Max violation', 'بیشترین نقض قیود'), format(0)],
    [label('Mean weight (lbf)', 'میانگین وزن (پوند‌نیرو)'), format(summary.mean)],
    [label('Median weight (lbf)', 'میانهٔ وزن (پوند‌نیرو)'), format(summary.median)],
    [label('Std. dev. (lbf)', 'انحراف معیار وزن (پوند‌نیرو)'), format(summary.deviation)],
    [label('Evaluator / modal', 'فراخوانی ارزیاب / حل مودال'), format(run.evaluator_calls) + ' / ' + format(run.modal_solves)],
    [label('Static load-case solves', 'تعداد حل‌های استاتیکی برای حالت‌های بارگذاری'), format(run.static_load_case_solves)]
  ];
  document.querySelector('#cards').innerHTML = cards.map(([title, value]) =>
    '<div class="card"><small>' + title + '</small><b>' + value + '</b></div>'
  ).join('');
  const algorithms = [...new Set(modelRows.map(row => row.algorithm))];
  const means = algorithms.map(algorithm => stats(modelRows.filter(row => row.algorithm === algorithm).map(row => +row.weight)).mean);
  const maximum = Math.max(...means);
  document.querySelector('#bars').innerHTML = algorithms.map((algorithm, i) =>
    '<div class="barrow"><div class="barlabel"><bdi dir="ltr">' + algorithm + '</bdi><span>' +
    format(means[i]) + label(' lbf', ' پوند‌نیرو') + '</span></div><div class="track"><div class="fill" style="width:' +
    (100 * means[i] / maximum) + '%"></div></div></div>'
  ).join('');
  const filters = new URLSearchParams({benchmark: benchmark.value, variant: variant.value});
  const languageLink = document.querySelector('.language');
  languageLink.hash = filters.toString();
  document.dispatchEvent(new CustomEvent("truss-selection", {detail: {model: benchmark.value, runs: selected}}));
}

function validate(data) {
  const keys = new Set();
  if (data.source_commit !== '723bdc81d198a7895ce5401c083620c709897307' || data.rows.length !== 40) {
    throw Error('Unexpected dataset');
  }
  for (const row of data.rows) {
    const key = [row.benchmark, row.algorithm, row.seed].join('|');
    if (keys.has(key) || !['72-bar-steel-dynamic-discrete', '120-bar-steel-dynamic-discrete'].includes(row.benchmark) ||
        !['BMPOA-core', 'BMPOA-DiscreteLS', 'BMPOA-QIO', 'BMPOA-DiscreteLS-QIO'].includes(row.algorithm) ||
        ![2026, 2027, 2028, 2029, 2030].includes(+row.seed) || +row.evaluator_calls !== 35070 ||
        +row.modal_solves !== 35070 || row.feasible !== '1' || +row.violation !== 0 || !Number.isFinite(+row.weight)) {
      throw Error('Invalid run');
    }
    keys.add(key);
  }
}

async function start() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw Error('Data unavailable');
    const data = await response.json();
    validate(data);
    rows = data.rows;
    const filters = new URLSearchParams(location.hash.slice(1));
    for (const select of [benchmark, variant]) {
      const value = filters.get(select.id);
      if ([...select.options].some(option => option.value === value)) select.value = value;
      select.disabled = false;
    }
    document.querySelector('.badge').innerHTML = label('40/40<br><small>validated runs</small>', '۴۰ از ۴۰<br><small>اجرای اعتبارسنجی‌شده</small>');
    render();
  } catch {
    document.querySelector('#cards').textContent = label('Validated data unavailable. Reconnect and reload.', 'داده‌های اعتبارسنجی‌شده در دسترس نیستند. اتصال اینترنت را بررسی کنید و صفحه را دوباره باز کنید.');
    document.querySelector('.badge').textContent = label('Unavailable', 'داده در دسترس نیست');
    document.dispatchEvent(new Event('truss-unavailable'));
  }
}

function networkStatus() {
  document.querySelector('#net').textContent = navigator.onLine ? label('● online', '● آنلاین') : label('● offline', '● آفلاین');
}

benchmark.onchange = variant.onchange = render;
benchmark.disabled = variant.disabled = true;
addEventListener('online', networkStatus);
addEventListener('offline', networkStatus);
networkStatus();
start();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    document.querySelector('#net').textContent = label('Offline storage unavailable', 'ذخیره‌سازی آفلاین در دسترس نیست');
  });
}
