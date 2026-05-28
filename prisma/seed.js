const { PrismaClient } = require('/app/src/generated/prisma');
const { PrismaMariaDb } = require('/app/node_modules/@prisma/adapter-mariadb');

const url = (process.env.DATABASE_URL || '').replace('mysql://', 'mariadb://');
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

const SEED_POSTS = [
  { id: '1', category: 'info', subCategory: null, tag: null, title: '피아노 조율', content: `Mike Bratcher 317-371-5747\n웨라에 사는 분은 아니어서 이 분이 웨라에 오실 때 맞춰서 시간 잡고 있어요. 언제 오시는 지 먼저 물어보세요~\n저는 몇 년 동안 이 분께 조율 맡기고 있어서 요즘은 연락 먼저 주실 때까지 기다려요.\n조율비: 그랜드 피아노 $155/1회 입니다. 업라이트 피아노는 이보다 저렴한 걸로 알아요.\n조율시간: 보통 1시간\n1년 이상 조율 안한 피아노는 한 번 방문시 두 번 이상 조율하기 때문에 기본 조율 비용보다 많이 나와요.`, viewCount: 0, createdAt: '2026-04-22T00:15:00Z', updatedAt: '2026-04-22T00:15:00Z' },
  { id: '2', category: 'info', subCategory: null, tag: null, title: 'Pest Control', content: `웨스트라피엣 한인커뮤니티 단톡방 질문과 답변 공유합니다.\n스윗 라이언: 안녕하세요! 조금 전에 pest control 업체에서 홍보하려고 저희 집을 방문을 했는데요~ 저희도 하우스에서 살아보는건 처음이라.. 업체의 도움을 받아야 할지 감이 안오네요.. 보통 직접 약을 뿌리시나요? 다들 pest control 어떻게 하시는지 궁금합니다!\nShy Neo: 어떤 pest냐에따라 다릅니다.. 개미는 약뿌려서 퇴치가 되는 경우도 있고요.. 쥐는 다니는 통로가 있어서 덫이나 약으로는 한계가 있습니다..\n스윗 라이언님이 공유해주신 MAVEN pest control 사진.`, viewCount: 0, createdAt: '2026-04-22T00:04:00Z', updatedAt: '2026-04-22T00:04:00Z' },
  { id: '3', category: 'info', subCategory: null, tag: null, title: '치과 추천해주세요', content: '정기점검으로 일반 성인 치과 추천 부탁해요', viewCount: 0, createdAt: '2026-04-13T20:45:00Z', updatedAt: '2026-04-13T20:45:00Z' },
  { id: '4', category: 'info', subCategory: null, tag: null, title: '✨ 퍼듀 평일 한국학교 The Bridge', content: `✨ 퍼듀 평일 한국학교 The Bridge\n2026 봄학기 학생 & 학부모 모집합니다!\n퍼듀 평일 한국학교 The Bridge는 토요 한국학교와는 별도로,\n평일에 학생과 가정이 함께 배우며 성장할 수 있도록 마련된 주중 프로그램입니다.`, viewCount: 0, createdAt: '2026-01-15T13:58:00Z', updatedAt: '2026-01-15T13:58:00Z' },
  { id: '5', category: 'info', subCategory: null, tag: null, title: '✏️ 2026 봄학기 한국학교 개강 안내 🎉', content: `2026 봄 학기 한국학교가 개강합니다!\n등록을 원하시는 분들은 아래 링크를 통해 신청해주세요!\n🗓 일정: 2026.2.7 - 2026.4.25\n⏰ 시간: 매주 토요일 9:30AM - 12:30PM\n👧 대상: 3세 - 성인\n📍 장소: 퍼듀한인장로교회`, viewCount: 0, createdAt: '2026-01-15T13:54:00Z', updatedAt: '2026-01-15T13:54:00Z' },
  { id: '6', category: 'info', subCategory: null, tag: null, title: '2025년 Thanksgiving Market  날짜&시간', content: `Holiday downtown Farmers Market\nDates: November 22, 2025\nTimes: 11 AM - 2 PM\nAddress:\n100 N. 5th Street\nLafayette, IN 47901`, viewCount: 0, createdAt: '2025-11-15T23:03:00Z', updatedAt: '2025-11-15T23:03:00Z' },
  { id: '7', category: 'info', subCategory: null, tag: null, title: 'Christkindlmarkt, Carmel, IN', content: `해마다 추수감사절 무렵부터 시작해서 크리스마스 이브까지만 열리는 독일 전통 시장 소개합니다.\n다양한 볼거리, 먹을거리, shop들, 아이스링크 등이 있어서 성별/나이 상관없이 모두 즐길 수 있는 곳이에요.`, viewCount: 0, createdAt: '2025-10-28T19:47:00Z', updatedAt: '2025-10-28T19:47:00Z' },
  { id: '8', category: 'info', subCategory: null, tag: null, title: '집 보험 커버 지붕 수리 (6월 우박 관련)', content: `지난 6월에 저희 동네를 강타한 우박 (hail)때문에 혹시 지붕이 파손되었는지 roofing contractors에 연락해서 한번 체크해보세요~\n지붕교체에 해당되면 집 보험으로 100% 커버된다고 합니다.`, viewCount: 0, createdAt: '2025-10-21T22:49:00Z', updatedAt: '2025-10-21T22:49:00Z' },
  { id: '9', category: 'info', subCategory: null, tag: null, title: '[식당] Strings Ramen', content: `https://maps.app.goo.gl/8MLhkNLaA9rNVC576\n캠퍼스 근처에 위치한 일식라멘 집이라 사람들이 많은듯.\n비쌈. 뭐 외식이 다 그렇긴 한데 그래도 비쌈`, viewCount: 0, createdAt: '2025-10-18T21:58:00Z', updatedAt: '2025-10-18T21:58:00Z' },
  { id: '10', category: 'info', subCategory: null, tag: null, title: '[식당] Green Leaf Vietnamese', content: `https://maps.app.goo.gl/NG6mbtsfE4m59fcM6\n쌀국수 먹어봤는데 양이 좀 적은 편이고. 그냥 어디 쌀국수 액기스 사와서 뜨거운 물에 풀어준 것 같음.`, viewCount: 0, createdAt: '2025-10-18T21:54:00Z', updatedAt: '2025-10-18T21:54:00Z' },
  { id: '11', category: 'jobs', subCategory: null, tag: null, title: '모집공고 (HR & 전산)', content: `회사 위치 : 하트퍼드 & 헌팅턴\n생산 제품 : ESS 관련\n모집 분야 : (1)HR 매니저 또는 담당자 (2) 전산(신입,경력)`, viewCount: 0, createdAt: '2025-10-21T19:22:00Z', updatedAt: '2025-10-21T19:22:00Z' },
  { id: '12', category: 'jobs', subCategory: null, tag: null, title: 'Admin Officer, 현장 엔지니어 모집(배터리 공장)', content: `-채용 공고-\n회사: 배터리 공장 환경 플랜트 업체 HKENE USA INC\n근무 지역: 미국 인디애나 코코모`, viewCount: 0, createdAt: '2025-10-16T18:05:00Z', updatedAt: '2025-10-16T18:05:00Z' },
  { id: '13', category: 'jobs', subCategory: null, tag: null, title: '채용공고(지역: 코코모)', content: `<채용 공고>\n회사: 삼성 협력업체\n근무지역: 인디애나 코코모 (Kokomo, IN)`, viewCount: 0, createdAt: '2025-10-15T18:40:00Z', updatedAt: '2025-10-15T18:40:00Z' },
  { id: '14', category: 'tutoring', subCategory: 'offer-tutor', tag: null, title: '과외교사 홍보 양식', content: `과외 교사 홍보 글 작성 안내\n아래 양식을 복사하여 작성해 주세요.`, viewCount: 0, createdAt: '2026-02-08T03:51:00Z', updatedAt: '2026-02-08T03:51:00Z' },
  { id: '15', category: 'tutoring', subCategory: 'offer-tutor', tag: null, title: '영어 원어민 과외 선생님', content: `안녕하세요,\n영어 과외 선생님을 구하시는 분들께 좋은 선생님 한 분 소개합니다.`, viewCount: 0, createdAt: '2026-04-04T17:02:00Z', updatedAt: '2026-04-04T17:02:00Z' },
  { id: '16', category: 'tutoring', subCategory: 'offer-tutor', tag: null, title: '메쓰존 튜터 (그룹&개인)', content: `1. 기본 정보\n이름: John Lee\n거주 지역: West Lafayette`, viewCount: 0, createdAt: '2026-03-31T14:57:00Z', updatedAt: '2026-03-31T14:57:00Z' },
  { id: '17', category: 'tutoring', subCategory: 'offer-tutor', tag: null, title: '수학 과외 안내', content: `1. 기본 정보\n이름: Thomas Kim\n거주 지역: 웨스트라파엣`, viewCount: 0, createdAt: '2026-03-28T22:08:00Z', updatedAt: '2026-03-28T22:08:00Z' },
  { id: '18', category: 'housing', subCategory: 'rent', tag: null, title: '샌츄리 아파트 선착순 프로모션', content: '센츄리 아파트 2b2b 또는 Studio 1년 계약시 선착순으로 $1,250 gift card 증정 합니다. (소진시 종료되고 6/15일 까지 입주)', viewCount: 0, createdAt: '2026-04-23T06:55:00Z', updatedAt: '2026-04-23T06:55:00Z' },
  { id: '19', category: 'housing', subCategory: null, tag: null, title: '웨스트라피엣 부동산 문의', content: '', viewCount: 0, createdAt: '2026-04-06T15:28:00Z', updatedAt: '2026-04-06T15:28:00Z' },
  { id: '20', category: 'housing', subCategory: 'rent', tag: null, title: 'Sk 근처 웨스트라피엣 하우스 쉐어 렌트', content: `자세한 사항 /사진/ 쇼잉 문의는 전화/문자/ email\n702-238-3226\nEmoon@truebloodre.com`, viewCount: 0, createdAt: '2026-03-30T08:57:00Z', updatedAt: '2026-03-30T08:57:00Z' },
  { id: '21', category: 'faq', subCategory: null, tag: null, title: '[필독] 웨스트라피엣 한인 커뮤니티 웹사이트는 어떤 곳인가요?', content: `West Lafayette Korea\n는 웨스트라피엣에 거주하는 모든 한인들을 위한 커뮤니티 플랫폼입니다.`, viewCount: 0, createdAt: '2025-09-21T15:26:00Z', updatedAt: '2025-09-21T15:26:00Z' },
  { id: '22', category: 'faq', subCategory: null, tag: null, title: 'Farmers Market (파머스 마켓)', content: `#파머스 마켓이 열리는 기간은\n5월 - 10월\n입니다.`, viewCount: 0, createdAt: '2025-11-15T22:50:00Z', updatedAt: '2025-11-15T22:50:00Z' },
  { id: '23', category: 'faq', subCategory: null, tag: null, title: '공립도서관(Public library) 이용 방법', content: `West Lafayette에는\nWest Lafayette Public Library\n와\nKlondike Library\n가 있으며, 두 도서관을 운영하는 상위 기관이 서로 달라 도서관에서 책을 대출하기 위해서는 각각의 도서관 카드(library card)를 만드셔야 합니다.`, viewCount: 0, createdAt: '2025-10-22T22:31:00Z', updatedAt: '2025-10-22T22:31:00Z' },
  { id: '24', category: 'faq', subCategory: null, tag: null, title: '한국 식재료/식품을 구입할 수 있는 곳', content: `하나 마켓\n3457 Bethel Dr A, West Lafayette, IN 47906\nCUBE market (편의점)\n150 S Chauncey Ave Suite 140, West Lafayette, IN 47906`, viewCount: 0, createdAt: '2025-10-22T21:56:00Z', updatedAt: '2025-10-22T21:56:00Z' },
  { id: '25', category: 'faq', subCategory: null, tag: null, title: '교회 & 성당 정보', content: `퍼듀한인장로교회\nhttps://www.purduekoreanchurch.org/\n주소:\n4505 IN-26, West Lafayette, IN 47906`, viewCount: 0, createdAt: '2025-10-21T23:04:00Z', updatedAt: '2025-10-21T23:04:00Z' },
  { id: '26', category: 'faq', subCategory: null, tag: null, title: '학군/학교 정보 알려주세요.', content: `West Lafayette에는 West Lafayette Community School Corporation (WLCSC)과 Tippecanoe School Corporation (TSC), 이렇게\n2개의 학군\n이 있습니다.`, viewCount: 0, createdAt: '2025-09-26T00:22:00Z', updatedAt: '2025-09-26T00:22:00Z' },
  { id: '27', category: 'faq', subCategory: null, tag: null, title: '데이케어 정보 알려주세요.', content: `데이케어 이용 대상: 생후 6주 - 만 5세 (Kindergarten 입학 전)`, viewCount: 0, createdAt: '2025-09-26T00:13:00Z', updatedAt: '2025-09-26T00:13:00Z' },
];

