import sys, io, json, requests, re, time
from bs4 import BeautifulSoup
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

HEADERS = {'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'ko-KR,ko;q=0.9'}
BASE = 'https://wlafayettekorea.org'

def get_soup(url):
    r = requests.get(url, headers=HEADERS, timeout=20)
    r.encoding = 'utf-8'
    return BeautifulSoup(r.text, 'lxml')

url = BASE + '/elementor-%ED%8E%98%EC%9D%B4%EC%A7%80-286/'
soup = get_soup(url)
stubs = []
for a in soup.select('a[href*="mod=document"]'):
    href = a.get('href', '')
    m = re.search(r'uid=(\d+)', href)
    if not m:
        continue
    title = a.get_text(strip=True)
    full_url = BASE + href if href.startswith('/') else href
    uid = int(m.group(1))
    stubs.append({'uid': uid, 'title': title, 'url': full_url})

seen = set()
unique = [s for s in stubs if not (s['uid'] in seen or seen.add(s['uid']))]
print(f'Found {len(unique)} FAQ posts')

results = []
for stub in unique:
    print(f"  uid={stub['uid']} {stub['title'][:50]}")
    ps = get_soup(stub['url'])
    content_el = ps.select_one('.kboard-content')
    content = content_el.get_text(separator='\n', strip=True) if content_el else ''
    raw_html = str(content_el) if content_el else ''

    detail_el = ps.select_one('.kboard-detail')
    author = ''
    date = ''
    if detail_el:
        full_text = detail_el.get_text(' ', strip=True)
        dm = re.search(r'(\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2})', full_text)
        if dm:
            date = dm.group(1).strip()
        spans = detail_el.select('span, a')
        texts = [s.get_text(strip=True) for s in spans if s.get_text(strip=True)]
        if texts:
            author = texts[0]

    comments = []
    for block in ps.select('.kboard-comments-item'):
        w = block.select_one('.comments-list-username')
        d = block.select_one('.comments-list-create')
        b = block.select_one('.comments-list-content')
        c = {
            'author': w.get_text(strip=True) if w else '',
            'date': d.get_text(strip=True) if d else '',
            'content': b.get_text(separator='\n', strip=True) if b else '',
        }
        if c['content']:
            comments.append(c)

    results.append({
        'uid': stub['uid'],
        'url': stub['url'],
        'title': stub['title'],
        'author': author,
        'date': date,
        'category': '',
        'content': content,
        'raw_html': raw_html,
        'comments': comments,
    })
    time.sleep(0.8)

out = {
    'board_name': 'FAQ',
    'board_url': url,
    'total_posts': len(results),
    'posts': results,
}
with open('scripts/crawled_data/faq.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print(f'Saved {len(results)} FAQ posts')
