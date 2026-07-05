(function() {

/* ====== WC 2026 DATA (365scores API) ====== */
var API_GAMES = 'https://webws.365scores.com/web/games/?langId=1&timezoneName=Africa/Cairo&userId=-1&competitions=5930';
var API_STATS = 'https://webws.365scores.com/web/stats/?langId=1&timezoneName=Africa/Cairo&competitions=5930&top=10&type=goals';
var _AUTO_REFRESH = null;
var _COMPETITOR_MAP = {};
var _TEAM_MAP = {
  2372:{n:'Germany',s:'GER'}, 2376:{n:'Norway',s:'NOR'}, 2377:{n:'Netherlands',s:'NED'},
  2378:{n:'Argentina',s:'ARG'}, 2379:{n:'Brazil',s:'BRA'}, 2388:{n:'Canada',s:'CAN'},
  2389:{n:'USA',s:'USA'}, 2391:{n:'Canada',s:'CAN'}, 5028:{n:'Portugal',s:'POR'},
  5032:{n:'Switzerland',s:'SWI'}, 5050:{n:'Spain',s:'ESP'}, 5054:{n:'England',s:'ENG'},
  5061:{n:'France',s:'FRA'}, 5070:{n:'Paraguay',s:'PAR'}, 5093:{n:'Morocco',s:'MAR'},
  5102:{n:'Senegal',s:'SEN'}, 5106:{n:'Colombia',s:'COL'}, 14650:{n:'Congo DR',s:'DR'},
  5029:{n:'Uruguay',s:'URU'}, 5030:{n:'Croatia',s:'CRO'}, 5031:{n:'Belgium',s:'BEL'},
  5033:{n:'Denmark',s:'DEN'}, 5034:{n:'Sweden',s:'SWE'}, 5035:{n:'Austria',s:'AUT'},
  5036:{n:'Serbia',s:'SRB'}, 5037:{n:'Czechia',s:'CZE'}, 5038:{n:'Poland',s:'POL'},
  5039:{n:'Wales',s:'WAL'}, 5040:{n:'Scotland',s:'SCO'}, 5041:{n:'Ireland',s:'IRL'},
  5042:{n:'Hungary',s:'HUN'}, 5043:{n:'Romania',s:'ROU'}, 5044:{n:'Slovakia',s:'SVK'},
  5045:{n:'Slovenia',s:'SVN'}, 5046:{n:'Albania',s:'ALB'}, 5047:{n:'Greece',s:'GRE'},
  5048:{n:'Finland',s:'FIN'}, 5049:{n:'Iceland',s:'ISL'}, 5051:{n:'Italy',s:'ITA'},
  5052:{n:'N. Ireland',s:'NIR'}, 5053:{n:'Israel',s:'ISR'}, 5055:{n:'Wales',s:'WAL'},
  5056:{n:'Bosnia',s:'BIH'}, 5057:{n:'Montenegro',s:'MNE'}, 5058:{n:'North Macedonia',s:'MKD'},
  5059:{n:'Georgia',s:'GEO'}, 5060:{n:'Kazakhstan',s:'KAZ'}, 5062:{n:'Tunisia',s:'TUN'},
  5063:{n:'Algeria',s:'ALG'}, 5064:{n:'Nigeria',s:'NGA'}, 5065:{n:'Cameroon',s:'CMR'},
  5066:{n:'Ghana',s:'GHA'}, 5067:{n:'Ivory Coast',s:'CIV'}, 5068:{n:'Mali',s:'MLI'},
  5069:{n:'Burkina Faso',s:'BFA'}, 5071:{n:'Chile',s:'CHI'}, 5072:{n:'Peru',s:'PER'},
  5073:{n:'Ecuador',s:'ECU'}, 5074:{n:'Bolivia',s:'BOL'}, 5075:{n:'Venezuela',s:'VEN'},
  5076:{n:'Japan',s:'JPN'}, 5077:{n:'S. Korea',s:'KOR'}, 5078:{n:'Australia',s:'AUS'},
  5079:{n:'Saudi Arabia',s:'KSA'}, 5080:{n:'Iran',s:'IRN'}, 5081:{n:'Iraq',s:'IRA'},
  5082:{n:'Qatar',s:'QAT'}, 5083:{n:'UAE',s:'UAE'}, 5084:{n:'China',s:'CHN'},
  5085:{n:'Oman',s:'OMA'}, 5086:{n:'Jordan',s:'JOR'}, 5087:{n:'Uzbekistan',s:'UZB'},
  5088:{n:'Syria',s:'SYR'}, 5089:{n:'Thailand',s:'THA'}, 5090:{n:'Vietnam',s:'VIE'},
  5091:{n:'India',s:'IND'}, 5092:{n:'Indonesia',s:'IDN'}, 5094:{n:'Egypt',s:'EGY'},
  5095:{n:'South Africa',s:'SOU'}, 5096:{n:'Cape Verde',s:'CPV'}, 5097:{n:'Angola',s:'ANG'},
  5098:{n:'Gabon',s:'GAB'}, 5099:{n:'Guinea',s:'GUI'}, 5100:{n:'Congo',s:'CON'},
  5101:{n:'Zambia',s:'ZAM'}, 5103:{n:'Tanzania',s:'TAN'}, 5104:{n:'Burundi',s:'BDI'},
  5105:{n:'Rwanda',s:'RWA'}, 5107:{n:'Mexico',s:'MEX'}, 5108:{n:'Panama',s:'PAN'},
  5109:{n:'Honduras',s:'HON'}, 5110:{n:'Costa Rica',s:'CRC'}, 5111:{n:'Jamaica',s:'JAM'},
  5112:{n:'Haiti',s:'HAI'}, 5113:{n:'Trinidad',s:'TRI'}, 5114:{n:'Cuba',s:'CUB'},
  5115:{n:'El Salvador',s:'SLV'}, 5116:{n:'Guatemala',s:'GUA'}, 5117:{n:'Nicaragua',s:'NCA'},
  5118:{n:'New Zealand',s:'NEW'}, 5119:{n:'Curaçao',s:'CUR'}, 5120:{n:'Bosnia',s:'BIH'},
  2380:{n:'Poland',s:'POL'}, 2381:{n:'Serbia',s:'SRB'}, 2382:{n:'Czechia',s:'CZE'},
  2383:{n:'Wales',s:'WAL'}, 2384:{n:'Scotland',s:'SCO'}, 2385:{n:'Austria',s:'AUT'},
  2386:{n:'Hungary',s:'HUN'}, 2387:{n:'Israel',s:'ISR'}, 2390:{n:'Iceland',s:'ISL'},
  2392:{n:'Albania',s:'ALB'}, 2393:{n:'Finland',s:'FIN'}, 2394:{n:'Greece',s:'GRE'},
  14640:{n:'Tunisia',s:'TUN'}, 14641:{n:'Algeria',s:'ALG'}, 14642:{n:'Nigeria',s:'NGA'},
  14643:{n:'Cameroon',s:'CMR'}, 14644:{n:'Ghana',s:'GHA'}, 14645:{n:'Senegal',s:'SEN'},
  14646:{n:'Morocco',s:'MAR'}, 14647:{n:'Egypt',s:'EGY'}, 14648:{n:'Ivory Coast',s:'CIV'},
  14649:{n:'South Africa',s:'SOU'}, 14651:{n:'Mali',s:'MLI'}
};
var _TOP_SCORERS = [];

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function formatTime12(d) {
  var options = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Africa/Cairo' };
  return d.toLocaleTimeString('ar-EG', options);
}

function parseStartTime(g) {
  return new Date(g.startTime);
}

function cairoDateStr(d) {
  return d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
}

function isToday(g) {
  if (!g || !g.startTime) return false;
  return cairoDateStr(parseStartTime(g)) === cairoDateStr(new Date());
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
  if (!comp) return '<span class="md-n">—</span>';
  var name = comp.name || '—';
  var code = comp.symbolicName && _FLAG_ISO2[comp.symbolicName];
  var f = code ? '<img class="md-f" src="https://flagcdn.com/36x27/' + code + '.png" alt="">' : '';
  return f + '<span class="md-n">' + name + '</span>';
}

/* ====== GAME DETAIL FETCH ====== */
function fetchGameDetail(gameId) {
  var url = 'https://webws.365scores.com/web/game/?langId=1&timezoneName=Africa/Cairo&userId=-1&gameId=' + gameId;
  return fetch(url).then(function(r) { return r.json(); });
}

/* ====== RENDER EVENTS ====== */
function renderEvents(events, homeId, awayId, members) {
  var memberMap = {};
  if (members) {
    members.forEach(function(m) { memberMap[m.id] = m; });
  }

  function getPlayerName(pid) {
    if (!pid) return '';
    var m = memberMap[pid];
    return m ? (m.shortName || m.name || '') : '';
  }

  var html = '<div class="md-section md-events-section"><div class="md-section-title"><span>⚡</span> أحداث المباراة</div><div class="md-events">';
  var times = [];
  events.forEach(function(e) { if (times.indexOf(e.gameTime) === -1) times.push(e.gameTime); });
  times.sort(function(a,b) { return a - b; });

  var goalCounts = {};
  events.forEach(function(e) {
    if (e.eventType && (e.eventType.name === 'Goal' || e.eventType.id === 1)) {
      goalCounts[e.competitorId] = (goalCounts[e.competitorId] || 0) + 1;
    }
  });

  times.forEach(function(t) {
    events.filter(function(e) { return e.gameTime === t; }).sort(function(a,b) { return a.order - b.order; }).forEach(function(e) {
      var isHome = e.competitorId === homeId;
      var timeStr = e.gameTimeDisplay || t + "'";
      var icon = '', desc = '';
      var en = e.eventType;

      if (!en) return;

      if (en.name === 'Goal' || en.id === 1) {
        icon = '<span class="ev-icon ev-goal">⚽</span>';
        var g = en.subTypeName === 'Penalty Goal' ? ' (pen.)' : (en.subTypeName === 'Own Goal' ? ' (o.g.)' : '');
        var scorer = getPlayerName(e.playerId);
        var assist = e.extraPlayers && e.extraPlayers[0] ? getPlayerName(e.extraPlayers[0]) : '';
        desc = scorer + g;
        if (assist) desc += ' ( ' + assist + ' )';
      } else if (en.name === 'Yellow Card' || en.id === 2) {
        icon = '<span class="ev-icon ev-yellow">🟨</span>';
        desc = getPlayerName(e.playerId);
      } else if (en.name === 'Red Card' || en.id === 3) {
        icon = '<span class="ev-icon ev-red">🟥</span>';
        desc = getPlayerName(e.playerId);
      } else if (en.name.indexOf('Substitution') >= 0 || en.id === 1000) {
        icon = '<span class="ev-icon ev-sub">🔄</span>';
        var pIn = getPlayerName(e.playerId);
        var pOut = e.extraPlayers && e.extraPlayers[0] ? getPlayerName(e.extraPlayers[0]) : '';
        desc = pIn + (pOut ? ' ← ' + pOut : '');
      } else if (en.name === 'Missed Penalty' || en.id === 7) {
        icon = '<span class="ev-icon ev-miss">❌</span>';
        desc = getPlayerName(e.playerId);
      }

      if (desc) {
        html += '<div class="md-event ' + (isHome ? 'ev-home' : 'ev-away') + '"><span class="ev-time">' + timeStr + '</span>' + icon + '<span class="ev-desc">' + desc + '</span></div>';
      }
    });
  });

  html += '</div></div>';
  return html;
}

/* ====== RENDER LINEUPS ====== */
function renderLineupsTeam(competitor, members) {
  var lineups = competitor.lineups;
  if (!lineups || !lineups.members || lineups.members.length === 0) return '';

  var memberMap = {};
  if (members) { members.forEach(function(m) { memberMap[m.id] = m; }); }

  var formation = lineups.formation || '';
  var teamName = competitor.name || '—';
  var flag = getFlag(competitor.symbolicName);

  var starters = lineups.members.filter(function(m) { return m.status === 1 || m.statusText === 'Starting'; });
  var subs = lineups.members.filter(function(m) { return m.status === 2 || (m.statusText && m.statusText.indexOf('Substitute') >= 0); });

  function playerRow(m) {
    var p = memberMap[m.id];
    var name = p ? (p.shortName || p.name) : '';
    var num = p ? (p.jerseyNumber || '') : '';
    var rank = m.ranking ? '<span class="lu-rating">' + m.ranking.toFixed(1) + '</span>' : '';
    return '<div class="lu-player"><span class="lu-num">' + num + '</span><span class="lu-name">' + name + '</span>' + rank + '</div>';
  }

  var html = '<div class="md-section md-lineups-section"><div class="md-section-title"><span>👥</span> تشكيل ' + teamName + (formation ? ' — ' + formation : '') + '</div>';
  html += '<div class="lu-grid"><div class="lu-col"><div class="lu-label">' + flag + ' التشكيلة الأساسية</div>';
  starters.forEach(function(m) { html += playerRow(m); });
  html += '</div>';
  if (subs.length > 0) {
    html += '<div class="lu-col"><div class="lu-label">🔄 البدلاء</div>';
    subs.forEach(function(m) { html += playerRow(m); });
    html += '</div>';
  }
  html += '</div></div>';
  return html;
}

/* ====== RENDER VENUE ====== */
function renderVenue(venue) {
  if (!venue || !venue.name) return '';
  var parts = [];
  if (venue.name) parts.push('🏟️ ' + venue.name);
  if (venue.capacity) parts.push('👥 السعة: ' + venue.capacity.toLocaleString());
  if (venue.attendance) parts.push('📊 الحضور: ' + venue.attendance.toLocaleString());
  return '<div class="md-section md-venue-section"><div class="md-section-title"><span>📍</span> الملعب</div><div class="md-venue">' + parts.join(' • ') + '</div></div>';
}

/* ====== RENDER OFFICIALS ====== */
function renderOfficials(officials) {
  if (!officials || officials.length === 0) return '';
  var names = officials.map(function(o) { return o.name || ''; }).filter(function(n) { return n; });
  if (names.length === 0) return '';
  return '<div class="md-section md-officials-section"><div class="md-section-title"><span>🔰</span> الحكام</div><div class="md-officials">' + names.join(' • ') + '</div></div>';
}

/* ====== MAIN FETCH ====== */
var _ALL_GAMES = [];
var _CURRENT_VIEW = 'today';

function fetchData() {
  var list = document.getElementById('matchesList');
  var err = document.getElementById('matchError');
  if (!list) return;
  list.innerHTML = '<div class="ldr"><span class="ldr-spin"></span><span>جاري التحميل...</span></div>';
  if (err) err.classList.add('hidden');

  fetch(API_GAMES).then(function(r) { return r.json(); }).then(function(data) {
    list.innerHTML = '';
    _ALL_GAMES = data.games || [];

    /* build competitor map for flag lookup */
    _ALL_GAMES.forEach(function(g) {
      if (g.homeCompetitor && g.homeCompetitor.id) {
        _COMPETITOR_MAP[g.homeCompetitor.id] = { symbolicName: g.homeCompetitor.symbolicName, name: g.homeCompetitor.name };
      }
      if (g.awayCompetitor && g.awayCompetitor.id) {
        _COMPETITOR_MAP[g.awayCompetitor.id] = { symbolicName: g.awayCompetitor.symbolicName, name: g.awayCompetitor.name };
      }
    });

    renderFeatured(_ALL_GAMES);
    renderToday(_ALL_GAMES);
    renderKnockout(_ALL_GAMES);
    if (_CURRENT_VIEW === 'all') switchView('all');
    fetchTopScorers();
  }).catch(function(e) {
    list.innerHTML = '';
    if (err) err.classList.remove('hidden');
  });
}

/* ====== VIEW TOGGLE ====== */
function switchView(view) {
  var todayBtn = document.getElementById('viewTodayBtn');
  var allBtn = document.getElementById('viewAllBtn');
  var matchList = document.getElementById('matchesList');
  var scheduleList = document.getElementById('scheduleList');
  if (!matchList || !scheduleList) return;

  [todayBtn, allBtn].forEach(function(b) { if (b) b.classList.remove('active'); });
  matchList.classList.add('hidden');
  scheduleList.classList.add('hidden');

  if (view === 'today') {
    if (todayBtn) todayBtn.classList.add('active');
    matchList.classList.remove('hidden');
  } else {
    if (allBtn) allBtn.classList.add('active');
    scheduleList.classList.remove('hidden');
  }
}

/* ====== SCHEDULE VIEW ====== */
function renderSchedule(games) {
  var el = document.getElementById('scheduleList');
  if (!el) return;

  var rounds = {};
  games.forEach(function(g) {
    var key = g.stageNum || 1;
    var label = roundLabel(g) || 'مرحلة ' + key;
    if (!rounds[key]) rounds[key] = { label: label, games: [] };
    rounds[key].games.push(g);
  });

  var keys = Object.keys(rounds).sort(function(a,b) { return parseInt(a) - parseInt(b); });
  var html = '';
  keys.forEach(function(k) {
    var round = rounds[k];
    round.games.sort(function(a,b) { return parseStartTime(a) - parseStartTime(b); });
    html += '<div class="schedule-round"><div class="schedule-round-title">' + round.label + ' (' + round.games.length + ' مباراة)</div><div class="schedule-grid">';
    round.games.forEach(function(g) {
      var hComp = g.homeCompetitor;
      var aComp = g.awayCompetitor;
      var hName = (hComp && hComp.name) || '—';
      var aName = (aComp && aComp.name) || '—';
      var hScore = hComp ? Math.round(hComp.score) : void 0;
      var aScore = aComp ? Math.round(aComp.score) : void 0;
      var hs = isNaN(hScore) ? 0 : hScore, as = isNaN(aScore) ? 0 : aScore;
      var d = parseStartTime(g);
      var dateStr = d.toLocaleDateString('ar-EG', { weekday:'short', day:'numeric', month:'short', timeZone: 'Africa/Cairo' });
      var timeStr = formatTime12(d);
      var type = statusGroupToType(g.statusGroup);
      var scoreStr, scoreCls;
      if (type === 'finished') {
        scoreStr = hs + '-' + as;
        scoreCls = 'sm-score';
      } else if (type === 'live') {
        scoreStr = hs + '-' + as;
        scoreCls = 'sm-score live-s';
      } else {
        scoreStr = 'VS';
        scoreCls = 'sm-vs';
      }
      html += '<div class="schedule-match" onclick="showDetail(g_show' + g.id + ', \'' + type + '\')"><div class="sm-date">' + dateStr + '</div><div class="sm-time">' + timeStr + '</div><div class="sm-teams"><span class="sm-team sm-home">' + getFlag(hComp && hComp.symbolicName) + '<span class="sm-n">' + hName + '</span></span><span class="' + scoreCls + '">' + scoreStr + '</span><span class="sm-team sm-away"><span class="sm-n">' + aName + '</span>' + getFlag(aComp && aComp.symbolicName) + '</span></div></div>';
      window['g_show' + g.id] = g;
    });
    html += '</div></div>';
  });
  el.innerHTML = html || '<div class="empty-day"><span>لا توجد مباريات</span></div>';
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

  var hComp = g.homeCompetitor;
  var aComp = g.awayCompetitor;
  var hName = (hComp && hComp.name) || '—';
  var aName = (aComp && aComp.name) || '—';
      var hScore = hComp && hComp.score != null && hComp.score >= 0 ? Math.round(hComp.score) : void 0;
      var aScore = aComp && aComp.score != null && aComp.score >= 0 ? Math.round(aComp.score) : void 0;

  var hFlag = getFlag(hComp && hComp.symbolicName);
  var aFlag = getFlag(aComp && aComp.symbolicName);
  var hRank = hComp && hComp.rankings && hComp.rankings[0] ? '<span class="mc-rank">#' + hComp.rankings[0].position + '</span>' : '';
  var aRank = aComp && aComp.rankings && aComp.rankings[0] ? '<span class="mc-rank">#' + aComp.rankings[0].position + '</span>' : '';
  var hRed = hComp && hComp.redCards > 0 ? '<span class="mc-red">🟥</span>' : '';
  var aRed = aComp && aComp.redCards > 0 ? '<span class="mc-red">🟥</span>' : '';

  var d = parseStartTime(g);
  var dateStr = d.toLocaleDateString('ar-EG', { weekday:'short', day:'numeric', month:'short', timeZone: 'Africa/Cairo' });

  var badgeHTML, extraClass = '', scoreHTML;
  if (type === 'live') {
    var et = g.gameTimeDisplay || '';
    badgeHTML = '<span class="mc-badge b-live"><span class="live-badge-dot"></span> ' + et + '</span>';
    extraClass = ' live-s';
    scoreHTML = '<div class="mc-score-wrap live-s"><span class="mc-score">' + (isNaN(hScore) ? 0 : hScore) + '</span><span class="mc-score-dash">-</span><span class="mc-score">' + (isNaN(aScore) ? 0 : aScore) + '</span></div>';
  } else if (type === 'finished') {
    badgeHTML = '<span class="mc-badge b-end">انتهت</span>';
    if (g.gameTime && g.gameTime > 90) badgeHTML += '<span class="mc-extra">⚡ ET</span>';
    scoreHTML = '<div class="mc-score-wrap"><span class="mc-score">' + (isNaN(hScore) ? 0 : hScore) + '</span><span class="mc-score-dash">-</span><span class="mc-score">' + (isNaN(aScore) ? 0 : aScore) + '</span></div>';
  } else {
    var t = formatTime12(d);
    badgeHTML = '<span class="mc-badge b-up">' + t + '</span>';
    scoreHTML = '<div class="mc-score-wrap mc-vs-wrap"><span class="mc-vs-text">VS</span></div>';
  }

  card.innerHTML = '<div class="mc-hdr"><span class="mc-round">' + roundLabel(g) + '</span><span class="mc-date">' + dateStr + '</span>' + badgeHTML + '</div>' +
    '<div class="mc-body">' +
      '<div class="mc-team mc-home">' + hFlag + '<span class="mc-n">' + hName + '</span>' + hRank + hRed + '</div>' +
      scoreHTML +
      '<div class="mc-team mc-away">' + aFlag + '<span class="mc-n">' + aName + '</span>' + aRank + aRed + '</div>' +
    '</div>';

  card.onclick = function() { showDetail(g, type); };

  return card;
}

/* ====== RENDER GOAL SCORERS ====== */
function renderGoalScorers(events, homeId, awayId, members) {
  var memberMap = {};
  if (members) { members.forEach(function(m) { memberMap[m.id] = m; }); }

  function getName(pid) {
    if (!pid) return '';
    var m = memberMap[pid];
    return m ? (m.shortName || m.name || '') : '';
  }

  var homeGoals = [], awayGoals = [];
  var goalTypes = { 1: true, '1': true };
  events.forEach(function(e) {
    if (e.eventType && (e.eventType.name === 'Goal' || goalTypes[e.eventType.id])) {
      var goalInfo = {
        time: e.gameTimeDisplay || e.gameTime + "'",
        scorer: getName(e.playerId),
        type: e.eventType.subTypeName || '',
        assist: e.extraPlayers && e.extraPlayers[0] ? getName(e.extraPlayers[0]) : ''
      };
      if (e.competitorId === homeId) homeGoals.push(goalInfo);
      else awayGoals.push(goalInfo);
    }
  });

  var html = '<div class="md-section md-scorers-section"><div class="md-section-title"><span>⚽</span> الهدافون</div><div class="md-scorers-list">';
  html += '<div class="md-scorers-col"><div class="md-scorers-col-title"></div>';
  homeGoals.forEach(function(g) {
    var typeLabel = g.type === 'Penalty Goal' ? ' (pen)' : g.type === 'Own Goal' ? ' (o.g.)' : '';
    html += '<div class="md-scorer"><span class="md-scorer-time">' + g.time + '</span><span class="md-scorer-icon">⚽</span><span class="md-scorer-name">' + g.scorer + typeLabel + '</span></div>';
  });
  if (homeGoals.length === 0) html += '<div class="md-scorer" style="opacity:0.4">—</div>';
  html += '</div>';
  html += '<div class="md-scorers-col"><div class="md-scorers-col-title"></div>';
  awayGoals.forEach(function(g) {
    var typeLabel = g.type === 'Penalty Goal' ? ' (pen)' : g.type === 'Own Goal' ? ' (o.g.)' : '';
    html += '<div class="md-scorer"><span class="md-scorer-icon">⚽</span><span class="md-scorer-name">' + g.scorer + typeLabel + '</span><span class="md-scorer-time">' + g.time + '</span></div>';
  });
  if (awayGoals.length === 0) html += '<div class="md-scorer" style="opacity:0.4">—</div>';
  html += '</div></div></div>';

  return html;
}
function showDetail(g, type) {
  var ov = document.getElementById('matchDetail');
  var inner = document.getElementById('matchDetailInner');
  if (!ov || !inner) return;

  var hComp = g.homeCompetitor;
  var aComp = g.awayCompetitor;
  var hName = (hComp && hComp.name) || '—';
  var aName = (aComp && aComp.name) || '—';
  var hScore = hComp && hComp.score != null ? Math.round(hComp.score) : void 0;
  var aScore = aComp && aComp.score != null ? Math.round(aComp.score) : void 0;

  var hRank = hComp && hComp.rankings && hComp.rankings[0] ? '<span class="md-rank">FIFA #' + hComp.rankings[0].position + '</span>' : '';
  var aRank = aComp && aComp.rankings && aComp.rankings[0] ? '<span class="md-rank">FIFA #' + aComp.rankings[0].position + '</span>' : '';

  var scoreBig;
  if (type === 'upcoming' || type === 'notstarted') {
    var d = parseStartTime(g);
    scoreBig = '<div class="md-time-big">' + formatTime12(d) + '</div><div class="md-date-big">' + d.toLocaleDateString('ar-EG', { weekday:'long', month:'long', day:'numeric', timeZone: 'Africa/Cairo' }) + '</div>';
  } else {
    var hs = isNaN(hScore) ? 0 : hScore;
    var as = isNaN(aScore) ? 0 : aScore;
    scoreBig = '<div class="md-score-big">' + hs + ' - ' + as + '</div>';
  }

  var statusInfo = '';
  if (type === 'finished' && g.statusText && g.statusText !== 'Ended') {
    statusInfo = '<div class="md-status-info">' + g.statusText + ' (بعد ' + Math.round(g.gameTime || 90) + ' دقيقة)</div>';
  }
  if (type === 'live') {
    statusInfo = '<div class="md-status-info live">' + g.gameTimeDisplay + ' — ' + (g.statusText || 'جارية') + '</div>';
  }

  inner.innerHTML = '<div class="md-close" onclick="document.getElementById(\'matchDetail\').classList.add(\'hidden\')">✕</div>' +
    '<div class="md-round">' + roundLabel(g) + '</div>' +
    '<div class="md-teams">' +
      '<div class="md-t">' + teamHTML(hComp) + hRank + '</div>' +
      scoreBig +
      '<div class="md-t">' + teamHTML(aComp) + aRank + '</div>' +
    '</div>' + statusInfo +
    '<div class="md-actions"><button class="md-btn md-btn-watch" onclick="watchMatch()">▶ شاهد المباراة</button></div>' +
    '<div id="mdGoalScorers" class="md-goal-scorers-section"></div>' +
    '<div id="mdDetailSection" class="md-detail-section"><div class="ldr"><span class="ldr-spin"></span><span>جاري تحميل التفاصيل...</span></div></div>';

  ov.classList.remove('hidden');

  if (g.id && (type === 'finished' || type === 'live')) {
    var gameId = g.id;
    fetchGameDetail(gameId).then(function(data) {
      var game = data && data.game;
      if (!game) {
        var de = document.getElementById('mdDetailSection');
        if (de) de.innerHTML = '';
        return;
      }

      var html = '';
      var hCompDetail = game.homeCompetitor;
      var aCompDetail = game.awayCompetitor;
      var members = game.members;

      if (game.events && game.events.length > 2) {
        var gsEl = document.getElementById('mdGoalScorers');
        if (gsEl) gsEl.innerHTML = renderGoalScorers(game.events, hCompDetail.id, aCompDetail.id, members);
      }

      if (game.events && game.events.length > 2) {
        html += renderEvents(game.events, hCompDetail.id, aCompDetail.id, members);
      }
      if (hCompDetail.lineups && hCompDetail.lineups.members && hCompDetail.lineups.members.length > 0) {
        html += renderLineupsTeam(hCompDetail, members);
        html += renderLineupsTeam(aCompDetail, members);
      }
      if (game.venue) {
        html += renderVenue(game.venue);
      }
      if (game.officials) {
        html += renderOfficials(game.officials);
      }

      var de = document.getElementById('mdDetailSection');
      if (de) de.innerHTML = html || '<div class="md-no-detail">لا توجد تفاصيل إضافية</div>';
    }).catch(function() {
      var de = document.getElementById('mdDetailSection');
      if (de) de.innerHTML = '';
    });
  } else {
    var de = document.getElementById('mdDetailSection');
    if (de) de.innerHTML = '';
  }
}

function closeDetail(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('matchDetail').classList.add('hidden');
}

function watchMatch() {
  navigateTo('player');
}

/* ====== KNOCKOUT ROUNDS (كل الأدوار الإقصائية) ====== */
function renderKnockout(games) {
  var el = document.getElementById('koList');
  if (!el) return;
  _KO_GAMES_CACHE = games;

  var rounds = { 3: [], 4: [], 5: [], 6: [] };
  var labels = { 3: 'دور 16', 4: 'ربع النهائي', 5: 'نصف النهائي', 6: '🏆 النهائي' };

  games.forEach(function(g) {
    var sn = g.stageNum;
    if (rounds[sn]) rounds[sn].push(g);
  });

  var koSection = document.getElementById('knockoutSection');
  var hasAny = false;
  for (var k in rounds) { if (rounds[k].length > 0) hasAny = true; }

  if (!hasAny) {
    if (koSection) koSection.style.display = 'none';
    return;
  }
  if (koSection) koSection.style.display = '';

  el.innerHTML = '';
  var roundKeys = [3, 4, 5, 6];

  roundKeys.forEach(function(rk) {
    var rg = rounds[rk];
    if (rg.length === 0) return;

    rg.sort(function(a,b) { return parseStartTime(a) - parseStartTime(b); });

    var h = document.createElement('div');
    h.className = 'sec-label';
    h.innerHTML = '<span>' + labels[rk] + '</span><span class="sec-count">' + rg.length + '</span>';
    el.appendChild(h);

    rg.forEach(function(g) {
      var hComp = g.homeCompetitor;
      var aComp = g.awayCompetitor;
      var hName = (hComp && hComp.name) || '?';
      var aName = (aComp && aComp.name) || '?';
      var hScore = hComp ? Math.round(hComp.score) : void 0;
      var aScore = aComp ? Math.round(aComp.score) : void 0;
      var type = statusGroupToType(g.statusGroup);
      var d = parseStartTime(g);
      var dateStr = d.toLocaleDateString('ar-EG', { weekday:'short', day:'numeric', month:'short', timeZone: 'Africa/Cairo' });

      var card = document.createElement('div');
      card.className = 'mc mc-' + type;

      var hFlag = getFlag(hComp && hComp.symbolicName);
      var aFlag = getFlag(aComp && aComp.symbolicName);

      var badgeHTML, scoreHTML;
      if (type === 'live') {
        badgeHTML = '<span class="mc-badge b-live"><span class="live-badge-dot"></span> ' + (g.gameTimeDisplay || '') + '</span>';
        scoreHTML = '<div class="mc-score-wrap live-s"><span class="mc-score">' + (isNaN(hScore) ? 0 : hScore) + '</span><span class="mc-score-dash">-</span><span class="mc-score">' + (isNaN(aScore) ? 0 : aScore) + '</span></div>';
      } else if (type === 'finished') {
        badgeHTML = '<span class="mc-badge b-end">انتهت</span>';
        scoreHTML = '<div class="mc-score-wrap"><span class="mc-score">' + (isNaN(hScore) ? 0 : hScore) + '</span><span class="mc-score-dash">-</span><span class="mc-score">' + (isNaN(aScore) ? 0 : aScore) + '</span></div>';
      } else {
        var timeStr = formatTime12(d);
        badgeHTML = '<span class="mc-badge b-up">' + timeStr + '</span>';
        scoreHTML = '<div class="mc-score-wrap mc-vs-wrap"><span class="mc-vs-text">VS</span></div>';
      }

      card.innerHTML =
        '<div class="mc-hdr"><span class="mc-round">' + labels[rk] + '</span><span class="mc-date">' + dateStr + '</span>' + badgeHTML + '</div>' +
        '<div class="mc-body">' +
          '<div class="mc-team mc-home">' + hFlag + '<span class="mc-n">' + hName + '</span></div>' +
          scoreHTML +
          '<div class="mc-team mc-away">' + aFlag + '<span class="mc-n">' + aName + '</span></div>' +
        '</div>';

      card.onclick = function() { showDetail(g, type); };
      el.appendChild(card);
    });
  });

  if (document.getElementById('koTabBracket') && document.getElementById('koTabBracket').classList.contains('active')) {
    renderBracketTree(games);
  }
}

/* ====== KNOCKOUT TOGGLE + BRACKET TREE ====== */
var _KO_GAMES_CACHE = [];

function switchKoTab(tab) {
  document.getElementById('koTabMatches').classList.toggle('active', tab === 'matches');
  document.getElementById('koTabBracket').classList.toggle('active', tab === 'bracket');
  document.getElementById('koList').classList.toggle('hidden', tab !== 'matches');
  document.getElementById('koBracket').classList.toggle('hidden', tab !== 'bracket');
  if (tab === 'bracket') renderBracketTree(_KO_GAMES_CACHE);
}

function renderBracketTree(games) {
  var el = document.getElementById('koBracket');
  if (!el || !games.length) return;

  var roundMeta = {
    3: { key: 3, label: 'دور 16',     next: 4 },
    4: { key: 4, label: 'ربع النهائي', next: 5 },
    5: { key: 5, label: 'نصف النهائي', next: 6 },
    6: { key: 6, label: '🏆 النهائي',  next: null }
  };

  var grouped = {};
  games.forEach(function(g) {
    var sn = g.stageNum;
    if (!roundMeta[sn]) return;
    if (!grouped[sn]) grouped[sn] = [];
    grouped[sn].push(g);
  });

  var hasAny = false;
  for (var k in grouped) { if (grouped[k].length > 0) hasAny = true; }
  if (!hasAny) { el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:12px">لا توجد مباريات إقصائية بعد</div>'; return; }

  var roundOrder = [3, 4, 5, 6].filter(function(r) { return grouped[r] && grouped[r].length > 0; });

  roundOrder.forEach(function(r) {
    grouped[r].sort(function(a, b) {
      return (a.startTime || 0) - (b.startTime || 0);
    });
  });

  var winners = {};

  function getTeamSide(game, side) {
    var c = side === 'home' ? game.homeCompetitor : game.awayCompetitor;
    var name = (c && c.name) || '—';
    var code = (c && c.symbolicName) && _FLAG_ISO2[c.symbolicName];
    var flagSrc = code ? 'https://flagcdn.com/24x18/' + code + '.png' : '';
    var rawScore = (c && c.score != null) ? Math.round(c.score) : null;
    var score = (rawScore !== null && rawScore >= 0) ? rawScore : null;
    var sym = (c && c.symbolicName) || '';
    var type = statusGroupToType(game.statusGroup);
    var isWinner = false;
    if (type === 'finished' && score !== null) {
      var oppC = side === 'home' ? game.awayCompetitor : game.homeCompetitor;
      var oppRaw = (oppC && oppC.score != null) ? Math.round(oppC.score) : null;
      var oppScore = (oppRaw !== null && oppRaw >= 0) ? oppRaw : null;
      if (oppScore !== null && score > oppScore) isWinner = true;
    }
    return { name: name, flagSrc: flagSrc, score: score, sym: sym, isWinner: isWinner };
  }

  var wrap = document.createElement('div');
  wrap.className = 'br-wrap';

  var lastColY = {};

  roundOrder.forEach(function(rnd, ri) {
    var rndGames = grouped[rnd];
    var meta = roundMeta[rnd];
    var col = document.createElement('div');
    col.className = 'br-column';

    var title = document.createElement('div');
    title.className = 'br-col-title';
    title.textContent = meta.label;
    col.appendChild(title);

    var spacer = document.createElement('div');
    spacer.className = 'br-spacer';
    col.appendChild(spacer);

    rndGames.forEach(function(g, gi) {
      var home = getTeamSide(g, 'home');
      var away = getTeamSide(g, 'away');
      var type = statusGroupToType(g.statusGroup);

      var homeWinner = false, awayWinner = false;
      if (type === 'finished' && home.score !== null && away.score !== null) {
        if (home.score > away.score) homeWinner = true;
        else if (away.score > home.score) awayWinner = true;
      }

      var matchId = g.gameId || g.id;
      winners[matchId] = homeWinner ? home : awayWinner ? away : null;

      var card = document.createElement('div');
      card.className = 'br-matchup';
      card.onclick = (function(game, tp) { return function() { showDetail(game, tp); }; })(g, type);

      var teamRow = function(side, won) {
        var cls = 'br-team' + (won ? ' winner' : '');
        var flagHtml = side.flagSrc ? '<img class="br-flag" src="' + side.flagSrc + '" alt="" onerror="this.style.display=\'none\'">' : '';
        var scoreHtml = side.score !== null ? '<span class="br-ts">' + side.score + '</span>' : '';
        return '<div class="' + cls + '">' +
          flagHtml +
          '<span class="br-tname">' + side.name + '</span>' +
          scoreHtml + '</div>';
      };

      var vsRow = type === 'finished'
        ? '<div class="br-vs">' + (g.penaltyScore ? 'ركلات ترجيح' : 'انتهت') + '</div>'
        : type === 'live'
          ? '<div class="br-vs">' + (g.gameTimeDisplay || 'مباشر') + '</div>'
          : '<div class="br-vs">VS</div>';

      card.innerHTML = teamRow(home, homeWinner) + vsRow + teamRow(away, awayWinner);
      col.appendChild(card);
    });

    lastColY[rnd] = rndGames.length;
    wrap.appendChild(col);

    if (ri < roundOrder.length - 1) {
      var lineCol = document.createElement('div');
      lineCol.className = 'br-column';
      lineCol.style.minWidth = '24px';
      lineCol.style.maxWidth = '24px';
      lineCol.appendChild(document.createElement('div'));
      lineCol.appendChild(document.createElement('div'));

      var numMatches = rndGames.length;
      for (var li = 0; li < numMatches; li++) {
        var line = document.createElement('div');
        line.style.height = '46px';
        line.style.display = 'flex';
        line.style.alignItems = 'center';
        line.style.justifyContent = 'center';
        line.innerHTML = '<span style="color:var(--primary);font-size:8px;opacity:.5">▸</span>';
        lineCol.appendChild(line);
      }
      wrap.appendChild(lineCol);
    }
  });

  el.innerHTML = '';
  el.appendChild(wrap);
}

/* ====== FEATURED MATCHES (NEXT MATCH + COUNTDOWN) ====== */
var _COUNTDOWN_INTERVAL = null;

function renderFeatured(games) {
  var el = document.getElementById('featuredList');
  if (!el) return;

  var upcoming = [];
  games.forEach(function(g) {
    var type = statusGroupToType(g.statusGroup);
    if (type === 'notstarted') upcoming.push(g);
  });
  upcoming.sort(function(a,b) { return parseStartTime(a) - parseStartTime(b); });

  var next = upcoming.slice(0, 5);
  if (next.length === 0) { el.innerHTML = ''; return; }

  el.innerHTML = '';
  next.forEach(function(g) {
    var hComp = g.homeCompetitor;
    var aComp = g.awayCompetitor;
    var hName = (hComp && hComp.name) || '—';
    var aName = (aComp && aComp.name) || '—';
    var d = parseStartTime(g);
    var dateStr = d.toLocaleDateString('ar-EG', { weekday:'short', day:'numeric', month:'short', timeZone: 'Africa/Cairo' });
    var timeStr = formatTime12(d);

    var card = document.createElement('div');
    card.className = 'mc mc-upcoming';
    card.innerHTML =
      '<div class="mc-hdr"><span class="mc-round">' + roundLabel(g) + '</span><span class="mc-date">' + dateStr + '</span><span class="mc-badge b-up">' + timeStr + '</span></div>' +
      '<div class="mc-body">' +
        '<div class="mc-team mc-home">' + getFlag(hComp && hComp.symbolicName) + '<span class="mc-n">' + hName + '</span></div>' +
        '<div class="mc-score-wrap mc-vs-wrap"><span class="mc-vs-text">VS</span></div>' +
        '<div class="mc-team mc-away">' + getFlag(aComp && aComp.symbolicName) + '<span class="mc-n">' + aName + '</span></div>' +
      '</div>' +
      '<div class="mc-sc fb-timer" data-start="' + g.startTime + '"><span class="fb-timer-lbl">يبدأ بعد </span><span class="fb-timer-val">--:--:--</span></div>';
    card.onclick = function() { showDetail(g, 'upcoming'); };
    el.appendChild(card);
  });

  if (_COUNTDOWN_INTERVAL) clearInterval(_COUNTDOWN_INTERVAL);
  _COUNTDOWN_INTERVAL = setInterval(updateCountdowns, 1000);
  updateCountdowns();
}

function updateCountdowns() {
  var timers = document.querySelectorAll('.fb-timer');
  var now = new Date();
  var nowMs = now.getTime() + now.getTimezoneOffset() * 60000; // convert local to UTC
  timers.forEach(function(el) {
    var start = el.getAttribute('data-start');
    if (!start) return;
    var matchTime = new Date(start).getTime();
    var diff = matchTime - nowMs;
    if (diff <= 0) {
      el.querySelector('.fb-timer-val').textContent = 'بدأت!';
      return;
    }
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);
    var str = '';
    if (days > 0) str += days + 'd ';
    str += pad(hours) + ':' + pad(mins) + ':' + pad(secs);
    el.querySelector('.fb-timer-val').textContent = str;
  });
}


/* ====== TOP SCORERS ====== */
function fetchTopScorers() {
  fetch(API_STATS).then(function(r) { return r.json(); }).then(function(data) {
    var rows = data && data.stats && data.stats.athletesStats && data.stats.athletesStats[0] && data.stats.athletesStats[0].rows;
    if (!rows || rows.length === 0) return;
    _TOP_SCORERS = rows.slice(0, 4);
    renderTopScorers();
  }).catch(function() {});
}

function renderTopScorers() {
  var el = document.getElementById('topScorersList');
  if (!el || _TOP_SCORERS.length === 0) return;

  el.innerHTML = '';
  _TOP_SCORERS.forEach(function(row, idx) {
    var ent = row.entity;
    if (!ent) return;
    var name = ent.shortName || ent.name || '';
    var goals = row.stats && row.stats[0] ? row.stats[0].value : '0';
    var imgUrl = 'https://img.a.transfermarkt.technology/portrait/small/' + ent.id + '.png';
    var flagCode = '';
    var teamName = '';
    if (_COMPETITOR_MAP[ent.competitorId]) {
      flagCode = _COMPETITOR_MAP[ent.competitorId].symbolicName;
      teamName = _COMPETITOR_MAP[ent.competitorId].name;
    } else if (_TEAM_MAP[ent.competitorId]) {
      flagCode = _TEAM_MAP[ent.competitorId].s;
      teamName = _TEAM_MAP[ent.competitorId].n;
    }
    var flagUrl = flagCode && _FLAG_ISO2[flagCode] ? 'https://flagcdn.com/24x18/' + _FLAG_ISO2[flagCode] + '.png' : '';
    var initials = name.split(' ').map(function(w){ return w.charAt(0); }).join('').substring(0,2).toUpperCase();

    var card = document.createElement('div');
    card.className = 'ts-card';
    card.onclick = function() { showPlayerPopup(name, imgUrl, teamName, flagUrl, goals, ent.positionShortName || '', initials); };

    var flagHtml = flagUrl ? '<img class="ts-flag" src="' + flagUrl + '" alt="" onerror="this.style.display=\'none\'">' : '';

    card.innerHTML =
      '<div class="ts-rank">' + (idx + 1) + '</div>' +
      '<div class="ts-avatar" data-initials="' + initials + '">' +
        '<img class="ts-img" src="' + imgUrl + '" alt="' + name + '" loading="lazy" onerror="this.style.display=\'none\';this.parentElement.classList.add(\'ts-fallback\')">' +
      '</div>' +
      '<div class="ts-info">' +
        '<span class="ts-name">' + name + '</span>' +
        '<span class="ts-team">' + flagHtml + teamName + '</span>' +
      '</div>' +
      '<div class="ts-goals"><span class="ts-g-num">' + goals + '</span><span class="ts-g-label">هدف</span></div>';
    el.appendChild(card);
  });
}

function showPlayerPopup(name, imgUrl, teamName, flagUrl, goals, position, initials) {
  var existing = document.getElementById('playerPopup');
  if (existing) existing.remove();

  var flagHtml = flagUrl ? '<img src="' + flagUrl + '" style="width:20px;height:14px;border-radius:2px;vertical-align:middle;margin-left:4px" alt="" onerror="this.style.display=\'none\'">' : '';

  var ov = document.createElement('div');
  ov.id = 'playerPopup';
  ov.className = 'player-popup-overlay';
  ov.onclick = function(e) { if (e.target === ov) ov.remove(); };

  ov.innerHTML =
    '<div class="player-popup-card">' +
      '<button class="pp-close" onclick="document.getElementById(\'playerPopup\').remove()">✕</button>' +
      '<div class="pp-avatar" data-initials="' + (initials || '') + '">' +
        '<img class="pp-img" src="' + imgUrl + '" alt="' + name + '" onerror="this.style.display=\'none\';this.parentElement.classList.add(\'pp-fallback\')">' +
      '</div>' +
      '<div class="pp-name">' + name + '</div>' +
      '<div class="pp-team">' + flagHtml + teamName + (position ? ' · ' + position : '') + '</div>' +
      '<div class="pp-goals"><span class="pp-g-num">' + goals + '</span><span class="pp-g-label">هدف</span></div>' +
    '</div>';

  document.body.appendChild(ov);
}

/* ====== INIT ====== */
function initHome() {
  fetchData();
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
    if (_COUNTDOWN_INTERVAL) { clearInterval(_COUNTDOWN_INTERVAL); _COUNTDOWN_INTERVAL = null; }
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
_global.fetchData = fetchData;
_global.navigateTo = navigateTo;
_global.switchView = switchView;
_global.switchKoTab = switchKoTab;

console.log('app.js initialized');
})();
