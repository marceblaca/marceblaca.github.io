// ImportAuto - script.js
(() => {
  // Helpers
  const $ = id => document.getElementById(id);
  const fmtUSD = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const fmtCRC = (v) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(v);
  const safeNum = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

  // Elements
  const vehiculo = $('vehiculo');
  const tipoCambio = $('tipoCambio');
  const tasaImpuesto = $('tasaImpuesto');
  const flete = $('flete');
  const seguro = $('seguro');
  const otros = $('otros');

  const calcularBtn = $('calcularBtn');
  const copiarBtn = $('copiarBtn');
  const descargarBtn = $('descargarBtn');
  const printBtn = $('printBtn');

  const baseUSDel = $('baseUSD');
  const impuestosPorcEl = $('impuestosPorc');
  const impuestosUSDel = $('impuestosUSD');
  const gastosAdicionalesUSDel = $('gastosAdicionalesUSD');
  const totalUSDEl = $('totalUSD');
  const totalCRCE = $('totalCRC');
  const detalleEl = $('detalle');
  const mensajeEl = $('mensaje');

  const presetNameEl = $('presetName');
  const savePresetBtn = $('savePreset');
  const presetSelect = $('presetSelect');
  const loadPresetBtn = $('loadPreset');
  const deletePresetBtn = $('deletePreset');
  const resetPresetsBtn = $('resetPresets');

  // Theme
  const themeToggle = $('themeToggle');
  const root = document.documentElement;
  const THEME_KEY = 'importauto_theme';
  const PRESETS_KEY = 'importauto_presets';

  function applyTheme(t) {
    if (t === 'dark') {
      root.setAttribute('data-theme', 'dark');
      themeToggle.checked = true;
    } else {
      root.removeAttribute('data-theme');
      themeToggle.checked = false;
    }
    localStorage.setItem(THEME_KEY, t);
  }

  themeToggle.addEventListener('change', () => {
    applyTheme(themeToggle.checked ? 'dark' : 'light');
  });

  // Load theme
  const savedTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);

  // Calculation
  function calcular(e) {
    if (e) e.preventDefault();
    mensajeEl.textContent = '';
    // Read values
    const vVeh = safeNum(vehiculo.value);
    const vTipo = safeNum(tipoCambio.value);
    const vTasa = safeNum(tasaImpuesto.value);
    const vFlete = safeNum(flete.value);
    const vSeguro = safeNum(seguro.value);
    const vOtros = safeNum(otros.value);

    // Validation
    if (vVeh <= 0) {
      mensajeEl.textContent = 'Ingresa un valor del vehículo mayor que 0.';
      vehiculo.focus();
      return;
    }
    if (vTipo <= 0) {
      mensajeEl.textContent = 'Ingresa un tipo de cambio válido mayor que 0.';
      tipoCambio.focus();
      return;
    }

    // Base imponible: en este ejemplo consideramos base = valor vehículo + flete + seguro + otros
    const base = vVeh + vFlete + vSeguro + vOtros;
    const impuestos = base * (vTasa / 100);
    const gastosAdicionales = vFlete + vSeguro + vOtros;
    const totalUSD = base + impuestos;
    const totalCRC = totalUSD * vTipo;

    // Update UI
    baseUSDel.textContent = fmtUSD(base);
    impuestosPorcEl.textContent = `${Number(vTasa).toLocaleString()} %`;
    impuestosUSDel.textContent = fmtUSD(impuestos);
    gastosAdicionalesUSDel.textContent = fmtUSD(gastosAdicionales);
    totalUSDEl.textContent = fmtUSD(totalUSD);
    totalCRCE.textContent = fmtCRC(Math.round(totalCRC));

    // Detalle
    detalleEl.textContent = [
      `Valor vehículo: ${fmtUSD(vVeh)}`,
      `Flete: ${fmtUSD(vFlete)}`,
      `Seguro: ${fmtUSD(vSeguro)}`,
      `Otros: ${fmtUSD(vOtros)}`,
      `Base imponible (USD): ${fmtUSD(base)}`,
      `Impuestos (${vTasa}%): ${fmtUSD(impuestos)}`,
      `Total (USD): ${fmtUSD(totalUSD)}`,
      `Tipo de cambio: ${vTipo.toLocaleString()} CRC/USD`,
      `Total (CRC): ${fmtCRC(Math.round(totalCRC))}`
    ].join('\n');

    // Make copyable data available
    copiarBtn.disabled = false;
    descargarBtn.disabled = false;
  }

  // Events
  calcularBtn.addEventListener('click', calcular);

  // Allow Enter key to calculate when inside inputs
  [vehiculo, tipoCambio, tasaImpuesto, flete, seguro, otros].forEach(el => {
    el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        calcular();
      }
    });
  });

  // Copy results
  copiarBtn.addEventListener('click', () => {
    const text = detalleEl.textContent.trim();
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      mensajeEl.textContent = 'Resultados copiados al portapapeles.';
      setTimeout(() => mensajeEl.textContent = '', 2500);
    }).catch(() => {
      mensajeEl.textContent = 'No se pudo copiar — tu navegador no lo permite.';
    });
  });

  // Download CSV
  descargarBtn.addEventListener('click', () => {
    const rows = [
      ['Campo', 'Valor'],
      ['Valor vehículo (USD)', vehiculo.value || 0],
      ['Tipo de cambio (CRC/USD)', tipoCambio.value || 0],
      ['Impuestos (%)', tasaImpuesto.value || 0],
      ['Flete (USD)', flete.value || 0],
      ['Seguro (USD)', seguro.value || 0],
      ['Otros (USD)', otros.value || 0],
      ['', ''],
      ['Detalle', detalleEl.textContent || '']
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `importauto_resultados_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Print
  printBtn.addEventListener('click', () => window.print());

  // Presets (localStorage)
  function loadPresets() {
    const raw = localStorage.getItem(PRESETS_KEY);
    let obj = {};
    try { obj = raw ? JSON.parse(raw) : {}; } catch(e){ obj = {}; }
    // Populate select
    presetSelect.innerHTML = '<option value="">— Selecciona —</option>';
    Object.keys(obj).forEach(k => {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = k;
      presetSelect.appendChild(opt);
    });
    return obj;
  }

  function savePresets(p) { localStorage.setItem(PRESETS_KEY, JSON.stringify(p)); }

  savePresetBtn.addEventListener('click', () => {
    const name = presetNameEl.value?.trim();
    if (!name) { mensajeEl.textContent = 'Dale un nombre al preset.'; return; }
    const presets = loadPresets();
    presets[name] = {
      veh: vehiculo.value || 0,
      tipo: tipoCambio.value || 0,
      tasa: tasaImpuesto.value || 0,
      flete: flete.value || 0,
      seguro: seguro.value || 0,
      otros: otros.value || 0
    };
    savePresets(presets);
    presetNameEl.value = '';
    loadPresets();
    mensajeEl.textContent = `Preset "${name}" guardado.`;
    setTimeout(()=>mensajeEl.textContent='',2000);
  });

  loadPresetBtn.addEventListener('click', () => {
    const name = presetSelect.value;
    if (!name) { mensajeEl.textContent = 'Selecciona un preset para cargar.'; return; }
    const presets = loadPresets();
    const p = presets[name];
    if (!p) { mensajeEl.textContent = 'Preset no encontrado.'; return; }
    vehiculo.value = p.veh;
    tipoCambio.value = p.tipo;
    tasaImpuesto.value = p.tasa;
    flete.value = p.flete;
    seguro.value = p.seguro;
    otros.value = p.otros;
    mensajeEl.textContent = `Preset "${name}" cargado.`;
    setTimeout(()=>mensajeEl.textContent='',2000);
  });

  deletePresetBtn.addEventListener('click', () => {
    const name = presetSelect.value;
    if (!name) { mensajeEl.textContent = 'Selecciona un preset para eliminar.'; return; }
    const presets = loadPresets();
    if (!presets[name]) { mensajeEl.textContent = 'Preset no encontrado.'; return; }
    delete presets[name];
    savePresets(presets);
    loadPresets();
    mensajeEl.textContent = `Preset "${name}" eliminado.`;
    setTimeout(()=>mensajeEl.textContent='',2000);
  });

  resetPresetsBtn.addEventListener('click', () => {
    if (!confirm('Eliminar todos los presets guardados?')) return;
    localStorage.removeItem(PRESETS_KEY);
    loadPresets();
    mensajeEl.textContent = 'Presets eliminados.';
    setTimeout(()=>mensajeEl.textContent='',2000);
  });

  // Initialize
  function init() {
    // Disable copy/download until calculation
    copiarBtn.disabled = true;
    descargarBtn.disabled = true;
    // Load presets
    loadPresets();
  }

  init();

  // Expose for debugging (optional)
  window.ImportAuto = {
    calcular, loadPresets
  };
})();
