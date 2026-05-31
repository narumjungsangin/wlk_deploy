#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Docker로 마이그레이션 실행 (수정판)
"""

import subprocess
import sys
import os
from pathlib import Path

# Windows 인코딩 문제 해결
os.environ['PYTHONIOENCODING'] = 'utf-8'

def main():
    print("=== Docker로 데이터베이스 마이그레이션 실행 ===\n")
    
    # Docker가 실행 중인지 확인
    try:
        result = subprocess.run(['docker', 'ps'], capture_output=True, text=True, encoding='utf-8')
        if result.returncode != 0:
            print("Docker가 실행되고 있지 않습니다. Docker를 먼저 시작하세요.")
            return
    except FileNotFoundError:
        print("Docker가 설치되지 않았습니다.")
        return
    
    print("1. Docker 컨테이너 시작...")
    try:
        # Docker Compose로 데이터베이스 시작
        subprocess.run(['docker-compose', 'up', '-d', 'db'], check=True, encoding='utf-8')
        print("데이터베이스 컨테이너 시작 완료")
    except subprocess.CalledProcessError as e:
        print(f"컨테이너 시작 실패: {e}")
        return
    
    print("\n2. 10초 대기 (데이터베이스 초기화)...")
    import time
    time.sleep(10)
    
    print("\n3. MariaDB 클라이언트로 마이그레이션 실행...")
    try:
        # Docker 컨테이너 안에서 mariadb 클라이언트 사용
        cmd = [
            'docker', 'exec', '-i', 'wlafayettekorea-db',
            'mariadb', '-u', 'wlk_user', '-pwlk_password', 'wlk_db'
        ]
        
        # SQL 파일 읽기
        sql_file = Path(__file__).parent / 'migration.sql'
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Docker 컨테이너에 SQL 전송
        process = subprocess.Popen(cmd, stdin=subprocess.PIPE, text=True, encoding='utf-8')
        stdout, stderr = process.communicate(input=sql_content)
        
        if process.returncode == 0:
            print("마이그레이션 완료!")
            print("\n관리자 계정:")
            print("이메일: admin@wlafayettekorea.org")
            print("비밀번호: admin123")
        else:
            print(f"마이그레이션 실패: {stderr}")
            
    except Exception as e:
        print(f"마이그레이션 중 오류: {e}")
        
        # 대안: 직접 SQL 파일을 컨테이너에 복사하고 실행
        print("\n대체 방법 시도...")
        try:
            # SQL 파일을 컨테이너에 복사
            subprocess.run([
                'docker', 'cp', 
                str(Path(__file__).parent / 'migration.sql'),
                'wlafayettekorea-db:/tmp/migration.sql'
            ], check=True)
            
            # 컨테이너 안에서 SQL 실행
            subprocess.run([
                'docker', 'exec', 'wlafayettekorea-db',
                'sh', '-c',
                'mariadb -u wlk_user -pwlk_password wlk_db < /tmp/migration.sql'
            ], check=True)
            
            print("대체 방법으로 마이그레이션 완료!")
            print("\n관리자 계정:")
            print("이메일: admin@wlafayettekorea.org")
            print("비밀번호: admin123")
            
        except Exception as e2:
            print(f"대체 방법도 실패: {e2}")

if __name__ == "__main__":
    main()
