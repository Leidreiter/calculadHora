/**
 * calculadHora - Calendario de horas
 * Vanilla JS · LocalStorage · Dark Bento UI
 */

// ─── Configuración de meses ───────────────────────────────────────────────────
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MONTH_KEYS  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
let currentYear = 2026;

function buildMonths(year) {
  return Array.from({ length: 12 }, (_, i) => ({
    key: `${MONTH_KEYS[i]}${year}`,
    name: MONTH_NAMES[i],
    year: year,
    month: i,
    totalDays: new Date(year, i + 1, 0).getDate(),
  }));
}

let MONTHS = buildMonths(currentYear);

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const LS_PREFIX = 'calculadHora_';   // Prefijo para LocalStorage

const CURRENCIES = {
  USD: { symbol: 'US$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'es-ES' },
  ARS: { symbol: '$', locale: 'es-AR' },
  BRL: { symbol: 'R$', locale: 'pt-BR' },
  CLP: { symbol: '$', locale: 'es-CL' },
  COP: { symbol: '$', locale: 'es-CO' },
  MXN: { symbol: '$', locale: 'es-MX' },
  PEN: { symbol: 'S/', locale: 'es-PE' },
  UYU: { symbol: '$', locale: 'es-UY' },
  VES: { symbol: 'Bs.', locale: 'es-VE' },
};

// ─── Estado global del modal ──────────────────────────────────────────────────
let activeCell = null;  // { monthKey, day, element }

// ─── Utilidades LocalStorage ──────────────────────────────────────────────────

/** Lee el valor guardado para un día. Devuelve string o null. */
function getValue(monthKey, day) {
  return localStorage.getItem(`${LS_PREFIX}${monthKey}_${day}`);
}

/** Guarda un valor para un día. Si value es vacío, elimina la clave. */
function setValue(monthKey, day, value) {
  const key = `${LS_PREFIX}${monthKey}_${day}`;
  if (value === '' || value === null || value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
}

// ─── Construcción del DOM ─────────────────────────────────────────────────────

/**
 * Crea y devuelve el elemento de tarjeta de un mes completo.
 * @param {Object} monthConfig  - Configuración del mes
 */
function buildMonthCard(monthConfig) {
  const { key, name, year, month, totalDays } = monthConfig;

  // Tarjeta contenedora
  const card = document.createElement('section');
  card.className = 'month-card';
  card.setAttribute('aria-label', `${name} ${year}`);

  // Título del mes
  const title = document.createElement('h2');
  title.className = 'month-name';
  title.textContent = `${name} ${year}`;
  card.appendChild(title);

  // Fila de etiquetas de días de la semana
  const weekdaysRow = document.createElement('div');
  weekdaysRow.className = 'weekdays';
  WEEKDAY_LABELS.forEach(label => {
    const span = document.createElement('span');
    span.className = 'weekday-label';
    span.textContent = label;
    weekdaysRow.appendChild(span);
  });
  card.appendChild(weekdaysRow);

  // Grilla de días
  const grid = document.createElement('div');
  grid.className = 'days-grid';

  // Calcular día de la semana en que cae el 1ro del mes
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Dom

  // Celdas vacías al inicio
  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell empty';
    grid.appendChild(empty);
  }

  // Celdas de días reales
  for (let day = 1; day <= totalDays; day++) {
    const cell = buildDayCell(monthConfig, day);
    grid.appendChild(cell);
  }

  card.appendChild(grid);

  // Pie: botones + resultado
  const footer = document.createElement('div');
  footer.className = 'calc-footer';

  // Grupo izquierdo de botones
  const btnGroup = document.createElement('div');
  btnGroup.className = 'calc-footer-buttons';

  const btnCalc = document.createElement('button');
  btnCalc.className = 'btn-calc';
  btnCalc.textContent = 'Calcular horas';
  btnCalc.setAttribute('aria-label', `Calcular horas de ${name}`);

  const btnCapture = document.createElement('button');
  btnCapture.className = 'btn-capture';
  btnCapture.setAttribute('aria-label', `Capturar ${name}`);
  btnCapture.innerHTML = '<i aria-hidden="true" class="fa-solid fa-camera"></i> Captura';
  btnCapture.addEventListener('click', () => captureCard(card, name, year));

  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn-delete';
  btnDelete.setAttribute('aria-label', `Borrar registros de ${name}`);
  btnDelete.innerHTML = '<i aria-hidden="true" class="fa-solid fa-trash-can"></i> Borrar';
  btnDelete.addEventListener('click', () => deleteMonth(key, totalDays, card, resultEl));

  btnGroup.appendChild(btnCalc);
  btnGroup.appendChild(btnCapture);
  btnGroup.appendChild(btnDelete);

  // Resultado (horas + monto)
  const resultEl = document.createElement('span');
  resultEl.className = 'calc-result';
  resultEl.id = `result-${key}`;
  resultEl.setAttribute('aria-live', 'polite');

  btnCalc.addEventListener('click', () => calcHours(key, totalDays, resultEl));

  footer.appendChild(btnGroup);
  footer.appendChild(resultEl);
  card.appendChild(footer);

  return card;
}

/**
 * Crea una celda individual para un día.
 * @param {Object} monthConfig  - Configuración del mes
 * @param {number} day         - Número del día
 */
function buildDayCell(monthConfig, day) {
  const { key: monthKey, year, month } = monthConfig;

  const cell = document.createElement('div');
  cell.className = 'day-cell';
  cell.setAttribute('role', 'button');
  cell.setAttribute('tabindex', '0');
  cell.setAttribute('aria-label', `Día ${day}`);
  cell.dataset.month = monthKey;
  cell.dataset.day = day;

  // Resaltar el día actual
  const today = new Date();
  if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) {
    cell.classList.add('today');
  }

  // Número del día (pequeño, decorativo)
  const dayNum = document.createElement('span');
  dayNum.className = 'day-number';
  dayNum.textContent = day;
  dayNum.setAttribute('aria-hidden', 'true');
  cell.appendChild(dayNum);

  // Valor del usuario
  const dayVal = document.createElement('span');
  dayVal.className = 'day-value';
  cell.appendChild(dayVal);

  // Cargar desde LocalStorage
  const stored = getValue(monthKey, day);
  if (stored !== null) {
    if (stored === 'LIBRE') {
      dayVal.innerHTML = '<i aria-hidden="true" class="fa-solid fa-moon"></i>';
      cell.classList.add('is-libre');
    } else {
      dayVal.textContent = stored;
      cell.classList.add('has-value');
    }
  }

  // Eventos
  cell.addEventListener('click', () => openModal(monthKey, day, cell));
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(monthKey, day, cell);
      return;
    }

    // Navegación con flechas
    const grid = cell.closest('.days-grid');
    if (!grid) return;
    const currentDay = parseInt(cell.dataset.day);
    let targetDay;

    switch (e.key) {
      case 'ArrowLeft':  targetDay = currentDay - 1; break;
      case 'ArrowRight': targetDay = currentDay + 1; break;
      case 'ArrowUp':    targetDay = currentDay - 7; break;
      case 'ArrowDown':  targetDay = currentDay + 7; break;
      default: return;
    }

    e.preventDefault();
    const targetCell = grid.querySelector(`.day-cell:not(.empty)[data-day="${targetDay}"]`);
    if (targetCell) targetCell.focus();
  });

  return cell;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const overlay  = document.getElementById('modalOverlay');
