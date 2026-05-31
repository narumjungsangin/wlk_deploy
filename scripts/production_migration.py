#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
프로덕션 데이터베이스 마이그레이션 스크립트
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
    # mysql://USER:PASSWORD@HOST:PORT/DATABASE
    try:
        # 'mysql://' 제거
        clean_url = url.replace('mysql://', '')
        
        # @로 분리하여 호스트/포트/데이터베이스와 사용자정보 분리
        user_part, host_part = clean_url.split('@')
        
        # 사용자정보 분리
        user, password = user_part.split(':')
        
        # 호스트/포트/데이터베이스 분리
        if '/' in host_part:
            host_port, database = host_part.split('/')
        else:
            host_port = host_part
            database = ''
            
        # 포트 분리
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
    print("=== 프로덕션 데이터베이스 마이그레이션 ===\n")
    
    # .env 파일 로드
    load_dotenv()
    
    # 데이터베이스 연결 정보 가져오기
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("오류: .env 파일에서 DATABASE_URL을 찾을 수 없습니다.")
        print(".env.example 파일을 복사하여 .env 파일을 만들고 실제 데이터베이스 정보를 입력하세요.")
        return
    
    print(f"DATABASE_URL: {database_url.replace(database_url.split('@')[0].split('//')[1], '***')}")
    
    # 데이터베이스 연결 정보 파싱
    db_config = parse_database_url(database_url)
    if not db_config:
        return
    
    print(f"호스트: {db_config['host']}")
    print(f"데이터베이스: {db_config['database']}")
    print(f"사용자: {db_config['user']}")
    
    # 연결 테스트
    print("\n1. 데이터베이스 연결 테스트...")
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("연결 성공!")
        
        # 기존 데이터 확인
        cursor.execute("SELECT COUNT(*) FROM Post")
        post_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Comment")
        comment_count = cursor.fetchone()[0]
        
        print(f"현재 데이터: {post_count}개 게시물, {comment_count}개 댓글")
        
        if post_count > 0:
            response = input("\n기존 데이터가 있습니다. 삭제하고 다시 마이그레이션하시겠습니까? (y/N): ")
            if response.lower() != 'y':
                print("마이그레이션을 취소합니다.")
                return
            
            # 기존 데이터 삭제
            print("기존 데이터 삭제...")
            cursor.execute("DELETE FROM Comment WHERE authorId = 'admin_legacy_user'")
            cursor.execute("DELETE FROM Post WHERE authorId = 'admin_legacy_user'")
            cursor.execute("DELETE FROM User WHERE id = 'admin_legacy_user'")
            conn.commit()
            print("기존 데이터 삭제 완료")
        
    except Exception as e:
        print(f"데이터베이스 연결 오류: {e}")
        print("데이터베이스 정보를 확인하고 다시 시도하세요.")
        return
    
    # 마이그레이션 실행
    print("\n2. 마이그레이션 실행...")
    try:
        # SQL 파일 읽기
        sql_file = Path(__file__).parent / 'migration.sql'
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # SQL을 여러 구문으로 나누어 실행
        statements = sql_content.split(';')
        success_count = 0
        error_count = 0
        
        for statement in statements:
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                try:
                    cursor.execute(statement)
                    conn.commit()
                    success_count += 1
                except Exception as e:
                    if "Duplicate entry" not in str(e):
                        print(f"SQL 실행 오류: {e}")
                        print(f"SQL: {statement[:100]}...")
                        error_count += 1
        
        print(f"마이그레이션 완료! (성공: {success_count}, 오류: {error_count})")
        
        # 결과 확인
        cursor.execute("SELECT COUNT(*) FROM Post")
        new_post_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Comment")
        new_comment_count = cursor.fetchone()[0]
        
        print(f"\n마이그레이션 결과:")
        print(f"- 총 게시물: {new_post_count}개")
        print(f"- 총 댓글: {new_comment_count}개")
        
        print(f"\n관리자 계정:")
        print(f"- 이메일: admin@wlafayettekorea.org")
        print(f"- 비밀번호: admin123")
        
        print(f"\n카테고리별 게시물:")
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        for row in cursor.fetchall():
            print(f"- {row[0]}: {row[1]}개")
        
    except Exception as e:
        print(f"마이그레이션 중 오류: {e}")
        conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
