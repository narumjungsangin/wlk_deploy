-- Migration SQL for legacy data (Fixed)
-- Generated on: 2026-05-31 13:48:36


-- Create admin user for legacy posts
INSERT IGNORE INTO User (id, email, password, displayName, firstName, lastName, role, emailVerified, createdAt) 
VALUES (
    'admin_legacy_user',
    'admin@wlafayettekorea.org',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- admin123
    '운영자',
    '시스템',
    '관리자',
    'ADMIN',
    1,
    NOW()
);


-- 정보나눔터 posts

INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_63',
    '정보나눔터',
    '자유게시판',
    '피아노 조율',
    'Mike Bratcher 317-371-5747
웨라에 사는 분은 아니어서 이 분이 웨라에 오실 때 맞춰서 시간 잡고 있어요. 언제 오시는 지 먼저 물어보세요~
저는 몇 년 동안 이 분께 조율 맡기고 있어서 요즘은 연락 먼저 주실 때까지 기다려요.
조율비: 그랜드 피아노 $155/1회 입니다. 업라이트 피아노는 이보다 저렴한 걸로 알아요.
조율시간: 보통 1시간
1년 이상 조율 안한 피아노는 한 번 방문시 두 번 이상 조율하기 때문에 기본 조율 비용보다 많이 나와요.',
    'admin_legacy_user',
    0,
    '2026-04-22 00:15:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_62',
    '정보나눔터',
    '자유게시판',
    'Pest Control',
    '웨스트라피엣 한인커뮤니티 단톡방 질문과 답변 공유합니다.
스윗 라이언: 안녕하세요! 조금 전에 pest control 업체에서 홍보하려고 저희 집을 방문을 했는데요~ 저희도 하우스에서 살아보는건 처음이라.. 업체의 도움을 받아야 할지 감이 안오네요.. 보통 직접 약을 뿌리시나요? 다들 pest control 어떻게 하시는지 궁금합니다!
Shy Neo: 어떤 pest냐에따라 다릅니다.. 개미는 약뿌려서 퇴치가 되는 경우도 있고요.. 쥐는 다니는 통로가 있어서 덫이나 약으로는 한계가 있습니다..
스윗 라이언님이 공유해주신 MAVEN pest control 사진.',
    'admin_legacy_user',
    0,
    '2026-04-22 00:04:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_61',
    '정보나눔터',
    '자유게시판',
    '치과 추천해주세요',
    '정기점검으로 일반 성인 치과 추천 부탁해요',
    'admin_legacy_user',
    0,
    '2026-04-13 20:45:00',
    NOW()
);