const modalInput = document.getElementById('modalInput');
const modalLabel = document.getElementById('modalLabel');
const modalBox = document.getElementById('modalBox');
const btnSave  = document.getElementById('modalSave');
const btnClear = document.getElementById('modalClear');
const btnClose = document.getElementById('modalClose');
const btnLibre = document.getElementById('modalLibre');

/**
 * Abre el modal para editar un día.
 */
function openModal(monthKey, day, cellEl) {
  const stored = getValue(monthKey, day);
  activeCell = { monthKey, day, element: cellEl };

  // Obtener nombre del mes para el label
  const mConfig = MONTHS.find(m => m.key === monthKey);
  modalLabel.textContent = `${mConfig.name} ${day} — horas trabajadas`;

  modalInput.value = stored !== null ? stored : '';
  modalInput.style.borderColor = '';
  modalInput.style.boxShadow = '';
  overlay.classList.add('open');
  // Foco con pequeño delay para que la transición sea suave
  setTimeout(() => modalInput.focus(), 120);
  // Enfocar el primer elemento accesible del modal
  setTimeout(() => trapFocus(modalBox), 130);
}

/** Cierra el modal sin guardar. */
function closeModal() {
  overlay.classList.remove('open');
  activeCell = null;
  modalInput.value = '';
  releaseFocusTrap();
}

