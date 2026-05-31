#!/usr/bin/env python3
"""
Generate SQL migration script from crawled data (Fixed for foreign key constraints)
"""

import json
import sys
from pathlib import Path
from datetime import datetime
import re
from bs4 import BeautifulSoup

# Board mapping from legacy to new categories
BOARD_MAPPING = {
    "info": {
        "category": "정보나눔터",
        "subCategory": "자유게시판"
    },
    "market": {
        "category": "직거래마당", 
        "subCategory": "사고팔고"
    },
    "jobs": {
        "category": "구인구직",
        "subCategory": None
    },
    "tutoring": {
        "category": "과외",
        "subCategory": None
    },
    "housing": {
        "category": "Housing",
        "subCategory": None
    },
    "faq": {
        "category": "FAQ",
        "subCategory": None
    }
}

def clean_html_content(raw_html: str) -> str:
    """Clean and convert HTML content to plain text"""
    if not raw_html:
        return ""
    
    soup = BeautifulSoup(raw_html, 'html.parser')
    
    # Remove script and style elements
    for script in soup(["script", "style"]):
        script.decompose()
    
    # Get text content
    text = soup.get_text(separator='\n', strip=True)
    
    # Clean up extra whitespace
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    return '\n'.join(lines)

def escape_sql_string(text: str) -> str:
    """Escape string for SQL"""
    if not text:
        return "NULL"
    # Replace single quotes with two single quotes
    escaped = text.replace("'", "''").replace("\\", "\\\\")
    return f"'{escaped}'"

def parse_date(date_str: str) -> str:
    """Parse legacy date format to MySQL datetime string"""
    if not date_str:
        return "NOW()"
    
    # Handle format like "2026-04-22 00:15"
    try:
        dt = datetime.strptime(date_str.strip(), "%Y-%m-%d %H:%M")
        return f"'{dt.strftime('%Y-%m-%d %H:%M:%S')}'"
    except ValueError:
        return "NOW()"

def generate_user_sql() -> str:
    """Generate SQL for admin user"""
    admin_email = "admin@wlafayettekorea.org"
    admin_id = "admin_legacy_user"
    
    sql = f"""
-- Create admin user for legacy posts
INSERT IGNORE INTO User (id, email, password, displayName, firstName, lastName, role, emailVerified, createdAt) 
VALUES (
    '{admin_id}',
    '{admin_email}',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- admin123
    '운영자',
    '시스템',
    '관리자',
    'ADMIN',
    1,
    NOW()
);
"""
    return sql

def generate_posts_sql(board_slug: str, board_data: dict) -> str:
    """Generate SQL for posts and comments"""
    posts = board_data.get('posts', [])
    if not posts:
        return ""
    
    board_mapping = BOARD_MAPPING.get(board_slug, {"category": "기타", "subCategory": None})
    admin_id = "admin_legacy_user"
    
    sql_statements = []
    sql_statements.append(f"\n-- {board_data['board_name']} posts")
    
    for post in posts:
        # Clean and prepare content
        content = clean_html_content(post.get('raw_html', '')) or post.get('content', '')
        if not content or content.strip() == '':
            content = "내용 없음"
        
        title = post.get('title', '')[:255]  # Ensure title length
        
        # Generate a unique ID for the post
        post_id = f"legacy_{board_slug}_{post.get('uid', 'unknown')}"
        
        # Parse date
        created_at = parse_date(post.get('date', ''))
        
        # Create post SQL
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
);
"""
        sql_statements.append(post_sql)
        
        # Create comments if any
        comments = post.get('comments', [])
        for i, comment in enumerate(comments):
            if comment.get('content', '').strip():
                comment_id = f"{post_id}_comment_{i}"
                comment_created_at = parse_date(comment.get('date', ''))
                
                comment_sql = f"""
INSERT INTO Comment (id, content, postId, authorId, createdAt) 
VALUES (
    '{comment_id}',
    {escape_sql_string(comment['content'])},
    '{post_id}',
    '{admin_id}',
    {comment_created_at}
);
"""
                sql_statements.append(comment_sql)
    
    return '\n'.join(sql_statements)

def main():
    """Generate migration SQL"""
    print("SQL 마이그레이션 스크립트 생성 시작...")
    
    # Load crawled data
    data_dir = Path(__file__).parent / "crawled_data"
    all_boards_file = data_dir / "all_boards_20260521_154418.json"
    
    if not all_boards_file.exists():
        print(f"오류: 크롤링 데이터 파일을 찾을 수 없습니다: {all_boards_file}")
        return
    
    with open(all_boards_file, 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    # Generate SQL in correct order
    sql_statements = []
    sql_statements.append("-- Migration SQL for legacy data (Fixed)")
    sql_statements.append(f"-- Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_statements.append("")
    
    # 1. Add admin user first
    sql_statements.append(generate_user_sql())
    
    # 2. Add posts for each board
    total_posts = 0
    total_comments = 0
    
    for board_slug, board_data in all_data.items():
        print(f"[{board_data['board_name']}] SQL 생성 중...")
        posts_sql = generate_posts_sql(board_slug, board_data)
        if posts_sql:
            sql_statements.append(posts_sql)
            
            posts_count = len(board_data.get('posts', []))
            comments_count = sum(len(post.get('comments', [])) for post in board_data.get('posts', []))
            total_posts += posts_count
            total_comments += comments_count
            print(f"  {posts_count}개 게시물, {comments_count}개 댓글")
    
    # Write SQL file
    output_file = Path(__file__).parent / "migration_fixed.sql"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))
    
    print(f"\n=== SQL 마이그레이션 스크립트 생성 완료 ===")
    print(f"파일: {output_file}")
    print(f"총 게시물: {total_posts}개")
    print(f"총 댓글: {total_comments}개")
    print(f"\n사용법:")
    print(f"1. 데이터베이스에 연결")
    print(f"2. mysql -u username -p database_name < scripts/migration_fixed.sql")

if __name__ == "__main__":
    main()
