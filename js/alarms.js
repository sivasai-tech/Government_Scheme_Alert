/*
 * ALARM MODULE — Government Scheme Notifier
 * Shake cards · Persistent looping sound · Custom alarms · Browser notifications
 */

// ─── Persistent looping alarm sound ──────────────────────────────────────────
var _alarmAudioCtx = null;
var _alarmLoopTimer = null;

function startPersistentAlarm(soundType) {
  soundType = soundType || 'urgent';
  stopPersistentAlarm();
  var patterns = {
    urgent:  [880, 1100, 880, 1100, 880, 1100],
    default: [880, 1100, 880],
    gentle:  [523, 659, 784]
  };
  var freqs = patterns[soundType] || patterns.urgent;

  function burst() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      _alarmAudioCtx = ctx;
      freqs.forEach(function(freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        var t = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.04);
        gain.gain.linearRampToValueAtTime(0, t + 0.16);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch(e) {}
  }

  burst();
  _alarmLoopTimer = setInterval(burst, freqs.length * 200 + 800);
}

function stopPersistentAlarm() {
  clearInterval(_alarmLoopTimer);
  _alarmLoopTimer = null;
  if (_alarmAudioCtx) {
    try { _alarmAudioCtx.close(); } catch(e) {}
    _alarmAudioCtx = null;
  }
}

// One-shot preview
function playAlarmSound(type) {
  type = type || 'default';
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var notes = {
      default: [{f:880,s:0,d:.15},{f:1100,s:.2,d:.15},{f:880,s:.4,d:.15},{f:1100,s:.6,d:.3}],
      urgent:  [{f:1200,s:0,d:.1},{f:800,s:.15,d:.1},{f:1200,s:.3,d:.1},{f:800,s:.45,d:.1},{f:1200,s:.6,d:.15}],
      gentle:  [{f:523,s:0,d:.2},{f:659,s:.25,d:.2},{f:784,s:.5,d:.4}]
    };
    (notes[type] || notes.default).forEach(function(n) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = n.f;
      g.gain.setValueAtTime(0, ctx.currentTime + n.s);
      g.gain.linearRampToValueAtTime(0.4, ctx.currentTime + n.s + 0.02);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + n.s + n.d);
      o.start(ctx.currentTime + n.s);
      o.stop(ctx.currentTime + n.s + n.d + 0.05);
    });
  } catch(e) {}
}

// ─── Card shake ───────────────────────────────────────────────────────────────
function startCardShake(schemeId) {
  stopAllCardShakes();
  var card = document.querySelector('[data-scheme-id="' + schemeId + '"]');
  if (card) card.classList.add('alarm-ringing');
}

function stopAllCardShakes() {
  document.querySelectorAll('.alarm-ringing').forEach(function(c) {
    c.classList.remove('alarm-ringing');
  });
}

// ─── Storage ──────────────────────────────────────────────────────────────────
function getAlarms() {
  try { return JSON.parse(localStorage.getItem('schemeAlarms') || '{}'); }
  catch(e) { return {}; }
}
function saveAlarms(a) {
  localStorage.setItem('schemeAlarms', JSON.stringify(a));
}

// ─── Browser notification ─────────────────────────────────────────────────────
function requestNotificationPermission(cb) {
  if (!('Notification' in window)) { if (cb) cb('denied'); return; }
  if (Notification.permission === 'granted') { if (cb) cb('granted'); return; }
  Notification.requestPermission().then(function(p) { if (cb) cb(p); });
}

