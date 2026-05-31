#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
최종 한글 상태 확인
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
        
        host_port = ''
        database = ''
        
        if '/' in host_part:
            host_port, database = host_part.split('/', 1)
        else:
            host_port = host_port
            
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
    print("=== VERIFY KOREAN FINAL ===\n")
    
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
        conn = mysql.connector.connect(**db_config, charset='utf8mb4')
        cursor = conn.cursor()
        print("Database connected with UTF8MB4!")
        
        # 전체 게시물 수 확인
        cursor.execute("SELECT COUNT(*) FROM Post")
        total_posts = cursor.fetchone()[0]
        print(f"Total posts: {total_posts}")
        
        # 카테고리별 게시물 수 확인
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        categories = cursor.fetchall()
        print(f"\nPosts by category:")
        for category, count in categories:
            if category and count:
                print(f"- {category}: {count} posts")
        
        # 각 카테고리의 게시물 제목 확인
        for category, count in categories:
            if category and count:
                print(f"\n{category} posts:")
                cursor.execute(f"SELECT title FROM Post WHERE category = %s ORDER BY createdAt DESC", (category,))
                posts = cursor.fetchall()
                for i, post in enumerate(posts, 1):
                    if post and post[0]:
                        print(f"  {i}. {post[0]}")
        
        print(f"\nVerification completed!")
        
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
