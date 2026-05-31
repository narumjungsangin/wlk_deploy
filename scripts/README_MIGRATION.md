# 데이터 마이그레이션 가이드

기존 웹사이트(wlafayettekorea.org)의 게시물을 새로운 웹사이트로 마이그레이션하는 방법입니다.

## 마이그레이션된 데이터 요약

- **정보나눔터**: 10개 게시물, 4개 댓글
- **구인구직**: 3개 게시물, 1개 댓글  
- **과외**: 4개 게시물, 0개 댓글
- **Housing**: 3개 게시물, 0개 댓글
- **FAQ**: 1개 게시물, 0개 댓글
- **직거래마당**: 0개 게시물 (데이터 없음)

**총계**: 21개 게시물, 5개 댓글

## 실행 방법

### 1. 데이터베이스 준비

데이터베이스가 이미 설정되어 있어야 합니다. `.env` 파일에 데이터베이스 연결 정보가 있는지 확인하세요.

### 2. SQL 마이그레이션 실행

생성된 SQL 파일을 데이터베이스에서 실행합니다:

```bash
# MySQL 클라이언트를 사용하는 경우
mysql -u [username] -p [database_name] < scripts/migration.sql

# 또는 데이터베이스 관리 툴(phpMyAdmin, DBeaver 등)에서 
# scripts/migration.sql 파일을 직접 실행
```

### 3. 관리자 계정

마이그레이션 후 다음 관리자 계정이 생성됩니다:
- **이메일**: admin@wlafayettekorea.org
- **비밀번호**: admin123
- **이름**: 운영자

## 데이터 매핑 정보

| 기존 게시판 | 새로운 카테고리 | 서브카테고리 |
|-----------|---------------|-------------|
| 정보나눔터 | 정보나눔터 | 자유게시판 |
| 직거래마당 | 직거래마당 | 사고팔고 |
| 구인구직 | 구인구직 | - |
| 과외 | 과외 | - |
| Housing | Housing | - |
| FAQ | FAQ | - |

## 주의사항

1. **백업**: 마이그레이션 실행 전 반드시 데이터베이스를 백업하세요.
2. **중복 실행**: SQL 파일은 `INSERT IGNORE`를 사용하므로 여러 번 실행해도 중복되지 않습니다.
3. **이미지**: 기존 게시물의 이미지는 텍스트로만 처리되며, 실제 이미지 파일은 마이그레이션되지 않습니다.
4. **사용자**: 모든 게시물과 댓글은 관리자 계정으로 마이그레이션됩니다.

## 문제 해결

### 문자 깨짐 문제
```bash
# MySQL 실행 시 문자 인코딩 지정
mysql -u [username] -p [database_name] --default-character-set=utf8 < scripts/migration.sql
```

### 권한 문제
```bash
# PowerShell 실행 정책 문제 시
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 확인 방법

마이그레이션 후 다음 SQL로 데이터를 확인할 수 있습니다:

```sql
-- 게시물 수 확인
SELECT category, COUNT(*) as post_count FROM Post GROUP BY category;

-- 댓글 수 확인  
SELECT COUNT(*) as comment_count FROM Comment;

-- 관리자 계정 확인
SELECT email, displayName, role FROM User WHERE email = 'admin@wlafayettekorea.org';
```