function showBrowserNotification(title, body, urgent) {
  if (Notification.permission !== 'granted') return;
  var n = new Notification(title, {
    body: body,
    requireInteraction: !!urgent,
    icon: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg'
  });
  if (!urgent) setTimeout(function() { n.close(); }, 6000);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(html, type, duration) {
  type = type || 'info';
  duration = duration || 4500;
  var c = document.getElementById('alarmToastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'alarmToastContainer';
    c.style.cssText = 'position:fixed;top:80px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(c);
  }
  var colors = {
    info:    {bg:'#003366', border:'#FF9933'},
    success: {bg:'#065f46', border:'#6ee7b7'},
    warning: {bg:'#92400e', border:'#fcd34d'},
    danger:  {bg:'#7f1d1d', border:'#fca5a5'}
  };
  var col = colors[type] || colors.info;
  var t = document.createElement('div');
  t.style.cssText = 'background:' + col.bg + ';color:#fff;padding:14px 18px;border-radius:12px;' +
    'border-left:5px solid ' + col.border + ';box-shadow:0 8px 28px rgba(0,0,0,.4);' +
    'max-width:320px;font-size:14px;line-height:1.6;pointer-events:auto;cursor:pointer;' +
    'animation:alarmSlideIn .3s ease;';
  t.innerHTML = html;
  t.onclick = function() { t.remove(); };
  c.appendChild(t);
  setTimeout(function() {
    t.style.opacity = '0';
    t.style.transform = 'translateX(120%)';
    t.style.transition = 'all .3s';
    setTimeout(function() { t.remove(); }, 320);
  }, duration);
}

// ─── Dismiss overlay ──────────────────────────────────────────────────────────
function showAlarmDismissOverlay(alarm) {
  var old = document.getElementById('alarmDismissOverlay');
  if (old) old.remove();

  var dlDate = new Date(alarm.deadlineStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  var overlay = document.createElement('div');
  overlay.id = 'alarmDismissOverlay';

  var box = document.createElement('div');
  box.className = 'alarm-ring-box';

  box.innerHTML =
    '<div class="ring-pulse"></div>' +
    '<div class="ring-icon">🔔</div>' +
    '<h2>Deadline Reminder!</h2>' +
    '<p class="ring-scheme">' + alarm.schemeName + '</p>' +
    '<p class="ring-deadline">&#128197; Apply by: ' + dlDate + '</p>';

  var actions = document.createElement('div');
  actions.className = 'ring-actions';

  var dismissBtn = document.createElement('button');
  dismissBtn.className = 'btn-dismiss-alarm';
  dismissBtn.textContent = '🔕 Turn Off Alarm';
  dismissBtn.onclick = function() { dismissRingingAlarm(alarm.schemeId); };

  var applyBtn = document.createElement('button');
  applyBtn.className = 'btn-apply-now';
  applyBtn.textContent = 'Apply Now →';
  applyBtn.onclick = function() { dismissRingingAlarm(alarm.schemeId); };

  actions.appendChild(dismissBtn);
  actions.appendChild(applyBtn);
  box.appendChild(actions);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function dismissRingingAlarm(schemeId) {
  stopPersistentAlarm();
  stopAllCardShakes();
  var o = document.getElementById('alarmDismissOverlay');
  if (o) {
    o.style.opacity = '0';
    o.style.transition = 'opacity .3s';
    setTimeout(function() { o.remove(); }, 320);
  }
  localStorage.setItem('dismissedAlarm_' + schemeId, new Date().toISOString());
}
window.dismissRingingAlarm = dismissRingingAlarm;

// ─── Inject CSS ───────────────────────────────────────────────────────────────
(function injectCSS() {
  if (document.getElementById('alarmModuleStyles')) return;
  var s = document.createElement('style');
  s.id = 'alarmModuleStyles';
  s.textContent =
    /* Card shake */
    '@keyframes cardShake{' +
      '0%,100%{transform:translateX(0) rotate(0)}' +
      '15%{transform:translateX(-7px) rotate(-1.5deg)}' +
      '30%{transform:translateX(7px) rotate(1.5deg)}' +
      '45%{transform:translateX(-5px) rotate(-1deg)}' +
      '60%{transform:translateX(5px) rotate(1deg)}' +
      '75%{transform:translateX(-3px) rotate(-.5deg)}' +
      '90%{transform:translateX(3px) rotate(.5deg)}' +
    '}' +
    '@keyframes cardGlow{' +
      '0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.6),0 4px 6px rgba(0,0,0,.1)}' +
      '50%{box-shadow:0 0 0 16px rgba(239,68,68,0),0 4px 6px rgba(0,0,0,.1)}' +
    '}' +
    '.alarm-ringing{' +
      'animation:cardShake .5s ease infinite,cardGlow 1s ease infinite !important;' +
      'border-left-color:#ef4444 !important;border-left-width:5px !important;' +
    '}' +

    /* Dismiss overlay */
    '#alarmDismissOverlay{' +
      'position:fixed;inset:0;background:rgba(0,0,30,.8);backdrop-filter:blur(8px);' +
      'z-index:999999;display:flex;align-items:center;justify-content:center;' +
      'animation:fadeBgIn .3s ease;' +
    '}' +
    '@keyframes fadeBgIn{from{opacity:0}to{opacity:1}}' +
    '.alarm-ring-box{' +
      'background:#fff;border-radius:24px;padding:44px 40px;max-width:420px;width:90%;' +
      'text-align:center;position:relative;overflow:hidden;' +
      'box-shadow:0 32px 80px rgba(0,0,0,.5);animation:ringBoxIn .4s cubic-bezier(.34,1.56,.64,1);' +
    '}' +
    '@keyframes ringBoxIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}' +
    '.ring-pulse{' +
      'position:absolute;inset:0;border-radius:24px;pointer-events:none;' +
      'background:radial-gradient(circle at 50% 0%,rgba(239,68,68,.18) 0%,transparent 70%);' +
      'animation:pulseBg 1s ease-in-out infinite alternate;' +
    '}' +
    '@keyframes pulseBg{to{background:radial-gradient(circle at 50% 0%,rgba(239,68,68,.35) 0%,transparent 70%)}}' +
    '.ring-icon{' +
      'font-size:3.6rem;margin-bottom:14px;display:block;' +
      'animation:bellSwing .55s ease-in-out infinite alternate;transform-origin:50% 8%;' +
    '}' +
    '@keyframes bellSwing{from{transform:rotate(-22deg)}to{transform:rotate(22deg)}}' +
    '.alarm-ring-box h2{color:#dc2626;font-size:1.7rem;margin-bottom:8px;font-weight:800;position:relative}' +
    '.ring-scheme{font-size:1.1rem;font-weight:700;color:#003366;margin:6px 0;position:relative}' +
    '.ring-deadline{font-size:.92rem;color:#64748b;margin-bottom:26px;position:relative}' +
    '.ring-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative}' +
    '.btn-dismiss-alarm{' +
      'padding:12px 24px;background:#ef4444;color:#fff;border:none;border-radius:12px;' +
      'font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;' +
    '}' +
    '.btn-dismiss-alarm:hover{background:#dc2626;transform:scale(1.04)}' +
    '.btn-apply-now{' +
      'padding:12px 24px;background:#003366;color:#fff;border:none;border-radius:12px;' +
      'font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;' +
    '}' +
    '.btn-apply-now:hover{background:#FF9933;color:#003366;transform:scale(1.04)}' +

    /* Modal */
    '.alarm-modal-overlay{' +
      'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:99998;' +
      'display:flex;align-items:center;justify-content:center;animation:fadeBgIn .2s ease;' +
    '}' +
    '.alarm-modal{' +
      'background:#fff;border-radius:20px;padding:30px;max-width:460px;width:90%;' +
      'box-shadow:0 24px 60px rgba(0,0,0,.35);animation:ringBoxIn .25s ease;' +
    '}' +
    '.alarm-modal h3{color:#003366;margin-bottom:6px;font-size:1.2rem;font-weight:800}' +
    '.alarm-modal-subtitle{color:#64748b;font-size:.88rem;margin-bottom:18px}' +
    '.alarm-type-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}' +
    '.alarm-type-btn{' +
      'padding:12px;border:2px solid #e2e8f0;border-radius:12px;background:#f8fafc;' +
      'cursor:pointer;font-size:.83rem;text-align:center;transition:all .2s;font-weight:600;color:#334155;' +
    '}' +
    '.alarm-type-btn:hover,.alarm-type-btn.active{' +
      'border-color:#FF9933;background:linear-gradient(135deg,#fff8f0,#fff);' +
      'color:#003366;box-shadow:0 4px 14px rgba(255,153,51,.25);' +
    '}' +
    '.alarm-custom-wrap{margin-bottom:14px}' +
    '.alarm-custom-wrap input{' +
      'width:100%;padding:11px 14px;border:2px solid #e2e8f0;border-radius:12px;' +
      'font-size:.9rem;outline:none;transition:border .2s;box-sizing:border-box;font-family:inherit;' +
    '}' +
    '.alarm-custom-wrap input:focus{border-color:#FF9933}' +
    '.alarm-sound-wrap{' +
      'margin-bottom:18px;padding:12px 14px;background:#f8fafc;border-radius:12px;' +
      'font-size:.83rem;color:#64748b;display:flex;align-items:center;gap:10px;flex-wrap:wrap;' +
    '}' +
    '.alarm-sound-wrap select{' +
      'border:1.5px solid #e2e8f0;border-radius:8px;padding:5px 10px;font-size:.83rem;' +
      'outline:none;font-family:inherit;cursor:pointer;' +
    '}' +
    '.alarm-preview-btn{' +
      'border:none;background:#003366;color:#fff;border-radius:8px;' +
      'padding:6px 14px;cursor:pointer;font-size:.8rem;transition:all .2s;' +
    '}' +
    '.alarm-preview-btn:hover{background:#FF9933;color:#003366}' +
    '.alarm-modal-btns{display:flex;gap:10px}' +
    '.alarm-modal-btns button{flex:1;padding:12px;border:none;border-radius:12px;cursor:pointer;font-weight:700;font-size:.88rem;transition:all .2s;font-family:inherit}' +
    '.btn-alarm-confirm{background:#003366;color:#fff}' +
    '.btn-alarm-confirm:hover{background:#FF9933;color:#003366}' +
    '.btn-alarm-remove{background:#fee2e2;color:#dc2626}' +
    '.btn-alarm-remove:hover{background:#fecaca}' +
    '.btn-alarm-cancel{background:#f1f5f9;color:#64748b}' +
    '.btn-alarm-cancel:hover{background:#e2e8f0}' +

    /* Alarm set indicator */
    '.alarm-indicator{' +
      'display:inline-flex;align-items:center;gap:5px;font-size:.73rem;color:#059669;' +
      'background:#dcfce7;padding:3px 10px;border-radius:20px;margin-top:6px;font-weight:600;' +
    '}' +

    /* Toast anim */
    '@keyframes alarmSlideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}';

  document.head.appendChild(s);
})();

// ─── Modal: stored context ────────────────────────────────────────────────────
var _modalCtx = { selDays: 1, deadlineStr: '', schemeId: '', schemeName: '', soundType: 'urgent' };

// ─── Open alarm modal — pure DOM, no innerHTML onclick ────────────────────────
function openAlarmModal(schemeId, schemeName, deadlineStr) {
  // Remove existing
  var old = document.getElementById('alarmModalOverlay');
  if (old) old.remove();

  var alarms = getAlarms();
  var saved  = alarms[schemeId];
  var selDays = 1;
  var customVal = '';

  if (saved) {
    var dl   = new Date(deadlineStr);
    var al   = new Date(saved.alarmDate);
    var diff = Math.round((dl - al) / 86400000);
    if ([1, 3, 7].indexOf(diff) !== -1) selDays = diff;
    else { selDays = null; customVal = saved.alarmDate.slice(0, 16); }
  }

  _modalCtx.selDays     = selDays;
  _modalCtx.deadlineStr = deadlineStr;
  _modalCtx.schemeId    = schemeId;
  _modalCtx.schemeName  = schemeName;
  _modalCtx.soundType   = saved ? (saved.sound || 'urgent') : 'urgent';

  var dlFmt = new Date(deadlineStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // ── Build overlay
  var overlay = document.createElement('div');
  overlay.className = 'alarm-modal-overlay';
  overlay.id = 'alarmModalOverlay';
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeAlarmModal();
  });

  // ── Build modal box
  var modal = document.createElement('div');
  modal.className = 'alarm-modal';

  // Title
  var h3 = document.createElement('h3');
  h3.textContent = '🔔 Set Deadline Alarm';
  modal.appendChild(h3);

  // Subtitle
  var sub = document.createElement('p');
  sub.className = 'alarm-modal-subtitle';
  sub.textContent = schemeName + '  ·  Deadline: ' + dlFmt;
  modal.appendChild(sub);

  // Preset grid
  var grid = document.createElement('div');
  grid.className = 'alarm-type-grid';

  var PRESETS = [
    { label: '📅 1 Day Before',     days: 1    },
    { label: '📅 3 Days Before',    days: 3    },
    { label: '📅 1 Week Before',    days: 7    },
    { label: '🕐 Custom Date/Time', days: null }
  ];

  PRESETS.forEach(function(p) {
    var btn = document.createElement('button');
    btn.className = 'alarm-type-btn' + (p.days === selDays ? ' active' : '');
    btn.textContent = p.label;
    btn.addEventListener('click', function() {
      modal.querySelectorAll('.alarm-type-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _modalCtx.selDays = p.days;
      customWrap.style.display = (p.days === null) ? '' : 'none';
    });
    grid.appendChild(btn);
  });
  modal.appendChild(grid);

  // Custom date
  var customWrap = document.createElement('div');
  customWrap.className = 'alarm-custom-wrap';
  customWrap.style.display = (selDays !== null) ? 'none' : '';
  var customInput = document.createElement('input');
  customInput.type = 'datetime-local';
  customInput.id   = 'customAlarmDateInput';
  customInput.value = customVal;
  customInput.min   = new Date().toISOString().slice(0, 16);
  customInput.placeholder = 'Pick date & time';
  customWrap.appendChild(customInput);
  modal.appendChild(customWrap);

  // Sound row
  var soundWrap = document.createElement('div');
  soundWrap.className = 'alarm-sound-wrap';

  var soundLabel = document.createTextNode('🔊 Sound: ');
  soundWrap.appendChild(soundLabel);

  var soundSel = document.createElement('select');
  soundSel.id = 'alarmSoundSelect';
  [
    { v: 'urgent',  l: '🚨 Urgent Alert' },
    { v: 'default', l: '🎵 Default Chime' },
    { v: 'gentle',  l: '🎶 Gentle Tone' }
  ].forEach(function(opt) {
    var o = document.createElement('option');
    o.value = opt.v;
    o.textContent = opt.l;
    if (opt.v === _modalCtx.soundType) o.selected = true;
    soundSel.appendChild(o);
  });
  soundSel.addEventListener('change', function() {
    _modalCtx.soundType = soundSel.value;
  });
  soundWrap.appendChild(soundSel);

  var previewBtn = document.createElement('button');
  previewBtn.className = 'alarm-preview-btn';
  previewBtn.textContent = '▶ Preview';
  previewBtn.addEventListener('click', function() {
    playAlarmSound(soundSel.value);
  });
  soundWrap.appendChild(previewBtn);
  modal.appendChild(soundWrap);

  // Action buttons
  var btnRow = document.createElement('div');
  btnRow.className = 'alarm-modal-btns';

  var confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn-alarm-confirm';
  confirmBtn.textContent = saved ? '✏️ Update Alarm' : '✅ Set Alarm';
  confirmBtn.addEventListener('click', function() {
    doSetAlarm(customInput, soundSel);
  });
  btnRow.appendChild(confirmBtn);

  if (saved) {
    var removeBtn = document.createElement('button');
    removeBtn.className = 'btn-alarm-remove';
    removeBtn.textContent = '🗑️ Remove';
    removeBtn.addEventListener('click', function() { doRemoveAlarm(schemeId); });
    btnRow.appendChild(removeBtn);
  }

  var cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-alarm-cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', closeAlarmModal);
  btnRow.appendChild(cancelBtn);

  modal.appendChild(btnRow);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
window.openAlarmModal = openAlarmModal;

function closeAlarmModal() {
  var o = document.getElementById('alarmModalOverlay');
  if (o) o.remove();
}
window.closeAlarmModal = closeAlarmModal;

// ─── Set alarm action ─────────────────────────────────────────────────────────
function doSetAlarm(customInput, soundSel) {
  var schemeId    = _modalCtx.schemeId;
  var schemeName  = _modalCtx.schemeName;
  var deadlineStr = _modalCtx.deadlineStr;
  var selDays     = _modalCtx.selDays;
  var soundType   = soundSel ? soundSel.value : (_modalCtx.soundType || 'urgent');
  var alarmDate;

  if (selDays !== null && selDays !== undefined) {
    var d = new Date(deadlineStr);
    d.setDate(d.getDate() - selDays);
    d.setHours(9, 0, 0, 0);
    alarmDate = d.toISOString();
  } else {
    var cv = customInput ? customInput.value : '';
    if (!cv) {
      showToast('⚠️ Please pick a custom date & time.', 'warning');
      return;
    }
    alarmDate = new Date(cv).toISOString();
  }

  var alarms = getAlarms();
  alarms[schemeId] = {
    schemeId: schemeId,
    schemeName: schemeName,
    deadlineStr: deadlineStr,
    alarmDate: alarmDate,
    sound: soundType,
    set: new Date().toISOString()
  };
  saveAlarms(alarms);
  closeAlarmModal();

  var alarmFmt = new Date(alarmDate).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  playAlarmSound('gentle');
  showToast('🔔 Alarm set!<br><strong>' + schemeName + '</strong><br>⏰ ' + alarmFmt, 'success', 5000);
  requestNotificationPermission(function(p) {
    if (p === 'granted') showBrowserNotification('Alarm Set ✅', schemeName + ' — ' + alarmFmt);
  });
  refreshAlarmButtons();
}

// ─── Remove alarm ─────────────────────────────────────────────────────────────
function doRemoveAlarm(schemeId) {
  var alarms = getAlarms();
  delete alarms[schemeId];
  saveAlarms(alarms);
  closeAlarmModal();
  stopPersistentAlarm();
  stopAllCardShakes();
  localStorage.removeItem('dismissedAlarm_' + schemeId);
  showToast('🗑️ Alarm removed.', 'info', 2500);
  refreshAlarmButtons();
}
window.removeAlarm = doRemoveAlarm;

// ─── Refresh button states ────────────────────────────────────────────────────
function refreshAlarmButtons() {
  var alarms = getAlarms();
  document.querySelectorAll('[data-scheme-id]').forEach(function(card) {
    var sid = card.getAttribute('data-scheme-id');
    var btn = card.querySelector('.btn-set-alarm-trigger');
    var ind = card.querySelector('.alarm-indicator-wrap');
    if (!btn) return;
    if (alarms[sid]) {
      var d = new Date(alarms[sid].alarmDate);
      var label = d.toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });
      btn.textContent = '🔔 Alarm Set ✓';
      btn.style.background = '#059669';
      btn.style.boxShadow  = '0 0 0 3px rgba(5,150,105,.25)';
      if (ind) ind.innerHTML = '<span class="alarm-indicator">⏰ ' + label + '</span>';
    } else {
      btn.textContent = '🔔 Set Alarm';
      btn.style.background = '';
      btn.style.boxShadow  = '';
      if (ind) ind.innerHTML = '';
    }
  });
}
window.refreshAlarmButtons = refreshAlarmButtons;

// ─── Tick: fire due alarms ────────────────────────────────────────────────────
function checkDueAlarms() {
  var alarms = getAlarms();
  var now    = new Date();
  Object.keys(alarms).forEach(function(sid) {
    var alarm     = alarms[sid];
    var alarmTime = new Date(alarm.alarmDate);
    var diff      = now - alarmTime;
    if (diff >= 0 && diff < 120000) {
      if (localStorage.getItem('dismissedAlarm_' + sid)) return;
      if (sessionStorage.getItem('firedAlarm_' + sid)) return;
      sessionStorage.setItem('firedAlarm_' + sid, '1');
      startPersistentAlarm(alarm.sound || 'urgent');
      startCardShake(sid);
      showAlarmDismissOverlay(alarm);
      requestNotificationPermission(function(p) {
        if (p === 'granted') showBrowserNotification(
          '🚨 Deadline Reminder!',
          alarm.schemeName + ' — Apply now!',
          true
        );
      });
    }
  });
}

setInterval(checkDueAlarms, 30000);

document.addEventListener('DOMContentLoaded', function() {
  requestNotificationPermission();
  refreshAlarmButtons();
  checkDueAlarms();
});

window.getAlarms            = getAlarms;
window.startPersistentAlarm = startPersistentAlarm;
window.stopPersistentAlarm  = stopPersistentAlarm;
window.playAlarmSound       = playAlarmSound;
