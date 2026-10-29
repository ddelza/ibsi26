/**
 * 2027 고입 챙김판(ddelza.github.io/ibsi26) API
 *
 * '2027 광수중 진학' 시트에 붙어 있는 Apps Script 프로젝트에 새 파일(ibsi26-api.gs)로 추가한다.
 * (hs-survey-sync.gs와 같은 프로젝트에 둬도 함수 이름이 겹치지 않음 — 모두 ib 접두어)
 *
 * 배포: 배포 → 새 배포 → 유형 "웹 앱" → 실행: 나 / 액세스: 모든 사용자 → 배포 → /exec URL을 사이트 config.js에 넣는다.
 * 비밀번호: 프로젝트 설정 → 스크립트 속성 IB_PW 가 있으면 그것, 없으면 아래 IB_INITIAL_PW.
 *   ※ 공개 레포에는 IB_INITIAL_PW를 비워 둔다. 붙여넣을 때만 채운다.
 *
 * 읽는 곳 : '희망학교 입력' 탭(gid 438675650) — 반/번호/이름/전기고교(희망)/학과/후기고교(희망)/메모 + 설문 열
 * 쓰는 곳 : 같은 탭의 전기고교·학과·후기고교·메모 칸, '사이트_진행' 탭(전형·상태·체크), '사이트_수정기록' 탭(변경 이력)
 */

const IB_INITIAL_PW = '';
const IB_SS_ID = '1PRQS3Jb1a9retpUBWThVgA4UveD-qfFiZO-haeq0_y4';
const IB_GID = 438675650;
const IB_GRADE = 3;
const IB_PROGRESS_SHEET = '사이트_진행';
const IB_LOG_SHEET = '사이트_수정기록';
const IB_PROGRESS_HEADERS = ['학번', '반', '번호', '이름', '전형', '상태', '체크(JSON)', '수정시각', '수정자'];
const IB_LOG_HEADERS = ['시각', '수정자', '학번', '이름', '항목', '이전 값', '새 값'];

function doGet() {
  return ibJson_({ ok: true, service: 'ibsi26' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return ibJson_({ ok: false, error: 'bad_request' }); }
  if (!ibCheckPw_(req.pw)) return ibJson_({ ok: false, error: 'auth' });
  try {
    if (req.action === 'login') return ibJson_({ ok: true });
    if (req.action === 'data') return ibJson_(Object.assign({ ok: true }, ibData_()));
    if (req.action === 'saveChoice') return ibJson_(ibSaveChoice_(req));
    if (req.action === 'saveProgress') return ibJson_(ibSaveProgress_(req));
    return ibJson_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return ibJson_({ ok: false, error: String((err && err.message) || err) });
  }
}

/* ───────── 읽기 ───────── */

function ibData_() {
  const ss = ibSs_();
  const t = ibTable_(ss);
  const values = t.sheet.getRange(1, 1, t.sheet.getLastRow(), t.sheet.getLastColumn()).getDisplayValues();
  const students = [];
  for (let r = t.headerRow; r < values.length; r++) {
    const s = ibRowToStudent_(values[r], t.col);
    if (s) students.push(s);
  }
  return { students: students, progress: ibReadProgress_(ss), serverTime: new Date().toISOString() };
}

function ibRowToStudent_(row, col) {
  const ban = parseInt(row[col.ban - 1], 10), num = parseInt(row[col.num - 1], 10);
  const name = String(row[col.name - 1] || '').trim();
  if (!(ban > 0) || !(num > 0) || !name) return null;
  const v = function (c) { return c ? String(row[c - 1] || '').trim() : ''; };
  return {
    id: ibId_(ban, num), ban: ban, num: num, name: name,
    early: v(col.early), dept: v(col.dept), late: v(col.late), memo: v(col.memo),
    survey: {
      region: v(col.sRegion), type: v(col.sType), when: v(col.sWhen), school: v(col.sSchool),
      dept: v(col.sDept), count: v(col.sCount), at: v(col.sAt)
    }
  };
}

function ibReadProgress_(ss) {
  const sh = ss.getSheetByName(IB_PROGRESS_SHEET);
  const out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, IB_PROGRESS_HEADERS.length).getDisplayValues().forEach(function (r) {
    const id = String(r[0]).trim();
    if (!id) return;
    let checks = {};
    try { checks = r[6] ? JSON.parse(r[6]) : {}; } catch (err) { checks = {}; }
    out[id] = { track: r[4], status: r[5], checks: checks, at: r[7], by: r[8] };
  });
  return out;
}

