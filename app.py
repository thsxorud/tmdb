# ---------- 1. 도구(라이브러리) 불러오기 ----------
import os                                   # 운영체제 기능 (환경변수 읽기용)
import requests                             # 다른 서버(TMDB)에 요청을 보내는 도구
from dotenv import load_dotenv              # .env 파일을 읽어주는 도구
from flask import Flask, jsonify, request, send_from_directory  # 웹 서버 도구

# ---------- 2. API 키 불러오기 ----------
load_dotenv()                               # .env 파일의 내용을 환경변수로 등록
API_KEY = os.getenv("TMDB_API_KEY")         # 환경변수에서 키를 꺼냄 (코드에 키를 직접 쓰지 않음)

# ---------- 3. 웹 서버 만들기 ----------
# public 폴더의 파일(css, js)을 주소 바로 아래에서 제공한다는 설정
app = Flask(__name__, static_folder="public", static_url_path="")


# ---------- 4. 주소별로 할 일 정하기 ----------
@app.route("/")                             # 누군가 localhost:3000/ 에 접속하면
def home():
    return send_from_directory("public", "index.html")   # 화면 뼈대 파일을 보내줌


@app.route("/api/search")                   # localhost:3000/api/search?q=검색어 로 요청이 오면
def search():
    query = request.args.get("q", "").strip()   # 주소에서 q 값(검색어)을 꺼냄
    if not query:
        return jsonify({"error": "검색어를 입력하세요."}), 400
    if not API_KEY:
        return jsonify({"error": ".env 파일에 TMDB_API_KEY가 없습니다."}), 500

    try:
        # 우리 서버가 TMDB 서버에 대신 요청 (키는 서버 안에서만 사용됨)
        response = requests.get(
            "https://api.themoviedb.org/3/search/movie",
            params={"api_key": API_KEY, "language": "ko-KR", "query": query},
            timeout=10,
        )
        return jsonify(response.json()), response.status_code
    except requests.RequestException:
        return jsonify({"error": "TMDB 요청에 실패했습니다."}), 500


# ---------- 5. 서버 실행 ----------
if __name__ == "__main__":                  # python app.py 로 직접 실행했을 때만
    app.run(port=3000, debug=True)          # 3000번 문으로 서버 시작
