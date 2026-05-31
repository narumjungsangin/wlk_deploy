#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한글 인코딩 직접 수정
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
    print("=== FIX KOREAN ENCODING ===\n")
    
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
        
        # 카테고리 이름 직접 수정
        print("Fixing Korean category names...")
        
        # 정보나눔터로 수정
        cursor.execute("UPDATE Post SET category = '정보나눔터' WHERE category LIKE '%정보%' OR category = 'info'")
        info_count = cursor.rowcount
        conn.commit()
        print(f"Updated {info_count} posts to '정보나눔터'")
        
        # 구인구직으로 수정
        cursor.execute("UPDATE Post SET category = '구인구직' WHERE category LIKE '%구인%' OR category = 'jobs'")
        jobs_count = cursor.rowcount
        conn.commit()
        print(f"Updated {jobs_count} posts to '구인구직'")
        
        # 과외로 수정
        cursor.execute("UPDATE Post SET category = '과외' WHERE category LIKE '%과외%' OR category = 'tutoring'")
        tutoring_count = cursor.rowcount
        conn.commit()
        print(f"Updated {tutoring_count} posts to '과외'")
        
        # Housing은 그대로
        print("Housing category kept as is")
        
        # FAQ는 그대로
        print("FAQ category kept as is")
        
        # 최종 상태 확인
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        categories = cursor.fetchall()
        print(f"\nFinal posts by category:")
        for category, count in categories:
            print(f"- {category}: {count} posts")
        
        cursor.execute("SELECT COUNT(*) FROM Post")
        total_posts = cursor.fetchone()[0]
        print(f"Total posts: {total_posts}")
        
        print(f"\nKorean encoding fix completed!")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