/** Guarda el valor del modal en la celda y en LocalStorage. */
function saveModal() {
  if (!activeCell) return;

  const { monthKey, day, element } = activeCell;
  const rawValue = modalInput.value.trim();
  const valEl = element.querySelector('.day-value');

  // Validar que no exceda 24 horas
  const num = parseFloat(rawValue);
  if (rawValue !== '' && !isNaN(num) && num > 24) {
    modalInput.style.borderColor = '#f87171';
    modalInput.style.boxShadow = '0 0 20px rgba(248, 113, 113, 0.3)';
    modalInput.focus();
    setTimeout(() => {
      modalInput.style.borderColor = '';
      modalInput.style.boxShadow = '';
    }, 1200);
    return;
  }

  // Guardar en LS
  setValue(monthKey, day, rawValue);

  // Actualizar DOM
  valEl.textContent = rawValue;

  if (rawValue !== '') {
    element.classList.remove('is-libre');
    element.classList.add('has-value');
    // Animación bounce en el valor
    valEl.classList.remove('animate');
    // Forzar reflow para reiniciar la animación
    void valEl.offsetWidth;
    valEl.classList.add('animate');

    // Flash en la celda
    element.classList.remove('flash');
    void element.offsetWidth;
    element.classList.add('flash');

    // Limpiar clases de animación al terminar
    valEl.addEventListener('animationend', () => valEl.classList.remove('animate'), { once: true });
    element.addEventListener('animationend', () => element.classList.remove('flash'), { once: true });
  } else {
    element.classList.remove('is-libre', 'has-value');
    valEl.textContent = '';
  }

  closeModal();
}

/** Borra el valor del día. */
function clearModal() {
  modalInput.value = '';
  // Guardar como vacío (borra de LS) y actualizar celda
  if (activeCell) {
    const { monthKey, day, element } = activeCell;
    setValue(monthKey, day, '');
    const valEl = element.querySelector('.day-value');
    valEl.textContent = '';
    element.classList.remove('is-libre', 'has-value');
  }
  closeModal();
}

// ─── Cálculo de horas ─────────────────────────────────────────────────────────

/**
 * Suma todos los valores del mes y muestra el resultado.
 * @param {string} monthKey
 * @param {number} totalDays
 * @param {HTMLElement} resultEl - Elemento donde mostrar el resultado
 */
function calcHours(monthKey, totalDays, resultEl) {
  let total = 0;

  for (let day = 1; day <= totalDays; day++) {
    const val = getValue(monthKey, day);
    if (val !== null && val.trim() !== '') {
      const num = parseFloat(val);
      if (!isNaN(num)) total += num;
    }
  }

  // Obtener tarifa actual del input
  const currentRate = parseFloat(document.getElementById('globalHourlyRate').value) || 0;

  // Formatear resultado (hasta 2 decimales si es necesario)
  const formattedHours = Number.isInteger(total) ? total : total.toFixed(2);
  const payment = total * currentRate;
  const formattedPayment = Number.isInteger(payment) ? payment : payment.toFixed(2);
  const currencySymbol = CURRENCIES[document.getElementById('currencySelect').value]?.symbol || '$';

  resultEl.innerHTML =
    `<i aria-hidden="true" class="fa-regular fa-clock"></i> ${formattedHours} hs` +
    `<span class="result-divider" aria-hidden="true">·</span>` +
    `<i aria-hidden="true" class="fa-solid fa-dollar-sign"></i> ${currencySymbol} ${formattedPayment}`;

  // Mostrar con transición
  resultEl.classList.remove('visible');
  void resultEl.offsetWidth;
  resultEl.classList.add('visible');
}

// ─── Borrar registros de un mes ───────────────────────────────────────────────

/**
 * Borra todos los registros de un mes del LocalStorage y resetea las celdas.
 */
