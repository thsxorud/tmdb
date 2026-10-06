# 영화 검색 & 찜 목록 (TMDB API, Flask)

## 실행 방법
1. 가상환경 생성: `python -m venv venv`
2. 가상환경 활성화: Windows `venv\Scripts\activate` / Mac `source venv/bin/activate`
3. 라이브러리 설치: `pip install -r requirements.txt`
4. `.env.example`을 `.env`로 이름 변경 후 TMDB API 키 입력
5. 실행: `python app.py` → http://localhost:3000

## 파일 구조
- `app.py` : Flask 서버. .env의 키로 TMDB에 요청을 대신 전달
- `public/` : index.html(뼈대), style.css(디자인), script.js(검색/찜 동작)
- `requirements.txt` : 필요한 파이썬 라이브러리 목록
- `.env` : API 키 보관 (GitHub 업로드 금지)
- `.gitignore` : GitHub에 올리지 않을 파일 목록
