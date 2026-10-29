/* 2027학년도 고입 — 학교별 입학요강 핵심 정리
 * 출처: 각 학교 홈페이지에 게시된 2027학년도 입학전형요항(요강), 2026-10-29 확인.
 * ★ 표시는 요강 원문에서 확인하지 못해 학교에 문의가 필요한 항목.
 * 날짜는 모두 2026년(원서·발표), kind: apply(원서) · result1(1차 발표) · exam(면접·실기) · result(합격 발표) · etc
 */
window.IB = window.IB || {};

IB.YEAR_LABEL = '2027학년도 고입';

/* 모든 학생에게 해당하는 공통 규칙 */
IB.RULES = [
  '전기학교(특성화고·마이스터고·예술고 등)는 전국에서 1개교만 지원할 수 있음(이중지원 금지).',
  '경기 특성화고 특별전형에 불합격한 학생만 일반전형에 지원 가능(다른 학교도 가능).',
  '경기 특성화고에 지원했다가 불합격해도 서울 특성화고에는 지원할 수 없음 → 경기·서울 중 처음부터 한 곳만 선택.',
  '마이스터고 불합격자는 특성화고 지원 가능, 예술고 불합격자는 불가.',
  '전기학교 합격자(포기자 포함)는 전기 추가모집·후기학교 지원 불가. 포기 시 학부모 포기원 + 중학교장 확인서.',
  '경기 특성화고 내신 200점 = 교과 150(3학년 2학기 1차 지필까지) + 출결 20 + 봉사 20 + 학교활동 10(비교과는 3학년 10월 말까지). 학교마다 특별전형 배점은 다름.'
];

/* 공통 일정. scope: gg(경기 특성화고) · seoul(서울 특성화고) · early(전기 전체) · late(후기 일반고) · all */
IB.COMMON_EVENTS = [
  { date: '2026-10-30', label: '지원 학교·학과·전형 최종 확정(학생·학부모 확인)', kind: 'etc', scope: 'early', who: '담임' },
  { date: '2026-10-30', label: '출결·봉사·학교활동(수상·임원) 나이스 입력 마감 확인', kind: 'etc', scope: 'all', who: '담임' },
  { date: '2026-11-03', end: '2026-11-05', time: '~17:00', label: '경기 특성화고 특별전형 원서 접수(고교입학시스템)', kind: 'apply', scope: 'gg' },
  { date: '2026-11-12', end: '2026-11-13', time: '~17:00', label: '경기 특성화고 일반전형 원서 접수', kind: 'apply', scope: 'gg' },
  { date: '2026-11-23', label: '경기 특성화고 일반전형 합격 발표', kind: 'result', scope: 'gg' },
  { date: '2026-11-23', end: '2026-11-24', time: '09:00~17:00', label: '서울 특성화고 특별전형 원서(수기 원서 방문 제출)', kind: 'apply', scope: 'seoul' },
  { date: '2026-11-25', end: '2026-11-26', label: '서울 특성화고 특별전형 면접', kind: 'exam', scope: 'seoul' },
  { date: '2026-11-27', time: '10:00', label: '서울 특성화고 특별전형 합격 발표', kind: 'result', scope: 'seoul' },
  { date: '2026-11-26', end: '2026-11-27', label: '전기학교 미달교 추가모집 원서(발표 12/1)', kind: 'apply', scope: 'early' },
  { date: '2026-11-30', end: '2026-12-01', time: '09:00~17:00', label: '서울 특성화고 일반전형 원서', kind: 'apply', scope: 'seoul' },
  { date: '2026-12-02', time: '10:00', label: '서울 특성화고 일반전형 합격 발표', kind: 'result', scope: 'seoul' },
  { date: '2026-12-04', end: '2026-12-10', label: '후기 일반고 원서 접수(1개교, 발표 12/14)', kind: 'apply', scope: 'late' },
  { date: '2026-12-14', label: '후기 일반고 합격 발표', kind: 'result', scope: 'late' }
];

/* 공통 서류 템플릿 */
const GG_APP = { id: 'app', name: '입학원서·개인정보활용동의서', track: '공통', who: '학생', how: '우리 학교에서 고교입학시스템 온라인 접수(출력물은 내지 않음)', check: true };
const GG_REC = { id: 'rec', name: '학교장 추천서', track: '특별', who: '학교장', how: '고교입학시스템 서식, 원서와 함께', check: true };
const SEOUL_FLOW = '경기 학생은 학교 홈페이지에서 원서 양식을 받아 손으로 작성 → 학교에 직접 방문 제출(나이스 접수 불가)';
const SEOUL_APP = { id: 'app', name: '입학원서(사진 부착)', track: '공통', who: '학생·보호자 서명, 성적란은 중학교 기재, 중학교장 직인', how: '방문 제출', check: true };
const SEOUL_DATES = [
  { date: '2026-11-23', end: '2026-11-24', time: '09:00~17:00', label: '특별전형 원서 방문 접수', kind: 'apply' },
  { date: '2026-11-25', end: '2026-11-26', label: '특별전형 심층면접', kind: 'exam' },
  { date: '2026-11-27', time: '10:00', label: '특별전형 합격 발표', kind: 'result' },
  { date: '2026-11-30', end: '2026-12-01', time: '09:00~17:00', label: '일반전형 원서 방문 접수', kind: 'apply' },
  { date: '2026-12-02', time: '10:00', label: '일반전형 합격 발표', kind: 'result' }
];

