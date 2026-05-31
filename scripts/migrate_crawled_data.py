#!/usr/bin/env python3
"""
Migration script to import crawled legacy data into the new website database
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime
import re
from bs4 import BeautifulSoup

# Add parent directory to path to import database modules
sys.path.append(str(Path(__file__).parent.parent))

# Database imports will be added after we create the database connection
import asyncio
import prisma
from prisma import Prisma

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

def parse_date(date_str: str) -> datetime:
    """Parse legacy date format to datetime"""
    if not date_str:
        return datetime.now()
    
    # Handle format like "2026-04-22 00:15"
    try:
        return datetime.strptime(date_str.strip(), "%Y-%m-%d %H:%M")
    except ValueError:
        # Fallback to current time if parsing fails
        return datetime.now()

async def create_admin_user(prisma_client: Prisma) -> str:
    """Create or get admin user for legacy posts"""
    admin_email = "admin@wlafayettekorea.org"
    
    # Check if admin user exists
    existing_admin = await prisma_client.user.find_unique(
        where={"email": admin_email}
    )
    
    if existing_admin:
        return existing_admin.id
    
    # Create new admin user
    import bcrypt
    
    hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    admin_user = await prisma_client.user.create({
        "email": admin_email,
        "password": hashed_password,
        "displayName": "운영자",
        "firstName": "시스템",
        "lastName": "관리자",
        "role": "ADMIN",
        "emailVerified": True
    })
    
    return admin_user.id

async def migrate_board(prisma_client: Prisma, board_slug: str, board_data: dict, admin_user_id: str):
    """Migrate a single board's data"""
    print(f"\n[{board_data['board_name']}] 마이그레이션 시작...")
    
    posts = board_data.get('posts', [])
    if not posts:
        print("  마이그레이션할 게시물이 없습니다.")
        return
    
    board_mapping = BOARD_MAPPING.get(board_slug, {"category": "기타", "subCategory": None})
    
    migrated_count = 0
    error_count = 0
    
    for i, post in enumerate(posts, 1):
        try:
            # Clean and prepare content
            content = clean_html_content(post.get('raw_html', '')) or post.get('content', '')
            
            # Parse date
            created_at = parse_date(post.get('date', ''))
            
            # Create post
            new_post = await prisma_client.post.create({
                "category": board_mapping["category"],
                "subCategory": board_mapping["subCategory"],
                "title": post.get('title', '')[:255],  # Ensure title length
                "content": content,
                "authorId": admin_user_id,
                "createdAt": created_at,
                "updatedAt": datetime.now()
            })
            
            # Create comments if any
            comments = post.get('comments', [])
            for comment in comments:
                if comment.get('content', '').strip():
                    await prisma_client.comment.create({
                        "content": comment['content'],
                        "postId": new_post.id,
                        "authorId": admin_user_id,
                        "createdAt": parse_date(comment.get('date', ''))
                    })
            
            migrated_count += 1
            print(f"  [{i}/{len(posts)}] '{post.get('title', '')[:30]}...' 마이그레이션 완료")
            
        except Exception as e:
            error_count += 1
            print(f"  [{i}/{len(posts)}] ERROR: {e}")
            continue
    
    print(f"  완료: {migrated_count}개 성공, {error_count}개 실패")

async def main():
    """Main migration function"""
    print("데이터 마이그레이션 시작...")
    
    # Initialize Prisma client
    prisma_client = Prisma()
    await prisma_client.connect()
    
    try:
        # Create admin user
        admin_user_id = await create_admin_user(prisma_client)
        print(f"관리자 사용자 생성 완료: {admin_user_id}")
        
        # Load crawled data
        data_dir = Path(__file__).parent / "crawled_data"
        all_boards_file = data_dir / "all_boards_20260521_154418.json"
        
        if not all_boards_file.exists():
            print(f"오류: 크롤링 데이터 파일을 찾을 수 없습니다: {all_boards_file}")
            return
        
        with open(all_boards_file, 'r', encoding='utf-8') as f:
            all_data = json.load(f)
        
        # Migrate each board
        for board_slug, board_data in all_data.items():
            await migrate_board(prisma_client, board_slug, board_data, admin_user_id)
        
        print("\n=== 마이그레이션 완료 ===")
        
        # Print summary
        total_posts = await prisma_client.post.count()
        total_comments = await prisma_client.comment.count()
        print(f"총 게시물: {total_posts}개")
        print(f"총 댓글: {total_comments}개")
        
    except Exception as e:
        print(f"마이그레이션 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await prisma_client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
