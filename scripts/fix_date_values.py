#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
날짜 값 오류 수정
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
    print("=== FIX DATE VALUES ===\n")
    
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
        
        # 잘못된 날짜 값 확인
        print("Checking for invalid date values...")
        cursor.execute("SELECT id, createdAt FROM Post WHERE createdAt IS NULL OR createdAt = '0000-00-00 00:00:00' OR createdAt LIKE 'NOW%'")
        invalid_posts = cursor.fetchall()
        
        if invalid_posts:
            print(f"Found {len(invalid_posts)} posts with invalid dates")
            
            # 모든 게시물 날짜 수정
            print("Fixing all post dates...")
            cursor.execute("UPDATE Post SET createdAt = NOW(), updatedAt = NOW() WHERE createdAt IS NULL OR createdAt = '0000-00-00 00:00:00' OR createdAt LIKE 'NOW%'")
            conn.commit()
            print(f"Fixed {cursor.rowcount} post dates")
        else:
            print("No invalid date values found")
        
        # 댓글 날짜도 확인
        cursor.execute("SELECT id, createdAt FROM Comment WHERE createdAt IS NULL OR createdAt = '0000-00-00 00:00:00' OR createdAt LIKE 'NOW%'")
        invalid_comments = cursor.fetchall()
        
        if invalid_comments:
            print(f"Found {len(invalid_comments)} comments with invalid dates")
            
            # 모든 댓글 날짜 수정
            print("Fixing all comment dates...")
            cursor.execute("UPDATE Comment SET createdAt = NOW() WHERE createdAt IS NULL OR createdAt = '0000-00-00 00:00:00' OR createdAt LIKE 'NOW%'")
            conn.commit()
            print(f"Fixed {cursor.rowcount} comment dates")
        else:
            print("No invalid comment dates found")
        
        # 사용자 날짜도 확인
        cursor.execute("SELECT id, createdAt FROM User WHERE createdAt IS NULL OR createdAt = '0000-00-00 00:00:00' OR createdAt LIKE 'NOW%'")
        invalid_users = cursor.fetchall()
        
        if invalid_users:
            print(f"Found {len(invalid_users)} users with invalid dates")
            
            # 모든 사용자 날짜 수정
            print("Fixing all user dates...")
            cursor.execute("UPDATE User SET createdAt = NOW() WHERE createdAt IS NULL OR createdAt = '0000-00-00 00:00:00' OR createdAt LIKE 'NOW%'")
            conn.commit()
            print(f"Fixed {cursor.rowcount} user dates")
        else:
            print("No invalid user dates found")
        
        print(f"\nDate values fix completed!")
        
        # 최종 상태 확인
        cursor.execute("SELECT COUNT(*) FROM Post")
        total_posts = cursor.fetchone()[0]
        print(f"Total posts: {total_posts}")
        
        cursor.execute("SELECT COUNT(*) FROM Comment")
        total_comments = cursor.fetchone()[0]
        print(f"Total comments: {total_comments}")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
