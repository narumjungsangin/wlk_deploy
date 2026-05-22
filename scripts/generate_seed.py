"""
크롤링 JSON -> src/lib/seed-data.ts 생성
"""
import sys, io, json, re
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BOARD_SLUG_MAP = {
    'info': 'info',
    'market': 'market',
    'jobs': 'jobs',
    'tutoring': 'tutoring',
    'housing': 'housing',
    'faq': 'faq',
}

SUBCAT_MAP = {
    'tutoring': {
        '과외교사 홍보 양식': 'offer-tutor',
        '영어 원어민 과외 선생님': 'offer-tutor',
        '메쓰존 튜터 (그룹&개인)': 'offer-tutor',
        '수학 과외 안내': 'offer-tutor',
    },
    'housing': {
        '렌트': 'rent',
        '서브리스': 'sublease',
        '집매매': 'sale',
        '기타': 'etc',
    }
}

def parse_date(date_str):
    """'2026-04-22 00:15' -> '2026-04-22T00:15:00Z'"""
    if not date_str:
        return '2025-01-01T00:00:00Z'
    date_str = date_str.strip()
    m = re.match(r'(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})', date_str)
    if m:
        return f"{m.group(1)}T{m.group(2)}:00Z"
    m2 = re.match(r'(\d{4}-\d{2}-\d{2})', date_str)
    if m2:
        return f"{m2.group(1)}T00:00:00Z"
    return '2025-01-01T00:00:00Z'

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

def main():
    data_dir = Path('scripts/crawled_data')

    # 최신 all_boards JSON 로드 + faq.json으로 덮어쓰기
    all_json = sorted(data_dir.glob('all_boards_*.json'))[-1]
    with open(all_json, encoding='utf-8') as f:
        all_data = json.load(f)

    with open(data_dir / 'faq.json', encoding='utf-8') as f:
        all_data['faq'] = json.load(f)

    posts_ts = []
    comments_ts = []
    post_id = 1

    for board_slug, board_data in all_data.items():
        cat_slug = BOARD_SLUG_MAP.get(board_slug, board_slug)
        for post in board_data.get('posts', []):
            if not post.get('title'):
                continue

            pid = str(post_id)
            title = escape_ts(post.get('title', ''))
            content = escape_ts(post.get('content', ''))
            author_name = escape_ts(post.get('author', '') or '운영자')
            created = parse_date(post.get('date', ''))
            comment_list = post.get('comments', [])
            comment_count = len(comment_list)

            subcat = ''
            if cat_slug in SUBCAT_MAP:
                subcat = f"  subCategory: 'offer-tutor'," if cat_slug == 'tutoring' else ''

            post_entry = f"""  {{
    id: '{pid}',
    category: '{cat_slug}',
    title: `{title}`,
    content: `{content}`,
    authorId: 'legacy',
    author: {{ id: 'legacy', displayName: `{author_name}` }},
    viewCount: 0,
    commentCount: {comment_count},
    createdAt: '{created}',
    updatedAt: '{created}',
  }}"""
            posts_ts.append(post_entry)

            for ci, c in enumerate(comment_list):
                c_author = escape_ts(c.get('author', '') or '익명')
                c_content = escape_ts(c.get('content', ''))
                c_date = parse_date(c.get('date', ''))
                comment_entry = f"""  {{
    id: 'c{post_id}_{ci+1}',
    postId: '{pid}',
    authorId: 'legacy',
    author: {{ id: 'legacy', displayName: `{c_author}` }},
    content: `{c_content}`,
    createdAt: '{c_date}',
  }}"""
                comments_ts.append(comment_entry)

            post_id += 1

    out_path = Path('src/lib/seed-data.ts')
    lines = []
    lines.append("import type { Post, Comment } from '@/types';\n\n")
    lines.append("export const SEED_POSTS: Post[] = [\n")
    lines.append(',\n'.join(posts_ts))
    lines.append('\n];\n\n')
    lines.append("export const SEED_COMMENTS: Comment[] = [\n")
    lines.append(',\n'.join(comments_ts))
    lines.append('\n];\n')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(''.join(lines))

    print(f"Generated {post_id-1} posts, {len(comments_ts)} comments -> {out_path}")

if __name__ == '__main__':
    main()