INSERT INTO Comment (id, content, postId, authorId, createdAt) 
VALUES (
    'legacy_info_61_comment_0',
    '웨라단톡방에서 어떤 분이 Salisbury Dental (https://maps.app.goo.gl/QY6qfzzReD1MTW5i7) 추천해주셨어요.
저는 개인적으로 Dr. York (https://maps.app.goo.gl/dKDKjx6qbrUbnWrLA) 추천합니다.
그리고 인디폴에 공 선생님께 진료 받는 분들도 많으세요. (
https://west38thdental.com/staff/sung-kong-dds/)"
target="_blank">
https://west38thdental.com/staff/sung-kong-dds/)',
    'legacy_info_61',
    'admin_legacy_user',
    '2026-04-13 20:51:00'
);


INSERT INTO Comment (id, content, postId, authorId, createdAt) 
VALUES (
    'legacy_info_61_comment_1',
    '감사합니다!',
    'legacy_info_61',
    'admin_legacy_user',
    '2026-04-13 22:01:00'
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_54',
    '정보나눔터',
    '자유게시판',
    '✨ 퍼듀 평일 한국학교 The Bridge',
    '✨ 퍼듀 평일 한국학교 The Bridge
2026 봄학기 학생 & 학부모 모집합니다!
퍼듀 평일 한국학교 The Bridge는 토요 한국학교와는 별도로,
평일에 학생과 가정이 함께 배우며 성장할 수 있도록 마련된 주중 프로그램입니다.
아이들에게는 영어 읽기·쓰기 + 신앙적 이해 + 건강한 운동 활동,
학부모에게는 말씀·생활 영어·커뮤니티,
가정에는 함께 성장하는 배움의 연결을 제공합니다.
📚 학생(4–7학년): 방과 후 화·목
· Bible Study, Reading & Writing, Sports Activity
💵 $60 / 4주 (교재비 별도)
🗓 화/목 16:00-17:50
👩‍👧 성인 프로그램(학부모 및 성인여성)
· 바이블 스터디, 미국 생활 영어, 학부모 커뮤니티
💵 $50 / 4주
🗓 화/목 오전 9:30-11:30
📍 2026년 2월 3일 시작합니다.
📝 등록링크
https://forms.gle/SfoVAUCGRSwBipr37',
    'admin_legacy_user',
    0,
    '2026-01-15 13:58:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_53',
    '정보나눔터',
    '자유게시판',
    '✏️ 2026 봄학기 한국학교 개강 안내 🎉',
    '2026 봄 학기 한국학교가 개강합니다!
믿음 안에서 한국어와 문화를 배우는 한국학교에 여러분을 초대합니다😊
등록을 원하시는 분들은 아래 링크를 통해 신청해주세요!
🗓 일정: 2026.2.7 - 2026.4.25
⏰ 시간: 매주 토요일 9:30AM - 12:30PM
👧 대상: 3세 - 성인
📍 장소: 퍼듀한인장로교회
https://docs.google.com/forms/d/e/1FAIpQLSffpPQBlCS-nDFQUIs5LoqyTHMx9loAKYXVhqstVMLLm4i60Q/viewform',
    'admin_legacy_user',
    0,
    '2026-01-15 13:54:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_52',
    '정보나눔터',
    '자유게시판',
    '2025년 Thanksgiving Market  날짜&시간',
    'Holiday downtown Farmers Market
Dates: November 22, 2025
Times: 11 AM - 2 PM
Address:
100 N. 5th Street
Lafayette, IN 47901
Location: 5th Street between Columbia & mid-block of Ferry, and Main Street between 4th and 6th street
West Lafayette Thanksgiving Market
Dates: November 26, 2025
Times: 2 - 6 PM
Address:
1101 Kalberer Road, West Lafayette, IN 47906
Location: Wellness Center',
    'admin_legacy_user',
    0,
    '2025-11-15 23:03:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_50',
    '정보나눔터',
    '자유게시판',
    'Christkindlmarkt, Carmel, IN',
    '해마다 추수감사절 무렵부터 시작해서 크리스마스 이브까지만 열리는 독일 전통 시장 소개합니다.
다양한 볼거리, 먹을거리, shop들, 아이스링크 등이 있어서 성별/나이 상관없이 모두 즐길 수 있는 곳이에요.
장소는 Carmel, IN 이고, 구글맵에서 검색하면 바로 나옵니다.
웹사이트:
https://www.carmelchristkindlmarkt.com/
2025년 일정:
11월 22일(토) - 12월 24일
월, 화 Closed
수, 목 4 - 9 PM
금, 토 12 - 9 PM
일 12 - 8 PM',
    'admin_legacy_user',
    0,
    '2025-10-28 19:47:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_45',
    '정보나눔터',
    '자유게시판',
    '집 보험 커버 지붕 수리 (6월 우박 관련)',
    '지난 6월에 저희 동네를 강타한 우박 (hail)때문에 혹시 지붕이 파손되었는지 roofing contractors에 연락해서 한번 체크해보세요~
지붕교체에 해당되면 집 보험으로 100% 커버된다고 합니다.
혹시 우박이 떨어졌던 시기에 여행중이셨던 분들을 위해 구글에서 퍼온 글 공유합니다.
출처:
https://shorturl.at/6Lfop
West Lafayette experienced hail during a severe thunderstorm on June 18, 2025. Reports also noted damage from high winds and two brief tornadoes west and northwest of the Lafayette area.
Details of the June 18 storm:
Hail:
Quarter-sized hail was reported in the West Lafayette area. Interactive Hail Maps recorded quarter-sized hail near West County Road 525 South and County Road 550 South.
Wind and Tornadoes:
The National Weather Service (NWS) confirmed that two EF0 tornadoes, with winds up to 80 mph, touched down west and northwest of Lafayette. Much of the severe weather damage, which included downed trees and power lines, was caused by widespread straight-line winds.
Widespread Impact:
The line of strong storms affected a broad area of central Indiana, causing extensive power outages and damaging trees.
#하우징#housing#집수리#지붕#insurance#보험#집보험',
    'admin_legacy_user',
    0,
    '2025-10-21 22:49:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_43',
    '정보나눔터',
    '자유게시판',
    '[식당] Strings Ramen',
    'https://maps.app.goo.gl/8MLhkNLaA9rNVC576
캠퍼스 근처에 위치한 일식라멘 집이라 사람들이 많은듯.
비쌈. 뭐 외식이 다 그렇긴 한데 그래도 비쌈
맛 그냥... 그럼. 라멘집인데 면이 왜 미지근하게 나와 한 적이 있었음. 면 삶아 놓고 말리다가 뜨거운 국물 퍼준듯. 그냥 20대 애들 입맛 음식인듯.
현재 퍼듀 총장님이 혼자 와서 먹는거 본 적 있음. 두 가지 생각을 했음. 1) 얼마나 캠퍼스에 먹을게 없으면 여기까지 오셨을까. 2) 아는척해서 말 한 번 걸어볼껄...',
    'admin_legacy_user',
    0,
    '2025-10-18 21:58:00',
    NOW()
);


