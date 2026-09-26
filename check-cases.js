// 데이터 파일과 화면 로직이 실제로 맞물리는지 확인하는 검증 스크립트
const fs = require('fs');
eval(fs.readFileSync('cases.js', 'utf8'));

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fail++; };

// 1. periods가 PERIODS에 있는 키인가
CASES.forEach(c => ok(c.periods.length > 0 && c.periods.every(p => PERIODS[p]), c.id + ' periods 유효'));

// 2. areas가 전역 AREAS에 등록된 이름인가
CASES.forEach(c => {
  const bad = c.areas.filter(a => !AREAS.includes(a));
  ok(c.areas.length > 0 && bad.length === 0, c.id + ' areas 유효' + (bad.length ? ' → ' + bad.join(',') : ''));
});

// 3. 화면이 그릴 때 필요한 항목이 빠지지 않았는가
CASES.forEach(c => {
  const miss = ['id', 'title', 'summary'].filter(k => !c[k] || c[k].length === 0);
  ok(miss.length === 0, c.id + ' 필수 항목 있음' + (miss.length ? ' → ' + miss.join(',') : ''));
});

// 4. 절차는 steps 하나이거나 branches로 갈리거나 둘 중 하나다
CASES.forEach(c => {
  const flat = c.steps && c.steps.length > 0;
  const branched = c.branches && c.branches.length > 0
    && c.branches.every(b => b.name && b.steps && b.steps.length > 0);
  ok((flat || branched) && !(c.steps && c.branches), c.id + ' 절차 구조 유효');
});

// 5. id 중복 없음
ok(new Set(CASES.map(c => c.id)).size === CASES.length, 'id 중복 없음');

// 6. 중괄호 표기 짝이 맞는가
CASES.forEach(c => {
  const all = JSON.stringify(c);
  ok((all.match(/\{/g) || []).length === (all.match(/\}/g) || []).length, c.id + ' 중괄호 짝 맞음');
});

// 7. 문의 건수가 들어 있는가
CASES.forEach(c => {
  ok(typeof c.asks === 'number' && c.asks > 0, c.id + ' asks 유효');
});

// 8. 트리맵용 짧은 이름이 있고 서로 겹치지 않는가
CASES.forEach(c => {
  ok(typeof c.short === 'string' && c.short.length > 0 && c.short.length <= 14,
     c.id + ' short 유효' + (c.short ? ' (' + c.short.length + '자)' : ''));
});
ok(new Set(CASES.map(c => c.short)).size === CASES.length, 'short 중복 없음');

// 9. related가 실제 존재하는 id를 가리키는가
const ids = new Set(CASES.map(c => c.id));
CASES.forEach(c => {
  const rel = c.related || [];
  const bad = rel.filter(r => !ids.has(r));
  const self = rel.includes(c.id);
  ok(bad.length === 0 && !self,
     c.id + ' related 유효' + (bad.length ? ' → 없는 id ' + bad.join(',') : '') + (self ? ' → 자기 자신 참조' : ''));
});

// 10. 연결은 양방향인가 (한쪽만 걸려 있으면 돌아올 길이 없다)
CASES.forEach(c => {
  const oneWay = (c.related || []).filter(r => {
    const o = CASES.find(x => x.id === r);
    return o && !(o.related || []).includes(c.id);
  });
  ok(oneWay.length === 0, c.id + ' 연결 양방향' + (oneWay.length ? ' → ' + oneWay.join(',') : ''));
});

// 11. 한글·영문·허용 기호 외의 문자가 섞이지 않았는가
const raw = fs.readFileSync('cases.js', 'utf8');
const strange = [...new Set(raw)].filter(c =>
  !(c.charCodeAt(0) < 128 || (c >= '\uac00' && c <= '\ud7a3') || (c >= '\u3131' && c <= '\u318e') || '›·—…‘’“”'.includes(c))
);
ok(strange.length === 0, '이상 문자 없음' + (strange.length ? ' → ' + strange.join(' ') : ''));

// 12. 시기별 사례 수와 칩 구성
Object.keys(PERIODS).forEach(p => {
  const list = CASES.filter(c => c.periods.includes(p));
  const chips = AREAS.filter(a => list.some(c => c.areas.includes(a)));
  console.log('     ' + p + ' (' + PERIODS[p].name + ') → ' + list.length + '건 · 칩 [' + chips.join(', ') + ']');
});

// 13. 한 번도 쓰이지 않은 영역 이름 알려주기
const unused = AREAS.filter(a => !CASES.some(c => c.areas.includes(a)));
if (unused.length) console.log('     아직 사례가 없는 영역 → ' + unused.join(', '));

process.exit(fail ? 1 : 0);
