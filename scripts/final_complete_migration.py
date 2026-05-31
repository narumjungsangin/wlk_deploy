#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
최종 완전 마이그레이션
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
            host_port, database = host_port.split('/')
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
        print(f"DATABASE_URL parsing error: {e}")
        return None

def main():
    print("=== FINAL COMPLETE MIGRATION ===\n")
    
    # .env 파일 로드
    load_dotenv()
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL not found.")
        return
    
    db_config = parse_database_url(database_url)
    if not db_config:
        return
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("Database connected!")
        
        # 모든 데이터 삭제
        print("Deleting all existing data...")
        cursor.execute("DELETE FROM Comment")
        cursor.execute("DELETE FROM Post")
        cursor.execute("DELETE FROM User WHERE email = 'admin@wlafayettekorea.org'")
        conn.commit()
        
        # 관리자 사용자 생성
        print("Creating admin user...")
        cursor.execute("""
            INSERT INTO User (id, email, password, displayName, firstName, lastName, role, emailVerified, createdAt) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, ('admin_legacy_user', 'admin@wlafayettekorea.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', '운영자', '시스템', '관리자', 'ADMIN', 1))
        conn.commit()
        
        # 게시물 생성
        posts_data = [
            # 정보나눔터
            ('legacy_info_1', '정보나눔터', '자유게시판', '피아노 조율', 'Mike Bratcher 317-371-5747 웨라에 사는 분은 아니어서 이 분이 웨라에 오실 때 맞춰서 시간 잡고 있어요.'),
            ('legacy_info_2', '정보나눔터', '자유게시판', 'Pest Control', '웨스트라피엣 한인커뮤니티 단톡방 질문과 답변 공유합니다.'),
            ('legacy_info_3', '정보나눔터', '자유게시판', '치과 추천해주세요', '정기점검으로 일반 성인 치과 추천 부탁해요'),
            
            # 구인구직
            ('legacy_jobs_1', '구인구직', None, '케어(아이)', '아이 돌봄 경력 있는 분 찾습니다.'),
            ('legacy_jobs_2', '구인구직', None, 'Admin Officer, 웨스트라피엣 학교', '웨스트라피엣 학교에서 Admin Officer를 채용합니다.'),
            ('legacy_jobs_3', '구인구직', None, '번역(영어)', '영어 번역 가능한 분 찾습니다.'),
            
            # 과외
            ('legacy_tutoring_1', '과외', None, '해외 유학', '해외 유학 상담 가능합니다.'),
            ('legacy_tutoring_2', '과외', None, '튜터링 (수학과학)', '수학과 과학 튜터링 가능합니다.'),
            ('legacy_tutoring_3', '과외', None, '피아노 레슨', '피아노 레슨 가능합니다.'),
            ('legacy_tutoring_4', '과외', None, '대학생 과외', '대학생 과외 가능합니다.'),
            
            # Housing
            ('legacy_housing_1', 'Housing', None, '하우스 렌트', '하우스 렌트합니다.'),
            ('legacy_housing_2', 'Housing', None, '웨스트라피엣 렌트', '웨스트라피엣에서 렌트합니다.'),
            ('legacy_housing_3', 'Housing', None, 'Sk 씨 웨스트라피엣 하우스', 'Sk 씨가 하우스 렌트합니다.'),
            
            # FAQ
            ('legacy_faq_1', 'FAQ', None, '[필독] 웨스트라피엣 한인 커뮤니티 웹사이트는 어떤 곳인가요?', '웨스트라피엣 한인 커뮤니티 웹사이트는 웨스트라피엣 지역에 거주하는 한인들을 위한 정보 공유 및 소통의 장입니다.'),
            ('legacy_faq_2', 'FAQ', None, 'Farmers Market (파머스 마켓)', '웨스트라피엣 지역 파머스 마켓 정보: 5월-10월 매주 토요일 7:30 AM - 12:30 PM'),
            ('legacy_faq_3', 'FAQ', None, '공립도서관(Public library) 이용 방법', '웨스트라피엣 공립도서관 이용 안내'),
            ('legacy_faq_4', 'FAQ', None, '한국 식재료/식품을 구입할 수 있는 곳', '웨스트라피엣 지역 한국 식품 구매처'),
            ('legacy_faq_5', 'FAQ', None, '교회 & 성당 정보', '웨스트라피엣 지역 한인 교회 및 성당'),
            ('legacy_faq_6', 'FAQ', None, '학군/학교 정보 알려주세요.', '웨스트라피엣 지역 학교 정보'),
            ('legacy_faq_7', 'FAQ', None, '데이케어 정보 알려주세요.', '웨스트라피엣 지역 데이케어 정보')
        ]
        
        print("Creating posts...")
        for post_id, category, subcategory, title, content in posts_data:
            cursor.execute("""
                INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (post_id, category, subcategory, title, content, 'admin_legacy_user', 0))
        
        conn.commit()
        print("Posts created successfully!")
        
        # 최종 상태 확인
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        categories = cursor.fetchall()
        print(f"\nFinal posts by category:")
        for category, count in categories:
            print(f"- {category}: {count} posts")
        
        cursor.execute("SELECT COUNT(*) FROM Post")
        total_posts = cursor.fetchone()[0]
        print(f"Total posts: {total_posts}")
        
        print(f"\nMigration completed successfully!")
        print(f"Admin login: admin@wlafayettekorea.org / admin123")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
