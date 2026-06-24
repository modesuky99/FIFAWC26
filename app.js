(function() {

/* ====== WC 2026 DATA (365scores API) ====== */
var API_GAMES = 'https://webws.365scores.com/web/games/?langId=1&timezoneName=Africa/Cairo&userId=-1&competitions=5930';
var API_STANDINGS = 'https://webws.365scores.com/web/standings/?langId=1&timezoneName=Africa/Cairo&competitions=5930&seasonNum=25';
var _AUTO_REFRESH = null;

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function formatTime12(d) {
  var options = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Africa/Cairo' };
  return d.toLocaleTimeString('ar-EG', options);
}

function parseStartTime(g) {
  return new Date(g.startTime);
}

function isToday(g) {
  if (!g || !g.startTime) return false;
  var gameDate = parseStartTime(g);
  var now = new Date();
  var nowUtcMs = now.getTime() - now.getTimezoneOffset() * 60000;
  var egyptNow = new Date(nowUtcMs + 2 * 3600000);
  return gameDate.getUTCFullYear() === egyptNow.getUTCFullYear() &&
         gameDate.getUTCMonth() === egyptNow.getUTCMonth() &&
         gameDate.getUTCDate() === egyptNow.getUTCDate();
}

function statusGroupToType(sg) {
  if (sg === 3) return 'live';
  if (sg === 4) return 'finished';
  return 'notstarted';
}

function roundLabel(g) {
  var sn = g.stageNum || 1;
  if (sn === 2) return 'دور 32';
  if (sn === 3) return 'دور 16';
  if (sn === 4) return 'ربع النهائي';
  if (sn === 5) return 'نصف النهائي';
  if (sn === 6) return '🏆 النهائي';
  return g.groupName || '';
}

var _FLAG_ISO2 = {
  'ALG':'dz','ARG':'ar','AUS':'au','AUT':'at','BEL':'be','BIH':'ba','BRA':'br',
  'CAN':'ca','COL':'co','CPV':'cv','CRO':'hr','CUR':'cw','CZE':'cz',
  'DR':'cd','ECU':'ec','EGY':'eg','ENG':'gb-eng','ESP':'es','FRA':'fr',
  'GER':'de','GHA':'gh','HAI':'ht','IRA':'iq','IRN':'ir','CIV':'ci',
  'JOR':'jo','JPN':'jp','KOR':'kr','KSA':'sa','MAR':'ma','MEX':'mx',
  'NED':'nl','NEW':'nz','NOR':'no','PAN':'pa','PAR':'py','POR':'pt',
  'QAT':'qa','SCO':'gb-sct','SEN':'sn','SOU':'za','SWE':'se','SWI':'ch',
  'TUN':'tn','TUR':'tr','USA':'us','URU':'uy','UZB':'uz'
};

function getFlag(sym) {
  var code = sym && _FLAG_ISO2[sym];
  return code ? '<img class="fi" src="https://flagcdn.com/24x18/' + code + '.png" alt="">' : '';
}
function teamHTML(comp) {
  if (!comp) return '<span class="mc-n">—</span>';
  var name = comp.name || '—';
  var f = getFlag(comp.symbolicName);
  return f + '<span class="mc-n">' + name + '</span>';
}

/* ====== MAIN FETCH ====== */
function fetchData() {
  var list = document.getElementById('matchesList');
  var err = document.getElementById('matchError');
  if (!list) return;
  list.innerHTML = '<div class="ldr"><span class="ldr-spin"></span><span>جاري التحميل...</span></div>';
  if (err) err.classList.add('hidden');

  fetch(API_GAMES).then(function(r) { return r.json(); }).then(function(data) {
    list.innerHTML = '';
    renderToday((data.games || []));
  }).catch(function(e) {
    list.innerHTML = '';
    if (err) err.classList.remove('hidden');
  });
}

function renderToday(games) {
  var live = [], upcoming = [], finished = [];
  games.forEach(function(g) {
    var type = statusGroupToType(g.statusGroup);
    if (type === 'live') {
      live.push(g);
    } else if (isToday(g)) {
      if (type === 'notstarted') upcoming.push(g);
      else if (type === 'finished') finished.push(g);
    }
  });

  upcoming.sort(function(a,b) { return parseStartTime(a) - parseStartTime(b); });
  finished.sort(function(a,b) { return parseStartTime(b) - parseStartTime(a); });

  var el = document.getElementById('matchesList');
  var total = live.length + upcoming.length + finished.length;

  var hlc = document.getElementById('heroLiveCount');
  if (hlc) {
    if (live.length > 0) hlc.innerHTML = '<span class="live-dot"></span> ' + live.length + ' مباراة مباشرة';
    else if (total === 0) hlc.textContent = '— لا توجد مباريات اليوم';
    else hlc.textContent = total + ' مباريات اليوم';
  }

  if (total === 0) {
    el.innerHTML = '<div class="empty-day"><div class="empty-icon">📅</div><span>لا توجد مباريات اليوم</span></div>';
    return;
  }

  live.forEach(function(g) { el.appendChild(buildCard(g, 'live')); });

  if (upcoming.length > 0) {
    var h = document.createElement('div');
    h.className = 'sec-label';
    h.innerHTML = '<span>📋 المباريات القادمة</span><span class="sec-count">' + upcoming.length + '</span>';
    el.appendChild(h);
    upcoming.forEach(function(g) { el.appendChild(buildCard(g, 'upcoming')); });
  }

  if (finished.length > 0) {
    var h = document.createElement('div');
    h.className = 'sec-label';
    h.innerHTML = '<span>✅ النتائج</span><span class="sec-count">' + finished.length + '</span>';
    el.appendChild(h);
    finished.forEach(function(g) { el.appendChild(buildCard(g, 'finished')); });
  }
}

/* ====== MATCH CARD ====== */
function buildCard(g, type) {
  var card = document.createElement('div');
  card.className = 'mc mc-' + type;
  card.setAttribute('data-game', JSON.stringify(g));

  var hComp = g.homeCompetitor;
  var aComp = g.awayCompetitor;
  var hName = (hComp && hComp.name) || '—';
  var aName = (aComp && aComp.name) || '—';
  var hScore = hComp ? Math.round(hComp.score) : 0;
  var aScore = aComp ? Math.round(aComp.score) : 0;

  var scoreHTML, badgeHTML;
  if (type === 'live') {
    var et = g.gameTimeDisplay || '';
    scoreHTML = '<span class="mc-score live-s">' + hScore + ' - ' + aScore + '</span>';
    badgeHTML = '<span class="mc-badge b-live"><span class="live-badge-dot"></span> جاريه الان <span class="live-time">' + et + '</span></span>';
  } else if (type === 'finished') {
    scoreHTML = '<span class="mc-score">' + hScore + ' - ' + aScore + '</span>';
    badgeHTML = '<span class="mc-badge b-end">انتهت</span>';
  } else {
    var d = parseStartTime(g);
    var t = formatTime12(d);
    scoreHTML = '<span class="mc-score mc-vs">VS</span>';
    badgeHTML = '<span class="mc-badge b-up">' + t + '</span>';
  }

  card.innerHTML = '<div class="mc-row1"><span class="mc-round">' + roundLabel(g) + '</span>' + badgeHTML + '</div><div class="mc-row2"><div class="mc-t">' + teamHTML(hComp) + '</div>' + scoreHTML + '<div class="mc-t">' + teamHTML(aComp) + '</div></div>';

  card.onclick = function() { showDetail(g, type); };

  return card;
}

/* ====== MATCH DETAIL OVERLAY ====== */
function showDetail(g, type) {
  var ov = document.getElementById('matchDetail');
  var inner = document.getElementById('matchDetailInner');
  if (!ov || !inner) return;

  var hComp = g.homeCompetitor;
  var aComp = g.awayCompetitor;
  var hName = (hComp && hComp.name) || '—';
  var aName = (aComp && aComp.name) || '—';
  var hScore = hComp ? Math.round(hComp.score) : 0;
  var aScore = aComp ? Math.round(aComp.score) : 0;

  var scoreBig;
  if (type === 'upcoming') {
    var d = parseStartTime(g);
    scoreBig = '<div class="md-time-big">' + formatTime12(d) + '</div><div class="md-date-big">' + d.toLocaleDateString('ar-EG', { weekday:'long', month:'long', day:'numeric', timeZone: 'Africa/Cairo' }) + '</div>';
  } else {
    scoreBig = '<div class="md-score-big">' + hScore + ' - ' + aScore + '</div>';
  }

  inner.innerHTML = '<div class="md-close" onclick="document.getElementById(\'matchDetail\').classList.add(\'hidden\')">✕</div><div class="md-round">' + roundLabel(g) + '</div><div class="md-teams"><div class="md-t">' + teamHTML(hComp) + '</div>' + scoreBig + '<div class="md-t">' + teamHTML(aComp) + '</div></div><div class="md-actions"><button class="md-btn md-btn-watch" onclick="watchMatch()">▶ شاهد المباراة</button></div>';

  ov.classList.remove('hidden');
}

function closeDetail(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('matchDetail').classList.add('hidden');
}

function watchMatch() {
  navigateTo('player');
}

/* ====== STANDINGS ====== */
function fetchStandings() {
  var el = document.getElementById('standingsList');
  var err = document.getElementById('standingsError');
  if (!el) return;
  el.innerHTML = '<div class="ldr"><span class="ldr-spin"></span></div>';
  if (err) err.classList.add('hidden');

  fetch(API_STANDINGS).then(function(r) { return r.json(); }).then(function(d) {
    el.innerHTML = '';
    var s = d.standings && d.standings[0];
    if (s && s.groups && s.rows) {
      __standingsRows = s.rows;
      renderStands(s.groups, s.rows);
    }
  }).catch(function(e) {
    el.innerHTML = '';
    if (err) err.classList.remove('hidden');
  });
}

var _GROUPS_DATA = [];
var GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

function renderStands(groups, rows) {
  groups.sort(function(a,b) { return a.num - b.num; });
  _GROUPS_DATA = groups;
  var el = document.getElementById('standingsList');

  groups.forEach(function(g, idx) {
    var groupRows = rows.filter(function(r) { return r.groupNum === g.num; });
    groupRows.sort(function(a,b) { return (b.points||0) - (a.points||0) || (b.ratio||0) - (a.ratio||0); });

    var letter = (g.num >= 1 && g.num <= 12) ? GROUP_LETTERS[g.num - 1] : '';
    var html = '<div class="st-grp" onclick="showSD(' + idx + ')"><div class="st-grp-title">المجموعة ' + letter + ' <span class="st-expand-icon">▼</span></div>';
    html += '<table class="st-tbl"><thead><tr><th></th><th class="st-tl">الفريق</th><th>ل</th><th>ف</th><th>ت</th><th>خ</th><th>+/-</th><th class="st-pts-h">ن</th></tr></thead><tbody>';
    groupRows.forEach(function(r, i) {
      var name = (r.competitor && r.competitor.name) || '—';
      var cls = i < 2 ? 'st-q' : '';
      html += '<tr class="' + cls + '"><td class="st-r">' + (i+1) + '</td><td class="st-tl">' + getFlag(r.competitor && r.competitor.symbolicName) + ' ' + name + '</td><td>' + (r.gamePlayed||0) + '</td><td>' + (r.gamesWon||0) + '</td><td>' + (r.gamesEven||0) + '</td><td>' + (r.gamesLost||0) + '</td><td class="st-gd">' + (r.ratio > 0 ? '+' : '') + (r.ratio||0) + '</td><td class="st-pts"><strong>' + (r.points||0) + '</strong></td></tr>';
    });
    html += '</tbody></table></div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    while (div.firstChild) el.appendChild(div.firstChild);
  });
}

/* ====== STANDINGS OVERLAY ====== */
function showSD(idx) {
  var g = _GROUPS_DATA[idx];
  if (!g) return;
  var s = document.getElementById('standsDetail');
  var el = document.getElementById('standsDetailInner');

  var allRows = [];
  try {
    var raw = __standingsRows;
    if (raw) allRows = raw.filter(function(r) { return r.groupNum === g.num; });
  } catch(e) {}

  if (allRows.length === 0) { closeSD(); return; }

  allRows.sort(function(a,b) { return (b.points||0) - (a.points||0) || (b.ratio||0) - (a.ratio||0); });

  var letter = (g.num >= 1 && g.num <= 12) ? GROUP_LETTERS[g.num - 1] : '';
  var html = '<div class="sd-close" onclick="closeSD(event)">✕</div>';
  html += '<div class="sd-header">المجموعة ' + letter + '</div>';
  html += '<table class="st-tbl sd-tbl"><thead><tr><th></th><th class="st-tl">الفريق</th><th>ل</th><th>ف</th><th>ت</th><th>خ</th><th>له</th><th>عليه</th><th>+/-</th><th class="st-pts-h">ن</th></tr></thead><tbody>';
  allRows.forEach(function(r, i) {
    var name = (r.competitor && r.competitor.name) || '—';
    var cls = i < 2 ? 'st-q' : '';
    html += '<tr class="' + cls + '"><td class="st-r">' + (i+1) + '</td><td class="st-tl">' + getFlag(r.competitor && r.competitor.symbolicName) + ' ' + name + '</td><td>' + (r.gamePlayed||0) + '</td><td>' + (r.gamesWon||0) + '</td><td>' + (r.gamesEven||0) + '</td><td>' + (r.gamesLost||0) + '</td><td>' + (r['for']||0) + '</td><td>' + (r.against||0) + '</td><td class="st-gd">' + (r.ratio > 0 ? '+' : '') + (r.ratio||0) + '</td><td class="st-pts"><strong>' + (r.points||0) + '</strong></td></tr>';
  });
  html += '</tbody></table>';

  el.innerHTML = html;
  s.classList.remove('hidden');
}

var __standingsRows = [];

function closeSD(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('sd-close')) return;
  var el = document.getElementById('standsDetail');
  if (el) el.classList.add('hidden');
}

/* ====== INIT ====== */
function initHome() {
  fetchData();
  fetchStandings();
}

var hd = document.getElementById('heroDate');
if (hd) {
  var d = new Date();
  hd.textContent = d.toLocaleDateString('ar-EG', { weekday:'long', month:'long', day:'numeric', year:'numeric', timeZone: 'Africa/Cairo' });
}



var _k = 'wc26';
function _d(s) {
  try {
    var b = window.atob(s);
    var o = '', i;
    for (i = 0; i < b.length; i++) o += String.fromCharCode(b.charCodeAt(i) ^ _k.charCodeAt(i % _k.length));
    return o;
  } catch(e) { console.error('Decode error', e); return ''; }
}

var _DATA = [
{k:'bein-1',n:'beIN Sports 1',s:[{m:'AlbaPlayer',u:'HxdGRgRZHRkNUhxSEhNdWRgMHFUYDh1XGwFTRhsCS1MFTFBTHg0fB1g=',t:'iframe',q:7},{m:'HLS مباشر',u:'HxdGRgRZHRlDVFFDB01BBVkWQRsSAkFCWlEcVxoCSFkZAkVFWQBdW1gOU05GTF9XBBdXRFkOAUNP',t:'m3u8',q:9}]},
{k:'bein-2',n:'beIN Sports 2',s:[{m:'AlbaPlayer kooora',u:'HxdGRgRZHRkADEBaE01ZWRgMQFdaEFtXWQBdW1gCXlQWE15XDgZAGRUGW1haUR0=',t:'iframe',q:7},{m:'HLS مباشر S3',u:'HxdGRgRZHRkEUBxDBE5XVwQXHwRZAl9XDQxcVwAQHFUYDh1VEw1TBEdSHVoeFVcZBBdAUxYOHV8ZB1dOWQ4BQ08=',t:'m3u8',q:10}]},
{k:'bein-3',n:'beIN Sports 3',s:[{m:'HLS مباشر',u:'HxdGRgRZHRlFUFFDB05eXwEGHEVETVdDWg1dRAMLHwdZAl9XDQxcVwAQHFUYDh1bFhsDGRoCQUISERxbRBYK',t:'m3u8',q:8}]},
{k:'bein-4',n:'beIN Sports 4',s:[{m:'HLS مباشر',u:'HxdGRgRZHRkfD0EYBBpAWh4VVxgYDV5fGQYdVBIKXAJYDlNFAwZAGBpQRw4=',t:'m3u8',q:7}]},
{k:'bein-5',n:'beIN Sports 5',s:[{m:'HLS مباشر',u:'HxdGRgRZHRkfD0EYBBpAWh4VVxgYDV5fGQYdVBIKXANYDlNFAwZAGBpQRw4=',t:'m3u8',q:7}]},
{k:'bein-6',n:'beIN Sports 6',s:[{m:'HLS مباشر',u:'HxdGRgRZHRlFVEFPBQpTWh4VVxgEUBxDBE5XVwQXHwRZAl9XDQxcVwAQHFUYDh1UEgpcAFgOU0UDBkAYGlBHDg==',t:'m3u8',q:8}]},
{k:'bein-7',n:'beIN Sports 7',s:[{m:'AlbaPlayer',u:'HxdGRgRZHRkADEBaE01ZWRgMQFdaEFtXWQBdW1gCXlQWE15XDgZAGRUGW1haVB0=',t:'iframe',q:6},{m:'HLS مباشر',u:'HxdGRgRZHRkfD0EYBBpAWh4VVxgYDV5fGQYdVBIKXAFYDlNFAwZAGBpQRw4=',t:'m3u8',q:7}]},
{k:'bein-8',n:'beIN Sports 8',s:[{m:'AlbaPlayer',u:'HxdGRgRZHRkADEBaE01ZWRgMQFdaEFtXWQBdW1gCXlQWE15XDgZAGRUGW1haWx0=',t:'iframe',q:6},{m:'HLS مباشر',u:'HxdGRgRZHRkfD0EYBBpAWh4VVxgYDV5fGQYdVBIKXA5YDlNFAwZAGBpQRw4=',t:'m3u8',q:7}]},
{k:'bein-9',n:'beIN Sports 9',s:[{m:'AlbaPlayer',u:'HxdGRgRZHRkADEBaE01ZWRgMQFdaEFtXWQBdW1gCXlQWE15XDgZAGRUGW1haWh0=',t:'iframe',q:6},{m:'HLS مباشر',u:'HxdGRgRZHRlFVEFPBQpTWh4VVxgEUBxDBE5XVwQXHwRZAl9XDQxcVwAQHFUYDh1UEgpcD1gOU0UDBkAYGlBHDg==',t:'m3u8',q:8}]},
{k:'ssc-2',n:'SSC 2',s:[{m:'HLS مباشر',u:'HxdGRgRZHRlGC15FWRBLRBsKRFNZDFxaHg1XGQMKX1NFTF9XBBdXRFkOAUNP',t:'m3u8',q:8}]},
{k:'vip1',n:'VIP 1',s:[{m:'AlbaPlayer vip',u:'HxdGRgRZHRkBCkIYAAxAWhMIXVkFAhxVGA4dVxsBU0YbAktTBUxEXwdSHQ==',t:'iframe',q:7},{m:'HLS مباشر',u:'HxdGRgRZHRkWGRxDBAZcWxgMHFkZD1tYEkxGUwQXABgaUEcO',t:'m3u8',q:9},{m:'AlbaPlayer poiy',u:'HxdGRgRZHRkZBkUYBwxbT1kMXFoeDVcZFg9QVwcPU08SER1bFhsDGQ==',t:'iframe',q:7}]},
{k:'hd3',n:'HD 3 sportts',s:[{m:'AlbaPlayer',u:'HxdGRgRZHRkAFAAYBBNdRAMXQVkZD1tYEk1RWh4AWRkUC1NYGQZeRVgLVhkfBwEYBwtC',t:'iframe',q:6}]},
{k:'xtra1',n:'Xtra 1',s:[{m:'AlbaPlayer',u:'HxdGRgRZHRkADEBaE01ZWRgMQFdaEFtXWQBdW1gCXlQWE15XDgZAGQ8XQFdGTA==',t:'iframe',q:5}]},
{k:'xtra2',n:'Xtra 2',s:[{m:'AlbaPlayer',u:'HxdGRgRZHRkADEBaE01ZWRgMQFdaEFtXWQBdW1gCXlQWE15XDgZAGQ8XQFdFTA==',t:'iframe',q:5}]},
{k:'on-time',n:'On Time Sport',s:[{m:'يوتيوب',u:'HxdGRgRZHRkAFEUYDgxHQgIBVxgUDF8ZEg5QUxNM',t:'youtube',q:5}]},
{k:'ssc-1',n:'SSC 1',s:[{m:'يوتيوب',u:'HxdGRgRZHRkAFEUYDgxHQgIBVxgUDF8ZEg5QUxNM',t:'youtube',q:5}]},
{k:'wc-ch2',n:'كأس CH2',s:[{m:'AlbaPlayer',u:'HxdGRgRZHRkADEBaE01ZWRgMQFdaEFtXWQBdW1gCXlQWE15XDgZAGRUGW1haUR0=',t:'iframe',q:7},{m:'HLS karimo23',u:'HxdGRgRZHRkcAkBfGgwABVkQUEVYC15FWABaBFkOAUNPXEQLBBdTVBsG',t:'m3u8',q:8}]}
];

var CHANNELS = [];
_DATA.forEach(function(encCh) {
  var ch = { key:encCh.k, name:encCh.n, servers:[] };
  encCh.s.forEach(function(s) {
    ch.servers.push({ name:s.m, url:_d(s.u), type:s.t, quality:s.q||5 });
  });
  CHANNELS.push(ch);
});
console.log('Channels loaded:', CHANNELS.length);

var currentChannel = null;
var currentServerIdx = 0;
var plyrInstance = null;
var hlsInstance = null;

function $(id) { return document.getElementById(id); }
var holder = $('k-player');
var loader = $('loader');
var serverGrid = $('playerServers');
var channelsGrid = $('channelsGrid');
var vipGrid = $('vipGrid');
var liveBadge = $('liveBadge');
var channelNamePlayer = $('channelNamePlayer');
var currentServerName = $('currentServerName');

function destroyPlayer() {
  if (plyrInstance) { try { plyrInstance.destroy(); } catch(e) {} plyrInstance = null; }
  if (hlsInstance) { try { hlsInstance.destroy(); } catch(e) {} hlsInstance = null; }
  holder.innerHTML = '';
  loader.style.opacity = '0';
  loader.style.pointerEvents = 'none';
}

function playStream(server) {
  console.log('Playing:', server.name, server.type, server.url);
  destroyPlayer();
  loader.style.opacity = '1';
  loader.style.pointerEvents = 'auto';
  liveBadge.style.display = 'none';

  if (server.type === 'iframe') {
    holder.innerHTML = '<iframe src="' + server.url + '" allow="fullscreen;autoplay;encrypted-media" allowfullscreen style="width:100%;height:100%;border:0"></iframe>';
    var ifr = holder.querySelector('iframe');
    var t = setTimeout(function() { console.log('Iframe timeout'); _hideLoader(); }, 12000);
    ifr.onload = function() { clearTimeout(t); console.log('Iframe loaded'); _hideLoader(); };
    return;
  }

  if (server.type === 'youtube') {
    holder.innerHTML = '<iframe src="https://www.youtube.com/embed/" allow="fullscreen;autoplay;encrypted-media" allowfullscreen style="width:100%;height:100%;border:0"></iframe>';
    holder.querySelector('iframe').onload = _hideLoader;
    return;
  }

  holder.innerHTML = '<video id="player" playsinline style="width:100%;height:100%"></video>';
  var video = $('player');
  if (!video) { console.error('No video element'); return; }

  if (window.Hls && Hls.isSupported()) {
    console.log('Using hls.js');
    hlsInstance = new Hls({ capLevelToPlayerSize: true, liveBackBufferLength: 30, maxBufferLength: 30 });
    hlsInstance.loadSource(server.url);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
      console.log('HLS manifest parsed');
      try {
        plyrInstance = new Plyr(video, {
          controls: ['play-large','play','progress','current-time','duration','mute','volume','settings','pip','fullscreen'],
          settings: ['quality','speed'], speed: { selected:1, options:[0.5,0.75,1,1.25,1.5,2] },
          keyboard: { focused:true, global:true }, tooltips: { controls:true, seek:true }, seekTime: 10
        });
      } catch(e) { console.error('Plyr error', e); }
      _hideLoader();
    });
    hlsInstance.on(Hls.Events.ERROR, function(_, data) {
      console.error('HLS error', data.type, data.details);
      if (data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hlsInstance.startLoad();
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hlsInstance.recoverMediaError();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = server.url;
    try { plyrInstance = new Plyr(video, { controls: ['play-large','play','progress','current-time','duration','mute','volume','settings','pip','fullscreen'], settings: ['speed'], speed: { selected:1, options:[0.5,0.75,1,1.25,1.5,2] }, keyboard: { focused:true, global:true }, tooltips: { controls:true, seek:true }, seekTime: 10 }); } catch(e) {}
    if (plyrInstance) plyrInstance.on('ready', _hideLoader);
  } else {
    console.error('HLS not supported');
    holder.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.3);font-size:14px">المتصفح لا يدعم البث المباشر</div>';
    _hideLoader();
  }
}

function _hideLoader() { loader.style.opacity = '0'; loader.style.pointerEvents = 'none'; liveBadge.style.display = 'block'; }

function loadChannel(channelKey, serverIdx) {
  serverIdx = serverIdx || 0;
  var channel = null;
  CHANNELS.forEach(function(ch) { if (ch.key === channelKey) channel = ch; });
  if (!channel) { console.error('Channel not found:', channelKey); return; }
  currentChannel = channel;
  currentServerIdx = Math.min(serverIdx, channel.servers.length - 1);
  if (channelNamePlayer) channelNamePlayer.textContent = channel.name;
  renderServers(channel);
  playStream(channel.servers[currentServerIdx]);
  if (currentServerName) currentServerName.textContent = channel.servers[currentServerIdx].name;
}

function renderServers(channel) {
  serverGrid.innerHTML = '';
  channel.servers.forEach(function(server, idx) {
    var btn = document.createElement('button');
    btn.className = 'server-btn' + (idx === currentServerIdx ? ' active' : '');
    var h = server.name + ' <span class="srv-tag">' + (server.type === 'm3u8' ? 'HLS' : server.type === 'iframe' ? 'iframe' : 'YT') + '</span>';
    if (server.quality >= 7) h += ' <span class="srv-tag" style="background:rgba(240,192,64,0.1);color:#f0c040">VIP</span>';
    btn.innerHTML = h;
    btn.onclick = function() {
      document.querySelectorAll('.server-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentServerIdx = idx;
      if (currentServerName) currentServerName.textContent = server.name;
      playStream(server);
    };
    serverGrid.appendChild(btn);
  });
}

function renderChannels() {
  channelsGrid.innerHTML = '';
  CHANNELS.forEach(function(ch) {
    var card = document.createElement('div');
    card.className = 'ch-card';
    var tags = '';
    if (ch.servers.some(function(s) { return s.type === 'm3u8'; })) tags += '<span class="ch-tag hls-tag">HLS</span>';
    if (ch.servers.some(function(s) { return s.quality >= 8; })) tags += '<span class="ch-tag vip-tag">VIP</span>';
    card.innerHTML = '<h3>' + ch.name + '</h3><div class="ch-meta">' + tags + '</div><div class="ch-count">' + ch.servers.length + ' سيرفر</div>';
    card.onclick = function() { navigateTo('player', { channel: ch.key }); };
    channelsGrid.appendChild(card);
  });
}

function renderVip() {
  vipGrid.innerHTML = '';
  var list = [];
  CHANNELS.forEach(function(ch) {
    ch.servers.forEach(function(s) {
      if (s.type === 'm3u8') list.push({ channelName: ch.name, channelKey: ch.key, name: s.name, quality: s.quality });
    });
  });
  list.sort(function(a, b) { return b.quality - a.quality; });
  list.forEach(function(srv, idx) {
    var card = document.createElement('div');
    card.className = 'vip-card';
    card.style.setProperty('--idx', idx);
    var speed = srv.quality >= 9 ? '⚡ أسرع سيرفر' : srv.quality >= 7 ? '⚡ سريع جداً' : '⚡ سريع';
    card.innerHTML = '<h3>' + srv.channelName + '</h3><div class="vip-detail">' + srv.name + ' — جودة ' + srv.quality + '/10</div><div class="vip-speed">' + speed + '</div><span class="vip-badge">HLS مباشر</span>';
    card.onclick = function() { navigateTo('player', { channel: srv.channelKey }); };
    vipGrid.appendChild(card);
  });
}

function navigateTo(page, params) {
  params = params || {};
  var hash = '#' + page;
  if (params.channel) hash += '?channel=' + params.channel;
  window.location.hash = hash;
}

function handleRoute() {
  var hash = window.location.hash.replace('#', '') || 'home';
  var parts = hash.split('?');
  var page = parts[0];
  var params = {};
  if (parts[1]) {
    parts[1].split('&').forEach(function(p) { var kv = p.split('='); params[kv[0]] = kv[1] || ''; });
  }

  document.querySelectorAll('.page').forEach(function(p) { p.classList.add('hidden'); });
  document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });

  var pages = { home:'page-home', player:'page-player', vip:'page-vip', about:'page-about' };
  var target = $(pages[page]);
  if (target) {
    target.classList.remove('hidden');
    var nl = document.querySelector('[data-page="' + page + '"]');
    if (nl) nl.classList.add('active');
  } else {
    $('page-home').classList.remove('hidden');
    document.querySelector('[data-page="home"]').classList.add('active');
  }

  if (page === 'home') {
    initHome();
    if (_AUTO_REFRESH) clearInterval(_AUTO_REFRESH);
    _AUTO_REFRESH = setInterval(function() {
      fetchData();
    }, 30000);
  } else {
    if (_AUTO_REFRESH) { clearInterval(_AUTO_REFRESH); _AUTO_REFRESH = null; }
  }
  if (page === 'vip') renderVip();
  if (page === 'player') {
    if (params.channel) loadChannel(params.channel, 0);
    else if (currentChannel) loadChannel(currentChannel.key, 0);
    else loadChannel('vip1', 0);
  }
}

