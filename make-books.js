// 시기별 인쇄용 책자 HTML을 만든다 · node make-books.js 하면 print-p1.html ~ print-p4.html이 나온다
//
// 화면용 list.html은 한 사례만 골라 인쇄하는 구조라 시기 전체를 찍을 수 없다.
// 이 파일은 같은 cases.js를 읽어, 시기 하나를 표지 · 차례 · 사례 순서로 이어 붙인 인쇄 전용 문서를 만든다.
// 만들어진 HTML은 브라우저로 열어 Ctrl+P만 눌러도 그대로 PDF가 된다.

var fs = require('fs');
var path = require('path');

var DIR = __dirname;
eval(fs.readFileSync(path.join(DIR, 'cases.js'), 'utf8'));

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 본문의 {저장} 표기를 나이스 버튼 모양으로 바꾼다.
function rich(s) {
  return esc(s).replace(/\{([^}]+)\}/g, '<span class="btn">$1</span>');
}

function li(items) {
  return items.map(function (t) { return '<li>' + rich(t) + '</li>'; }).join('');
}

function stepsHtml(steps) {
  return steps.map(function (s) {
    var body = [].concat(s.body).map(function (t) {
      return '<p class="step-body">' + rich(t) + '</p>';
    }).join('');

    return '<li>'
      + '<span class="step-name">' + esc(s.name) + '</span>'
      + (s.path ? '<span class="path">' + esc(s.path) + '</span>' : '')
      + body
      + '</li>';
  }).join('');
}

