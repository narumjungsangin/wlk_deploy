"""
wlafayettekorea.org KBoard 게시판 크롤러
게시물 본문 + 댓글 포함, JSON으로 저장

Usage:
    pip install requests beautifulsoup4 lxml
    python scripts/crawl_legacy.py
"""

import sys
import io
import json
import time
import re
from datetime import datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# Windows 콘솔 인코딩 문제 해결
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

BASE_URL = "https://wlafayettekorea.org"

BOARDS = [
    {
        "name": "정보나눔터",
        "slug": "info",
        "url": f"{BASE_URL}/%ec%9e%90%ec%9c%a0%ea%b2%8c%ec%8b%9c%ed%8c%90/",
    },
    {
        "name": "직거래마당",
        "slug": "market",
        "url": f"{BASE_URL}/%ec%82%ac%ea%b3%a0%ed%8c%94%ea%b3%a0/",
    },
    {
        "name": "구인구직",
        "slug": "jobs",
        "url": f"{BASE_URL}/%ea%b5%ac%ec%9d%b8-%ea%b5%ac%ec%a7%81/",
    },
    {
        "name": "과외",
        "slug": "tutoring",
        "url": f"{BASE_URL}/%ea%b3%bc%ec%99%b8/",
    },
    {
        "name": "Housing",
        "slug": "housing",
        "url": f"{BASE_URL}/housing/",
    },
    {
        "name": "FAQ",
        "slug": "faq",
        "url": f"{BASE_URL}/elementor-%ed%8e%98%ec%9d%b4%ec%a7%80-286/",
    },
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
}

DELAY = 0.8  # seconds between requests


def get_soup(url: str) -> BeautifulSoup:
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.encoding = "utf-8"
    return BeautifulSoup(resp.text, "lxml")


# ---------------------------------------------------------------------------
# 게시판 목록 크롤링 (KBoard)
# ---------------------------------------------------------------------------

def get_post_links_from_list_page(soup: BeautifulSoup, board_url: str) -> list[dict]:
    """한 목록 페이지에서 게시물 링크 + uid 추출"""
    posts = []
    # KBoard list items: links with ?mod=document&uid=
    for a in soup.select("a[href*='mod=document']"):
        href = a.get("href", "")
        m = re.search(r"uid=(\d+)", href)
        if not m:
            continue
        uid = int(m.group(1))
        title = a.get_text(separator=" ", strip=True)
        # remove trailing comment count like "(2)"
        title = re.sub(r'\s*\(\d+\)\s*$', '', title).strip()
        full_url = href if href.startswith("http") else BASE_URL + href
        posts.append({"uid": uid, "title": title, "url": full_url})
    # deduplicate by uid
    seen = set()
    unique = []
    for p in posts:
        if p["uid"] not in seen:
            seen.add(p["uid"])
            unique.append(p)
    return unique


def get_total_pages(soup: BeautifulSoup) -> int:
    """페이지네이션에서 마지막 페이지 번호 추출"""
    last = soup.select_one("a[href*='pageid='][href*='mod=list']:last-child")
    if last:
        m = re.search(r"pageid=(\d+)", last.get("href", ""))
        if m:
            return int(m.group(1))
    # fallback: find all pageid links
    page_nums = [
        int(m.group(1))
        for a in soup.select("a[href*='pageid=']")
        if (m := re.search(r"pageid=(\d+)", a.get("href", "")))
    ]
    return max(page_nums) if page_nums else 1


def crawl_board_list(board: dict) -> list[dict]:
    """게시판의 모든 페이지를 순회하며 게시물 링크 수집"""
    print(f"\n[{board['name']}] 목록 크롤링 시작...")
    first_soup = get_soup(board["url"] + "?mod=list")
    total_pages = get_total_pages(first_soup)
    print(f"  총 {total_pages} 페이지")

    all_posts = get_post_links_from_list_page(first_soup, board["url"])

    for page in range(2, total_pages + 1):
        url = f"{board['url']}?pageid={page}&mod=list"
        soup = get_soup(url)
        posts = get_post_links_from_list_page(soup, board["url"])
        all_posts.extend(posts)
        print(f"  페이지 {page}/{total_pages}: {len(posts)}개 발견")
        time.sleep(DELAY)

    # deduplicate
    seen = set()
    unique = []
    for p in all_posts:
        if p["uid"] not in seen:
            seen.add(p["uid"])
            unique.append(p)

    print(f"  총 {len(unique)}개 게시물 발견")
    return unique


# ---------------------------------------------------------------------------
# 개별 게시물 + 댓글 크롤링
# ---------------------------------------------------------------------------

