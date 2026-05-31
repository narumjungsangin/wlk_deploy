#!/usr/bin/env python3
"""
Docker로 마이그레이션 실행
"""

import subprocess
import sys
from pathlib import Path

def main():
    print("=== Docker로 데이터베이스 마이그레이션 실행 ===\n")
    
    # Docker가 실행 중인지 확인
    try:
        result = subprocess.run(['docker', 'ps'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Docker가 실행되고 있지 않습니다. Docker를 먼저 시작하세요.")
            return
    except FileNotFoundError:
        print("❌ Docker가 설치되지 않았습니다.")
        return
    
    print("1. Docker 컨테이너 시작...")
    try:
        # Docker Compose로 데이터베이스 시작
        subprocess.run(['docker-compose', 'up', '-d', 'db'], check=True)
        print("✅ 데이터베이스 컨테이너 시작 완료")
    except subprocess.CalledProcessError as e:
        print(f"❌ 컨테이너 시작 실패: {e}")
        return
    
    print("\n2. 5초 대기 (데이터베이스 초기화)...")
    import time
    time.sleep(5)
    
    print("\n3. 마이그레이션 실행...")
    try:
        # Docker 컨테이너 안에서 마이그레이션 실행
        cmd = [
            'docker', 'exec', '-i', 'wlafayettekorea-db',
            'mysql', '-u', 'wlk_user', '-pwlk_password', 'wlk_db'
        ]
        
        # SQL 파일 읽기
        sql_file = Path(__file__).parent / 'migration.sql'
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Docker 컨테이너에 SQL 전송
        process = subprocess.Popen(cmd, stdin=subprocess.PIPE, text=True)
        process.communicate(input=sql_content)
        
        if process.returncode == 0:
            print("✅ 마이그레이션 완료!")
            print("\n관리자 계정:")
            print("이메일: admin@wlafayettekorea.org")
            print("비밀번호: admin123")
        else:
            print("❌ 마이그레이션 실패")
            
    except Exception as e:
        print(f"❌ 마이그레이션 중 오류: {e}")

if __name__ == "__main__":
    main()