function deleteMonth(monthKey, totalDays, cardEl, resultEl) {
  if (!confirm('¿Estás seguro de que querés borrar todos los registros de este mes?')) return;

  // Borrar del LocalStorage
  for (let day = 1; day <= totalDays; day++) {
    setValue(monthKey, day, '');
  }

  // Resetear celdas en el DOM
  const cells = cardEl.querySelectorAll('.day-cell:not(.empty)');
  cells.forEach(cell => {
    const valEl = cell.querySelector('.day-value');
    if (valEl) valEl.textContent = '';
    cell.classList.remove('has-value');
  });

  // Ocultar resultado
  resultEl.classList.remove('visible');
  resultEl.innerHTML = '';
}

// ─── Exportación de datos ──────────────────────────────────────────────────────

function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(LS_PREFIX)) {
      data[key] = localStorage.getItem(key);
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calculadhora_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Importación de datos ──────────────────────────────────────────────────────

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      let count = 0;
      Object.keys(data).forEach(key => {
        if (key.startsWith(LS_PREFIX)) {
          localStorage.setItem(key, data[key]);
          count++;
        }
      });
      alert(`Se importaron ${count} registros correctamente. La página se recargará para reflejar los cambios.`);
      location.reload();
    } catch {
      alert('Error al importar: el archivo no tiene un formato válido.');
    }
  };
  reader.readAsText(file);
}

// ─── Resumen anual ─────────────────────────────────────────────────────────────

function calcAnnualSummary() {
  const rate = parseFloat(document.getElementById('globalHourlyRate').value) || 0;
  const currencySymbol = CURRENCIES[document.getElementById('currencySelect').value]?.symbol || '$';
  let totalHours = 0;

  MONTHS.forEach(month => {
    for (let day = 1; day <= month.totalDays; day++) {
      const val = getValue(month.key, day);
      if (val !== null && val.trim() !== '') {
        const num = parseFloat(val);
        if (!isNaN(num)) totalHours += num;
      }
    }
  });

  const totalPayment = totalHours * rate;
  const monthlyAvg = totalHours / MONTHS.length;

  document.getElementById('summaryHours').textContent =
    (Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(2)) + ' hs';
  document.getElementById('summaryEarnings').textContent =
    `${currencySymbol} ${Number.isInteger(totalPayment) ? totalPayment : totalPayment.toFixed(2)}`;
  document.getElementById('summaryAverage').textContent =
    (Number.isInteger(monthlyAvg) ? monthlyAvg : monthlyAvg.toFixed(2)) + ' hs';
}

// ─── Actualizar display de moneda ──────────────────────────────────────────────

function updateCurrencyDisplay() {
  const currency = document.getElementById('currencySelect').value;
  const symbol = CURRENCIES[currency]?.symbol || '$';
  document.getElementById('rateUnit').textContent = symbol;
  localStorage.setItem(`${LS_PREFIX}currency`, currency);
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

function showToast(message, duration = 2000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Marcar día como libre ──────────────────────────────────────────────────────

function saveModalLibre() {
  if (!activeCell) return;
  const { monthKey, day, element } = activeCell;
  const valEl = element.querySelector('.day-value');

  setValue(monthKey, day, 'LIBRE');
  valEl.innerHTML = '<i aria-hidden="true" class="fa-solid fa-moon"></i>';
  element.classList.remove('has-value');
  element.classList.add('is-libre');

  closeModal();
}

// ─── Focus Trap ────────────────────────────────────────────────────────────────

let focusTrapHandler = null;

function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'button, input, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (focusTrapHandler) {
    document.removeEventListener('keydown', focusTrapHandler);
  }

  focusTrapHandler = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  document.addEventListener('keydown', focusTrapHandler);
}

function releaseFocusTrap() {
  if (focusTrapHandler) {
    document.removeEventListener('keydown', focusTrapHandler);
    focusTrapHandler = null;
  }
}

// ─── Event Listeners del Modal ────────────────────────────────────────────────

btnSave.addEventListener('click', saveModal);
btnClear.addEventListener('click', clearModal);
btnClose.addEventListener('click', closeModal);
btnLibre.addEventListener('click', saveModalLibre);

// Guardar con Enter / Libre con L / Cerrar con Escape
modalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveModal();
  if (e.key === 'Escape') closeModal();
  if (e.key === 'l' || e.key === 'L') saveModalLibre();
});

// Cerrar al hacer clic fuera del modal
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

