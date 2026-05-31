#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
실제 데이터베이스 상태 확인
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
        
        if '/' in host_port:
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

def main():
    print("=== 실제 데이터베이스 상태 확인 ===\n")
    
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
        
        # 전체 게시물 수 확인
        cursor.execute("SELECT COUNT(*) FROM Post")
        total_posts = cursor.fetchone()[0]
        print(f"전체 게시물 수: {total_posts}")
        
        # 카테고리별 게시물 수 확인
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        categories = cursor.fetchall()
        print(f"\n카테고리별 게시물:")
        for category, count in categories:
            print(f"- {category}: {count}개")
        
        # 각 카테고리의 게시물 제목 확인
        for category, _ in categories:
            print(f"\n{category} 게시물:")
            cursor.execute(f"SELECT title FROM Post WHERE category = '{category}' ORDER BY createdAt DESC")
            posts = cursor.fetchall()
            for i, post in enumerate(posts, 1):
                print(f"  {i}. {post[0]}")
        
        # 댓글 수 확인
        cursor.execute("SELECT COUNT(*) FROM Comment")
        total_comments = cursor.fetchone()[0]
        print(f"\n전체 댓글 수: {total_comments}")
        
        # 관리자 사용자 확인
        cursor.execute("SELECT id, email, displayName FROM User WHERE email = 'admin@wlafayettekorea.org'")
        admin_user = cursor.fetchone()
        if admin_user:
            print(f"\n관리자 사용자: {admin_user[0]}, {admin_user[1]}, {admin_user[2]}")
        else:
            print("\n관리자 사용자 없음")
        
    except Exception as e:
        print(f"오류: {e}")
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
