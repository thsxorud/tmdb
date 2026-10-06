# 학습 노트: 영화 검색 & 찜 목록 만들기

## 0. 전체 흐름 (먼저 이 그림부터 이해하기)
```
[브라우저: script.js] -> [우리 서버: app.py] -> [TMDB 서버]
   "어벤져스 검색"        키(.env)를 붙여 대신 요청      영화 데이터 응답
[브라우저] <- 결과 JSON <- [우리 서버] <- 결과 JSON <-
```
- **브라우저(프론트엔드)**: 사용자가 보는 화면. HTML/CSS/JavaScript로 만듦.
- **서버(백엔드)**: 뒤에서 일하는 프로그램. 우리는 파이썬(Flask)으로 만듦.
- 웹 프로그램은 "화면 + 서버" 두 부분으로 나뉜다. C언어만 하셨다면 지금까지 만든 것은 서버 쪽에 가까워요.

## 1. 용어 정리
- **서버**: 요청이 오면 응답을 돌려주는 프로그램. 식당 주방.
- **localhost:3000**: "내 컴퓨터(localhost)의 3000번 문(포트)". 내 컴퓨터에서 서버를 켜고 내가 접속하는 주소.
- **Flask**: 파이썬으로 웹 서버를 쉽게 만드는 라이브러리.
- **라이브러리**: 남이 만들어둔 코드 모음. C의 `#include <stdio.h>`와 같은 개념.
- **pip**: 파이썬 라이브러리 설치 프로그램.
- **가상환경(venv)**: 이 프로젝트 전용 라이브러리 보관함. 다른 프로젝트와 섞이지 않게 해줌.
- **JSON**: 데이터를 주고받는 글자 형식. 파이썬의 딕셔너리와 거의 같음. 예: `{"title": "어벤져스", "id": 24428}`
- **API**: 다른 프로그램의 기능을 정해진 주소와 방식으로 요청해 쓰는 창구.
- **환경변수 / .env**: 프로그램 밖에 따로 보관하는 설정값(비밀번호, 키 등).

## 2. app.py 한 줄씩 설명

### (1) import: 도구 불러오기
```python
import os
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
```
- `import os`: 환경변수를 읽는 기능을 가져옴.
- `import requests`: 우리 서버가 TMDB에 요청을 보낼 때 사용.
- `from A import B`: A라는 묶음에서 B만 꺼내 쓰겠다는 뜻 (`from dotenv import load_dotenv`).
- Flask에서 가져온 것: `Flask`(서버 본체), `jsonify`(파이썬 데이터를 JSON 응답으로 변환), `request`(들어온 요청 정보), `send_from_directory`(파일을 브라우저에 보내줌).

### (2) API 키 불러오기
```python
load_dotenv()
API_KEY = os.getenv("TMDB_API_KEY")
```
- `load_dotenv()`가 `.env` 파일을 읽어 `TMDB_API_KEY=abc123`을 환경변수로 등록.
- `os.getenv("TMDB_API_KEY")`가 그 값을 꺼냄. 없으면 `None`.
- **왜 이렇게?** 코드에 `API_KEY = "abc123"`이라고 쓰고 GitHub에 올리면 전 세계에 키가 공개됨.

### (3) 서버 만들기
```python
app = Flask(__name__, static_folder="public", static_url_path="")
```
- `Flask(...)`로 서버 객체를 만들어 `app`에 저장. `__name__`은 "현재 파일"을 뜻하는 파이썬 기본값.
- `static_folder="public"`: HTML/CSS/JS가 있는 폴더 지정.
- `static_url_path=""`: `public/style.css`를 `localhost:3000/style.css`로 접근하게 함.

### (4) 라우트: 주소마다 할 일 정하기
```python
@app.route("/")
def home():
    return send_from_directory("public", "index.html")
```
- `@app.route("/")`는 **데코레이터**라고 부르며, "이 주소로 오면 바로 아래 함수를 실행해라"라는 표시.
- 함수 `home()`은 `index.html`을 브라우저에 돌려줌. 그래서 접속하면 화면이 뜸.

```python
@app.route("/api/search")
def search():
    query = request.args.get("q", "").strip()
```
- 브라우저가 `/api/search?q=어벤져스`로 요청하면 `?q=` 뒤의 값이 `request.args`에 들어옴.
- `.get("q", "")`: q가 없으면 빈 문자열. `.strip()`: 앞뒤 공백 제거.

