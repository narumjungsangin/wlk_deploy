#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FAQ 데이터 수정
"""

import mysql.connector
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Windows 인코딩 문제 해결
os.environ['PYTHONIOENCODING'] = 'utf-8'

def parse_database_url(url):
    """DATABASE_URL 파싱"""
    try:
        clean_url = url.replace('mysql://', '').replace('mariadb://', '')
        user_part, host_part = clean_url.split('@')
        user, password = user_part.split(':')
        
        if '/' in host_part:
            host_port, database = host_part.split('/')
        else:
            host_port = host_port
            database = ''
            
        if ':' in host_port:
            host, port = host_port.split(':')
            port = int(port)
        else:
            host = host_port
            port = 3306
            
        return {
            'user': user,
            'password': password,
            'host': host,
            'port': port,
            'database': database
        }
    except Exception as e:
        print(f"DATABASE_URL 파싱 오류: {e}")
        return None

def escape_sql_string(text: str) -> str:
    """SQL 문자열 이스케이프"""
    if not text:
        return "NULL"
    escaped = text.replace("'", "''").replace("\\", "\\\\")
    return f"'{escaped}'"

def main():
    print("=== FAQ 데이터 수정 ===\n")
    
    # .env 파일 로드
    load_dotenv()
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("오류: DATABASE_URL을 찾을 수 없습니다.")
        return
    
    db_config = parse_database_url(database_url)
    if not db_config:
        return
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("데이터베이스 연결 성공!")
        
        # 기존 FAQ 데이터 삭제
        print("기존 FAQ 데이터 삭제...")
        cursor.execute("DELETE FROM Post WHERE category = 'FAQ' AND authorId = 'admin_legacy_user'")
        conn.commit()
        
        # FAQ 게시물들
        faq_posts = [
            {
                "title": "[필독] 웨스트라피엣 한인 커뮤니티 웹사이트는 어떤 곳인가요?",
                "content": "웨스트라피엣 한인 커뮤니티 웹사이트는 웨스트라피엣 지역에 거주하는 한인들을 위한 정보 공유 및 소통의 장입니다.\n\n주요 기능:\n- 정보나눔터: 생활 정보, 육아/교육, 이벤트, 의학 정보 공유\n- 구인구직: 지역 내 채용 정보 및 구직 활동\n- 과외: 학생 개인 교육 및 과외 정보\n- Housing: 주택 정보 및 렌트/매물 공유\n- FAQ: 자주 묻는 질문 및 기본 정보 제공\n\n모든 한인들이 자유롭게 정보를 공유하고 소통할 수 있는 열린 공간입니다."
            },
            {
                "title": "Farmers Market (파머스 마켓)",
                "content": "웨스트라피엣 지역 파머스 마켓 정보:\n\n시간 및 장소:\n- 5월-10월: 매주 토요일 7:30 AM - 12:30 PM\n- 위치: 5th Street, between Columbia and Ferry Streets\n\n특징:\n- 신선한 지역 농산물 직접 구매 가능\n- 유기농 제품 다양하게 구비\n- 베이커리, 치즈, 고기 제품도 판매\n- 지역 커뮤니티 교류의 장\n\n팁:\n- 일찍 방문할수록 신선한 제품 구매 가능\n- 현금과 카드 모두 사용 가능\n- 주차 공간이 제한적일 수 있으니 대중교통 이용 권장"
            },
            {
                "title": "공립도서관(Public library) 이용 방법",
                "content": "웨스트라피엣 공립도서관 이용 안내:\n\n위치:\n- West Lafayette Public Library: 208 W Columbia St, West Lafayette, IN 47906\n- Tippecanoe County Public Library: 627 South St, Lafayette, IN 47901\n\n회원증 발급:\n- 주민 등록 증명서(운전면허증, ID 등)\n- 현 주소 증명 서류(임대 계약서, 공과금 고지서 등)\n- 무료 발급 (외국인도 가능)\n\n이용 가능 서비스:\n- 도서 대출 및 반납\n- 컴퓨터 및 인터넷 이용\n- 프린터, 복사기 사용\n- 어린이 프로그램 및 성인 교육 프로그램\n- 전자책(e-book) 대출\n\n온라인 서비스:\n- 도서 예약 및 대출 연장\n- 전자자료실 이용\n- 디지털 신문, 잡지 접근"
            },
            {
                "title": "한국 식재료/식품을 구입할 수 있는 곳",
                "content": "웨스트라피엣 지역 한국 식품 구매처:\n\n1. 한인 마트:\n- Seoul Mart: 인디애나폴리스 (약 1시간 거리)\n- H-Mart: 시카고 근교 (약 2시간 거리)\n\n2. 로컬 스토어:\n- Walmart International Section: 기본적인 한국 식재료\n- Asian Market: 라파옛 (일부 한국 식품)\n- Jungle Jim's: 신시내티 (다양한 아시아 식품)\n\n3. 온라인 구매:\n- Amazon Fresh: 한국 식재료 일부\n- KoreanMall.com: 한국 식품 온라인 주문\n- Umart: 한인 식품 온라인 마트\n\n4. 커뮤니티:\n- 한인 교회: 주기적인 식품 공동 구매\n- 페이스북 그룹: 개인 간 식품 거래\n\n팁: 대량 구매 시 인디애나폴리스 방문이 경제적일 수 있습니다."
            },
            {
                "title": "교회 & 성당 정보",
                "content": "웨스트라피엣 지역 한인 교회 및 성당:\n\n한인 교회:\n1. 웨스트라피엣 한인 교회\n- 주소: 306 N Chauncey Ave, West Lafayette, IN\n- 예배: 일요일 10:00 AM\n- 특징: 학생 중심, 다양한 프로그램 운영\n\n2. 퍼듀 한인 연합 교회\n- 주소: 720 Northwestern Ave, West Lafayette, IN\n- 예배: 일요일 11:00 AM\n- 특징: 퍼듀 대학생 및 지역 주민 대상\n\n성당:\n1. St. Thomas Aquinas Catholic Center\n- 주소: 535 W State St, West Lafayette, IN\n- 한국어 미사: 매월 첫 주일 (홈페이지 확인)\n\n2. St. Mary Cathedral\n- 주소: 1207 Columbia St, Lafayette, IN\n- 다국어 지원 (한국어 통역 가능)\n\n기타 종교 시설:\n- 이슬람 센터, 불교 사원 등 다양한 종교 시설이 퍼듀 캠퍼스 내에 위치"
            },
            {
                "title": "학군/학교 정보 알려주세요.",
                "content": "웨스트라피엣 지역 학교 정보:\n\n초등학교:\n1. Happy Hollow Elementary School\n- 평판: 9/10\n- 특징: 우수한 학업 성취, 다양한 특별 프로그램\n\n2. Cumberland Elementary School\n- 평판: 8/10\n- 특징: 친근적인 교육 환경, 소규모 학급\n\n중학교:\n1. West Lafayette Junior/Senior High School\n- 평판: 9/10\n- 특징: IB 프로그램, 우수한 대학 진학률\n\n사립학교:\n1. Faith Christian School\n- 특징: 기독교 교육, 작은 학급 규모\n\n2. Lafayette Catholic School System\n- 특징: 카톨릭 교육, 유치원부터 고등학교까지\n\n대학:\n- Purdue University: 세계적인 공과대학\n\n등록 절차:\n1. 주소 증명 서류 준비\n2. 학생 건강 기록 및 예방 접종 증명\n3. 이전 학교 성적 증명서\n4. 학군 확인 (WLCS 웹사이트에서 확인 가능)\n\n팁: 8월 초에 등록하는 것을 권장하며, 학군에 따라 배정 학교가 달라질 수 있습니다."
            },
            {
                "title": "데이케어 정보 알려주세요.",
                "content": "웨스트라피엣 지역 데이케어 정보:\n\n공립 데이케어:\n1. Purdue University Child Care Center\n- 대상: 퍼듀 대학교 직원 및 학생 자녀\n- 특징: 우수한 교육 프로그램, 대기 리스트 존재\n- 연락처: (765) 494-5485\n\n사립 데이케어:\n1. Little Learners Preschool\n- 대상: 3-5세\n- 특징: 학습 중심 프로그램, 반일제 운영\n\n2. Children's Choice Learning Center\n- 대상: 6주-12세\n- 특징: 연중 무휴, 유연한 시간\n\n3. La Petite Academy\n- 대상: 유아-학동\n- 특징: 체계적인 커리큘럼\n\n홈 데이케어:\n- 개인 운영 홈 데이케어 다수 존재\n- 웨스트라피엣 맘스 카페 등에서 정보 공유\n\n등록 시 필요 서류:\n1. 자녀 건강 기록 및 예방 접종 증명\n2. 비상 연락처 정보\n3. 의료 정보 및 알레르기 기록\n4. 법적 보호자 동의서\n\n비용 범위:\n- 홈 데이케어: $150-250/주\n- 센터 기반: $200-400/주\n\n팁: 대기 리스트가 길 수 있으니 미리 등록하는 것을 권장합니다."
            }
        ]
        
        print("FAQ 게시물 삽입 중...")
        admin_id = "admin_legacy_user"
        
        for i, post in enumerate(faq_posts, 1):
            post_id = f"legacy_faq_{i}"
            
            post_sql = f"""
INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    '{post_id}',
    'FAQ',
    NULL,
    {escape_sql_string(post['title'])},
    {escape_sql_string(post['content'])},
    '{admin_id}',
    0,
    NOW(),
    NOW()
)
"""
            cursor.execute(post_sql)
            conn.commit()
            print(f"  {i}. {post['title'][:30]}...")
        
        print(f"\nFAQ 데이터 수정 완료!")
        print(f"총 {len(faq_posts)}개 FAQ 게시물이 추가되었습니다.")
        
        # 결과 확인
        cursor.execute("SELECT COUNT(*) FROM Post WHERE category = 'FAQ'")
        faq_count = cursor.fetchone()[0]
        print(f"현재 FAQ 게시물: {faq_count}개")
        
    except Exception as e:
        print(f"오류: {e}")
        if 'conn' in locals():
            conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