/* ───────── 쓰기: 지망학교 ───────── */

/** req: { id, name, by, fields: {early, dept, late, memo}, prev: {early, dept, late, memo} } */
function ibSaveChoice_(req) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = ibSs_();
    const t = ibTable_(ss);
    const r = ibFindRow_(t, req.id, req.name);
    if (!r) return { ok: false, error: 'not_found' };
    const keys = ['early', 'dept', 'late', 'memo'];
    const row = t.sheet.getRange(r, 1, 1, t.sheet.getLastColumn()).getDisplayValues()[0];
    const cur = {};
    keys.forEach(function (k) { cur[k] = t.col[k] ? String(row[t.col[k] - 1] || '').trim() : ''; });

    // 다른 선생님이 먼저 바꿨으면 덮어쓰지 않고 알려 준다
    const prev = req.prev || {};
    const changedByOther = keys.filter(function (k) {
      return Object.prototype.hasOwnProperty.call(prev, k) && String(prev[k] || '').trim() !== cur[k];
    });
    if (changedByOther.length) return { ok: false, error: 'conflict', current: ibRowToStudent_(row, t.col) };

    const fields = req.fields || {};
    const log = [];
    keys.forEach(function (k) {
      if (!Object.prototype.hasOwnProperty.call(fields, k) || !t.col[k]) return;
      const nv = String(fields[k] || '').trim();
      if (nv === cur[k]) return;
      t.sheet.getRange(r, t.col[k]).setValue(nv);
      log.push([k, cur[k], nv]);
    });
    ibLog_(ss, req.by, req.id, req.name, log.map(function (l) {
      return [{ early: '전기고교', dept: '학과', late: '후기고교', memo: '메모' }[l[0]], l[1], l[2]];
    }));
    SpreadsheetApp.flush();
    const after = t.sheet.getRange(r, 1, 1, t.sheet.getLastColumn()).getDisplayValues()[0];
    return { ok: true, student: ibRowToStudent_(after, t.col) };
  } finally {
    lock.releaseLock();
  }
}

/* ───────── 쓰기: 전형·상태·체크 ───────── */

/** req: { id, name, ban, num, by, patch: { track?, status?, checks?: { key: true|false } } } */
function ibSaveProgress_(req) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = ibSs_();
    const sh = ibEnsureSheet_(ss, IB_PROGRESS_SHEET, IB_PROGRESS_HEADERS);
    const id = String(req.id || '').trim();
    if (!/^\d{4}$/.test(id)) return { ok: false, error: 'bad_id' };
    const ids = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues().map(function (x) { return String(x[0]).trim(); }) : [];
    let r = ids.indexOf(id) + 2;
    let rec = ['', '', '', '', '', '', '{}', '', ''];
    if (r >= 2) rec = sh.getRange(r, 1, 1, IB_PROGRESS_HEADERS.length).getDisplayValues()[0];
    else r = sh.getLastRow() + 1;

    let checks = {};
    try { checks = rec[6] ? JSON.parse(rec[6]) : {}; } catch (err) { checks = {}; }
    const patch = req.patch || {};
    const log = [];
    if (patch.checks) {
      Object.keys(patch.checks).forEach(function (k) {
        if (patch.checks[k]) checks[k] = new Date().toISOString().slice(0, 10);
        else delete checks[k];
        log.push(['체크:' + k, '', patch.checks[k] ? '✔' : '해제']);
      });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'track') && patch.track !== rec[4]) { log.push(['전형', rec[4], patch.track]); rec[4] = patch.track; }
    if (Object.prototype.hasOwnProperty.call(patch, 'status') && patch.status !== rec[5]) { log.push(['상태', rec[5], patch.status]); rec[5] = patch.status; }

    const out = [id, req.ban || rec[1], req.num || rec[2], req.name || rec[3], rec[4], rec[5], JSON.stringify(checks),
      Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm'), req.by || ''];
    sh.getRange(r, 1, 1, out.length).setValues([out]);
    ibLog_(ss, req.by, id, req.name, log);
    return { ok: true, progress: { track: out[4], status: out[5], checks: checks, at: out[7], by: out[8] } };
  } finally {
    lock.releaseLock();
  }
}

