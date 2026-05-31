#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vercel용 데이터베이스 마이그레이션 스크립트
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
            host_port = host_part
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
    print("=== Vercel 데이터베이스 마이그레이션 ===\n")
    
    # .env 파일 로드
    load_dotenv()
    
    # 데이터베이스 연결 정보 가져오기
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("오류: .env 파일에서 DATABASE_URL을 찾을 수 없습니다.")
        return
    
    db_config = parse_database_url(database_url)
    if not db_config:
        return
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("Vercel 데이터베이스 연결 성공!")
        
        # 기존 데이터 삭제
        print("기존 데이터 삭제...")
        cursor.execute("DELETE FROM Comment WHERE authorId = 'admin_legacy_user'")
        cursor.execute("DELETE FROM Post WHERE authorId = 'admin_legacy_user'")
        cursor.execute("DELETE FROM User WHERE id = 'admin_legacy_user'")
        conn.commit()
        print("기존 데이터 삭제 완료")
        
        # 관리자 사용자 생성
        print("관리자 사용자 생성...")
        admin_user_sql = """
INSERT INTO User (id, email, password, displayName, firstName, lastName, role, emailVerified, createdAt) 
VALUES (
    'admin_legacy_user',
    'admin@wlafayettekorea.org',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm',
    '운영자',
    '시스템',
    '관리자',
    'ADMIN',
    1,
    NOW()
)
"""
        cursor.execute(admin_user_sql)
        conn.commit()
        print("관리자 사용자 생성 완료")
        
        # 게시물 및 댓글 삽입
        print("게시물 및 댓글 삽입...")
        
        # 수정된 SQL 파일 읽기
        sql_file = Path(__file__).parent / 'migration_fixed.sql'
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # SQL 실행
        statements = sql_content.split(';')
        success_count = 0
        
        for statement in statements:
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                # 사용자 생성 SQL은 건너뛰기
                if 'INSERT INTO User' in statement:
                    continue
                    
                try:
                    cursor.execute(statement)
                    conn.commit()
                    success_count += 1
                except Exception as e:
                    if "Duplicate entry" not in str(e):
                        print(f"SQL 오류: {e}")
        
        # 결과 확인
        cursor.execute("SELECT COUNT(*) FROM Post")
        post_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Comment")
        comment_count = cursor.fetchone()[0]
        
        print(f"\n마이그레이션 완료!")
        print(f"성공: {success_count}개 SQL 실행")
        print(f"총 게시물: {post_count}개")
        print(f"총 댓글: {comment_count}개")
        
        print(f"\n카테고리별 게시물:")
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        for row in cursor.fetchall():
            print(f"- {row[0]}: {row[1]}개")
        
        print(f"\n관리자 계정:")
        print(f"- 이메일: admin@wlafayettekorea.org")
        print(f"- 비밀번호: admin123")
        
        print(f"\n이제 Vercel 사이트에서 로그인하여 데이터를 확인하세요!")
        
    except Exception as e:
        print(f"오류: {e}")
        if 'conn' in locals():
            conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
