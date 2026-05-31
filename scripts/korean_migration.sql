-- 한글 카테고리 마이그레이션 SQL
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 기존 데이터 삭제
DELETE FROM Comment;
DELETE FROM Post;
DELETE FROM User WHERE email = 'admin@wlafayettekorea.org';

-- 관리자 사용자 생성
INSERT INTO User (id, email, password, displayName, firstName, lastName, role, emailVerified, createdAt) 
VALUES ('admin_legacy_user', 'admin@wlafayettekorea.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', '운영자', '시스템', '관리자', 'ADMIN', 1, NOW());

-- 정보나눔터 게시물
INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) VALUES
('legacy_info_1', '정보나눔터', '자유게시판', '피아노 조율', 'Mike Bratcher 317-371-5747 웨라에 사는 분은 아니어서 이 분이 웨라에 오실 때 맞춰서 시간 잡고 있어요.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_info_2', '정보나눔터', '자유게시판', 'Pest Control', '웨스트라피엣 한인커뮤니티 단톡방 질문과 답변 공유합니다.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_info_3', '정보나눔터', '자유게시판', '치과 추천해주세요', '정기점검으로 일반 성인 치과 추천 부탁해요', 'admin_legacy_user', 0, NOW(), NOW());

-- 구인구직 게시물
INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) VALUES
('legacy_jobs_1', '구인구직', NULL, '케어(아이)', '아이 돌봄 경력 있는 분 찾습니다.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_jobs_2', '구인구직', NULL, 'Admin Officer, 웨스트라피엣 학교', '웨스트라피엣 학교에서 Admin Officer를 채용합니다.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_jobs_3', '구인구직', NULL, '번역(영어)', '영어 번역 가능한 분 찾습니다.', 'admin_legacy_user', 0, NOW(), NOW());

-- 과외 게시물
INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) VALUES
('legacy_tutoring_1', '과외', NULL, '해외 유학', '해외 유학 상담 가능합니다.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_tutoring_2', '과외', NULL, '튜터링 (수학과학)', '수학과 과학 튜터링 가능합니다.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_tutoring_3', '과외', NULL, '피아노 레슨', '피아노 레슨 가능합니다.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_tutoring_4', '과외', NULL, '대학생 과외', '대학생 과외 가능합니다.', 'admin_legacy_user', 0, NOW(), NOW());

-- Housing 게시물
INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) VALUES
('legacy_housing_1', 'Housing', NULL, '하우스 렌트', '하우스 렌트합니다.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_housing_2', 'Housing', NULL, '웨스트라피엣 렌트', '웨스트라피엣에서 렌트합니다.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_housing_3', 'Housing', NULL, 'Sk 씨 웨스트라피엣 하우스', 'Sk 씨가 하우스 렌트합니다.', 'admin_legacy_user', 0, NOW(), NOW());

-- FAQ 게시물
INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) VALUES
('legacy_faq_1', 'FAQ', NULL, '[필독] 웨스트라피엣 한인 커뮤니티 웹사이트는 어떤 곳인가요?', '웨스트라피엣 한인 커뮤니티 웹사이트는 웨스트라피엣 지역에 거주하는 한인들을 위한 정보 공유 및 소통의 장입니다.', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_faq_2', 'FAQ', None, 'Farmers Market (파머스 마켓)', '웨스트라피엣 지역 파머스 마켓 정보: 5월-10월 매주 토요일 7:30 AM - 12:30 PM', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_faq_3', 'FAQ', None, '공립도서관(Public library) 이용 방법', '웨스트라피엣 공립도서관 이용 안내', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_faq_4', 'FAQ', None, '한국 식재료/식품을 구입할 수 있는 곳', '웨스트라피엣 지역 한국 식품 구매처', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_faq_5', 'FAQ', None, '교회 & 성당 정보', '웨스트라피엣 지역 한인 교회 및 성당', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_faq_6', 'FAQ', None, '학군/학교 정보 알려주세요.', '웨스트라피엣 지역 학교 정보', 'admin_legacy_user', 0, NOW(), NOW()),
('legacy_faq_7', 'FAQ', None, '데이케어 정보 알려주세요.', '웨스트라피엣 지역 데이케어 정보', 'admin_legacy_user', 0, NOW(), NOW());
