#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한글 SQL 직접 실행
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
    print("=== EXECUTE KOREAN SQL ===\n")
    
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
        
        # SQL 파일 읽기
        sql_file = Path(__file__).parent / "korean_migration.sql"
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # SQL 실행
        print("Executing Korean migration SQL...")
        cursor.execute(sql_content)
        conn.commit()
        
        print("SQL executed successfully!")
        
        # 최종 상태 확인
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        categories = cursor.fetchall()
        print(f"\nFinal posts by category:")
        for category, count in categories:
            print(f"- {category}: {count} posts")
        
        cursor.execute("SELECT COUNT(*) FROM Post")
        total_posts = cursor.fetchone()[0]
        print(f"Total posts: {total_posts}")
        
        print(f"\nKorean migration completed!")
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