INSERT INTO Comment (id, content, postId, authorId, createdAt) 
VALUES (
    'legacy_info_43_comment_0',
    '3번 코멘트 재밌네요 ㅋㅋㅋㅋ 캠퍼스 근처에선 거의 유일한 일식라멘집이죠. 저는 개인적으로 여기보다 Genki ramen 추천해요~',
    'legacy_info_43',
    'admin_legacy_user',
    '2025-10-19 22:06:00'
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_info_42',
    '정보나눔터',
    '자유게시판',
    '[식당] Green Leaf Vietnamese',
    'https://maps.app.goo.gl/NG6mbtsfE4m59fcM6
쌀국수 먹어봤는데 양이 좀 적은 편이고. 그냥 어디 쌀국수 액기스 사와서 뜨거운 물에 풀어준 것 같음.
가게 더러움.
해주는거 별로 없는데 Tip은 왜 물어보나 싶음.
다시 안감.',
    'admin_legacy_user',
    0,
    '2025-10-18 21:54:00',
    NOW()
);


INSERT INTO Comment (id, content, postId, authorId, createdAt) 
VALUES (
    'legacy_info_42_comment_0',
    '여기 너무 맛 없어요 진짜...',
    'legacy_info_42',
    'admin_legacy_user',
    '2025-10-19 22:08:00'
);


-- 구인구직 posts

INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_jobs_44',
    '구인구직',
    NULL,
    '모집공고 (HR & 전산)',
    '회사 위치 : 하트퍼드 & 헌팅턴
생산 제품 : ESS 관련
모집 분야 : (1)HR 매니저 또는 담당자 (2) 전산(신입,경력)
SAP 경험자 우대
입사후 1달간 본사 체류하면서 직무 교육 실시
입사 희망 시기 : 26.02월 (조정 가능)
근무조건 : 한국 상장 회사이며 개별 컨택 주시면 회사 정보 공유 예정, 미국 신생기업이라 근무 조건은 주변과 유사한 수준으로 협상
의사가 있으신분은 개인적으로 톡 주시거나 안되시면 여기에 댓글 주시면 별도 컨택하겠습니다.
참고로 저는 아직 한국에 거주하고 있습니다',
    'admin_legacy_user',
    0,
    '2025-10-21 19:22:00',
    NOW()
);


