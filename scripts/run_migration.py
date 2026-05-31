#!/usr/bin/env python3
"""
간단한 마이그레이션 실행 도우미
"""

import os
import subprocess
from pathlib import Path

def main():
    print("=== 데이터베이스 마이그레이션 실행 ===\n")
    
    # .env 파일에서 데이터베이스 정보 읽기
    env_file = Path(__file__).parent.parent / ".env"
    
    if not env_file.exists():
        print("❌ .env 파일을 찾을 수 없습니다.")
        print("프로젝트 루트에 .env 파일이 있는지 확인하세요.")
        return
    
    # .env 파일 내용 출력 (비밀번호 제외)
    print("📁 현재 .env 파일 설정:")
    with open(env_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for line in lines:
            if '=' in line and not line.strip().startswith('#'):
                key, value = line.split('=', 1)
                if 'PASSWORD' in key.upper():
                    print(f"   {key}=*** (숨겨짐)")
                else:
                    print(f"   {key}={value.strip()}")
    
    print("\n" + "="*50)
    print("📋 마이그레이션 실행 방법:")
    print("="*50)
    
    print("\n방법 1: 직접 MySQL 명령어 실행")
    print("----------------------------")
    print("1. 터미널을 열고 다음 명령어를 실행하세요:")
    print("   mysql -u [사용자이름] -p [데이터베이스이름] < scripts/migration.sql")
    print("\n2. 예시:")
    print("   mysql -u root -p wlk_database < scripts/migration.sql")
    print("   (비밀번호를 입력하라는 프롬프트가 나오면 입력하세요)")
    
    print("\n방법 2: 데이터베이스 관리 툴 사용")
    print("----------------------------")
    print("1. phpMyAdmin, DBeaver, MySQL Workbench 등을 열세요")
    print("2. 데이터베이스에 연결하세요")
    print("3. SQL 탭을 열고 scripts/migration.sql 파일 내용을 복사해서 실행하세요")
    
    print("\n방법 3: Python으로 실행 (권장하지 않음)")
    print("----------------------------")
    print("아래 스크립트를 수정해서 직접 실행할 수도 있습니다:")
    
    # Python 실행 스크립트 생성
    python_script = '''
import mysql.connector
from pathlib import Path

# 여기에 실제 데이터베이스 정보를 입력하세요
config = {
    'user': 'your_username',
    'password': 'your_password', 
    'host': 'localhost',
    'database': 'your_database'
}

try:
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    
    with open('scripts/migration.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    # SQL을 여러 구문으로 나누어 실행
    statements = sql_script.split(';')
    for statement in statements:
        if statement.strip():
            cursor.execute(statement)
    
    conn.commit()
    print("✅ 마이그레이션 완료!")
    
except Exception as e:
    print(f"❌ 오류: {e}")
finally:
    if 'conn' in locals():
        conn.close()
'''
    
    script_file = Path(__file__).parent / "run_mysql_migration.py"
    with open(script_file, 'w', encoding='utf-8') as f:
        f.write(python_script)
    
    print(f"   생성된 파일: {script_file}")
    print("   파일을 열고 데이터베이스 정보를 수정한 후 실행하세요")
    
    print("\n" + "="*50)
    print("⚠️  중요:")
    print("- 마이그레이션 전에 데이터베이스를 백업하세요")
    print("- 관리자 계정: admin@wlafayettekorea.org / admin123")
    print("- 총 21개 게시물, 5개 댓글이 마이그레이션됩니다")
    print("="*50)

if __name__ == "__main__":
    main()