IB.SCHOOLS = [
  /* ───────────── 경기 특성화고 ───────────── */
  {
    id: 'sungil', name: '성일정보고', aliases: ['성일정보고등학교'], type: '특성화고', area: 'gg', region: '경기 성남(전국 모집)',
    depts: ['뷰티스마트케어과', '부사관과', '글로벌경영과', '회계정보과', '창업마케팅과', 'AI게임콘텐츠과', '소프트웨어개발과'],
    home: 'https://sungili-h.goesn.kr',
    links: [
      { label: '2027 입학전형요항 + 취업희망서·담임추천서 양식', url: 'https://sungili-h.goesn.kr/sungili-h/na/ntt/selectNttInfo.do?mi=17785&bbsId=14272&nttSn=1945934' },
      { label: '입학공지사항 게시판', url: 'https://sungili-h.goesn.kr/sungili-h/na/ntt/selectNttList.do?mi=17785&bbsId=14272' }
    ],
    contact: '교무실 031-720-1321 · 입학상담실 031-720-1313',
    apply: '고교입학시스템 온라인. 추가 증빙서류가 있으면 원서 출력물과 함께 직접(또는 우편, 마감일 17:00 도착) 제출',
    tracks: [
      { name: '진로적성(취업희망자) 특별전형', choices: '2지망까지 (부사관과는 1지망만)', method: '1차 서류 100(출결 40·교과 50·학교활동 10, 학교장추천서 참고) → 1.2배수 → 2차 100(취업희망서 40·인성면접 30·적성면접 30). 부사관과 2차 = 취업희망서 40·인성 15·적성 15·체력실기 30' },
      { name: '일반전형', choices: '2지망까지', method: '내신 200(교과 150·출결 20·봉사 20·학교활동 10)' }
    ],
    dates: [
      { date: '2026-11-03', end: '2026-11-05', time: '09:00~17:00', label: '특별전형 원서 접수', kind: 'apply' },
      { date: '2026-11-06', time: '11:00', label: '1차(서류) 합격 발표', kind: 'result1' },
      { date: '2026-11-09', time: '14:00', label: '2차 면접·실기(본교 교실·운동장)', kind: 'exam' },
      { date: '2026-11-11', time: '11:00', label: '특별전형 합격 발표', kind: 'result' },
      { date: '2026-11-12', end: '2026-11-13', label: '일반전형 원서 접수', kind: 'apply' },
      { date: '2026-11-23', time: '11:00', label: '일반전형 합격 발표', kind: 'result' },
      { date: '2026-12-04', time: '14:00', label: '합격자 예비소집(본교 원계체육관)', kind: 'etc' }
    ],
    docs: [
      GG_APP, GG_REC,
      { id: 'hope', name: '취업희망서', track: '특별', who: '학생', form: true, how: '학교 양식(게시판 hwp). 원서 출력물과 함께 직접 제출', note: '2차 40점. 미래 진로 설계·본교 지원 이유 필수 작성', check: true },
      { id: 'trec', name: '담임교사 추천서', track: '특별', who: '담임', form: true, how: '취업희망서와 같은 양식 안에 있음(담임 서명)', check: true },
      { id: 'etc', name: '기타 증빙서류', track: '특별', who: '학생', how: '해당자만, 원서 출력물과 함께 직접 제출' }
    ],
    notes: [
      '부사관과 체력실기: 1.2km 달리기(우천 시 20m 왕복달리기), 앉아윗몸앞으로굽히기 → 운동복·운동화',
      '1차 합격자가 2차에 불참하면 면접·실기는 최하점 처리'
    ],
    ask: []
  },
  {
    id: 'sts', name: '성남테크노과학고', aliases: ['성남테크노과학고등학교', '성남테크노고'], type: '특성화고', area: 'gg', region: '경기 성남(경기도 모집)',
    depts: ['스마트로봇기계과', '스마트전기전자과', '3D인테리어디자인과', '영상콘텐츠과', '정보보안과'],
    home: 'https://sts-h.goesn.kr',
    links: [{ label: '2027 입학전형요항 + 각종 서식(취업희망서·자기소개서)', url: 'https://sts-h.goesn.kr/sts-h/na/ntt/selectNttInfo.do?mi=21704&bbsId=16612&nttSn=1952627' }],
    contact: '교무실 031-753-0253',
    apply: '고교입학시스템 온라인. 자격증 사본 등 증빙은 원서 출력물과 함께 직접 제출',
    tracks: [
      { name: '진로적성(취업희망자) 특별전형', choices: '3지망까지 (2·3지망은 미달 학과만 유효)', method: '1차 서류 100(출결 20·봉사 20·학교활동 10·교과 50) → 1.5배수 → 2차 100(취업희망서 30·자기소개서 20·면접 50)' },
      { name: '일반전형', choices: '4지망까지', method: '내신 200 + 자격증 가산점(개당 1점, 최대 10점)' }
    ],
    dates: [
      { date: '2026-11-03', end: '2026-11-05', time: '09:00~17:00', label: '특별전형 원서 접수', kind: 'apply' },
      { date: '2026-11-06', time: '11:00', label: '1차(서류) 합격 발표', kind: 'result1' },
      { date: '2026-11-09', time: '14:00', label: '2차 면접·신체검사(본교 교실)', kind: 'exam' },
      { date: '2026-11-11', time: '11:00', label: '특별전형 합격 발표', kind: 'result' },
      { date: '2026-11-12', end: '2026-11-13', label: '일반전형 원서 접수', kind: 'apply' },
      { date: '2026-11-23', time: '12:00', label: '일반전형 합격 발표', kind: 'result' }
    ],
    docs: [
      GG_APP, GG_REC,
      { id: 'cert', name: '자격증 사본', track: '특별·일반', who: '학생', how: '해당자만, 원서 출력물과 함께 직접 제출' },
      { id: 'hope', name: '취업희망서(서식2)', track: '특별', who: '학생', form: true, how: '2차 면접 당일 현장에서 자필 작성', note: '30점. 양식 미리 보고 연습', check: true },
      { id: 'self', name: '자기소개서(서식3)', track: '특별', who: '학생', form: true, how: '2차 면접 당일 현장에서 자필 작성', note: '20점', check: true },
      { id: 'proof', name: '자기소개서 증빙자료', track: '특별', who: '학생', how: '미리 준비해서 2차 당일 제출', check: true }
    ],
    notes: ['2차 점수가 60% 미만이고 지원동기·취업의지가 부족하면 정원과 관계없이 불합격할 수 있음'],
    ask: []
  },
  {
    id: 'hanam', name: '하남경영고', aliases: ['하남경영고등학교'], type: '특성화고', area: 'gg', region: '경기 하남(경기·서울 모집)',
    depts: ['스마트경영과', '카페플랫폼경영과', '스마트IT과', '콘텐츠디자인과', '보건간호과'],
    home: 'https://hanambiz-h.goegh.kr',
    links: [
      { label: '2027 입학전형요항', url: 'https://hanambiz-h.goegh.kr/hanambiz-h/na/ntt/selectNttInfo.do?mi=4224&bbsId=2414&nttSn=1219367' },
      { label: '특별전형 제출 서류 안내 + 자기소개서 양식·학과별 예시(10/27)', url: 'https://hanambiz-h.goegh.kr/hanambiz-h/na/ntt/selectNttInfo.do?mi=4224&bbsId=2414&nttSn=1231865' }
    ],
    contact: '교무실 031-795-6303',
    apply: '고교입학시스템 온라인(원서 출력물은 내지 않음)',
    tracks: [
      { name: '진로적성(취업희망자) 특별전형', choices: '2지망까지', method: '1차 서류 100(교과 50·출결 20·봉사 20·학교활동 10) → 1.2배수 → 2차 100(취업희망서 30·자기소개서 30·가산점 10·면접 30)' },
      { name: '일반전형', choices: '3지망까지', method: '내신 200 + 자격증 가산점(개당 1점, 최대 10점). 1지망자 우선' }
    ],
    dates: [
      { date: '2026-11-03', end: '2026-11-05', time: '~17:00', label: '특별전형 원서 접수', kind: 'apply' },
      { date: '2026-11-06', time: '12:00', label: '1차(서류) 합격 발표', kind: 'result1' },
      { date: '2026-11-09', time: '14:00~', label: '2차 면접(본교)', kind: 'exam' },
      { date: '2026-11-11', time: '19:00', label: '특별전형 합격 발표', kind: 'result' },
      { date: '2026-11-12', end: '2026-11-13', label: '일반전형 원서 접수(특별 불합격자는 다시 제출)', kind: 'apply' },
      { date: '2026-11-23', time: '14:00', label: '일반전형 합격 발표', kind: 'result' }
    ],
    docs: [
      GG_APP,
      { id: 'rec', name: '학교장 추천서', track: '특별', who: '학교장', how: '★ 서식·제출 시기 학교 확인 필요(요항 표에만 있음)', check: true },
      { id: 'self', name: '자기소개서(취업희망 포함)', track: '특별', who: '학생', form: true, how: '2차 면접일에 면접장에서 본인 자필 작성. 미리 쓴 초안 지참 가능', note: '취업희망서 30 + 자기소개서 30. 문항: 지원 동기·진로희망 분야, 고교 3년 계획', check: true },
      { id: 'bonus', name: '가산점 증빙(자격증 사본, 본교 학과체험·견학 수료증)', track: '특별', who: '학생', how: '2차 면접일에 원서 출력물과 함께 직접 제출. 원서에도 가산점 입력', note: '자격증 개당 1점(최대 5) + 학과체험 5점, 합계 최대 10점', check: true },
      { id: 'cert', name: '자격증 사본', track: '일반', who: '학생', how: '★ 제출 시기·방법 미명시', note: '개당 1점, 최대 10점' }
    ],
    notes: ['취업희망서·자기소개서·면접 합계가 60% 미만이고 지원동기가 부족하면 불합격할 수 있음'],
    ask: ['학교장 추천서 서식·제출 시기', '일반전형 자격증 사본 제출 방법']
  },
  {
    id: 'gjja', name: '광주중앙고(특성화학과)', aliases: ['광주중앙고', '광주중앙고등학교', '광주중앙고(특성화학과)'], earlyOnly: true,
    type: '일반고 특성화학과', area: 'gg', region: '경기 광주(경기도 모집)',
    depts: ['농업유통정보과', '외식식품가공과', '조경시스템과', '스마트생물산업기계과'],
    home: 'https://gjja-h.goegh.kr',
    links: [{ label: '2027 입학전형요항(일반고 특성화학과)', url: 'https://gjja-h.goegh.kr/gjja-h/na/ntt/selectNttInfo.do?mi=5765&bbsId=3252&nttSn=1218934' }],
    contact: '입학 031-799-7400',
    apply: '고교입학시스템 온라인. 자격증 사본은 원서 출력물과 함께 직접(우편은 마감일 17:00 교육행정실 도착)',
    tracks: [
      { name: '일반전형만 (진로적성 특별전형 없음)', choices: '2지망까지', method: '내신 200 + 자격증 가산점(기술 관련, 개당 1점, 최대 10점). 1지망자 우선' }
    ],
    dates: [
      { date: '2026-11-12', end: '2026-11-13', time: '09:00~17:00', label: '일반전형 원서 접수', kind: 'apply' },
      { date: '2026-11-23', label: '합격 발표(본교 홈페이지)', kind: 'result' }
    ],
    docs: [
      { ...GG_APP, how: '11/12~11/13 고교입학시스템 온라인 접수' },
      { id: 'cert', name: '자격증 사본(해당자)', track: '일반', who: '학생', how: '원서 출력물과 함께 직접 제출(우편은 마감일 17:00 도착)', note: 'ITQ·워드·컴활 공통 인정, 학과별 기능사는 요항 3쪽' }
    ],
    notes: ['자기소개서·추천서·면접 없음 — 내신으로만 선발', '같은 학교 자율형공립고(후기)와는 다른 전형'],
    ask: []
  },
  {
    id: 'kheb', name: '경화여자EB고', aliases: ['경화여자EB고등학교', '경화여자English Business고', '경화여자잉글리시비즈니스고', '경화EB고'], type: '특성화고', area: 'gg', region: '경기 광주(여학생, 경기도 모집)',
    depts: ['공공행정사무과', '비즈니스영어과', '창업마케팅과'],
    home: 'https://kheb-h.goegh.kr',
    links: [
      { label: '2027 입학전형요항', url: 'https://kheb-h.goegh.kr/kheb-h/na/ntt/selectNttInfo.do?mi=7561&bbsId=4261&nttSn=1219204' },
      { label: '취업 희망서 및 자기소개서 양식·예시(10/26)', url: 'https://kheb-h.goegh.kr/kheb-h/na/ntt/selectNttInfo.do?mi=7561&bbsId=4261&nttSn=1231607' }
    ],
    contact: '교무실 031-799-0615',
    apply: '고교입학시스템 온라인(원서 출력물은 내지 않음)',
    tracks: [
      { name: '진로적성(취업희망자) 특별전형', choices: '3지망까지', method: '1차 서류 100(교과 50·출결 30·학교활동 10·봉사 10) → 1.2배수 → 2차(자기소개서·취업희망서 45·면접 53·가산점 2)' },
      { name: '일반전형', choices: '3지망까지', method: '내신 200(교과 150·출결 30·학교활동 10·봉사 10) + 자격증 가산점(최대 10점)' }
    ],
    dates: [
      { date: '2026-11-03', end: '2026-11-05', time: '~17:00', label: '특별전형 원서 접수', kind: 'apply' },
      { date: '2026-11-06', time: '10:00', label: '1차(서류) 합격 발표', kind: 'result1' },
      { date: '2026-11-09', time: '14:00', label: '2차 면접(본교)', kind: 'exam' },
      { date: '2026-11-11', time: '10:00', label: '특별전형 합격 발표', kind: 'result' },
      { date: '2026-11-12', end: '2026-11-13', label: '일반전형 원서 접수', kind: 'apply' },
      { date: '2026-11-23', time: '10:00', label: '일반전형 합격 발표', kind: 'result' }
    ],
    docs: [
      GG_APP,
      { id: 'rec', name: '학교장 추천서', track: '공통(요항 표기)', who: '학교장', how: '★ 서식·제출 방법 학교 확인 필요', check: true },
      { id: 'self', name: '취업 희망서 및 자기소개서 [서식5]', track: '특별(필수)', who: '학생', form: true, how: '집에서 자필로 작성 → 2차 면접일(11/9) 지참·제출', note: '45점. 희망 직종·진로 설계 체크 + 5문항(흥미 교과, 동아리·반 역할, 봉사·도운 경험, 지원 동기, 입학 후 각오)', check: true },
      { id: 'proof', name: '자기소개서 증빙서류', track: '특별', who: '학생', how: '2차 당일 제출(생기부에 있는 내용은 낼 필요 없음)', check: true },
      { id: 'cert', name: '자격증 사본', track: '특별·일반', who: '학생', how: '특별: 2차 당일 / 일반: 전형기간 중 17:00까지 제1교무실 도착', note: '특별 가산 최대 2점(학과체험 이수 또는 자격증), 일반 개당 1점 최대 10점' }
    ],
    notes: ['여학생만 지원 가능', '2차 점수 60% 미만이면 불합격할 수 있고, 면접 불참 시 불합격'],
    ask: ['학교장 추천서 서식·제출 방법']
  },
  {
    id: 'farms', name: '여주자영농업고', aliases: ['여주자영농업고등학교', '여주자영농고'], type: '특성화고', area: 'gg', region: '경기 여주(전국 모집, 농업계)',
    depts: ['스마트동물자원과'],
    deptNote: '학과는 요항 참고(설문의 "동물자원과" = 스마트동물자원과)',
    home: 'https://farms-h.goeyj.kr',
    links: [{ label: '2027 입학전형요항·서식(서식1~6)', url: 'https://farms-h.goeyj.kr/farms-h/na/ntt/selectNttInfo.do?mi=665&bbsId=192&nttSn=1581724' }],
    contact: '031-886-0966',
    apply: '고교입학시스템 온라인. 추가 제출 서류는 우편 접수(마감 시각까지 도착)',
    tracks: [
      { name: '진로적성(취업희망자) 특별전형만 (일반전형 없음)', choices: '1지망만', method: '1차 서류 100(출결 40·봉사 5·교과 50·가업승계 가산 5) → 1.2배수 → 2차 100(자기소개서 40·면접 60)' }
    ],
    dates: [
      { date: '2026-11-03', end: '2026-11-05', time: '09:00~17:00', label: '원서 접수', kind: 'apply' },
      { date: '2026-11-05', time: '21:00', label: '1차 합격 발표', kind: 'result1' },
      { date: '2026-11-06', time: '14:00~17:00', label: '2차 전형(자기소개서 작성·면접)', kind: 'exam' },
      { date: '2026-11-11', time: '14:00', label: '최종 합격 발표', kind: 'result' }
    ],
    docs: [
      GG_APP,
      { id: 'rec', name: '학교장 추천서(서식6)', track: '특별', who: '학교장', how: '고교입학시스템에서 출력, 원서와 함께(필수)', check: true },
      { id: 'hope', name: '진로(취업) 희망서(서식4)', track: '특별', who: '학생', form: true, how: '학생 자필, 원서 마감(11/5 17:00)까지 도착. ★ 우편/방문 방법 학교 확인', note: '희망 취업 분야, 진로 설계 택1, 지원 동기', check: true },
      { id: 'self', name: '자기소개서(서식5)', track: '특별', who: '학생', form: true, how: '사전 제출 없음. 1차 합격자가 2차 당일 학교에서 작성', note: '40점. 미래 진로 각오, 고교 3년 계획', check: true },
      { id: 'farm', name: '가족관계증명서 + 가업 증빙(농지대장·축산업등록증 등)', track: '특별', who: '보호자', how: '해당자만, 원서 기간 안에', note: '증빙 5점 / 미제출 3점' }
    ],
    notes: ['일반전형이 없어 불합격하면 다른 학교 일반전형(11/12~13)으로', '2차가 11/6(금)으로 다른 학교보다 빠름', '기숙사 입사 방법은 요항에 없음(입학 후 안내)'],
    ask: ['진로(취업) 희망서 제출 방법(우편/방문)']
  },
  {
    id: 'gtour', name: '경기관광고', aliases: ['경기관광고등학교'], type: '특성화고', area: 'gg', region: '경기 여주(경기·서울·강원·충북 모집)',
    depts: ['항공호텔서비스과', '크리에이트창업과', '호텔조리과', '카페베이커리과'],
    home: 'https://gtour-h.goeyj.kr',
    links: [
      { label: '2027 입학전형요항(최종)', url: 'https://gtour-h.goeyj.kr/gtour-h/na/ntt/selectNttInfo.do?mi=3679&bbsId=2023&nttSn=1585324' },
      { label: '취업희망서·자기소개서 양식·예시, 면접 예상 질문', url: 'https://gtour-h.goeyj.kr/gtour-h/na/ntt/selectNttList.do?mi=3680&bbsId=2024' }
    ],
    apply: '고교입학시스템 온라인',
    tracks: [
      { name: '진로적성(취업희망자) 특별전형만 (일반전형 0명)', choices: '1지망만', method: '1차 서류 100(취업희망서 20·출결 30·학교활동 10·교과 30·자격증 최대 10) → 1.5배수 → 2차(자기소개서 30·면접 70)' }
    ],
    dates: [
      { date: '2026-11-03', end: '2026-11-05', label: '원서 접수 + 취업희망서 제출', kind: 'apply' },
      { date: '2026-11-09', label: '2차 면접(장소 추후 안내)', kind: 'exam' },
      { date: '2026-11-11', time: '12:00', label: '합격 발표', kind: 'result' }
    ],
    docs: [
      GG_APP,
      { ...GG_REC, how: '고교입학시스템에서 원서 제출 시 자동 첨부' },
      { id: 'hope', name: '취업희망서', track: '특별', who: '학생', form: true, how: '출력해 자필 작성 → PDF/JPG로 업무관리시스템(수신: 경기관광고등학교장)·메신저·이메일, 또는 우편·방문(행정실). ★마감일 확인', note: '1차 20점. 지원 학과 1개 + 진로 계획 + 서술 1문항', check: true },
      { id: 'self', name: '자기소개서', track: '특별', who: '학생', form: true, how: '면접 당일 면접장에서 작성(양식 미리 공개)', note: '30점. 자신 소개, 지원 이유', check: true },
      { id: 'cert', name: '기술 관련 자격증 사본(원본대조필)', track: '특별', who: '학생', how: '원서 접수일까지 직접 제출', note: '개당 2점, 최대 10점' }
    ],
    notes: ['학생은 항공호텔서비스과·호텔조리과 중 하나만 선택(1지망만)', '2차 60% 미만이고 동기 부족 시 불합격 가능'],
    ask: ['취업희망서 제출 마감일']
  },
  {
    id: 'samil', name: '삼일고', aliases: ['삼일고등학교', '삼일고등학교(경기)', '삼일고(경기)', '삼일상업고', '삼일상고'], type: '특성화고', area: 'gg', region: '경기 수원(구 삼일상업고, 경기도 모집)',
    depts: ['IT메이커스경영과', '디지털인공지능경영과', '외식경영과', '베이커리카페과'],
    deptNote: '삼일공업고와 다른 학교',
    home: 'https://samil-h.goesw.kr',
    links: [
      { label: '2027 입학전형요항(최종본)', url: 'https://samil-h.goesw.kr/samil-h/na/ntt/selectNttInfo.do?mi=5369&bbsId=3353&nttSn=576793' },
      { label: '특별전형 서류(진로적성희망서·자기소개서) 안내', url: 'https://samil-h.goesw.kr/samil-h/na/ntt/selectNttInfo.do?mi=5369&bbsId=3353&nttSn=584147' }
    ],
    apply: '고교입학시스템 온라인. 추가 증빙이 있으면 출력물과 함께 직접(우편은 마감일 17:00 본관 3층 교무실 도착)',
    tracks: [
      { name: '진로적성(취업희망자) 특별전형', choices: '1지망만', method: '1차 서류 100(진로적성희망서 35·교과 50·출결 5·봉사 5·학교생활 5) → 1.2배수 → 2차(자기소개서 30·가산점 10·면접 60)' },
      { name: '일반전형', choices: '2지망까지', method: '내신 200 + 가산점. IT메이커스경영과 일반 3명뿐' }
    ],
    dates: [
      { date: '2026-11-03', end: '2026-11-05', time: '09:00~17:00', label: '특별전형 원서 + 진로적성희망서 제출', kind: 'apply' },
      { date: '2026-11-09', time: '10:00 이후', label: '1차 합격 발표', kind: 'result1' },
      { date: '2026-11-10', time: '10:00', label: '2차 면접(엘림관 1층 톡톡실)', kind: 'exam' },
      { date: '2026-11-11', time: '14:00 이후', label: '특별전형 합격 발표', kind: 'result' },
      { date: '2026-11-12', end: '2026-11-13', label: '일반전형 원서 접수', kind: 'apply' },
      { date: '2026-11-23', label: '일반전형 합격 발표', kind: 'result' }
    ],
    docs: [
      GG_APP, GG_REC,
      { id: 'hope', name: '진로적성(취업)희망서 [부록1]', track: '특별', who: '학생(자필·서명)', form: true, how: '원서 접수 기간(11/3~11/5 17:00)에 제출. ★직접/우편 학교 확인', note: '1차 35점. 희망 직업, 진로 설계, 지원 이유', check: true },
      { id: 'self', name: '자기소개서 [부록2]', track: '특별', who: '학생', form: true, how: '2차 면접일(11/10) 학교에서 작성', note: '30점. 미래 진로 각오, 고교 3년 계획', check: true },
      { id: 'bonus', name: '가산점 증빙(자격증 사본 원본대조필, 본교 대회 상장, 학과체험 확인서)', track: '특별·일반', who: '학생', how: '원서 기간에 본교 원서접수 담당자에게 제출 + 원서에 가산점 입력', note: '최대 10점' }
    ],
    notes: ['특별전형 면접이 11/10(화)로 다른 학교보다 하루 늦음'],
    ask: ['진로적성희망서 제출 방법(직접/우편)']
  },
  {
    id: 'bdar', name: '분당아람고', aliases: ['분당아람고등학교'], type: '특성화고', area: 'gg', region: '경기 성남 분당(경기·서울·인천 모집)',
    depts: ['베이커리경영과'],
    deptNote: '다른 학과는 요항 참고',
    home: 'https://bdar-h.goesn.kr',
    links: [{ label: '2027 입학전형요항(최종확정정원) + 양식', url: 'https://bdar-h.goesn.kr/snfn-h/na/ntt/selectNttInfo.do?mi=20714&bbsId=17167&nttSn=1948562' }],
    apply: '고교입학시스템 온라인. 자격증 사본은 원서 출력물과 함께 직접',
    tracks: [
      { name: '진로적성(취업희망자) 특별전형', choices: '2지망까지', method: '1차 서류(취업희망서 50·출결 10·봉사 5·교과 35) → 1.2배수 → 2차(자기소개서 40·면접 60)' },
      { name: '일반전형', choices: '3지망까지', method: '내신 200 + 자격증 가산점(개당 1점, 최대 10점)' }
    ],
    dates: [
      { date: '2026-11-03', end: '2026-11-05', label: '특별전형 원서 + 취업희망서 제출', kind: 'apply' },
      { date: '2026-11-05', time: '17:00', label: '1차 합격 발표(개별 통보)', kind: 'result1' },
      { date: '2026-11-09', time: '14:00', label: '2차 면접', kind: 'exam' },
      { date: '2026-11-11', time: '11:00', label: '특별전형 합격 발표', kind: 'result' },
      { date: '2026-11-12', end: '2026-11-13', label: '일반전형 원서 접수', kind: 'apply' },
      { date: '2026-11-23', time: '11:00', label: '일반전형 합격 발표', kind: 'result' },
      { date: '2026-12-21', label: '합격자 예비소집', kind: 'etc' }
    ],
    docs: [
      GG_APP,
      { id: 'hope', name: '취업희망서(+취업서약서)', track: '특별', who: '학생 자필, 서약서는 학생+보호자 서명', form: true, how: '학교 양식(hwp). 원서 접수 때 제출. ★방문/우편 확인', note: '1차 50점 — 가장 큰 배점', check: true },
      { id: 'trec', name: '담임교사 추천서', track: '특별', who: '담임', form: true, how: '취업희망서 양식 안에 있음(담임 서명, 휴대전화·학교전화 기재)', check: true },
      { id: 'self', name: '자기소개서', track: '특별', who: '학생', form: true, how: '2차 면접 당일 본교에서 자필 작성(체크리스트형)', note: '40점', check: true },
      { id: 'proof', name: '자기소개서 증빙자료', track: '특별', who: '학생', how: '미리 준비, 2차 당일 제출 — 담임교사 원본대조필 날인 필요', check: true },
      { id: 'cert', name: '자격증 사본', track: '특별·일반', who: '학생', how: '원서 출력물과 함께 직접 제출', note: '제과·제빵·조리기능사, GTQ, ITQ, 워드, 컴활 등' }
    ],
    notes: ['동점 시 면접 → 자기소개서 → 내신 → 취업희망서 순'],
    ask: ['취업희망서 제출 방법', '고교입학시스템 학교장 추천서 별도 필요 여부']
  },

  {
    id: 'anigo', name: '한국애니메이션고', aliases: ['한국애니고', '한국애니메이션고등학교', '애니고', '한국애니메이션고(하남)'], type: '특성화고', area: 'gg', region: '경기 하남(전국 모집)',
    depts: ['만화창작과', '애니메이션과', '영상연출과', '컴퓨터게임제작과'],
    home: 'https://anigo-h.goegh.kr',
    links: [
      { label: '2027 입학전형 요항(최종본)', url: 'https://anigo-h.goegh.kr/anigo-h/na/ntt/selectNttInfo.do?mi=5706&bbsId=3231&nttSn=1223401' },
      { label: '특별전형 제출 서류 양식(자기소개서·취업창업계획서)', url: 'https://anigo-h.goegh.kr/anigo-h/na/ntt/selectNttInfo.do?mi=5706&bbsId=3231&nttSn=1221367' },
      { label: '인터넷 원서 접수 안내', url: 'https://anigo-h.goegh.kr/anigo-h/na/ntt/selectNttInfo.do?mi=5706&bbsId=3231&nttSn=1231022' },
      { label: '학과별 실기전형 안내', url: 'https://anigo-h.goegh.kr/anigo-h/na/ntt/selectNttInfo.do?mi=5706&bbsId=3231&nttSn=1216654' }
    ],
    contact: '교무실 031-790-9031 · 입학 031-790-9045',
    apply: '고교입학시스템이 아님 — 유웨이어플라이(uwayapply.com) 인터넷 접수(전형료 40,000원) → 원서 출력 후 출신 중학교장 직인 → 서류를 본교 원서접수처(하남시 검단산로 223)에 인편·우편 제출(마감일 17:00 도착)',
    tracks: [
      { name: '진로적성(취업희망자) 특별전형', choices: '학과 1개(중복지원 금지)', method: '1단계 서류 100(교과 20·출결 20·봉사 10·취업창업계획서 20·자기소개서 30) → 2배수 → 2단계 실기 50 + 면접 50. 실기 50% 미만이면 불합격 가능. 정원: 만화창작·애니메이션 8명, 영상연출·컴퓨터게임제작 18명' },
      { name: '일반전형(경기도 출신 우선선발·일반선발)', choices: '학과 1개', method: '1단계 내신 100(만화·애니 6배수, 영상·게임 4배수) → 2단계 실기 100. 영상연출·게임 정원 우선 3 + 일반 3' }
    ],
    dates: [
      { date: '2026-11-03', end: '2026-11-05', time: '09:00~17:00', label: '특별전형 인터넷 접수 + 서류 제출', kind: 'apply' },
      { date: '2026-11-06', time: '14:00', label: '특별전형 1차(서류) 합격 발표', kind: 'result1' },
      { date: '2026-11-10', time: '실기 09:00 · 면접 15:00', label: '특별전형 실기고사(입실 08:10~08:20)·면접(입실 14:40~14:50)', kind: 'exam' },
      { date: '2026-11-11', time: '17:00', label: '특별전형 합격 발표', kind: 'result' },
      { date: '2026-11-12', end: '2026-11-13', time: '09:00~17:00', label: '일반전형 인터넷 접수 + 서류 제출', kind: 'apply' },
      { date: '2026-11-16', time: '14:00', label: '일반전형 1단계 발표', kind: 'result1' },
      { date: '2026-11-17', time: '09:00~13:00', label: '일반전형 실기고사(입실 08:10~08:20)', kind: 'exam' },
      { date: '2026-11-23', time: '17:00', label: '일반전형 합격 발표', kind: 'result' },
      { date: '2026-12-23', time: '13:00', label: '신입생 예비소집·오리엔테이션(본교 애니홀)', kind: 'etc' }
    ],
    docs: [
      { id: 'app', name: '입학원서·개인정보 활용 동의서(유웨이 출력물)', track: '공통', who: '학생, 중학교장 직인', how: '유웨이어플라이 접수 후 출력 → 출신 중학교장 직인 → 본교에 인편·우편 제출', check: true },
      { id: 'sb', name: '학교생활기록부Ⅱ 사본(학교장 직인·원본대조필)', track: '공통', who: '담임', how: '나이스 출결 10/31(토)까지 마감, 출결 특기사항에 "2026.10.31.까지 마감" 기록, 전체 반영 확인 후 출력', check: true },
      { id: 'plan', name: '취업·창업 계획서 3부', track: '특별', who: '학생', form: true, how: '학교 양식, 원서·서류와 함께 제출(11/3~11/5)', note: '1단계 20점. ① 지원 동기(500자) ② 개발·제작하고 싶은 콘텐츠 계획', check: true },
      { id: 'self', name: '자기소개서 3부', track: '특별', who: '학생', form: true, how: '학교 양식, 원서·서류와 함께 제출', note: '1단계 30점. ① 영향받은 콘텐츠(400자) ② 전공 관련 노력한 활동(400자) ③ 배려·나눔·협력 사례', check: true },
      { id: 'pledge', name: '서약서 1부', track: '특별', who: '학생', how: '★ 양식 게시물에 별도 파일 없음 — 학교 확인', check: true }
    ],
    notes: [
      '다른 경기 특성화고와 달리 고교입학시스템이 아닌 유웨이어플라이로 접수하고 전형료 40,000원',
      '실기 4시간 — 영상연출과: 영상 분석(A4 1쪽, 30점) + 새 이야기 구성(A4 4쪽, 70점)',
      '전기학교는 학교 종류·시기와 관계없이 1개교만 지원 가능. 예술고 등 다른 전기학교에 이미 지원했다면 지원 불가(마이스터고 불합격자만 예외)'
    ],
    ask: ['서약서 양식']
  },

  /* ───────────── 서울 특성화고 (경기 학생 = 타 시·도) ───────────── */
  {
    id: 'sangil', name: '상일미디어고', aliases: ['상일미디어고등학교'], type: '특성화고', area: 'seoul', region: '서울 강동(서울·경기 모집)',
    depts: ['인공지능소프트웨어과', '사물인터넷과', '디자인과', '디지털만화영상과', '바이오푸드과'],
    deptNote: '"디지털미디어디자인과"는 2027 요강에 없음 → 학생과 학과 재확인',
    home: 'https://sangilmedia.sen.hs.kr',
    links: [
      { label: '2027 입학전형 요강(입학안내 > 세부요강)', url: 'https://sangilmedia.sen.hs.kr/103755/subMenu.do' },
      { label: '2027 입학원서 서식(서식다운로드)', url: 'https://sangilmedia.sen.hs.kr/103757/subMenu.do' }
    ],
    apply: SEOUL_FLOW + '. 대리 접수는 가족(가족관계증명서·대리인 신분증, 봉투 밀봉·날인)',
    tracks: [
      { name: '미래인재 특별전형', choices: '5개 학과까지', method: '출결 30 + 봉사 10(시수 무관 만점) + 심층면접 60. 디지털만화영상과는 실기 40 + 면접 20' },
      { name: '상일인재 특별전형', choices: 'AI소프트웨어·사물인터넷·바이오푸드과만(바이오푸드 1지망)', method: '출결 30 + 봉사 10 + 면접 40 + 자기실적 20. 진로체험·자격증·포트폴리오·수상 중 1개 이상 증빙' },
      { name: '일반전형', choices: '5개 학과까지', method: '서울시교육청 방식 고입전형 총점순(디자인·디지털만화영상·바이오푸드는 일반 0명, 특별 미달 시 충원)' }
    ],
    dates: SEOUL_DATES.concat([{ date: '2026-12-03', end: '2026-12-04', label: '합격자 등록', kind: 'etc' }]),
    docs: [
      { ...SEOUL_APP, how: '학교 전용 양식(서식다운로드 게시판), 방문 제출' },
      { id: 'sb1', name: '학교생활기록부Ⅱ(수상경력·교과성적 제외)', track: '특별', who: '중학교', how: '원서와 함께. 간인·원본대조필 불필요', check: true },
      { id: 'sb2', name: '학교생활기록부Ⅱ(수상경력·교과성적 포함)', track: '일반', who: '중학교', how: '원서와 함께. 원본대조필 불필요' },
      { id: 'own', name: '자기실적 서류(자격증 사본·포트폴리오·상장 사본)', track: '상일인재', who: '학생', how: '원서와 함께' }
    ],
    notes: ['생기부 기준일 2026.11.13.(금)', '면접 10시(디자인과 1-5반 교실, 디지털만화영상과 만화영상체험실, 바이오푸드과 바리스타실)', '디지털만화영상과 실기: 사전 공개 5개 주제 중 1개, A4, 2시간'],
    ask: ['학과별 면접 날짜(11/25 또는 11/26)']
  },
  {
    id: 'daejin', name: '대진디자인고', aliases: ['대진디자인고등학교', '대진 디자인고'], type: '특성화고', area: 'seoul', region: '서울(서울·인천·경기 모집)',
    depts: ['인테리어디자인과', '시각디자인과'],
    deptNote: '다른 학과는 요강 참고',
    home: 'https://daejindesign.sen.hs.kr',
    links: [
      { label: '2027 입학전형 요강·원서 양식·작성 예시(입학관련서식)', url: 'https://daejindesign.sen.hs.kr/113088/subMenu.do' },
      { label: '공지사항(요강 PDF)', url: 'https://daejindesign.sen.hs.kr/75493/subMenu.do' }
    ],
    apply: SEOUL_FLOW + '. 대리 접수 시 서류봉투 밀봉 후 담임교사 날인',
    tracks: [
      { name: '미래인재 특별전형', choices: '3개 학과까지', method: '출결 30(미인정결석 0~3일 만점) + 봉사 10 + 심층면접 60' },
      { name: '디자인인재 특별전형', choices: '3개 학과까지', method: '같은 배점. 진로체험·설명회, 관련 수상, 동아리·봉사·전시, 관련 독서(생기부), 자격증, 포트폴리오, 본교 교사 추천 중 1개 이상' },
      { name: '일반전형', choices: '3개 학과까지', method: '서울 방식 고입전형 총점순' }
    ],
    dates: SEOUL_DATES.concat([{ date: '2026-12-04', label: '합격자 등록', kind: 'etc' }]),
    docs: [
      { ...SEOUL_APP, how: '서울 공통 양식(학교 게시, 작성 예시 3종), 방문 제출' },
      { id: 'sb1', name: '학교생활기록부Ⅱ(교과성적 제외)', track: '미래인재', who: '중학교', how: '원서와 함께. 원본대조필 필요', check: true },
      { id: 'sb2', name: '학교생활기록부Ⅱ(교과성적 포함)', track: '디자인인재·일반', who: '중학교', how: '원서와 함께. 원본대조필 필요', check: true }
    ],
    notes: ['인테리어디자인과는 실기 없음(시각디자인과만 실기)', '면접은 3층 강당 집합, 시간은 원서 접수 때 개별 안내', '면접 예상문항 PDF가 공지에 있음'],
    ask: []
  },
  {
    id: 'komyung', name: '고명외식고', aliases: ['고명외식고등학교'], type: '특성화고', area: 'seoul', region: '서울(서울·인천·경기 모집)',
    depts: ['디저트제과경영과'],
    deptNote: '학과명은 "디저트제과경영과"(설문의 디저트제과제빵과)',
    home: 'https://komyung.sen.hs.kr',
    links: [
      { label: '2027 모집요강', url: 'https://komyung.sen.hs.kr/124280/subMenu.do' },
      { label: '입학안내(원서 양식·면접 예상 질문·성적 산출 프로그램)', url: 'https://komyung.sen.hs.kr/124284/subMenu.do' }
    ],
    apply: SEOUL_FLOW + '. 대리 접수는 직계가족만(대리인 신분증·주민등록등본)',
    tracks: [
      { name: '미래인재 특별전형', choices: '4개 학과까지', method: '출결 30 + 봉사 10 + 심층면접 60(A 60 ~ H 18)' },
      { name: '일반전형', choices: '4개 학과까지', method: '서울 방식 고입전형 총점순' }
    ],
    dates: SEOUL_DATES.concat([{ date: '2026-12-03', end: '2026-12-04', label: '합격자 등록', kind: 'etc' }]),
    docs: [
      { ...SEOUL_APP, how: '서울 공통 양식(입학안내 게시판), 방문 제출' },
      { id: 'sb1', name: '학교생활기록부Ⅱ(교과성적 제외)', track: '특별', who: '중학교', how: '원서와 함께. 간인·원본대조필 필요', check: true },
      { id: 'sb2', name: '학교생활기록부Ⅱ(교과성적 포함)', track: '일반', who: '중학교', how: '원서와 함께. 간인·원본대조필 필요' }
    ],
    notes: ['원서 "중학교 성적"란: 서울시교육청 성적 산출 지침·프로그램 사용(서울교육청 공문 학교지원과-16519, 10/20)', '면접 시간·장소는 홈페이지 게시'],
    ask: []
  },
  {
    id: 'sdglobal', name: '성동글로벌경영고', aliases: ['성동글로벌경영고등학교'], type: '특성화고', area: 'seoul', region: '서울 성동(전국 모집)',
    depts: ['반려동물케어과'],
    deptNote: '다른 학과는 요강 참고',
    home: 'https://sdglobal.sen.hs.kr',
    links: [
      { label: '2027 신입생 입학전형 요강', url: 'https://sdglobal.sen.hs.kr/100365/subMenu.do' },
      { label: '서식다운로드(원서 양식·면접 예상 질문지)', url: 'https://sdglobal.sen.hs.kr/100374/subMenu.do' }
    ],
    apply: SEOUL_FLOW + '. 대리 접수 시 관계 증명 서류·대리인 신분증, 봉투 밀봉·날인',
    tracks: [
      { name: '미래인재 특별전형', choices: '4개 학과까지', method: '출결 30 + 봉사 10 + 심층면접 60(실기 없음). 반려동물케어과 40명 전원 특별전형' },
      { name: '일반전형', choices: '4개 학과까지', method: '서울 방식 고입전형 총점순(반려동물케어과 일반 0명)' }
    ],
    dates: SEOUL_DATES,
    docs: [
      { ...SEOUL_APP, how: '★ 2027 학교 양식 아직 미게시(10/29) — 서울 공통 양식일 가능성, 방문 제출' },
      { id: 'sb1', name: '학교생활기록부Ⅱ(교과성적 제외)', track: '특별', who: '중학교', how: '원서와 함께. 간인·원본대조필 필요', check: true },
      { id: 'sb2', name: '학교생활기록부Ⅱ(교과성적 포함)', track: '일반', who: '중학교', how: '원서와 함께. 간인·원본대조필 필요' }
    ],
    notes: ['면접 질문 = 예상 질문지 + 학과 특색 질문'],
    ask: ['2027 입학원서 양식 게시 여부']
  },
  {
    id: 'shinjeong', name: '서울신정고', aliases: ['신정고', '신정고등학교', '서울신정고등학교'], type: '특성화고', area: 'seoul', region: '서울(전국 모집, 기숙사 없음)',
    depts: ['웹크리에이터과', '생활체육과', '푸드조리과', '베이커리과'],
    home: 'https://shinjeong.sen.hs.kr',
    links: [{ label: '입학자료(2027 요강·원서 양식·작성 유의사항)', url: 'https://shinjeong.sen.hs.kr/198280/subMenu.do' }],
    apply: '학교 양식 원서를 손으로 작성 → 방문 또는 이메일(shinjung1965@gmail.com) 제출. 대리 접수는 봉투 밀봉 + 담임 날인',
    tracks: [
      { name: '미래인재 특별전형', choices: '4개 학과까지', method: '출결 30(미인정결석 1일당 −2) + 봉사 10 + 심층면접 60. 생활체육과는 면접 30 + 실기 30(제자리멀리뛰기 15, 20m 왕복달리기 15)' },
      { name: '일반전형', choices: '4개 학과까지', method: '서울 방식 고입전형 총점순' }
    ],
    dates: SEOUL_DATES.map(d => d.kind === 'exam' ? { ...d, end: undefined, label: '특별전형 면접(생활체육과 실기 포함)' } : d)
      .concat([{ date: '2026-12-04', label: '합격자 등록', kind: 'etc' }]),
    docs: [
      { ...SEOUL_APP, how: '학교 양식, 방문 또는 이메일 제출' },
      { id: 'sb1', name: '학교생활기록부Ⅱ(수상경력·교과성적 제외)', track: '특별', who: '중학교', how: '원서와 함께(기준일 11/13). 간인·원본대조필 불필요', check: true },
      { id: 'sb2', name: '학교생활기록부Ⅱ(수상경력·교과성적 포함)', track: '일반', who: '중학교', how: '원서와 함께' }
    ],
    notes: ['총점 60% 미만이면 불합격 가능, 면접 결시는 불합격', '생활체육과 실기 → 운동복·운동화'],
    ask: ['면접 시간·장소(개별 공지)']
  },

  /* ───────────── 타 지역 특성화고 ───────────── */
  {
    id: 'korhorse', name: '한국말산업고', aliases: ['한국말산업고등학교'], type: '특성화고', area: 'other', region: '전남 장흥(전국 모집)',
    depts: ['말산업육성과'],
    deptNote: '한국경마축산고(전북 남원)와 다른 학교',
    home: 'http://korhorse.hs.jne.kr',
    links: [{ label: '2027 신입생 입학 전형 요강(서식 1~7 포함)', url: 'https://korhorse.hs.jne.kr/daedeok_hs/na/ntt/selectNttInfo.do?mi=54049&bbsId=54049&nttSn=1801180493' }],
    apply: '방문 또는 등기우편 — 11/26 17:00까지 도착분만 유효',
    tracks: [
      { name: '일반전형 (특별전형 없음)', choices: '말산업육성과 1개 학과', method: '내신 석차백분율 순(타 시·도는 그 시·도 방식 석차백분율 인정)' }
    ],
    dates: [
      { date: '2026-11-23', end: '2026-11-26', time: '~17:00', label: '원서 접수(방문·등기)', kind: 'apply' },
      { date: '2026-11-30', time: '10:00', label: '신입생 전형', kind: 'exam' },
      { date: '2026-12-04', time: '14:00', label: '합격 발표', kind: 'result' }
    ],
    docs: [
      { id: 'app', name: '입학원서(서식1, 사진 3.5×4.5)', track: '공통', who: '학생·보호자 날인, 담임 날인, 중학교장 직인', how: '석차백분율 부분 투명테이프 처리', check: true },
      { id: 'rank', name: '내신 석차 연명부 + 학교생활기록부 사본(서식2)', track: '공통', who: '중학교', how: '각 쪽 직인·간인', check: true },
      { id: 'agree', name: '개인정보 활용 동의서(서식3)', track: '공통', who: '학생', check: true },
      { id: 'cover', name: '서류제출용 표지(서식5)', track: '공통', who: '학생', how: '봉투에 부착', check: true },
      { id: 'parent', name: '학부모 확인서(서식4)', track: '★대상 확인', who: '학생·보호자', how: '본문엔 "모든 지원자", 양식은 사회통합전형용' }
    ],
    notes: ['면접은 정원 미달 시 실시하지 않을 수 있음(★ 학교 확인)', '기숙사 여부 요강에 없음'],
    ask: ['면접 실시 여부', '학부모 확인서 제출 대상']
  },

  /* ───────────── 마이스터고 (전형 대부분 진행됨) ───────────── */
  {
    id: 'suwonhitech', name: '수원하이텍고', aliases: ['수원하이텍고등학교'], type: '마이스터고', area: 'gg', region: '경기 수원',
    depts: [], links: [],
    apply: '원서 접수 완료(전형 진행 중)',
    tracks: [{ name: '마이스터고 전형', choices: '', method: '1차 내신 1.5배수 → 2차 면접 답변 서면 작성·적성시험·심층면접(적성 100 + 면접 200)' }],
    dates: [
      { date: '2026-10-27', time: '08:30 입실', label: '2차 전형(서면·적성·심층면접)', kind: 'exam' },
      { date: '2026-11-02', time: '17:00', label: '최종 합격 발표(홈페이지)', kind: 'result' },
      { date: '2026-11-19', time: '13:00', label: '합격자 소집', kind: 'etc' }
    ],
    docs: [],
    notes: ['불합격 시 경기 특성화고 특별전형(11/3~11/5)에 지원 가능 → 미리 학교 정해 두기'],
    ask: []
  },
  {
    id: 'ggame', name: '경기게임마이스터고', aliases: ['경기게임마이스터고등학교'], type: '마이스터고', area: 'gg', region: '경기 안양',
    depts: [], links: [],
    apply: '원서 접수 완료(전형 진행 중)',
    tracks: [{ name: '마이스터고 전형', choices: '', method: '적성시험(PSG) + 심층면접' }],
    dates: [
      { date: '2026-10-30', time: '08:10 입실', label: '2차 전형(적성시험·심층면접)', kind: 'exam' },
      { date: '2026-11-02', time: '17:00', label: '최종 합격 발표', kind: 'result' }
    ],
    docs: [],
    notes: ['PSG 튜토리얼 PC로 미리 해 보기(화면에서 5초 이상 벗어나면 종료)', '불합격 시 특성화고 특별전형(11/3~11/5) 지원 가능'],
    ask: []
  },
  {
    id: 'sudo', name: '수도전기공업고', aliases: ['수도전기공업고등학교', '수도공고'], type: '마이스터고', area: 'seoul', region: '서울',
    depts: [], links: [],
    apply: '원서 접수 완료(원서 사이트 sudo.myapply.kr)',
    tracks: [{ name: '마이스터고 전형', choices: '', method: '적성·소양검사 + 심층면접(블라인드)' }],
    dates: [
      { date: '2026-10-29', label: '적성·소양검사 + 심층면접', kind: 'exam' },
      { date: '2026-11-04', time: '11:00', label: '합격 발표(원서 사이트)', kind: 'result' },
      { date: '2026-11-04', end: '2026-11-10', time: '~17:00', label: '합격자 신고(필수)', kind: 'etc' }
    ],
    docs: [], notes: ['합격자 신고(11/4~11/10 17:00) 안 하면 합격 무효 가능'], ask: []
  },
  {
    id: 'robot', name: '서울로봇고', aliases: ['서울로봇고등학교'], type: '마이스터고', area: 'seoul', region: '서울 강남',
    depts: [], links: [],
    apply: '원서 접수 완료',
    tracks: [{ name: '마이스터고 전형', choices: '', method: '학습역량검사(국·영·수) + 면접 4문항' }],
    dates: [
      { date: '2026-10-29', time: '14:00', label: '2차 전형(학습역량검사·면접)', kind: 'exam' },
      { date: '2026-11-04', time: '14:00', label: '합격 발표', kind: 'result' },
      { date: '2026-11-04', end: '2026-11-10', label: '합격자 신고(필수)', kind: 'etc' }
    ],
    docs: [], notes: [], ask: []
  },

  /* ───────────── 예술고 ───────────── */
  {
    id: 'hallym', name: '한림연예예술고', aliases: ['한림연예예술고등학교', '한림예술고'], type: '예술고', area: 'seoul', region: '서울',
    depts: ['실용무용과', '영상제작과'], links: [],
    apply: '원서 접수 완료',
    tracks: [{ name: '예술고 전형', choices: '', method: '실기고사' }],
    dates: [
      { date: '2026-10-28', end: '2026-10-29', label: '실기고사(실용무용 10/28 13:00, 영상제작 10/29 개인별)', kind: 'exam' },
      { date: '2026-11-04', time: '15:00', label: '합격 발표', kind: 'result' },
      { date: '2026-11-05', end: '2026-11-12', label: '합격 시 등록 확인(홈페이지)', kind: 'etc' }
    ],
    docs: [], notes: ['예술고 불합격자는 특성화고 지원 불가 → 전기 추가모집(11/26~27) 또는 후기(12/4~10)', '불합격자 충원 11/13~12/1 개별 연락'], ask: []
  },
  {
    id: 'anyang', name: '안양예술고', aliases: ['안양예술고등학교', '안양예고'], type: '예술고', area: 'gg', region: '경기 안양',
    depts: ['연극영화과'], links: [],
    apply: '원서 접수 완료',
    tracks: [{ name: '예술고 전형', choices: '', method: '실기(자유연기 + 특기)' }],
    dates: [
      { date: '2026-10-28', label: '실기고사(개인별 시간)', kind: 'exam' },
      { date: '2026-11-28', time: '10:00', label: '합격 시 예비소집·오리엔테이션', kind: 'etc' }
    ],
    docs: [], notes: ['★ 합격 발표일 학교 홈페이지에서 확인(요강상 10/27이었으나 실기가 10/28로 바뀜)', '예술고 불합격자는 특성화고 지원 불가'], ask: ['합격 발표일']
  },
  {
    id: 'gugak', name: '국립전통예술고', aliases: ['국립전통예술고등학교'], type: '예술고', area: 'seoul', region: '서울',
    depts: [], links: [],
    apply: '원서 접수 완료',
    tracks: [{ name: '예술고 전형', choices: '', method: '실기' }],
    dates: [
      { date: '2026-10-27', time: '16:00', label: '합격 발표', kind: 'result' },
      { date: '2026-11-02', end: '2026-11-03', label: '합격 시 등록', kind: 'etc' }
    ],
    docs: [], notes: [], ask: []
  }
];

/* 후기 일반고(공통 안내) */
IB.LATE = {
  name: '후기 일반고',
  apply: '12/4(금)~12/10(목) 원서 접수, 1개교만 지원. 합격 발표 12/14',
  notes: ['전기학교 합격자(미등록 포함)는 후기 지원 불가', '전기 불합격자는 후기 지원 가능']
};

/* 학생이 적어 낸 이름이 전기 칸에 있어도 사실상 후기(일반고)인 학교들 — 경고 표시용 */
IB.KNOWN_LATE = ['초월고', '광주고', '광남고', '경화여고', '곤지암고', '신장고', '남한고', '덕소고', '양평고', '양서고', '미사고', '미사강변고', '효양고', '태전고', '오남고', '매탄고'];