/* ───────── 도우미 ───────── */

function ibSs_() {
  try { const a = SpreadsheetApp.getActiveSpreadsheet(); if (a) return a; } catch (err) { /* 바인딩 안 됨 */ }
  return SpreadsheetApp.openById(IB_SS_ID);
}

function ibTable_(ss) {
  const sheet = ss.getSheets().filter(function (s) { return s.getSheetId() === IB_GID; })[0];
  if (!sheet) throw new Error('희망학교 입력 탭(gid ' + IB_GID + ')을 찾지 못했습니다');
  const top = sheet.getRange(1, 1, Math.min(6, sheet.getLastRow()), sheet.getLastColumn()).getDisplayValues();
  for (let i = 0; i < top.length; i++) {
    const h = top[i].map(function (x) { return String(x || '').replace(/\s/g, ''); });
    const find = function (fn) { const j = h.findIndex(fn); return j >= 0 ? j + 1 : 0; };
    const col = {
      ban: find(function (x) { return x === '반'; }),
      num: find(function (x) { return x === '번호'; }),
      name: find(function (x) { return x === '이름'; }),
      early: find(function (x) { return x.indexOf('전기고교') === 0; }),
      dept: find(function (x) { return x === '학과'; }),
      late: find(function (x) { return x.indexOf('후기고교') === 0; }),
      memo: find(function (x) { return x.indexOf('메모') === 0; }),
      sRegion: find(function (x) { return x === '설문지역'; }),
      sType: find(function (x) { return x === '설문학교분류'; }),
      sWhen: find(function (x) { return x === '설문전기/후기'; }),
      sSchool: find(function (x) { return x.indexOf('설문희망학교') === 0; }),
      sDept: find(function (x) { return x.indexOf('설문학과') === 0; }),
      sCount: find(function (x) { return x === '설문제출횟수'; }),
      sAt: find(function (x) { return x === '설문제출시각'; })
    };
    if (col.ban && col.num && col.name) return { sheet: sheet, headerRow: i + 1, col: col };
  }
  throw new Error('반/번호/이름 머리글 행을 찾지 못했습니다');
}

function ibFindRow_(t, id, name) {
  const m = /^(\d)(\d)(\d\d)$/.exec(String(id || ''));
  if (!m) return 0;
  const ban = +m[2], num = +m[3];
  const n = t.sheet.getLastRow() - t.headerRow;
  if (n < 1) return 0;
  const vals = t.sheet.getRange(t.headerRow + 1, 1, n, t.sheet.getLastColumn()).getDisplayValues();
  for (let i = 0; i < vals.length; i++) {
    if (parseInt(vals[i][t.col.ban - 1], 10) === ban && parseInt(vals[i][t.col.num - 1], 10) === num) {
      if (name && String(vals[i][t.col.name - 1]).trim() !== String(name).trim()) return 0;
      return t.headerRow + 1 + i;
    }
  }
  return 0;
}

function ibEnsureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#eef2ff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function ibLog_(ss, by, id, name, entries) {
  if (!entries || !entries.length) return;
  const sh = ibEnsureSheet_(ss, IB_LOG_SHEET, IB_LOG_HEADERS);
  const at = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  const rows = entries.map(function (e) { return [at, by || '', id, name || '', e[0], e[1], e[2]]; });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, IB_LOG_HEADERS.length).setValues(rows);
}

function ibCheckPw_(pw) {
  const want = PropertiesService.getScriptProperties().getProperty('IB_PW') || IB_INITIAL_PW;
  return !!want && String(pw || '') === String(want);
}

function ibId_(ban, num) { return String(IB_GRADE) + ban + (num < 10 ? '0' : '') + num; }

function ibJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** 편집기에서 ▶ 실행: 읽기가 되는지 확인(로그에 학생 수 출력) */
function ibSelfTest() {
  const d = ibData_();
  Logger.log('학생 ' + d.students.length + '명, 진행 기록 ' + Object.keys(d.progress).length + '건');
  Logger.log(JSON.stringify(d.students.slice(0, 2)));
}