// ─── Captura de pantalla ──────────────────────────────────────────────────────

/**
 * Captura el card del mes como imagen PNG y lo descarga.
 */
function captureCard(cardEl, monthName, year) {
  const btn = cardEl.querySelector('.btn-capture');

  btn.disabled = true;
  btn.innerHTML = '<i aria-hidden="true" class="fa-solid fa-spinner fa-spin"></i> Procesando...';

  html2canvas(cardEl, {
    backgroundColor: '#161620',
    scale: 2,
    useCORS: true,
    logging: false,
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `calculadhora_${monthName.toLowerCase()}_${year}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    btn.disabled = false;
    btn.innerHTML = '<i aria-hidden="true" class="fa-solid fa-circle-check"></i> Guardado!';
    setTimeout(() => {
      btn.innerHTML = '<i aria-hidden="true" class="fa-solid fa-camera"></i> Captura';
    }, 2000);
  }).catch(() => {
    btn.disabled = false;
    btn.innerHTML = '<i aria-hidden="true" class="fa-solid fa-camera"></i> Captura';
  });
}

// ─── Cambio de año ────────────────────────────────────────────────────────────

/**
 * Reconstruye todos los calendarios para el año indicado.
 */
function rebuildCalendar(newYear) {
  currentYear = newYear;
  MONTHS = buildMonths(currentYear);

  const wrapper = document.getElementById('calendarWrapper');
  wrapper.innerHTML = '';

  MONTHS.forEach(monthConfig => {
    const card = buildMonthCard(monthConfig);
    wrapper.appendChild(card);
  });

  document.getElementById('headerYearTag').textContent = `CALENDARIO ${currentYear}`;
  document.getElementById('yearDisplay').textContent = currentYear;
  document.getElementById('yearPrev').disabled = currentYear <= 2026;

  document.getElementById('summaryHours').textContent = '0';
  document.getElementById('summaryEarnings').textContent = '$ 0';
  document.getElementById('summaryAverage').textContent = '0 hs';

  showToast(`Año ${currentYear}`);
}

// ─── Inicialización ───────────────────────────────────────────────────────────

/**
 * Construye todos los calendarios y los inserta en el DOM.
 */
function init() {
  const wrapper = document.getElementById('calendarWrapper');
  const rateInput = document.getElementById('globalHourlyRate');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const currencySelect = document.getElementById('currencySelect');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFileInput = document.getElementById('importFileInput');
  const calcSummaryBtn = document.getElementById('calcSummaryBtn');
  const yearPrev = document.getElementById('yearPrev');
  const yearNext = document.getElementById('yearNext');

  // Cargar tarifa guardada
  const savedRate = localStorage.getItem(`${LS_PREFIX}global_rate`);
  if (savedRate) {
    rateInput.value = savedRate;
  }

  // Cargar moneda guardada
  const savedCurrency = localStorage.getItem(`${LS_PREFIX}currency`);
  if (savedCurrency && CURRENCIES[savedCurrency]) {
    currencySelect.value = savedCurrency;
    updateCurrencyDisplay();
  }

  MONTHS.forEach(monthConfig => {
    const card = buildMonthCard(monthConfig);
    wrapper.appendChild(card);
  });

  // Ocultar loading spinner
  if (loadingSpinner) loadingSpinner.style.display = 'none';

  // Escuchar cambios en la tarifa para guardar
  rateInput.addEventListener('change', () => {
    localStorage.setItem(`${LS_PREFIX}global_rate`, rateInput.value);
    showToast('Tarifa guardada');
  });

  // Escuchar cambios en la moneda
  currencySelect.addEventListener('change', updateCurrencyDisplay);

  // Exportar datos
  exportBtn.addEventListener('click', exportData);

  // Importar datos
  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      importData(e.target.files[0]);
      e.target.value = '';
    }
  });

  // Calcular resumen anual
  calcSummaryBtn.addEventListener('click', calcAnnualSummary);

  // Year stepper
  yearPrev.disabled = true;

  yearPrev.addEventListener('click', () => {
    const newYear = currentYear - 1;
    if (newYear >= 2026) rebuildCalendar(newYear);
  });

  yearNext.addEventListener('click', () => {
    rebuildCalendar(currentYear + 1);
  });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
