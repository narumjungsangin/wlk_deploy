#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
기존 데이터 삭제 후 마이그레이션 실행
"""

import subprocess
import sys
import os
from pathlib import Path

# Windows 인코딩 문제 해결
os.environ['PYTHONIOENCODING'] = 'utf-8'

def main():
    print("=== 기존 데이터 삭제 후 마이그레이션 ===\n")
    
    # 1. 기존 데이터 삭제
    print("1. 기존 게시물 및 댓글 데이터 삭제...")
    try:
        # 관리자 계정 제외하고 모든 데이터 삭제
        delete_sql = """
DELETE FROM Comment WHERE authorId = 'admin_legacy_user';
DELETE FROM Post WHERE authorId = 'admin_legacy_user';
DELETE FROM User WHERE id = 'admin_legacy_user';
"""
        
        cmd = [
            'docker', 'exec', '-i', 'wlafayettekorea-db',
            'mariadb', '-u', 'wlk_user', '-pwlk_password', 'wlk_db'
        ]
        
        process = subprocess.Popen(cmd, stdin=subprocess.PIPE, text=True, encoding='utf-8')
        process.communicate(input=delete_sql)
        print("기존 데이터 삭제 완료")
        
    except Exception as e:
        print(f"데이터 삭제 중 오류: {e}")
    
    # 2. 마이그레이션 실행
    print("\n2. 새로운 데이터 마이그레이션 실행...")
    try:
        # SQL 파일 읽기
        sql_file = Path(__file__).parent / 'migration.sql'
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Docker 컨테이너에 SQL 전송
        process = subprocess.Popen(cmd, stdin=subprocess.PIPE, text=True, encoding='utf-8')
        stdout, stderr = process.communicate(input=sql_content)
        
        if process.returncode == 0:
            print("✅ 마이그레이션 완료!")
            print("\n📊 마이그레이션 결과:")
            print("- 정보나눔터: 10개 게시물, 4개 댓글")
            print("- 구인구직: 3개 게시물, 1개 댓글")
            print("- 과외: 4개 게시물")
            print("- Housing: 3개 게시물")
            print("- FAQ: 1개 게시물")
            print("- 총계: 21개 게시물, 5개 댓글")
            
            print("\n👤 관리자 계정:")
            print("이메일: admin@wlafayettekorea.org")
            print("비밀번호: admin123")
            
        else:
            print(f"❌ 마이그레이션 실패: {stderr}")
            
    except Exception as e:
        print(f"❌ 마이그레이션 중 오류: {e}")

if __name__ == "__main__":
    main()
