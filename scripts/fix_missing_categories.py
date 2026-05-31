#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
누락된 카테고리 데이터 마이그레이션
"""

import mysql.connector
import sys
import os
import json
from pathlib import Path
from dotenv import load_dotenv
import re
from bs4 import BeautifulSoup

# Windows 인코딩 문제 해결
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Board mapping
BOARD_MAPPING = {
    "info": {
        "category": "정보나눔터",
        "subCategory": "자유게시판"
    },
    "jobs": {
        "category": "구인구직",
        "subCategory": None
    },
    "tutoring": {
        "category": "과외",
        "subCategory": None
    },
    "faq": {
        "category": "FAQ",
        "subCategory": None
    }
}

def parse_database_url(url):
    """DATABASE_URL 파싱"""
    try:
        clean_url = url.replace('mysql://', '').replace('mariadb://', '')
        user_part, host_part = clean_url.split('@')
        user, password = user_part.split(':')
        
        if '/' in host_part:
            host_port, database = host_part.split('/')
        else:
            host_port = host_port
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

def clean_html_content(raw_html: str) -> str:
    """HTML을 텍스트로 정리"""
    if not raw_html:
        return ""
    
    soup = BeautifulSoup(raw_html, 'html.parser')
    for script in soup(["script", "style"]):
        script.decompose()
    
    text = soup.get_text(separator='\n', strip=True)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return '\n'.join(lines)

def escape_sql_string(text: str) -> str:
    """SQL 문자열 이스케이프"""
    if not text:
        return "NULL"
    escaped = text.replace("'", "''").replace("\\", "\\\\")
    return f"'{escaped}'"

def main():
    print("=== 누락된 카테고리 마이그레이션 ===\n")
    
    # .env 파일 로드
    load_dotenv()
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("오류: DATABASE_URL을 찾을 수 없습니다.")
        return
    
    db_config = parse_database_url(database_url)
    if not db_config:
        return
    
    # 크롤링 데이터 로드
    data_dir = Path(__file__).parent / "crawled_data"
    all_boards_file = data_dir / "all_boards_20260521_154418.json"
    
    if not all_boards_file.exists():
        print(f"오류: 크롤링 데이터 파일을 찾을 수 없습니다.")
        return
    
    with open(all_boards_file, 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("데이터베이스 연결 성공!")
        
        admin_id = "admin_legacy_user"
        
        # 각 카테고리별로 마이그레이션
        for board_slug, board_data in all_data.items():
            if board_slug == "housing":  # Housing은 이미 됨
                continue
                
            if board_slug not in BOARD_MAPPING:
                continue
                
            print(f"\n[{board_data['board_name']}] 마이그레이션 시작...")
            
            posts = board_data.get('posts', [])
            if not posts:
                print("게시물 없음")
                continue
            
            board_mapping = BOARD_MAPPING[board_slug]
            success_count = 0
            
            for post in posts:
                try:
                    # 내용 정리
                    content = clean_html_content(post.get('raw_html', '')) or post.get('content', '')
                    if not content or content.strip() == '':
                        content = "내용 없음"
                    
                    title = post.get('title', '')[:200]  # 길이 제한
                    post_id = f"legacy_{board_slug}_{post.get('uid', 'unknown')}"
                    
                    # 날짜 파싱
                    date_str = post.get('date', '')
                    if date_str:
                        try:
                            from datetime import datetime
                            dt = datetime.strptime(date_str.strip(), "%Y-%m-%d %H:%M")
                            created_at = f"'{dt.strftime('%Y-%m-%d %H:%M:%S')}'"
                        except:
                            created_at = "NOW()"
                    else:
                        created_at = "NOW()"
                    
                    # 게시물 삽입
                    post_sql = f"""
INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
VALUES (
    '{post_id}',
    {escape_sql_string(board_mapping["category"])},
    {escape_sql_string(board_mapping["subCategory"])},
    {escape_sql_string(title)},
    {escape_sql_string(content)},
    '{admin_id}',
    0,
    {created_at},
    NOW()
)
"""
                    cursor.execute(post_sql)
                    conn.commit()
                    success_count += 1
                    
                    # 댓글 삽입
                    comments = post.get('comments', [])
                    for i, comment in enumerate(comments):
                        if comment.get('content', '').strip():
                            comment_id = f"{post_id}_comment_{i}"
                            comment_sql = f"""
INSERT INTO Comment (id, content, postId, authorId, createdAt) 
VALUES (
    '{comment_id}',
    {escape_sql_string(comment['content'])},
    '{post_id}',
    '{admin_id}',
    NOW()
)
"""
                            cursor.execute(comment_sql)
                            conn.commit()
                    
                    print(f"  ✓ {post.get('title', '')[:30]}...")
                    
                except Exception as e:
                    if "Duplicate entry" not in str(e):
                        print(f"  ✗ 오류: {e}")
            
            print(f"  {board_data['board_name']}: {success_count}개 성공")
        
        # 최종 결과 확인
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        print(f"\n최종 결과:")
        for row in cursor.fetchall():
            print(f"- {row[0]}: {row[1]}개 게시물")
        
        cursor.execute("SELECT COUNT(*) FROM Comment")
        comment_count = cursor.fetchone()[0]
        print(f"- 총 댓글: {comment_count}개")
        
    except Exception as e:
        print(f"오류: {e}")
        if 'conn' in locals():
            conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
