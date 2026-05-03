/**
 * calculadHora - Calendario de horas
 * Vanilla JS · LocalStorage · Dark Bento UI
 */

// ─── Configuración de meses ───────────────────────────────────────────────────
const MONTHS = [
  {
    key: 'ene2026',
    name: 'Enero',
    year: 2026,
    month: 0,          // 0-indexed: enero = 0
    totalDays: 31,     // 2026 no es bisiesto
  },
  {
    key: 'feb2026',
    name: 'Febrero',
    year: 2026,
    month: 1,          // 0-indexed: enero = 0
    totalDays: 28,     // 2026 no es bisiesto
  },
  {
    key: 'mar2026',
    name: 'Marzo',
    year: 2026,
    month: 2,
    totalDays: 31,
  },
  {
    key: 'abr2026',
    name: 'Abril',
    year: 2026,
    month: 3,
    totalDays: 30,
  },
  {
    key: 'may2026',
    name: 'Mayo',
    year: 2026,
    month: 4,
    totalDays: 31,
  },
  {
    key: 'jun2026',
    name: 'Junio',
    year: 2026,
    month: 5,
    totalDays: 30,
  },
  {
    key: 'jul2026',
    name: 'Julio',
    year: 2026,
    month: 6,
    totalDays: 31,
  },
  {
    key: 'ago2026',
    name: 'Agosto',
    year: 2026,
    month: 7,
    totalDays: 31,
  },
  {
    key: 'sep2026',
    name: 'Septiembre',
    year: 2026,
    month: 8,
    totalDays: 30,
  },
  {
    key: 'oct2026',
    name: 'Octubre',
    year: 2026,
    month: 9,
    totalDays: 31,
  },
  {
    key: 'nov2026',
    name: 'Noviembre',
    year: 2026,
    month: 10,
    totalDays: 30,
  },
  {
    key: 'dic2026',
    name: 'Diciembre',
    year: 2026,
    month: 11,
    totalDays: 31,
  },
];

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const LS_PREFIX = 'calculadHora_';   // Prefijo para LocalStorage

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
    const cell = buildDayCell(key, day);
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
  btnCapture.innerHTML = '<i class="fa-solid fa-camera"></i> Captura';
  btnCapture.addEventListener('click', () => captureCard(card, name, year));

  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn-delete';
  btnDelete.setAttribute('aria-label', `Borrar registros de ${name}`);
  btnDelete.innerHTML = '<i class="fa-solid fa-trash-can"></i> Borrar';
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
 * @param {string} monthKey  - Clave del mes (ej: 'feb2026')
 * @param {number} day       - Número del día
 */
function buildDayCell(monthKey, day) {
  const cell = document.createElement('div');
  cell.className = 'day-cell';
  cell.setAttribute('role', 'button');
  cell.setAttribute('tabindex', '0');
  cell.setAttribute('aria-label', `Día ${day}`);
  cell.dataset.month = monthKey;
  cell.dataset.day = day;

  // Número del día (pequeño, decorativo)
  const dayNum = document.createElement('span');
  dayNum.className = 'day-number';
  dayNum.textContent = day;
  cell.appendChild(dayNum);

  // Valor del usuario
  const dayVal = document.createElement('span');
  dayVal.className = 'day-value';
  cell.appendChild(dayVal);

  // Cargar desde LocalStorage
  const stored = getValue(monthKey, day);
  if (stored !== null) {
    dayVal.textContent = stored;
    cell.classList.add('has-value');
  }

  // Eventos
  cell.addEventListener('click', () => openModal(monthKey, day, cell));
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(monthKey, day, cell);
    }
  });

  return cell;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const overlay  = document.getElementById('modalOverlay');
const modalInput = document.getElementById('modalInput');
const modalLabel = document.getElementById('modalLabel');
const btnSave  = document.getElementById('modalSave');
const btnClear = document.getElementById('modalClear');
const btnClose = document.getElementById('modalClose');

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
  overlay.classList.add('open');
  // Foco con pequeño delay para que la transición sea suave
  setTimeout(() => modalInput.focus(), 120);
}

/** Cierra el modal sin guardar. */
function closeModal() {
  overlay.classList.remove('open');
  activeCell = null;
  modalInput.value = '';
}

/** Guarda el valor del modal en la celda y en LocalStorage. */
function saveModal() {
  if (!activeCell) return;

  const { monthKey, day, element } = activeCell;
  const rawValue = modalInput.value.trim();
  const valEl = element.querySelector('.day-value');

  // Guardar en LS
  setValue(monthKey, day, rawValue);

  // Actualizar DOM
  valEl.textContent = rawValue;

  if (rawValue !== '') {
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
    element.classList.remove('has-value');
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
    element.classList.remove('has-value');
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

  resultEl.innerHTML =
    `<i class="fa-regular fa-clock"></i> ${formattedHours} hs` +
    `<span class="result-divider">·</span>` +
    `<i class="fa-solid fa-dollar-sign"></i> ${formattedPayment}`;

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

// ─── Event Listeners del Modal ────────────────────────────────────────────────

btnSave.addEventListener('click', saveModal);
btnClear.addEventListener('click', clearModal);
btnClose.addEventListener('click', closeModal);

// Guardar con Enter dentro del input
modalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveModal();
  if (e.key === 'Escape') closeModal();
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
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

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
    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Guardado!';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-camera"></i> Captura';
    }, 2000);
  }).catch(() => {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-camera"></i> Captura';
  });
}

// ─── Inicialización ───────────────────────────────────────────────────────────

/**
 * Construye todos los calendarios y los inserta en el DOM.
 */
function init() {
  const wrapper = document.getElementById('calendarWrapper');
  const rateInput = document.getElementById('globalHourlyRate');

  // Cargar tarifa guardada
  const savedRate = localStorage.getItem(`${LS_PREFIX}global_rate`);
  if (savedRate) {
    rateInput.value = savedRate;
  }

  MONTHS.forEach(monthConfig => {
    const card = buildMonthCard(monthConfig);
    wrapper.appendChild(card);
  });

  // Escuchar cambios en la tarifa para guardar
  rateInput.addEventListener('change', () => {
    localStorage.setItem(`${LS_PREFIX}global_rate`, rateInput.value);
  });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