```python
    if not query:
        return jsonify({"error": "검색어를 입력하세요."}), 400
```
- 검색어가 비었으면 오류 메시지를 반환. **400**은 "요청이 잘못됐다"는 HTTP 상태 코드.
- 상태 코드: 200 성공 / 400 요청 잘못 / 401 인증 실패(키 틀림) / 500 서버 오류.

```python
        response = requests.get(
            "https://api.themoviedb.org/3/search/movie",
            params={"api_key": API_KEY, "language": "ko-KR", "query": query},
            timeout=10,
        )
```
- TMDB 주소로 GET 요청을 보냄. `params`는 주소 뒤에 `?api_key=...&language=ko-KR&query=...`로 자동 변환됨(한글도 알아서 처리).
- `language="ko-KR"`: 한국어 제목으로 받기. `timeout=10`: 10초 안에 응답 없으면 포기.

```python
        return jsonify(response.json()), response.status_code
```
- TMDB의 응답을 JSON으로 풀어서(`response.json()`) 브라우저에 그대로 전달.

```python
    except requests.RequestException:
        return jsonify({"error": "TMDB 요청에 실패했습니다."}), 500
```
- `try/except`: 인터넷이 끊기는 등 오류가 나도 서버가 죽지 않고 안내 메시지를 줌.

### (5) 실행
```python
if __name__ == "__main__":
    app.run(port=3000, debug=True)
```
- `python app.py`로 직접 실행할 때만 서버를 켬. (C의 `main` 함수 시작점과 비슷)
- `debug=True`: 코드를 고치면 서버가 자동 재시작되고, 오류가 상세히 보임.

## 3. public 폴더 (화면 쪽)

### index.html: 뼈대
- `<form id="search-form">`: 검색창과 버튼. `id`는 JS가 이 요소를 찾을 때 쓰는 이름표.
- `<div id="results">`, `<div id="wishlist">`: JS가 영화 카드를 채워 넣을 빈 상자.
- `<script src="script.js">`: 동작 코드를 연결. 맨 아래에 둬야 위쪽 요소가 먼저 만들어진 뒤 실행됨.

### style.css: 디자인
- `:root { --bg:#14161c; }`: 색을 변수로 저장, `var(--bg)`로 사용.
- `display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr))`: 카드를 화면 크기에 맞춰 자동으로 여러 줄 배치.

### script.js: 동작 (핵심 부분)
```js
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
```
- `localStorage`: 브라우저 안의 작은 저장소. 새로고침해도 유지됨. 글자만 저장 가능해서 `JSON.parse`로 목록(배열)으로 되돌림. 저장된 게 없으면 빈 배열 `[]`.
- `let`: 변수 선언 (C의 `int x;`에 해당, JS는 타입을 적지 않음).

```js
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch(`/api/search?q=${encodeURIComponent(input.value)}`);
  const data = await res.json();
```
- `addEventListener('submit', ...)`: 검색 버튼을 누르는 순간 실행할 함수 등록.
- `e.preventDefault()`: 폼의 기본 동작(페이지 새로고침) 막기.
- `fetch(...)`: 우리 서버(app.py)에 요청. `await`는 "응답이 올 때까지 기다려라".
- `encodeURIComponent`: 한글/특수문자를 주소에 넣을 수 있는 형태로 변환.

```js
wishlist = isWished(movie.id)
  ? wishlist.filter(m => m.id !== movie.id)
  : [...wishlist, movie];
```
- `조건 ? A : B`는 "조건이 참이면 A, 아니면 B". 이미 찜했으면 그 영화만 빼고(`filter`), 아니면 목록 끝에 추가(`[...wishlist, movie]`).

## 4. 보안 포인트 (블로그 필수 내용)
1. API 키는 `.env`에 둔다.
2. `.gitignore`에 `.env`를 적어 GitHub에 올라가지 않게 한다.
3. 대신 `.env.example`을 올려 "이런 형식의 키가 필요하다"를 알려준다.
4. 키는 브라우저(JS)가 아니라 서버(app.py)에서만 사용한다. 브라우저 코드는 누구나 볼 수 있기 때문.

## 5. 블로그 목차
1. 과제 소개 / 2. 파일별 역할 / 3. 코드 분석(app.py → html → css → js) / 4. API와 키 관리 / 5. 실행 화면 / 6. 배운 점