def parse_post_detail(soup: BeautifulSoup) -> dict:
    """게시물 상세 페이지에서 제목, 본문, 메타, 댓글 추출"""
    result = {
        "title": "",
        "author": "",
        "date": "",
        "category": "",
        "content": "",
        "comments": [],
        "raw_html": "",
    }

    # --- 제목 (h1 태그 직접 사용) ---
    title_el = soup.select_one(".kboard-document-wrap h1, h1")
    if title_el:
        result["title"] = title_el.get_text(strip=True)

    # --- 카테고리 ---
    cat_el = soup.select_one(".kboard-category-selected, .kboard-category")
    if cat_el:
        result["category"] = cat_el.get_text(strip=True)

    # --- 작성자 / 날짜: kboard-detail 내 첫 번째 정보 블록 ---
    detail_el = soup.select_one(".kboard-detail")
    if detail_el:
        # 작성자: 링크 또는 span 형태
        spans = detail_el.select("span, a")
        texts = [s.get_text(strip=True) for s in spans if s.get_text(strip=True)]
        if texts:
            result["author"] = texts[0]
        # 날짜: yyyy-mm-dd 패턴 찾기
        full_text = detail_el.get_text(" ", strip=True)
        date_m = re.search(r'(\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2})', full_text)
        if date_m:
            result["date"] = date_m.group(1).strip()

    # --- 본문 ---
    content_el = soup.select_one(".kboard-content")
    if content_el:
        result["content"] = content_el.get_text(separator="\n", strip=True)
        result["raw_html"] = str(content_el)

    # --- 댓글 ---
    comments = []
    comment_blocks = soup.select(".kboard-comments-item")
    for block in comment_blocks:
        writer_el = block.select_one(".comments-list-username")
        date_el2 = block.select_one(".comments-list-create")
        body_el = block.select_one(".comments-list-content")
        comment = {
            "author": writer_el.get_text(strip=True) if writer_el else "",
            "date": date_el2.get_text(strip=True) if date_el2 else "",
            "content": body_el.get_text(separator="\n", strip=True) if body_el else "",
        }
        if comment["content"]:
            comments.append(comment)

    result["comments"] = comments
    return result


def crawl_post(post_stub: dict) -> dict:
    """게시물 URL로 상세 정보 크롤링"""
    soup = get_soup(post_stub["url"])
    detail = parse_post_detail(soup)
    return {
        "uid": post_stub["uid"],
        "url": post_stub["url"],
        "title": detail["title"] or post_stub["title"],
        "author": detail["author"],
        "date": detail["date"],
        "category": detail["category"],
        "content": detail["content"],
        "raw_html": detail["raw_html"],
        "comments": detail["comments"],
    }


# ---------------------------------------------------------------------------
# FAQ / Elementor 페이지 (게시판 아님)
# ---------------------------------------------------------------------------

def crawl_faq_page(board: dict) -> list[dict]:
    """Elementor 기반 FAQ 페이지는 단일 페이지로 크롤링"""
    print(f"\n[{board['name']}] FAQ 페이지 크롤링...")
    soup = get_soup(board["url"])
    # Elementor accordion / toggle items
    items = []
    for el in soup.select(
        ".elementor-toggle-item, .elementor-accordion-item, "
        ".elementor-tab-content, article, section"
    ):
        text = el.get_text(separator="\n", strip=True)
        if len(text) > 30:
            items.append({"content": text, "raw_html": str(el)})

    if not items:
        # fallback: full page text
        body = soup.find("main") or soup.find("body")
        if body:
            items = [{"content": body.get_text(separator="\n", strip=True), "raw_html": ""}]

    print(f"  {len(items)}개 섹션 발견")
    return [{"uid": 0, "url": board["url"], "title": "FAQ", "author": "", "date": "", "category": "", "content": it["content"], "raw_html": it["raw_html"], "comments": []} for it in items]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    output_dir = Path("scripts/crawled_data")
    output_dir.mkdir(parents=True, exist_ok=True)

    all_results = {}
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    for board in BOARDS:
        board_slug = board["slug"]

        # FAQ는 별도 처리
        if board_slug == "faq":
            posts_data = crawl_faq_page(board)
            all_results[board_slug] = {
                "board_name": board["name"],
                "board_url": board["url"],
                "crawled_at": timestamp,
                "total_posts": len(posts_data),
                "posts": posts_data,
            }
            out_file = output_dir / f"{board_slug}.json"
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(all_results[board_slug], f, ensure_ascii=False, indent=2)
            print(f"  -> {out_file} 저장 완료")
            continue

        # 목록 수집
        post_stubs = crawl_board_list(board)

        # 상세 크롤링
        posts_data = []
        for i, stub in enumerate(post_stubs, 1):
            print(f"  [{i}/{len(post_stubs)}] uid={stub['uid']} {stub['title'][:40]}")
            try:
                post = crawl_post(stub)
                posts_data.append(post)
            except Exception as e:
                print(f"    ERROR: {e}")
                posts_data.append({**stub, "content": "", "raw_html": "", "comments": [], "author": "", "date": "", "category": "", "error": str(e)})
            time.sleep(DELAY)

        all_results[board_slug] = {
            "board_name": board["name"],
            "board_url": board["url"],
            "crawled_at": timestamp,
            "total_posts": len(posts_data),
            "posts": posts_data,
        }

        # 게시판별 JSON 저장
        out_file = output_dir / f"{board_slug}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(all_results[board_slug], f, ensure_ascii=False, indent=2)
        print(f"  -> {out_file} 저장 완료")

    # 전체 통합 JSON
    combined_file = output_dir / f"all_boards_{timestamp}.json"
    with open(combined_file, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\n전체 데이터 -> {combined_file}")

    # 요약 출력
    print("\n=== 크롤링 완료 ===")
    for slug, data in all_results.items():
        print(f"  {data['board_name']}: {data['total_posts']}개 게시물")


if __name__ == "__main__":
    main()