INSERT INTO Comment (id, content, postId, authorId, createdAt) 
VALUES (
    'legacy_jobs_44_comment_0',
    '연락드릴 수 있는 카톡 정보도 알려주시면 감사하겠습니다.',
    'legacy_jobs_44',
    'admin_legacy_user',
    '2025-10-21 22:22:00'
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_jobs_26',
    '구인구직',
    NULL,
    'Admin Officer, 현장 엔지니어 모집(배터리 공장)',
    '-채용 공고-
회사: 배터리 공장 환경 플랜트 업체 HKENE USA INC
근무 지역: 미국 인디애나 코코모
모집 분야: Admin Officer, 현장 엔지니어
모집 대상: Admin Officer(초보도 가능), 현장 엔지니어 (경력 2년 이상), 대졸
연봉: 경력에 따라 대우
혜택: 건강보험, 퇴직 연금, 자기운전 보조 경비, 교육지원정책, 성과급(대기업급)
지원 대상자: 합법적으로 일을 할수 있는 비자 소지자, 영어/한국어 가능자
관심 있으신 분들은 아래로 지원 바랍니다.
roca77@hkene.co.kr',
    'admin_legacy_user',
    0,
    '2025-10-16 18:05:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_jobs_25',
    '구인구직',
    NULL,
    '채용공고(지역: 코코모)',
    '<채용 공고>
회사: 삼성 협력업체
근무지역: 인디애나 코코모 (Kokomo, IN)
모집부문: 제조 부문
모집대상: 남성 (35세~45세)
연봉 범위: $55,000 ~ $65,000
복지 혜택: 기숙사 제공
근무조건: 신체 건강하며 즉시 출근 가능한 분, 한국어 가능자
<연락처>
수신 이메일: likeolivetree@gmail.com
관심 있으신 분은 개별 문의 바랍니다.',
    'admin_legacy_user',
    0,
    '2025-10-15 18:40:00',
    NOW()
);


-- 과외 posts

INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_tutoring_55',
    '과외',
    NULL,
    '과외교사 홍보 양식',
    '과외 교사 홍보 글 작성 안내
아래 양식을 복사하여 작성해 주세요.
정보가 누락된 경우 게시가 제한될 수 있습니다.
1. 기본 정보
이름:
거주 지역:
온라인 수업 가능 여부: (가능 / 불가)
2. 학력 및 전공
학교명:
전공 / 학년(졸업 예정 년도):
3. 과외 가능 과목
과목:
대상 학년:
수업 방식: (대면 / 온라인)
4. 과외 경력
과외 경험: (있음 / 없음)
경력 기간:
지도 사례 또는 성과:
※ 경력이 없는 경우 해당 없음으로 기재
5. 수업 방식
수업 진행 방식 및 특징을 간단히 작성
6. 가능 일정
가능 요일:
가능 시간대:
주당 수업 횟수:
7. 희망 과외비
시간당 금액:
협의 가능 여부: (가능 / 불가)
8. 연락 방법
연락 수단: (카카오톡 / 이메일 등)
연락 가능 시간대:
9. 한 줄 소개
학부모가 참고할 수 있도록 간단히 작성',
    'admin_legacy_user',
    0,
    '2026-02-08 03:51:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_tutoring_59',
    '과외',
    NULL,
    '영어 원어민 과외 선생님',
    '안녕하세요,