$('fullscreenBtn').onclick = function() {
  var el = $('playerContainer');
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
};

$('pipBtn').onclick = function() {
  if (plyrInstance && plyrInstance.elements && plyrInstance.elements.container) {
    var v = plyrInstance.elements.container.querySelector('video');
    if (v) {
      if (document.pictureInPictureElement) document.exitPictureInPicture();
      else if (v.requestPictureInPicture) v.requestPictureInPicture();
    }
  }
};

$('backToHomeBtn').onclick = function() { navigateTo('home'); };

document.querySelectorAll('.nav-link').forEach(function(link) {
  link.onclick = function(e) {
    e.preventDefault();
    window.location.hash = this.getAttribute('href').replace('#', '');
  };
});

window.open = function() { return null; };
window.addEventListener('beforeunload', function(e) {
  if (currentChannel) { var m = 'المشغل شغال. هل تريد المغادرة؟'; e.returnValue = m; return m; }
});

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);
if (window.location.hash) handleRoute();

/* ====== STARS CANVAS ====== */
(function(){
  var canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var stars = [];
  var numStars = 80;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (var i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.6 + 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.7 ? '#b044ff' : Math.random() > 0.5 ? '#00d4ff' : '#ffffff'
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.twinklePhase += s.twinkleSpeed;
      var op = s.opacity * (0.5 + 0.5 * Math.sin(s.twinklePhase));
      s.y -= s.speed;
      if (s.y < -5) { s.y = canvas.height + 5; s.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = op;
      ctx.fill();
      if (s.r > 1) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = op * 0.15;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  resize();
  createStars();
  animate();
  window.addEventListener('resize', function() { resize(); createStars(); });
})();

/* expose to global for onclick attributes */
var _global = (function(){ return this; })();
_global.closeDetail = closeDetail;
_global.watchMatch = watchMatch;
_global.showSD = showSD;
_global.closeSD = closeSD;
_global.fetchData = fetchData;
_global.fetchStandings = fetchStandings;
_global.navigateTo = navigateTo;

console.log('app.js initialized');
})();