var STYLE = [
  '@page { size: A4; margin: 14mm 15mm 16mm; }',
  '',
  '* { box-sizing: border-box; }',
  '',
  'html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
  '',
  'body {',
  '  word-break: keep-all;',
  '  overflow-wrap: normal;',
  '  hyphens: none;',
  '  margin: 0;',
  '  color: #17191c;',
  "  font-family: 'Pretendard', 'Noto Sans CJK KR', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;",
  '  font-size: 9.6pt;',
  '  line-height: 1.5;',
  '  letter-spacing: -0.25px;',
  '}',
  '',
  '/* ── 표지 ─────────────────────────────── */',
  '.cover { border-bottom: 2.5px solid var(--tone); padding-bottom: 12px; margin-bottom: 16px; }',
  '.cover .kicker { font-size: 9pt; font-weight: 700; color: #6b7078; margin: 0 0 6px; letter-spacing: 0; }',
  '.cover h1 { font-size: 24pt; font-weight: 800; letter-spacing: -1.2px; margin: 0; color: var(--tone); }',
  '.cover .months { font-size: 11pt; font-weight: 700; margin: 2px 0 10px; color: #3d4248; }',
  '.cover .about { font-size: 8.6pt; color: #6b7078; margin: 0; line-height: 1.55; }',
  '',
  '/* ── 차례 ─────────────────────────────── */',
  '.toc h2 { font-size: 11pt; font-weight: 800; margin: 0 0 8px; color: var(--tone); }',
  '.toc ol { margin: 0; padding: 0; list-style: none; columns: 2; column-gap: 16px; }',
  '.toc li { font-size: 8.8pt; line-height: 1.45; margin-bottom: 5px; padding-left: 22px; position: relative; break-inside: avoid; }',
  '.toc .no { position: absolute; left: 0; top: 0; font-weight: 700; color: var(--tone); font-variant-numeric: tabular-nums; }',
  '.toc .hit { color: #6b7078; }',
  '',
  '/* ── 사례 ─────────────────────────────── */',
  '/* 사례 사이를 굵은 선으로 끊는다. 앞 사례가 어디서 끝났는지 넘기면서도 보여야 한다 */',
  '.case { padding-top: 13px; margin-top: 20px; margin-bottom: 0; border-top: 2px solid var(--tone); }',
  '',
  '/* 제목이 혼자 페이지 끝에 남지 않게 요약까지 붙여 둔다 */',
  '.case-head { break-inside: avoid; break-after: avoid; }',
  '',
  '.case-title { font-size: 13pt; font-weight: 800; line-height: 1.35; margin: 0 0 5px; padding-left: 30px; position: relative; }',
  '.case-no { position: absolute; left: 0; top: 1px; font-size: 11.5pt; color: var(--tone); font-variant-numeric: tabular-nums; }',
  '',
  '.meta { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; font-size: 8pt; color: #6b7078; margin-left: 30px; }',
  '.area { font-weight: 700; color: var(--tone); border: 1px solid var(--tone); border-radius: 2px; padding: 0 5px; }',
  '.often { font-weight: 700; color: #fff; background: var(--tone); border-radius: 2px; padding: 0 5px; }',
  '.path { background: #eeece5; border-radius: 2px; padding: 0 6px; font-size: 8pt; color: #43484e; }',
  '',
  '.block { margin-left: 30px; }',
  '',
  'h3 { font-size: 8.6pt; font-weight: 800; color: #6b7078; margin: 11px 0 4px; letter-spacing: 0; }',
  '',
  '.summary { margin: 9px 0 0; padding: 8px 11px; background: var(--tint); border-left: 3px solid var(--tone); list-style: none; }',
  '.summary li { font-size: 9.4pt; line-height: 1.5; margin-bottom: 4px; padding-left: 11px; position: relative; break-inside: avoid; }',
  '.summary li:last-child { margin-bottom: 0; }',
  ".summary li::before { content: ''; position: absolute; left: 0; top: 7px; width: 4px; height: 4px; background: var(--tone); border-radius: 50%; }",
  '',
  '.branch { margin-bottom: 11px; }',
  '.branch:last-child { margin-bottom: 0; }',
  '.branch-name { font-size: 10pt; font-weight: 700; margin: 0 0 1px; padding-left: 9px; border-left: 3px solid var(--tone); break-after: avoid; }',
  '.branch-when { margin: 0 0 6px; padding-left: 12px; font-size: 8.8pt; color: #6b7078; }',
  '',
  '.steps { margin: 0; padding: 0; list-style: none; counter-reset: step; }',
  '.steps > li { position: relative; padding: 0 0 8px 24px; counter-increment: step; break-inside: avoid; }',
  '.steps > li:last-child { padding-bottom: 0; }',
  '.steps > li::before {',
  '  content: counter(step);',
  '  position: absolute; left: 0; top: 1px;',
  '  width: 16px; height: 16px;',
  '  display: flex; align-items: center; justify-content: center;',
  '  font-size: 8pt; font-weight: 700; color: #fff; background: var(--tone); border-radius: 50%;',
  '}',
  '.step-name { font-weight: 700; display: block; }',
  '.step-body { font-size: 9.4pt; margin: 1px 0 3px; }',
  '.step-body:last-child { margin-bottom: 0; }',
  '.steps .path { display: inline-block; margin: 2px 0; }',
  '',
  '.btn { border: 1px solid #9b988d; border-radius: 2px; padding: 0 4px; font-size: 8.8pt; font-weight: 600; background: #fff; }',
  '',
  '.notes { margin: 0; padding: 8px 11px 8px 26px; background: #faf5e9; border-left: 3px solid #8a5a12; }',
  '.notes li { font-size: 9.2pt; line-height: 1.5; margin-bottom: 5px; break-inside: avoid; }',
  '.notes li:last-child { margin-bottom: 0; }',
  '',
  '.why { margin-top: 10px; padding-top: 7px; border-top: 1px dashed #c9c6bb; }',
  '.why ul { margin: 0; padding-left: 15px; }',
  '.why li { font-size: 8.8pt; color: #6b7078; margin-bottom: 3px; break-inside: avoid; }',
  '.why li:last-child { margin-bottom: 0; }',
  '',
  '.related { margin-top: 9px; font-size: 8.8pt; color: #43484e; break-inside: avoid; }',
  '.related b { color: #6b7078; font-size: 8.4pt; }',
  '.related ul { margin: 3px 0 0; padding: 0; list-style: none; }',
  '.related li { margin-bottom: 2px; padding-left: 12px; position: relative; }',
  ".related li::before { content: '\\2192'; position: absolute; left: 0; color: var(--tone); }",
  '.related .out { color: #6b7078; }'
].join('\n');