영어 과외 선생님을 구하시는 분들께 좋은 선생님 한 분 소개합니다. Shelley Mathis (셸리 매띠스) 선생님께서 직접 써주신, 아래 소개 글 보시고 관심 있으신 분들은 연락해보세요~
살짝 여쭤보니 과외비 비싸지는 않았어요.
**이 웹사이트 활용이 어려운 원어민 선생님을 대신하여 작성하는 글이라, 과외 홍보 양식에 맞추어 쓰지 않은 점 양해 부탁드립니다.**
Professional ESL Tutoring in West Lafayette
Shelley Mathis is a highly experienced ESL (English as a Second Language) teacher based in West Lafayette, Indiana, with over 15 years of dedicated teaching experience. With a Bachelor’s degree and advanced training in ESL instruction, Shelley combines academic expertise with a practical, student-centered approach. Having taught thousands of students and traveled worldwide, she possesses a deep understanding and appreciation for different cultures, allowing her to connect effectively with learners from all backgrounds.
Shelley holds a TESOL certificate and specializes in helping students navigate both the practical and professional sides of English. Whether you are looking for help for your children, your career, or your daily life in America, Shelley offers tailored lessons with the flexibility to meet at your home, your workplace, a public meeting place, or online.
Specializations
Academic & Advanced Instruction: Leveraging a Bachelor’s degree and specialized training to provide high-quality pedagogy.
Cultural Competency: Extensive global travel ensures a supportive, culturally-aware learning environment.
Pronunciation & Accent Correction: Targeted training to help you speak clearly and confidently.
Everyday Life English: Master the useful vocabulary and cultural nuances needed for life in the U.S.
Professional English: Specialized coaching for professionals looking to improve workplace communication.
Support for All Ages: Proven track record with thousands of students, from young children to adults.
Rates & Contact
Flexible Pricing: Individual or group rates available.
Email: shelleyelaine75@gmail.com
Phone: 717-683-4987
.............................................................................................................................................
&#91;Korean Translation for Community Posting&#93;
웨스트 라파예트(West Lafayette) 전문 영어 과외 선생님을 소개합니다!
안녕하세요, 우리 지역사회에 거주하시는 한국 분들을 위해 15년 이상의 경력을 가진 베테랑 영어 선생님, Shelley E. Mathis를 소개해 드립니다. Shelley 선생님은 학사 학위와 ESL 심화 교육 과정을 이수한 교육 전문가입니다. TESOL 자격증을 보유하고 있으며, 전 세계를 여행하며 수천 명의 학생들을 가르친 경험을 통해 다양한 문화를 깊이 이해하고 존중하는 마음으로 수업에 임합니다.
주요 레슨 특징:
다양한 수업 장소: 학생분의 자택, 직장, 공공장소(카페 등), 또는 온라인 중 원하시는 곳에서 맞춤 수업이 가능합니다.
발음 교정 전문가: 정확한 영어 발음과 억양을 집중적으로 교정해 드립니다.
실생활 & 비즈니스 영어: 미국 생활 필수 어휘부터 전문적인 비즈니스 영어까지 맞춤형으로 진행됩니다.
모든 연령대 가능: 어린이부터 성인까지 수천 명을 가르친 노하우로 모든 레벨의 수업이 가능합니다.
수업료 및 연락처:
수업료: 개인 레슨 또는 그룹 레슨 할인 가능 (상담 문의)
이메일: shelleyelaine75@gmail.com
전화번호: 717-683-4987
웨스트 라파예트에서 자녀의 영어 실력 향상이나 미국 생활 적응, 또는 전문적인 영어 구사가 필요한 분들께 적극 추천합니다. 전문성과 풍부한 경험을 갖춘 Shelley 선생님과 함께 영어를 시작해보세요!',
    'admin_legacy_user',
    0,
    '2026-04-04 17:02:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_tutoring_58',
    '과외',
    NULL,
    '메쓰존 튜터 (그룹&개인)',
    '1. 기본 정보
이름: John Lee
거주 지역: West Lafayette
온라인 수업 가능 여부: 가능
2. 학력 및 전공
학교명: 아주대학교, 예일대학교
전공 / 학년(졸업 예정 년도): Biomedical Engineering
3. 과외 가능 과목
과목: 미국수학 (100% 영어로 수업), SAT (100% 영어로 수업), 한국수학 (한국어로 수업), 수능수학 (한국어로 수업)
대상 학년: 전학년
수업 방식: 대면
4. 과외 경력
과외 경험: 있음
경력 기간: 20년
지도 사례 또는 성과: 한국, 네델란드 주재원 가족들, 예일대 주변 초중고 학생들, 현재 웨라 초중고 학생들 (10명 과외중)
5. 수업 방식
학생 성향과 레벨에 맞춰서 재미있게 수업 진행하여 수학에 대한 자신감을 주고 수학을 좋아하게 해줍니다.
6. 가능 일정
가능 요일: 모든 요일
가능 시간대: 주중 오후, 주말 상시
주당 수업 횟수: 1회 또는 2회
7. 희망 과외비
시간당 금액: 개인튜터 시간당 $30부터, 그룹튜터 월 $140부터
8. 연락 방법
연락 수단: (203) 500-8751 (문자/카카오톡)
연락 가능 시간대: 상시',
    'admin_legacy_user',
    0,
    '2026-03-31 14:57:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_tutoring_56',
    '과외',
    NULL,
    '수학 과외 안내',
    '1. 기본 정보
