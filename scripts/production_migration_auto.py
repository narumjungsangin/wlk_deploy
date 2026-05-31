#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
프로덕션 데이터베이스 마이그레이션 스크립트 (자동 실행)
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
        clean_url = url.replace('mysql://', '')
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
    print("=== 프로덕션 데이터베이스 마이그레이션 (자동) ===\n")
    
    # .env 파일 로드
    load_dotenv()
    
    # 데이터베이스 연결 정보 가져오기
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("오류: .env 파일에서 DATABASE_URL을 찾을 수 없습니다.")
        return
    
    print(f"호스트: {database_url.split('@')[1].split(':')[0]}")
    print(f"데이터베이스: {database_url.split('/')[-1]}")
    
    # 데이터베이스 연결 정보 파싱
    db_config = parse_database_url(database_url)
    if not db_config:
        return
    
    # 연결 및 마이그레이션
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("데이터베이스 연결 성공!")
        
        # 기존 데이터 확인
        cursor.execute("SELECT COUNT(*) FROM Post")
        post_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Comment")
        comment_count = cursor.fetchone()[0]
        
        print(f"현재 데이터: {post_count}개 게시물, {comment_count}개 댓글")
        
        if post_count > 0:
            print("기존 데이터 삭제...")
            cursor.execute("DELETE FROM Comment WHERE authorId = 'admin_legacy_user'")
            cursor.execute("DELETE FROM Post WHERE authorId = 'admin_legacy_user'")
            cursor.execute("DELETE FROM User WHERE id = 'admin_legacy_user'")
            conn.commit()
            print("기존 데이터 삭제 완료")
        
        # 마이그레이션 실행
        print("마이그레이션 실행...")
        
        # SQL 파일 읽기
        sql_file = Path(__file__).parent / 'migration.sql'
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # SQL 실행
        statements = sql_content.split(';')
        success_count = 0
        
        for statement in statements:
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                try:
                    cursor.execute(statement)
                    conn.commit()
                    success_count += 1
                except Exception as e:
                    if "Duplicate entry" not in str(e):
                        print(f"SQL 오류: {e}")
        
        # 결과 확인
        cursor.execute("SELECT COUNT(*) FROM Post")
        new_post_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Comment")
        new_comment_count = cursor.fetchone()[0]
        
        print(f"\n마이그레이션 완료!")
        print(f"총 게시물: {new_post_count}개")
        print(f"총 댓글: {new_comment_count}개")
        
        print(f"\n카테고리별 게시물:")
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        for row in cursor.fetchall():
            print(f"- {row[0]}: {row[1]}개")
        
        print(f"\n관리자 계정:")
        print(f"- 이메일: admin@wlafayettekorea.org")
        print(f"- 비밀번호: admin123")
        
    except Exception as e:
        print(f"오류: {e}")
        if 'conn' in locals():
            conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
