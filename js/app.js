/* 2027 고입 챙김판 — 반별 보기 · 학교별 보기 · 일정표 · 진행 현황 */
(function () {
  'use strict';

  const DEMO = !window.IB_API || /[?&]demo\b/.test(location.search);
  const LS = 'ibsi26.';
  const $ = (sel, el) => (el || document).querySelector(sel);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(LS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } },
    del(k) { try { localStorage.removeItem(LS + k); } catch (e) { /* noop */ } }
  };

  const S = {
    pw: store.get('pw', ''), by: store.get('by', ''),
    students: [], progress: {}, loadedAt: 0,
    showChecks: store.get('showChecks', false),
    showPast: false, filter: store.get('filter', 'all'), schedBan: 'all', statusBan: store.get('ban', 1)
  };

  /* ───────── 학교 매칭 ───────── */
  const norm = s => String(s || '').replace(/\s+/g, '').replace(/고등학교/g, '고').replace(/\((경기|서울)\)$/, '');
  const SCHOOL_BY_ID = {};
  const ALIAS = {};
  IB.SCHOOLS.forEach(sc => {
    SCHOOL_BY_ID[sc.id] = sc;
    [sc.name].concat(sc.aliases || []).forEach(a => { ALIAS[norm(a)] = sc; });
  });
  const KNOWN_LATE = new Set(IB.KNOWN_LATE.map(norm));
  const UNDECIDED = /^(고민중?|미정|모름|없음|\.|-|x|X|\?)$/;

  function matchSchool(raw, col) {
    const n = norm(raw);
    const sc = ALIAS[n];
    if (!sc) return null;
    if (col === 'late' && sc.earlyOnly) return null;
    return sc;
  }
  function splitList(t) {
    return String(t || '').split(/[,，、\/]|\n/).map(x => x.trim()).filter(Boolean);
  }
  /** 학생의 지망을 구조화: early:[{raw, dept, school, undecided, lateLike}], late:[...] */
  function choicesOf(st) {
    const e = splitList(st.early), d = splitList(st.dept);
    const early = e.map((raw, i) => {
      const school = matchSchool(raw, 'early');
      const undecided = UNDECIDED.test(raw.replace(/\s/g, ''));
      return {
        raw, school, undecided,
        dept: d.length === e.length ? d[i] : (i === 0 ? st.dept : ''),
        lateLike: !school && !undecided && KNOWN_LATE.has(norm(raw))
      };
    });
    if (!e.length && st.dept) early.push({ raw: '', school: null, undecided: true, dept: st.dept, lateLike: false });
    const late = splitList(st.late).map(raw => ({ raw, undecided: UNDECIDED.test(raw.replace(/\s/g, '')) }));
    return { early, late };
  }
  function earlySchools(st) {
    const seen = {}; const out = [];
    choicesOf(st).early.forEach(c => { if (c.school && !seen[c.school.id]) { seen[c.school.id] = 1; out.push(c.school); } });
    return out;
  }
  function category(st) {
    const c = choicesOf(st);
    if (c.early.some(x => x.school || (!x.undecided && x.raw))) return 'early';
    if (c.late.some(x => !x.undecided)) return 'late';
    return 'none';
  }

  /* ───────── 날짜 ───────── */
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const toDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const md = s => { const d = toDate(s); return (d.getMonth() + 1) + '/' + d.getDate() + '(' + DOW[d.getDay()] + ')'; };
  const mdShort = s => { const d = toDate(s); return (d.getMonth() + 1) + '/' + d.getDate(); };
  const range = e => md(e.date) + (e.end ? '~' + md(e.end) : '') + (e.time ? ' ' + e.time : '');
  const dday = s => {
    const n = Math.round((toDate(s) - today()) / 864e5);
    return n === 0 ? 'D-day' : n > 0 ? 'D-' + n : '';
  };
  const isPast = e => toDate(e.end || e.date) < today();

  /* ───────── 진행(전형·상태·체크) ───────── */
  const prog = st => S.progress[st.id] || { track: '', status: '', checks: {} };
  const TRACKS = ['', '특별전형', '일반전형', '기타(특례 등)'];
  const STATUSES = ['', '준비 중', '원서 접수 완료', '1차 합격', '1차 불합격', '최종 합격', '불합격', '합격 포기'];
  const statusClass = s => /최종 합격|^1차 합격/.test(s) ? 'ok' : /불합격|포기/.test(s) ? 'bad' : s ? 'mid' : '';

  function trackFilter(track) {
    if (track === '일반전형') return x => /일반|공통/.test(x.track || '공통') || !/특별|미래인재|상일인재|디자인인재/.test(x.track || '');
    if (track === '특별전형') return x => !/^일반$/.test(x.track || '');
    return () => true;
  }
  function eventFilter(track) {
    if (track === '일반전형') return e => !/특별/.test(e.label) && e.kind !== 'result1' && !(e.kind === 'exam' && !/일반/.test(e.label));
    if (track === '특별전형') return e => !/일반/.test(e.label);
    return () => true;
  }
  /** 학생에게 해당하는 체크 항목 */
  function checklistOf(st) {
    const p = prog(st);
    const items = [{ key: 'common:confirm', text: '지원 학교·학과·전형 최종 확인(학생·학부모)', who: '담임' }];
    earlySchools(st).forEach(sc => {
      (sc.docs || []).filter(x => x.check).filter(trackFilter(p.track)).forEach(doc => {
        items.push({ key: sc.id + ':' + doc.id, text: doc.name, who: doc.who, sub: doc.how, school: sc.name });
      });
      (sc.dates || []).filter(e => e.kind === 'exam' || e.kind === 'result').filter(eventFilter(p.track)).forEach(e => {
        items.push({
          key: sc.id + ':d:' + e.date + ':' + e.kind,
          text: e.kind === 'exam' ? '면접·실기 ' + mdShort(e.date) + ' — 출결 처리·수험표·준비물 확인' : '합격 발표 확인 ' + mdShort(e.date) + (e.time ? ' ' + e.time : ''),
          who: '담임', school: sc.name
        });
      });
    });
    if (!earlySchools(st).length && category(st) === 'late') {
      items.push({ key: 'late:apply', text: '후기 일반고 원서 접수(12/4~12/10)', who: '담임' });
    }
    return items;
  }
  function checkStat(st) {
    const items = checklistOf(st); const c = prog(st).checks || {};
    return { done: items.filter(i => c[i.key]).length, total: items.length };
  }

  /** 학생에게 해당하는 일정(학교별 + 공통) */
  function eventsOf(st) {
    const p = prog(st); const f = eventFilter(p.track);
    const scs = earlySchools(st);
    const out = [];
    scs.forEach(sc => (sc.dates || []).filter(f).forEach(e => out.push(Object.assign({ school: sc.name }, e))));
    const cat = category(st);
    const scopes = new Set(['all']);
    if (cat === 'early') scopes.add('early');
    if (scs.some(sc => sc.area === 'gg' && sc.type !== '마이스터고' && sc.type !== '예술고')) scopes.add('gg');
    if (scs.some(sc => sc.area === 'seoul' && sc.type === '특성화고')) scopes.add('seoul');
    if (cat !== 'early' || /불합격|포기/.test(p.status)) scopes.add('late');
    IB.COMMON_EVENTS.filter(e => scopes.has(e.scope)).forEach(e => {
      if (e.scope === 'gg' || e.scope === 'seoul') return; // 학교 일정과 겹침
      out.push(Object.assign({ school: '' }, e));
    });
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }
  /** 다음 일정: 지망 학교 일정을 우선, 없으면 공통 일정 */
  function nextEventOf(st) {
    const up = eventsOf(st).filter(e => !isPast(e));
    return up.find(e => e.school) || up[0];
  }

  /* ───────── API ───────── */
  async function api(action, body) {
    if (DEMO) return demoApi(action, body || {});
    const res = await fetch(window.IB_API, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action, pw: S.pw }, body || {}))
    });
    const j = await res.json();
    if (!j.ok) { const err = new Error(j.error || 'error'); err.data = j; throw err; }
    return j;
  }
  function demoApi(action, b) {
    const D = window.IB_DEMO;
    if (action === 'login') return Promise.resolve({ ok: true });
    if (action === 'data') return Promise.resolve({ ok: true, students: JSON.parse(JSON.stringify(D.students)), progress: JSON.parse(JSON.stringify(D.progress)) });
    if (action === 'saveChoice') {
      const st = D.students.find(s => s.id === b.id);
      Object.assign(st, b.fields);
      return Promise.resolve({ ok: true, student: JSON.parse(JSON.stringify(st)) });
    }
    if (action === 'saveProgress') {
      const p = D.progress[b.id] || (D.progress[b.id] = { track: '', status: '', checks: {} });
      const pt = b.patch || {};
      if (pt.checks) Object.keys(pt.checks).forEach(k => { if (pt.checks[k]) p.checks[k] = new Date().toISOString().slice(0, 10); else delete p.checks[k]; });
      if ('track' in pt) p.track = pt.track;
      if ('status' in pt) p.status = pt.status;
      return Promise.resolve({ ok: true, progress: JSON.parse(JSON.stringify(p)) });
    }
    return Promise.reject(new Error('unknown'));
  }

  async function load(quiet) {
    if (!quiet) $('#main').innerHTML = '<p class="loading">불러오는 중…</p>';
    try {
      const d = await api('data');
      S.students = d.students.sort((a, b) => a.id.localeCompare(b.id));
      S.progress = d.progress || {};
      S.loadedAt = Date.now();
      render();
    } catch (err) {
      if (err.message === 'auth') { logout('비밀번호가 바뀌었거나 틀렸습니다. 다시 입력해 주세요.'); return; }
      $('#main').innerHTML = '<p class="error">데이터를 불러오지 못했습니다: ' + esc(err.message) + ' <button class="btn" id="retry">다시 시도</button></p>';
      $('#retry').onclick = () => load();
    }
  }

  function toast(msg, bad) {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.className = 'toast'; }, 2600);
  }

  /* ───────── 라우팅 ───────── */
  function route() {
    const h = location.hash.replace(/^#/, '');
    const [mode, arg] = h.split('=');
    return { mode: mode || 'class', arg: arg ? decodeURIComponent(arg) : '' };
  }
  const go = (mode, arg) => { location.hash = mode + (arg != null && arg !== '' ? '=' + encodeURIComponent(arg) : ''); };

  /* ───────── 렌더: 공통 조각 ───────── */
  const typeClass = t => ({ '특성화고': 't-voc', '마이스터고': 't-mei', '예술고': 't-art', '일반고 특성화학과': 't-gen' }[t] || 't-etc');
  const areaLabel = a => ({ gg: '경기', seoul: '서울', other: '타 지역' }[a] || '');

  function schoolTag(sc) {
    return '<span class="tag ' + typeClass(sc.type) + '">' + esc(sc.type) + (sc.area ? ' · ' + areaLabel(sc.area) : '') + '</span>';
  }
  function keyDates(sc, track) {
    const f = eventFilter(track);
    const label = { apply: '원서', result1: '1차 발표', exam: '면접·실기', result: '발표' };
    const out = []; const used = {};
    (sc.dates || []).filter(f).forEach(e => {
      if (!label[e.kind] || used[e.kind]) return;
      used[e.kind] = 1;
      const past = isPast(e);
      out.push('<span class="kd' + (past ? ' past' : '') + '">' + label[e.kind] + ' ' + mdShort(e.date) + (e.end ? '~' + mdShort(e.end) : '') + (e.time && e.kind !== 'apply' ? ' ' + esc(e.time) : '') + '</span>');
    });
    return out.join('<span class="arr">→</span>');
  }
  function docsLine(sc, track) {
    const docs = (sc.docs || []).filter(x => x.id !== 'app').filter(trackFilter(track));
    if (!docs.length) return '<span class="muted">원서 외 추가 서류 없음</span>';
    return docs.map(x => '<span class="doc' + (x.form ? ' form' : '') + '" title="' + esc((x.who ? x.who + ' · ' : '') + (x.how || '')) + '">' + esc(x.name) + '</span>').join('');
  }
  function linksHtml(sc) {
    if (!sc.links || !sc.links.length) return '';
    return sc.links.map(l => '<a class="src" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + ' ↗</a>').join('');
  }
  function detailHtml(sc) {
    let h = '';
    if (sc.apply) h += '<p class="d-apply"><b>원서</b> ' + esc(sc.apply) + '</p>';
    if (sc.tracks && sc.tracks.length) {
      h += '<div class="d-tracks">' + sc.tracks.map(t => '<div class="trk"><b>' + esc(t.name) + '</b>' + (t.choices ? ' <span class="muted">· ' + esc(t.choices) + '</span>' : '') + '<div>' + esc(t.method) + '</div></div>').join('') + '</div>';
    }
    if (sc.docs && sc.docs.length) {
      h += '<table class="d-docs"><thead><tr><th>서류</th><th>전형</th><th>누가</th><th>언제·어떻게</th></tr></thead><tbody>' +
        sc.docs.map(x => '<tr><td>' + esc(x.name) + (x.form ? ' <span class="mini">양식</span>' : '') + (x.note ? '<div class="muted">' + esc(x.note) + '</div>' : '') + '</td><td>' + esc(x.track || '') + '</td><td>' + esc(x.who || '') + '</td><td>' + esc(x.how || '') + '</td></tr>').join('') +
        '</tbody></table>';
    }
    if (sc.dates && sc.dates.length) {
      h += '<ul class="d-dates">' + sc.dates.map(e => '<li class="' + (isPast(e) ? 'past' : '') + '"><b>' + esc(range(e)) + '</b> ' + esc(e.label) + '</li>').join('') + '</ul>';
    }
    if (sc.notes && sc.notes.length) h += '<ul class="d-notes">' + sc.notes.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul>';
    if (sc.contact || sc.home) h += '<p class="muted">' + (sc.contact ? esc(sc.contact) + ' · ' : '') + (sc.home ? '<a href="' + esc(sc.home) + '" target="_blank" rel="noopener">학교 홈페이지 ↗</a>' : '') + '</p>';
    return h;
  }
  /** 카드 안의 요강 핵심 블록 */
  function yogangBlock(sc, st) {
    const track = prog(st).track;
    const deptHint = sc.deptNote ? '<li class="hint">' + esc(sc.deptNote) + '</li>' : '';
    const ask = (sc.ask || []).length ? '<li class="ask">★ 학교 확인: ' + esc(sc.ask.join(' / ')) + '</li>' : '';
    const trk = (sc.tracks || []).map(t => esc(t.name.replace(/\s*\([^()]*\)$/, '')) + (t.choices ? ' <span class="muted">' + esc(t.choices) + '</span>' : '')).join('<br>');
    return '<section class="yg">' +
      '<div class="yg-h"><b>' + esc(sc.name) + '</b> 요강 핵심 ' + schoolTag(sc) + '</div>' +
      '<ul class="yg-kv">' +
      (trk ? '<li><span class="k">전형</span><span>' + trk + '</span></li>' : '') +
      '<li><span class="k">일정</span><span class="kds">' + keyDates(sc, track) + '</span></li>' +
      (sc.docs && sc.docs.length ? '<li><span class="k">서류</span><span class="docs">' + docsLine(sc, track) + '</span></li>' : '') +
      deptHint + ask + '</ul>' +
      '<details class="yg-more"><summary>전형·서류 자세히</summary>' + detailHtml(sc) + '</details>' +
      (sc.links && sc.links.length ? '<div class="srcs">' + linksHtml(sc) + '</div>' : '') +
      '</section>';
  }

  function choiceRows(st, opt) {
    const c = choicesOf(st);
    let h = '';
    if (c.early.length) {
      h += '<div class="ch"><span class="lbl early">전기</span><div class="ch-list">' + c.early.map(x => {
        if (x.undecided) return '<div class="ci"><span class="sname undec">' + esc(x.raw || '학교 미정') + '</span>' + (x.dept ? ' <span class="dept">' + esc(x.dept) + '</span>' : '') + '</div>';
        const sc = x.school;
        const cls = 'sname' + (sc ? '' : ' unknown') + (opt && opt.focus && sc && sc.id === opt.focus ? ' focus' : '');
        const inner = sc ? '<a href="#school=' + sc.id + '" class="' + cls + '">' + esc(x.raw) + '</a>' : '<span class="' + cls + '">' + esc(x.raw) + '</span>';
        return '<div class="ci">' + inner + (x.dept ? ' <span class="dept">' + esc(x.dept) + '</span>' : '') +
          (sc ? ' ' + schoolTag(sc) : x.lateLike ? ' <span class="warn">일반고(후기)가 전기 칸에 있음</span>' : ' <span class="warn">정리된 요강 없음 · 학교명 확인</span>') + '</div>';
      }).join('') + '</div></div>';
    }
    if (c.late.length) {
      h += '<div class="ch"><span class="lbl late">후기</span><div class="ch-list">' + c.late.map(x => '<div class="ci"><span class="sname' + (x.undecided ? ' undec' : '') + '">' + esc(x.raw) + '</span></div>').join('') + '</div></div>';
    }
    if (!c.early.length && !c.late.length) h += '<div class="ch"><span class="lbl none">지망</span><div class="ch-list"><span class="muted">아직 없음 — ✏️ 수정에서 추가</span></div></div>';
    return h;
  }

  function cardHtml(st, opt) {
    opt = opt || {};
    const p = prog(st);
    const nx = nextEventOf(st);
    const scs = earlySchools(st);
    const cat = category(st);
    let yg = '';
    if (!opt.hideYogang) {
      yg = scs.filter(sc => !(opt.focus && sc.id === opt.focus)).map(sc => yogangBlock(sc, st)).join('');
      if (!scs.length && cat === 'late') yg = '<section class="yg late"><div class="yg-h"><b>후기 일반고</b></div><ul class="yg-kv"><li><span class="k">원서</span><span>' + esc(IB.LATE.apply) + '</span></li></ul></section>';
    }
    const cs = checkStat(st);
    let checks = '';
    if (S.showChecks) {
      const c = p.checks || {};
      checks = '<section class="checks"><div class="ck-h">준비 체크 <span class="muted">' + cs.done + '/' + cs.total + '</span></div>' +
        checklistOf(st).map(i => '<label class="ck"><input type="checkbox" data-ck="' + esc(i.key) + '" data-id="' + st.id + '"' + (c[i.key] ? ' checked' : '') + '><span><span class="who">' + esc(i.who || '') + '</span> ' + esc(i.text) + (i.school ? ' <span class="muted">· ' + esc(i.school) + '</span>' : '') + (i.sub ? '<small>' + esc(i.sub) + '</small>' : '') + '</span></label>').join('') +
        '</section>';
    }
    return '<article class="card cat-' + cat + '" data-id="' + st.id + '">' +
      '<header class="c-h"><span class="num">' + (opt.showBan ? st.ban + '-' : '') + st.num + '</span><b class="nm">' + esc(st.name) + '</b>' +
      (p.track ? '<span class="pill">' + esc(p.track) + '</span>' : '') +
      (p.status ? '<span class="pill st ' + statusClass(p.status) + '">' + esc(p.status) + '</span>' : '') +
      (!S.showChecks && cs.total > 1 ? '<span class="pill ck-mini' + (cs.done === cs.total ? ' ok' : '') + '" title="준비 체크">✓ ' + cs.done + '/' + cs.total + '</span>' : '') +
      '<button class="edit" data-edit="' + st.id + '" title="지망학교·전형·상태 수정">✏️ 수정</button></header>' +
      (nx ? '<div class="next' + (dday(nx.date) === 'D-day' ? ' today' : '') + '">⏰ ' + esc(range(nx)) + ' ' + esc(nx.label) + (nx.school ? ' <span class="muted">' + esc(nx.school) + '</span>' : '') + ' <b>' + dday(nx.date) + '</b></div>' : '') +
      '<div class="choices">' + choiceRows(st, opt) + '</div>' +
      (st.memo ? '<div class="memo">📝 ' + esc(st.memo) + '</div>' : '') +
      yg + checks + '</article>';
  }

  function bindCards(root) {
    root.querySelectorAll('[data-edit]').forEach(b => { b.onclick = () => openEdit(b.dataset.edit); });
    root.querySelectorAll('input[data-ck]').forEach(cb => { cb.onchange = () => toggleCheck(cb); });
  }

  async function toggleCheck(cb) {
    const st = S.students.find(s => s.id === cb.dataset.id);
    const key = cb.dataset.ck; const on = cb.checked;
    const p = S.progress[st.id] || (S.progress[st.id] = { track: '', status: '', checks: {} });
    p.checks = p.checks || {};
    if (on) p.checks[key] = new Date().toISOString().slice(0, 10); else delete p.checks[key];
    const head = cb.closest('.checks').querySelector('.ck-h .muted');
    const cs = checkStat(st); head.textContent = cs.done + '/' + cs.total;
    try {
      const r = await api('saveProgress', { id: st.id, name: st.name, ban: st.ban, num: st.num, by: S.by, patch: { checks: { [key]: on } } });
      S.progress[st.id] = r.progress;
    } catch (err) {
      cb.checked = !on;
      if (on) delete p.checks[key]; else p.checks[key] = '1';
      toast('저장하지 못했습니다: ' + err.message, true);
    }
  }

  /* ───────── 툴바 ───────── */
  function toolbarHtml(extra) {
    return '<div class="toolbar">' + (extra || '') +
      '<label class="tgl"><input type="checkbox" id="tglChecks"' + (S.showChecks ? ' checked' : '') + '> 준비 체크리스트 펼치기</label></div>';
  }
  function bindToolbar() {
    const t = $('#tglChecks');
    if (t) t.onchange = () => { S.showChecks = t.checked; store.set('showChecks', S.showChecks); render(); };
    document.querySelectorAll('[data-filter]').forEach(b => { b.onclick = () => { S.filter = b.dataset.filter; store.set('filter', S.filter); render(); }; });
  }

  /* ───────── 뷰: 반별 ───────── */
  function viewClass(arg) {
    const bans = [...new Set(S.students.map(s => s.ban))].sort((a, b) => a - b);
    let ban = parseInt(arg, 10) || store.get('ban', bans[0] || 1);
    if (!bans.includes(ban)) ban = bans[0];
    store.set('ban', ban);
    const list = S.students.filter(s => s.ban === ban);
    const cnt = { early: 0, late: 0, none: 0 };
    list.forEach(s => cnt[category(s)]++);
    const shown = list.filter(s => S.filter === 'all' || category(s) === S.filter);
    const filters = [['all', '전체 ' + list.length], ['early', '전기 지망 ' + cnt.early], ['late', '후기만 ' + cnt.late], ['none', '미정 ' + cnt.none]]
      .map(f => '<button class="chip sm' + (S.filter === f[0] ? ' on' : '') + '" data-filter="' + f[0] + '">' + f[1] + '</button>').join('');
    return '<div class="bans">' + bans.map(b => '<a class="chip big' + (b === ban ? ' on' : '') + '" href="#class=' + b + '">3학년 ' + b + '반</a>').join('') + '</div>' +
      toolbarHtml('<div class="filters">' + filters + '</div>') +
      (shown.length ? '<div class="grid">' + shown.map(s => cardHtml(s)).join('') + '</div>' : '<p class="empty">해당하는 학생이 없습니다.</p>');
  }

  /* ───────── 뷰: 학교별 ───────── */
  function schoolGroups() {
    const bySchool = {}; const unknown = {}; const late = {};
    S.students.forEach(st => {
      const c = choicesOf(st);
      c.early.forEach(x => {
        if (x.school) (bySchool[x.school.id] = bySchool[x.school.id] || new Set()).add(st.id);
        else if (!x.undecided && x.raw) (unknown[x.raw] = unknown[x.raw] || new Set()).add(st.id);
      });
      c.late.forEach(x => { if (!x.undecided) (late[x.raw] = late[x.raw] || new Set()).add(st.id); });
    });
    return { bySchool, unknown, late };
  }
  function viewSchoolIndex() {
    const g = schoolGroups();
    const order = ['특성화고', '일반고 특성화학과', '마이스터고', '예술고'];
    let h = '<p class="lead">학교를 고르면 그 학교 요강 핵심과 지원 예정 학생 카드가 나옵니다. 숫자 = 전기 지망 학생 수</p>';
    order.forEach(type => {
      const scs = IB.SCHOOLS.filter(sc => sc.type === type);
      if (!scs.length) return;
      const areas = type === '특성화고' ? [['gg', '경기'], ['seoul', '서울'], ['other', '타 지역']] : [['', '']];
      areas.forEach(([area, al]) => {
        const sub = scs.filter(sc => !area || sc.area === area).sort((a, b) => ((g.bySchool[b.id] || []).size || 0) - ((g.bySchool[a.id] || []).size || 0));
        if (!sub.length) return;
        h += '<h3 class="grp"><span class="tag ' + typeClass(type) + '">' + type + '</span>' + (al ? ' ' + al : '') + '</h3><div class="schools">' +
          sub.map(sc => { const n = (g.bySchool[sc.id] || new Set()).size; return '<a class="sch' + (n ? '' : ' zero') + '" href="#school=' + sc.id + '">' + esc(sc.name) + '<span class="n">' + n + '</span></a>'; }).join('') + '</div>';
      });
    });
    const unk = Object.keys(g.unknown);
    if (unk.length) {
      h += '<h3 class="grp"><span class="tag t-etc">요강 미정리 · 학교명 확인</span></h3><div class="schools">' +
        unk.map(n => '<a class="sch warnb" href="#school=' + encodeURIComponent('?' + n) + '">' + esc(n) + '<span class="n">' + g.unknown[n].size + '</span></a>').join('') + '</div>';
    }
    const lt = Object.keys(g.late).sort((a, b) => g.late[b].size - g.late[a].size);
    if (lt.length) {
      h += '<h3 class="grp"><span class="tag t-late">후기 일반고</span> <span class="muted">' + esc(IB.LATE.apply) + '</span></h3><div class="schools">' +
        lt.map(n => '<a class="sch" href="#school=' + encodeURIComponent('~' + n) + '">' + esc(n) + '<span class="n">' + g.late[n].size + '</span></a>').join('') + '</div>';
    }
    return h;
  }
  function viewSchool(arg) {
    if (!arg) return viewSchoolIndex();
    const g = schoolGroups();
    let title, ids, panel = '', focus = '';
    if (arg[0] === '~') {
      const n = arg.slice(1); title = n + ' <span class="tag t-late">후기</span>'; ids = g.late[n];
      panel = '<section class="panel"><p>' + esc(IB.LATE.apply) + '</p><ul class="d-notes">' + IB.LATE.notes.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></section>';
    } else if (arg[0] === '?') {
      const n = arg.slice(1); title = esc(n); ids = g.unknown[n];
      panel = '<section class="panel warnb"><p>이 이름은 정리된 학교 목록과 맞지 않습니다. 오타이거나 정리하지 않은 학교일 수 있어요. 학생 카드의 ✏️ 수정에서 정확한 학교명으로 고쳐 주세요.</p></section>';
    } else {
      const sc = SCHOOL_BY_ID[arg];
      if (!sc) return '<p class="error">학교를 찾지 못했습니다.</p>';
      focus = sc.id; title = esc(sc.name) + ' ' + schoolTag(sc); ids = g.bySchool[sc.id];
      panel = '<section class="panel">' +
        '<div class="p-meta">' + esc(sc.region || '') + (sc.depts && sc.depts.length ? ' · 학과: ' + esc(sc.depts.join(', ')) : '') + '</div>' +
        (sc.deptNote ? '<p class="hint">' + esc(sc.deptNote) + '</p>' : '') +
        (sc.ask && sc.ask.length ? '<p class="ask">★ 학교 확인 필요: ' + esc(sc.ask.join(' / ')) + '</p>' : '') +
        '<div class="p-key"><span class="k">일정</span> <span class="kds">' + keyDates(sc, '') + '</span></div>' +
        (sc.docs && sc.docs.length ? '<div class="p-key"><span class="k">서류</span> <span class="docs">' + docsLine(sc, '') + '</span></div>' : '') +
        (sc.links && sc.links.length ? '<div class="srcs">' + linksHtml(sc) + '</div>' : '<p class="muted">요강 원본 링크 없음(전형이 대부분 끝난 학교 — 시트의 \'전기학교 전형·발표 일정\' 탭 참고)</p>') +
        '<details class="yg-more"><summary>전형 방법·서류 표·전체 일정 자세히</summary>' + detailHtml(sc) + '</details>' +
        '</section>';
    }
    const list = S.students.filter(s => ids && ids.has(s.id));
    return '<div class="crumb"><a href="#school">← 학교 목록</a></div><h2 class="sch-title">' + title + ' <span class="muted">지원 예정 ' + list.length + '명</span></h2>' + panel +
      toolbarHtml() +
      (list.length ? '<div class="grid">' + list.map(s => cardHtml(s, { showBan: true, focus, hideYogang: false })).join('') + '</div>' : '<p class="empty">이 학교를 지망한 학생이 없습니다.</p>');
  }

  /* ───────── 뷰: 일정표 ───────── */
  function viewSchedule() {
    const bans = [...new Set(S.students.map(s => s.ban))].sort((a, b) => a - b);
    const pool = S.students.filter(s => S.schedBan === 'all' || s.ban === +S.schedBan);
    const rows = {};
    const add = (e, who, school) => {
      const k = e.date + '|' + (e.end || '') + '|' + (e.time || '') + '|' + e.label + '|' + (school || '');
      (rows[k] = rows[k] || { e, school, who: [] }).who.push(...who);
    };
    IB.SCHOOLS.forEach(sc => {
      const who = pool.filter(s => earlySchools(s).some(x => x.id === sc.id));
      if (!who.length) return;
      (sc.dates || []).forEach(e => add(e, who, sc.name));
    });
    IB.COMMON_EVENTS.forEach(e => {
      let who = [];
      if (e.scope === 'early') who = pool.filter(s => category(s) === 'early');
      else if (e.scope === 'late') who = pool.filter(s => category(s) !== 'early');
      else if (e.scope === 'gg') who = pool.filter(s => earlySchools(s).some(sc => sc.area === 'gg' && sc.type !== '마이스터고' && sc.type !== '예술고'));
      else if (e.scope === 'seoul') who = pool.filter(s => earlySchools(s).some(sc => sc.area === 'seoul' && sc.type === '특성화고'));
      else who = pool;
      add(e, who, '');
    });
    const all = Object.values(rows).sort((a, b) => (a.e.date + (a.e.time || '')).localeCompare(b.e.date + (b.e.time || '')));
    const past = all.filter(r => isPast(r.e)); const up = all.filter(r => !isPast(r.e));
    const byDay = list => {
      const days = {};
      list.forEach(r => (days[r.e.date] = days[r.e.date] || []).push(r));
      return Object.keys(days).sort().map(d => '<section class="day' + (dday(d) === 'D-day' ? ' today' : '') + '"><h3>' + md(d) + ' <span class="dd">' + dday(d) + '</span></h3>' +
        days[d].map(r => '<div class="ev k-' + r.e.kind + '"><div class="ev-t">' + (r.e.end ? '<span class="muted">~' + md(r.e.end) + '</span> ' : '') + (r.e.time ? '<b>' + esc(r.e.time) + '</b> ' : '') + esc(r.e.label) + (r.school ? ' <a class="sname" href="#school=' + esc((IB.SCHOOLS.find(x => x.name === r.school) || {}).id || '') + '">' + esc(r.school) + '</a>' : ' <span class="tag t-etc">공통</span>') + (r.e.who ? ' <span class="pill">' + esc(r.e.who) + '</span>' : '') + '</div>' +
          '<div class="ev-who">' + (r.who.length > 18 && !r.school ? '<span class="muted">해당 ' + r.who.length + '명</span>' : r.who.map(s => '<span class="stu">' + s.ban + '-' + s.num + ' ' + esc(s.name) + '</span>').join('')) + '</div></div>').join('') + '</section>').join('');
    };
    return '<h2>📅 일정표 <span class="muted">학생이 지망한 학교 일정 + 공통 일정</span></h2>' +
      '<div class="filters">' + [['all', '전체 반']].concat(bans.map(b => [String(b), b + '반'])).map(f => '<button class="chip sm' + (String(S.schedBan) === f[0] ? ' on' : '') + '" data-sban="' + f[0] + '">' + f[1] + '</button>').join('') + '</div>' +
      (past.length ? '<button class="linkbtn" id="tglPast">' + (S.showPast ? '지난 일정 숨기기' : '지난 일정 ' + past.length + '개 보기') + '</button>' : '') +
      (S.showPast ? '<div class="pastwrap">' + byDay(past) + '</div>' : '') + byDay(up);
  }

  /* ───────── 뷰: 진행 현황 ───────── */
  function viewStatus() {
    const bans = [...new Set(S.students.map(s => s.ban))].sort((a, b) => a - b);
    const ban = S.statusBan === 'all' ? 'all' : (+S.statusBan || bans[0]);
    const list = S.students.filter(s => ban === 'all' || s.ban === ban).filter(s => category(s) === 'early');
    const cnt = {}; list.forEach(s => { const k = prog(s).status || '미입력'; cnt[k] = (cnt[k] || 0) + 1; });
    return '<h2>📊 진행 현황 <span class="muted">전기 지망 학생 · 행을 누르면 수정</span></h2>' +
      '<div class="filters">' + [['all', '전체 반']].concat(bans.map(b => [String(b), b + '반'])).map(f => '<button class="chip sm' + (String(ban) === f[0] ? ' on' : '') + '" data-stban="' + f[0] + '">' + f[1] + '</button>').join('') + '</div>' +
      '<div class="stat-sum">' + Object.keys(cnt).map(k => '<span class="pill st ' + statusClass(k) + '">' + esc(k) + ' ' + cnt[k] + '</span>').join('') + '</div>' +
      '<div class="tblwrap"><table class="stat"><thead><tr><th>반-번</th><th>이름</th><th>전기 지망</th><th>전형</th><th>상태</th><th>준비</th><th>다음 일정</th></tr></thead><tbody>' +
      list.map(s => {
        const p = prog(s); const cs = checkStat(s); const nx = nextEventOf(s);
        const sch = choicesOf(s).early.map(x => esc(x.raw) + (x.dept ? ' <span class="muted">' + esc(x.dept) + '</span>' : '')).join('<br>');
        return '<tr data-edit="' + s.id + '"><td>' + s.ban + '-' + s.num + '</td><td>' + esc(s.name) + '</td><td>' + sch + '</td><td>' + esc(p.track || '—') + '</td><td>' + (p.status ? '<span class="pill st ' + statusClass(p.status) + '">' + esc(p.status) + '</span>' : '—') + '</td><td>' + cs.done + '/' + cs.total + '</td><td>' + (nx ? esc(mdShort(nx.date)) + ' ' + esc(nx.label) : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ───────── 뷰: 공통 규칙 ───────── */
  function viewRules() {
    return '<h2>📘 공통 규칙·일정</h2><section class="panel"><ul class="rules">' + IB.RULES.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul></section>' +
      '<section class="panel"><h3>공통 일정</h3><ul class="d-dates">' + IB.COMMON_EVENTS.map(e => '<li class="' + (isPast(e) ? 'past' : '') + '"><b>' + esc(range(e)) + '</b> ' + esc(e.label) + '</li>').join('') + '</ul></section>' +
      '<section class="panel"><h3>원서 접수 방법 차이</h3><ul class="rules"><li><b>경기 특성화고</b>: 우리 학교에서 고교입학시스템 온라인 접수. 출력물은 내지 않고 추가 증빙만 학교에 직접(또는 우편)</li><li><b>서울 특성화고</b>: 경기 학생은 수기 원서(중학교 성적란 기재 + 중학교장 직인) + 학교생활기록부Ⅱ를 학교에 직접 방문 제출. 생기부 기준일 11/13</li><li><b>타 지역(한국말산업고 등)</b>: 학교 요강의 서식으로 방문·등기 제출</li></ul></section>' +
      '<p class="muted">학교별 요강은 2026-10-29에 각 학교 홈페이지에서 확인한 내용입니다. ★ 표시는 학교에 문의가 필요한 항목입니다.</p>';
  }

  /* ───────── 수정 모달 ───────── */
  function allSchoolNames() { return IB.SCHOOLS.map(s => s.name); }
  function openEdit(id) {
    const st = S.students.find(s => s.id === id);
    if (!st) return;
    const p = prog(st);
    const c = choicesOf(st);
    const rows = c.early.length ? c.early.map(x => ({ school: x.raw, dept: x.dept })) : [{ school: '', dept: '' }];
    const dlg = $('#dlg');
    const rowHtml = (r, i) => '<div class="er" data-i="' + i + '"><input class="in-school" list="dl-schools" placeholder="전기 학교" value="' + esc(r.school) + '"><input class="in-dept" placeholder="학과" value="' + esc(r.dept) + '"><button type="button" class="x" title="삭제">✕</button></div>';
    dlg.innerHTML = '<form method="dialog" class="dlg-f">' +
      '<h3>' + st.ban + '-' + st.num + ' ' + esc(st.name) + ' <span class="muted">지망·진행 수정</span></h3>' +
      '<label class="fl">전기 지망 <span class="muted">(학교를 고르면 학과 목록이 나옵니다)</span></label><div id="erows">' + rows.map(rowHtml).join('') + '</div>' +
      '<button type="button" class="linkbtn" id="addRow">＋ 전기 학교 추가</button>' +
      '<label class="fl">후기 지망</label><input id="in-late" list="dl-late" value="' + esc(st.late) + '" placeholder="예: 초월고">' +
      '<label class="fl">메모 <span class="muted">(시트 Q열 — 상담 내용 등)</span></label><textarea id="in-memo" rows="2">' + esc(st.memo) + '</textarea>' +
      '<div class="two"><div><label class="fl">전형</label><select id="in-track">' + TRACKS.map(t => '<option' + (t === p.track ? ' selected' : '') + ' value="' + esc(t) + '">' + (t || '미정') + '</option>').join('') + '</select></div>' +
      '<div><label class="fl">상태</label><select id="in-status">' + STATUSES.map(t => '<option' + (t === p.status ? ' selected' : '') + ' value="' + esc(t) + '">' + (t || '—') + '</option>').join('') + '</select></div></div>' +
      (st.survey && st.survey.school ? '<p class="muted small">8월 설문 원문: ' + esc(st.survey.school) + (st.survey.dept ? ' / ' + esc(st.survey.dept) : '') + (st.survey.at ? ' (' + esc(st.survey.at) + ')' : '') + '</p>' : '') +
      '<datalist id="dl-schools">' + allSchoolNames().map(n => '<option value="' + esc(n) + '">').join('') + '<option value="고민중"></datalist>' +
      '<datalist id="dl-late">' + IB.KNOWN_LATE.map(n => '<option value="' + esc(n) + '">').join('') + '<option value="광주중앙고"></datalist>' +
      '<datalist id="dl-dept"></datalist>' +
      '<div class="dlg-btns"><button type="button" class="btn ghost" id="dlgCancel">취소</button><button type="button" class="btn" id="dlgSave">저장</button></div></form>';
    const wrap = $('#erows');
    const bindRow = el => {
      el.querySelector('.x').onclick = () => { el.remove(); if (!wrap.children.length) addRow({ school: '', dept: '' }); };
      const s = el.querySelector('.in-school'), d = el.querySelector('.in-dept');
      const upd = () => {
        const sc = matchSchool(s.value, 'early');
        const id = 'dl-dept-' + Math.random().toString(36).slice(2, 7);
        let dl = el.querySelector('datalist');
        if (!dl) { dl = document.createElement('datalist'); el.appendChild(dl); }
        dl.id = id; d.setAttribute('list', id);
        dl.innerHTML = sc ? sc.depts.map(x => '<option value="' + esc(x) + '">').join('') : '';
      };
      s.addEventListener('change', upd); upd();
    };
    const addRow = r => { const div = document.createElement('div'); div.innerHTML = rowHtml(r, wrap.children.length); const el = div.firstChild; wrap.appendChild(el); bindRow(el); };
    [...wrap.children].forEach(bindRow);
    $('#addRow').onclick = () => addRow({ school: '', dept: '' });
    $('#dlgCancel').onclick = () => dlg.close();
    $('#dlgSave').onclick = () => saveEdit(st, dlg);
    dlg.showModal();
  }

  async function saveEdit(st, dlg) {
    const rows = [...dlg.querySelectorAll('.er')].map(el => ({ s: el.querySelector('.in-school').value.trim(), d: el.querySelector('.in-dept').value.trim() })).filter(r => r.s || r.d);
    const early = rows.map(r => r.s).filter(Boolean).join(', ');
    const depts = rows.map(r => r.d);
    const dept = depts.some(Boolean) ? (rows.length > 1 ? depts.join(', ') : depts[0]) : '';
    const fields = { early, dept, late: $('#in-late').value.trim(), memo: $('#in-memo').value.trim() };
    const changed = {}; const prev = {};
    Object.keys(fields).forEach(k => { if (fields[k] !== (st[k] || '').trim()) { changed[k] = fields[k]; prev[k] = st[k] || ''; } });
    const p = prog(st);
    const patch = {};
    const tr = $('#in-track').value, stt = $('#in-status').value;
    if (tr !== (p.track || '')) patch.track = tr;
    if (stt !== (p.status || '')) patch.status = stt;
    const btn = $('#dlgSave'); btn.disabled = true; btn.textContent = '저장 중…';
    try {
      if (Object.keys(changed).length) {
        const r = await api('saveChoice', { id: st.id, name: st.name, by: S.by, fields: changed, prev });
        Object.assign(st, r.student);
      }
      if (Object.keys(patch).length) {
        const r = await api('saveProgress', { id: st.id, name: st.name, ban: st.ban, num: st.num, by: S.by, patch });
        S.progress[st.id] = r.progress;
      }
      dlg.close();
      toast(Object.keys(changed).length || Object.keys(patch).length ? (DEMO ? '저장했습니다 (체험용 — 시트에는 반영 안 됨)' : '저장했습니다 (시트에 반영됨)') : '바뀐 내용이 없습니다');
      render();
    } catch (err) {
      btn.disabled = false; btn.textContent = '저장';
      if (err.message === 'conflict' && err.data && err.data.current) {
        Object.assign(st, err.data.current);
        dlg.close(); render();
        toast('다른 선생님이 먼저 수정했습니다. 최신 내용으로 다시 열었어요.', true);
        openEdit(st.id);
      } else {
        toast('저장하지 못했습니다: ' + err.message, true);
      }
    }
  }

  /* ───────── 전체 렌더 ───────── */
  function render() {
    const r = route();
    document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === r.mode));
    let h = '';
    if (r.mode === 'school') h = viewSchool(r.arg);
    else if (r.mode === 'schedule') h = viewSchedule();
    else if (r.mode === 'status') h = viewStatus();
    else if (r.mode === 'rules') h = viewRules();
    else h = viewClass(r.arg);
    const main = $('#main');
    main.innerHTML = h;
    bindCards(main); bindToolbar();
    main.querySelectorAll('[data-sban]').forEach(b => { b.onclick = () => { S.schedBan = b.dataset.sban; render(); }; });
    main.querySelectorAll('[data-stban]').forEach(b => { b.onclick = () => { S.statusBan = b.dataset.stban === 'all' ? 'all' : +b.dataset.stban; render(); }; });
    const tp = $('#tglPast'); if (tp) tp.onclick = () => { S.showPast = !S.showPast; render(); };
    $('#who').textContent = S.by ? S.by + ' 선생님' : '';
  }

  /* ───────── 로그인 ───────── */
  function logout(msg) {
    S.pw = ''; store.del('pw');
    showLogin(msg);
  }
  function showLogin(msg) {
    $('#app').hidden = true; $('#login').hidden = false;
    $('#lgMsg').textContent = msg || '';
    $('#lgBy').value = S.by || '';
    $('#lgPw').focus();
  }
  async function doLogin(e) {
    e.preventDefault();
    S.pw = $('#lgPw').value.trim(); S.by = $('#lgBy').value.trim();
    $('#lgBtn').disabled = true; $('#lgMsg').textContent = '확인 중…';
    try {
      await api('login');
      store.set('pw', S.pw); store.set('by', S.by);
      startApp();
    } catch (err) {
      $('#lgMsg').textContent = err.message === 'auth' ? '비밀번호가 맞지 않습니다.' : '연결 오류: ' + err.message;
    } finally { $('#lgBtn').disabled = false; }
  }
  function startApp() {
    $('#login').hidden = true; $('#app').hidden = false;
    if (DEMO) $('#demoBanner').hidden = false;
    load();
  }

  window.addEventListener('hashchange', () => { if (S.loadedAt) { render(); window.scrollTo(0, 0); } });
  window.addEventListener('focus', () => { if (S.loadedAt && Date.now() - S.loadedAt > 60000 && !$('#dlg').open) load(true); });
  document.addEventListener('DOMContentLoaded', () => {
    $('#lgForm').onsubmit = doLogin;
    $('#btnReload').onclick = () => load();
    $('#btnLogout').onclick = () => logout('');
    if (DEMO) { S.pw = 'demo'; startApp(); return; }
    if (S.pw) startApp(); else showLogin('');
  });
})();
