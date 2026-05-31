#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
영어 카테고리로 완전 새 마이그레이션
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
        
        host_port = ''
        database = ''
        
        if '/' in host_part:
            host_port, database = host_part.split('/', 1)
        else:
            host_port = host_port
            
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
        print(f"DATABASE_URL parsing error: {e}")
        return None

def main():
    print("=== ENGLISH CATEGORIES MIGRATION ===\n")
    
    # .env 파일 로드
    load_dotenv()
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL not found.")
        return
    
    db_config = parse_database_url(database_url)
    if not db_config:
        return
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("Database connected!")
        
        # 모든 데이터 삭제
        print("Deleting all existing data...")
        cursor.execute("DELETE FROM Comment")
        cursor.execute("DELETE FROM Post")
        cursor.execute("DELETE FROM User WHERE email = 'admin@wlafayettekorea.org'")
        conn.commit()
        
        # 관리자 사용자 생성
        print("Creating admin user...")
        cursor.execute("""
            INSERT INTO User (id, email, password, displayName, firstName, lastName, role, emailVerified, createdAt) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, ('admin_legacy_user', 'admin@wlafayettekorea.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Admin', 'System', 'Administrator', 'ADMIN', 1))
        conn.commit()
        
        # 게시물 생성 (영어 카테고리)
        posts_data = [
            # Information
            ('legacy_info_1', 'Information', 'General', 'Piano Tuning', 'Mike Bratcher 317-371-5747. Professional piano tuning service in West Lafayette area.'),
            ('legacy_info_2', 'Information', 'General', 'Pest Control', 'Discussion about pest control services in West Lafayette community.'),
            ('legacy_info_3', 'Information', 'General', 'Dentist Recommendation', 'Looking for general dentist recommendations for regular checkup.'),
            
            # Jobs
            ('legacy_jobs_1', 'Jobs', None, 'Childcare Provider', 'Looking for experienced childcare provider in West Lafayette.'),
            ('legacy_jobs_2', 'Jobs', None, 'Admin Officer at West Lafayette School', 'West Lafayette School is hiring Admin Officer position.'),
            ('legacy_jobs_3', 'Jobs', None, 'English Translator', 'Looking for English translator available for part-time work.'),
            
            # Tutoring
            ('legacy_tutoring_1', 'Tutoring', None, 'Study Abroad Consulting', 'Study abroad consulting services available.'),
            ('legacy_tutoring_2', 'Tutoring', None, 'Math & Science Tutoring', 'Math and science tutoring for all levels.'),
            ('legacy_tutoring_3', 'Tutoring', None, 'Piano Lessons', 'Professional piano lessons available.'),
            ('legacy_tutoring_4', 'Tutoring', None, 'College Student Tutoring', 'Tutoring services for college students.'),
            
            # Housing
            ('legacy_housing_1', 'Housing', None, 'House for Rent', 'House available for rent in West Lafayette.'),
            ('legacy_housing_2', 'Housing', None, 'Apartment for Rent', 'Apartment for rent in West Lafayette area.'),
            ('legacy_housing_3', 'Housing', None, 'Room for Rent', 'Room available for rent near Purdue campus.'),
            
            # FAQ
            ('legacy_faq_1', 'FAQ', None, 'About West Lafayette Korean Community', 'Information about West Lafayette Korean Community website.'),
            ('legacy_faq_2', 'FAQ', None, 'Farmers Market Information', 'West Lafayette Farmers Market: Every Saturday 7:30 AM - 12:30 PM, May-October.'),
            ('legacy_faq_3', 'FAQ', None, 'Public Library Guide', 'How to use West Lafayette Public Library services.'),
            ('legacy_faq_4', 'FAQ', None, 'Korean Grocery Stores', 'Where to buy Korean groceries and food items.'),
            ('legacy_faq_5', 'FAQ', None, 'Church & Temple Information', 'Korean churches and temples in West Lafayette area.'),
            ('legacy_faq_6', 'FAQ', None, 'School District Information', 'West Lafayette school district and school information.'),
            ('legacy_faq_7', 'FAQ', None, 'Daycare Information', 'Daycare and childcare options in West Lafayette.')
        ]
        
        print("Creating posts with English categories...")
        for post_id, category, subcategory, title, content in posts_data:
            cursor.execute("""
                INSERT INTO Post (id, category, subCategory, title, content, authorId, viewCount, createdAt, updatedAt) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (post_id, category, subcategory, title, content, 'admin_legacy_user', 0))
        
        conn.commit()
        print("Posts created successfully!")
        
        # 최종 상태 확인
        cursor.execute("SELECT category, COUNT(*) as count FROM Post GROUP BY category")
        categories = cursor.fetchall()
        print(f"\nFinal posts by category:")
        for category, count in categories:
            print(f"- {category}: {count} posts")
        
        cursor.execute("SELECT COUNT(*) FROM Post")
        total_posts = cursor.fetchone()[0]
        print(f"Total posts: {total_posts}")
        
        print(f"\nMigration completed successfully!")
        print(f"Admin login: admin@wlafayettekorea.org / admin123")
        print(f"All categories are now in English and should be visible on the website!")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.rollback()
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