const SEED_COMMENTS = [
  { id: 'c3_1', postId: '3', content: `웨라단톡방에서 어떤 분이 Salisbury Dental (https://maps.app.goo.gl/QY6qfzzReD1MTW5i7) 추천해주셨어요.`, createdAt: '2026-04-13T20:51:00Z' },
  { id: 'c3_2', postId: '3', content: '감사합니다!', createdAt: '2026-04-13T22:01:00Z' },
  { id: 'c9_1', postId: '9', content: `3번 코멘트 재밌네요 ㅋㅋㅋㅋ 캠퍼스 근처에선 거의 유일한 일식라멘집이죠. 저는 개인적으로 여기보다 Genki ramen 추천해요~`, createdAt: '2025-10-19T22:06:00Z' },
  { id: 'c10_1', postId: '10', content: '여기 너무 맛 없어요 진짜...', createdAt: '2025-10-19T22:08:00Z' },
  { id: 'c11_1', postId: '11', content: '연락드릴 수 있는 카톡 정보도 알려주시면 감사하겠습니다.', createdAt: '2025-10-21T22:22:00Z' },
];

async function main() {
  console.log('Seeding legacy user...');
  await prisma.user.upsert({
    where: { id: 'legacy' },
    update: {},
    create: {
      id: 'legacy',
      email: 'legacy@wlk.internal',
      password: '',
      displayName: '운영자',
      firstName: '운영',
      lastName: '자',
    },
  });

  console.log('Seeding posts...');
  for (const post of SEED_POSTS) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        category: post.category,
        subCategory: post.subCategory,
        tag: post.tag,
        title: post.title,
        content: post.content,
        authorId: 'legacy',
        viewCount: post.viewCount,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      },
    });
  }

  console.log('Seeding comments...');
  for (const c of SEED_COMMENTS) {
    await prisma.comment.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        postId: c.postId,
        authorId: 'legacy',
        content: c.content,
        createdAt: new Date(c.createdAt),
      },
    });
  }

  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
