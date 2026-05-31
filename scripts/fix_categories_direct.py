#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
직접 카테고리 수정
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
    print("=== Direct Category Fix ===\n")
    
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
        
        # 현재 카테고리 확인
        cursor.execute("SELECT DISTINCT category FROM Post")
        current_categories = cursor.fetchall()
        print("Current categories:")
        for cat in current_categories:
            print(f"- {cat[0]}")
        
        # 모든 게시물 삭제 후 다시 삽입
        print("\nDeleting all posts...")
        cursor.execute("DELETE FROM Post")
        conn.commit()
        
        # 새로운 카테고리로 게시물 삽입
        print("Creating posts with correct categories...")
        
        # 정보나눔터 게시물
        info_posts = [
            ("피아노 조율", "Mike Bratcher 317-371-5747\n웨라에 사는 분은 아니어서 이 분이 웨라에 오실 때 맞춰서 시간 잡고 있어요. 언제 오시는 지 먼저 물어보세요~\n저는 몇 년 동안 이 분께 조율 맡기고 있어서 요즘은 연락 먼저 주실 때까지 기다려요.\n\n조율비: 그랜드 피아노 $155/1회 입니다. 업라이트 피아노는 이보다 저렴한 걸로 알아요.\n조율시간: 보통 1시간\n1년 이상 조율 안한 피아노는 한 번 방문시 두 번 이상 조율하기 때문에 기본 조율 비용보다 많이 나와요."),
            ("Pest Control", "웨스트라피엣 한인커뮤니티 단톡방 질문과 답변 공유합니다.\n\n스윗 라이언: 안녕하세요! 조금 전에 pest control 업체에서 홍보하려고 저희 집을 방문을 했는데요~ 저희도 하우스에서 살아보는건 처음이라.. 업체의 도움을 받아야 할지 감이 안오네요.. 보통 직접 약을 뿌리시나요? 다들 pest control 어떻게 하시는지 궁금합니다!\n\nShy Neo: 어떤 pest냐에따라 다릅니다.. 개미는 약뿌려서 퇴치가 되는 경우도 있고요.. 쥐는 다니는 통로가 있어서 덫이나 약으로는 한계가 있습니다.."),
            ("치과 추천해주세요", "정기점검으로 일반 성인 치과 추천 부탁해요")
        ]
        
        for i, (title, content) in enumerate(info_posts, 1):
            post_id = f"legacy_info_{i}"
            cursor.execute("""
                INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (post_id, '정보나눔터', '자유게시판', title, content, 'admin_legacy_user', 0))
        
        # 구인구직 게시물
        jobs_posts = [
            ("케어(아이)", "아이 돌봄 경력 있는 분 찾습니다."),
            ("Admin Officer, 웨스트라피엣 학교(교직원)", "웨스트라피엣 학교에서 Admin Officer를 채용합니다."),
            ("번역(영어)", "영어 번역 가능한 분 찾습니다.")
        ]
        
        for i, (title, content) in enumerate(jobs_posts, 1):
            post_id = f"legacy_jobs_{i}"
            cursor.execute("""
                INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (post_id, '구인구직', None, title, content, 'admin_legacy_user', 0))
        
        # 과외 게시물
        tutoring_posts = [
            ("해외 유학", "해외 유학 상담 가능합니다."),
            ("튜터링 (수학&과학)", "수학과 과학 튜터링 가능합니다."),
            ("피아노 레슨", "피아노 레슨 가능합니다."),
            ("대학생 과외", "대학생 과외 가능합니다.")
        ]
        
        for i, (title, content) in enumerate(tutoring_posts, 1):
            post_id = f"legacy_tutoring_{i}"
            cursor.execute("""
                INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (post_id, '과외', None, title, content, 'admin_legacy_user', 0))
        
        # Housing 게시물
        housing_posts = [
            ("하우스 렌트", "하우스 렌트합니다."),
            ("웨스트라피엣 렌트", "웨스트라피엣에서 렌트합니다."),
            ("Sk 씨 웨스트라피엣 하우스 렌트", "Sk 씨가 하우스 렌트합니다.")
        ]
        
        for i, (title, content) in enumerate(housing_posts, 1):
            post_id = f"legacy_housing_{i}"
            cursor.execute("""
                INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (post_id, 'Housing', None, title, content, 'admin_legacy_user', 0))
        
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
        
    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