이름: Thomas Kim
거주 지역: 웨스트라파엣
온라인 수업 가능 여부: 가능
2. 학력 및 전공
학교명: 서울대학교
전공 : 지구환경시스템공학부 박사 (2002년 졸업)
3. 과외 가능 과목
과목: 수학
대상 학년: 7학년-11학년 (남학생만)
수업 방식:  대면 / 온라인 모두 가능
4. 과외 경력
과외 경험: 있음
경력 기간: 3년
지도 사례 또는 성과: Stony Brook School (뉴욕소재) 보딩스쿨 9-12학년까지 수학 전과목 괴외지도 경험
5. 수업 방식
학교 GPA 향상을 위한 교과과정 : Algebra 1, 2, Geometry, Pre-Cal, AP-Cal AB/BC, AP Statistics 등 이론 강의와 연습문제 풀이
SAT 수학 준비 : SAT Prep Black Book, Princeton SAT Premium Prep. 등 실전 감각을 키우기 위한 문제 풀이 지도
6. 가능 일정
가능 요일: 협의 가능
가능 시간대: 협의 가능
주당 수업 횟수: 협의 가능
7. 희망 과외비
시간당 금액: $60-$140/hr
협의 가능 여부: 학생 수준, 학생 수 및 과목 난이도에 따라 협의 가능
8. 연락 방법
연락 수단: westlaf2026@gmail.com
연락 가능 시간대:  이메일로 연락 가능
9. 한 줄 소개
한·미 양국의 수학 학습 노하우를 접목하여 학생 수준별 맞춤 수업을 진행합니다. 학부모님과의 긴밀한 상담과 상세한 수업 피드백을 통해, 아이가 수학에 자신감을 가질 수 있도록 지도하겠습니다.',
    'admin_legacy_user',
    0,
    '2026-03-28 22:08:00',
    NOW()
);


-- Housing posts

INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_housing_64',
    'Housing',
    NULL,
    '샌츄리 아파트 선착순 프로모션',
    '센츄리 아파트 2b2b 또는 Studio 1년 계약시 선착순으로 $1,250 gift card 증정 합니다. (소진시 종료되고 6/15일 까지 입주)',
    'admin_legacy_user',
    0,
    '2026-04-23 06:55:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_housing_60',
    'Housing',
    NULL,
    '웨스트라피엣 부동산 문의',
    '내용 없음',
    'admin_legacy_user',
    0,
    '2026-04-06 15:28:00',
    NOW()
);


INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_housing_57',
    'Housing',
    NULL,
    'Sk 근처 웨스트라피엣 하우스 쉐어 렌트',
    '자세한 사항 /사진/ 쇼잉 문의는 전화/문자/ email
702-238-3226
Emoon@truebloodre.com',
    'admin_legacy_user',
    0,
    '2026-03-30 08:57:00',
    NOW()
);


-- FAQ posts

INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    'legacy_faq_0',
    'FAQ',
    NULL,
    'FAQ',
    '전체 7
최신순
추천순
조회순
업데이트순
번호
제목
작성자
작성일
추천
조회
공지사항
[필독] 웨스트라피엣 한인 커뮤니티 웹사이트는 어떤 곳인가요?
Junsu
|
2025.09.21
|
추천 0
|
조회 118
Junsu
2025.09.21
0
118
6
Farmers Market (파머스 마켓)
운영자
|
2025.11.15
|
추천 0
|
조회 74
운영자
2025.11.15
0
74
5
공립도서관(Public library) 이용 방법
운영자
|
2025.10.22
|
추천 0
|
조회 64
운영자
2025.10.22
0
64
4
한국 식재료/식품을 구입할 수 있는 곳
운영자
|
2025.10.22
|
추천 0
|
조회 73
운영자
2025.10.22
0
73
3
교회 & 성당 정보
운영자
|
2025.10.21
|
추천 0
|
조회 99
운영자
2025.10.21
0
99
2
학군/학교 정보 알려주세요.
운영자
|
2025.09.26
|
추천 0
|
조회 91
운영자
2025.09.26
0
91
1
데이케어 정보 알려주세요.
운영자
|
2025.09.26
|
추천 0
|
조회 90
운영자
2025.09.26
0
90
1
전체
제목
내용
작성자
검색
Powered by KBoard',
    'admin_legacy_user',
    0,
    NOW(),
    NOW()
);