function build(key) {
  var period = PERIODS[key];

  // 문의가 많은 순으로 놓는다. 화면과 같은 차례여야 찾는 사람이 헷갈리지 않는다.
  var cases = CASES
    .filter(function (c) { return c.periods.indexOf(key) !== -1; })
    .sort(function (a, b) { return (b.asks || 0) - (a.asks || 0); });

  // 인쇄물에는 링크가 없으므로 연결 사례를 이 책자의 번호로 가리킨다.
  var no = {};
  cases.forEach(function (c, i) { no[c.id] = i + 1; });

  var BY_ID = {};
  CASES.forEach(function (c) { BY_ID[c.id] = c; });

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var toc = '<div class="toc"><h2>차례</h2><ol>'
    + cases.map(function (c, i) {
        return '<li><span class="no">' + pad(i + 1) + '</span>' + esc(c.title)
          + (c.asks ? ' <span class="hit">(' + c.asks + '건)</span>' : '')
          + '</li>';
      }).join('')
    + '</ol></div>';

  var body = cases.map(function (c, i) {
    var areas = AREAS.filter(function (a) { return c.areas.indexOf(a) !== -1; });

    var procedure = c.branches
      ? c.branches.map(function (b) {
          return '<div class="branch">'
            + '<p class="branch-name">' + esc(b.name) + '</p>'
            + (b.when ? '<p class="branch-when">' + rich(b.when) + '</p>' : '')
            + '<ol class="steps">' + stepsHtml(b.steps) + '</ol>'
            + '</div>';
        }).join('')
      : '<ol class="steps">' + stepsHtml(c.steps) + '</ol>';

    var related = (c.related || [])
      .map(function (id) { return BY_ID[id]; })
      .filter(Boolean)
      .map(function (r) {
        return no[r.id]
          ? '<li>' + pad(no[r.id]) + '번 ' + esc(r.title) + '</li>'
          : '<li class="out">' + esc(r.title) + ' <span>(' + esc(PERIODS[r.periods[0]].name) + ' 책자)</span></li>';
      }).join('');

    return '<section class="case">'
      + '<div class="case-head">'
      +   '<h2 class="case-title"><span class="case-no">' + pad(i + 1) + '</span>' + esc(c.title) + '</h2>'
      +   '<div class="meta">'
      +     (c.asks >= 40 ? '<span class="often">자주 나오는 문제</span>' : '')
      +     areas.map(function (a) { return '<span class="area">' + esc(a) + '</span>'; }).join('')
      +     (c.path ? '<span class="path">' + esc(c.path) + '</span>' : '')
      +     (c.asks ? '<span>문의 ' + c.asks + '건</span>' : '')
      +   '</div>'
      +   '<ul class="summary">' + li(c.summary) + '</ul>'
      + '</div>'
      + '<div class="block">'
      +   '<h3>해결 절차</h3>' + procedure
      +   (c.notes && c.notes.length ? '<h3>주의 사항</h3><ul class="notes">' + li(c.notes) + '</ul>' : '')
      +   (c.why && c.why.length ? '<div class="why"><h3>왜 이렇게 되나요</h3><ul>' + li(c.why) + '</ul></div>' : '')
      +   (related ? '<div class="related"><b>이게 아니라면 이쪽을 보십시오</b><ul>' + related + '</ul></div>' : '')
      + '</div>'
      + '</section>';
  }).join('');

  return [
    '<!DOCTYPE html>',
    '<!-- ' + period.name + ' 인쇄용 책자 · make-books.js가 만든 파일이므로 직접 고치지 않는다 -->',
    '<html lang="ko">',
    '<head>',
    '<meta charset="UTF-8">',
    '<title>고등 나이스 치트시트 · ' + esc(period.name) + '</title>',
    '<style>',
    ':root { --tone: ' + period.tone + '; --tint: ' + period.tint + '; }',
    STYLE,
    '</style>',
    '</head>',
    '<body>',
    '<div class="cover">',
    '  <p class="kicker">고등 나이스 치트시트</p>',
    '  <h1>' + esc(period.name) + '</h1>',
    '  <p class="months">' + esc(period.months) + ' · 사례 ' + cases.length + '건</p>',
    '  <p class="about">사례는 문의가 많은 순으로 실었습니다. 문의 건수는 나이스광장 질의응답에 올라온 비슷한 질문의 수이며, 우리 학교의 문의 수가 아닙니다. 나이스 화면은 개편될 수 있으니 메뉴 이름이 다르면 같은 자리의 메뉴를 찾아 보십시오.</p>',
    '</div>',
    toc,
    body,
    '</body>',
    '</html>'
  ].join('\n');
}

Object.keys(PERIODS).forEach(function (key) {
  var file = path.join(DIR, 'print-' + key + '.html');
  fs.writeFileSync(file, build(key), 'utf8');
  var n = CASES.filter(function (c) { return c.periods.indexOf(key) !== -1; }).length;
  console.log('print-' + key + '.html · ' + PERIODS[key].name + ' · ' + n + '건');
});
