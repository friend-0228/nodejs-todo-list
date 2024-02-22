// express 가져오기 -> express 라는 라이브러리를 써서 서버를 만든다.
// 라이브러리 : 코드를 쉽게 짜기 위해 빌려쓰는 코드 모음집
import express from "express";

// mongoDB 연결한 함수 가져오기
import connect from "./schemas/index.js";

// 라우터 가져오기
import todosRouter from "./routes/todos.router.js";

import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";

// app 생성.
const app = express();
// 서버를 열 때 PORT 번호 3000 번으로 만들었다. -> 30라인~
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
// app.use는 미들웨어를 사용하게 해주는 코드. (=== app 생성 후에 전역으로 미들웨어 등록)
// express.json() 미들웨어는 클라이언트의 요청(Request)를 받을 때 body에 있는 데이터를
//	정상적으로 사용할 수 있게 분석해주는 역할을 한다. 그래서 JSON 형태의 body를 입력받을 수 있게 된다.
// === express.json() 을 통해서 bodyParser를 구현한다.
app.use(express.json()); // 미들웨어 1
// express.urlencoded() 통해서 contents 타입이 form인 경우에 body 데이터를 가져올 수 있도록 구현한다.
app.use(express.urlencoded({ extended: true })); // 미들웨어 2
// ===> 위 두 코드는 매번 같이 다니는 거라고 생각하자! 단짝 친구~ friendship~

// 1. app.use 를 통해서 해당하는 프론트엔드 파일을 서빙하도록 구현할 예정.
// 2. express.static() 이라는 명령어를 통해서 해당하는 프론트엔드파일을 서빙.
// 3. 어떤 위치에 서빙을 할 것이냐?
// 	==> assets 폴더에 있는 모든 파일을 서빙.
app.use(express.static("./assets/todo-list-static-files")); // 미들웨어 3

// 미들웨어 4 (미들웨어 5 아래에 이 코드를 넣게 된다면 실행되지 않을 것이다 왜? 미들웨어는 위에서 아래로 실행)
app.use((req, res, next) => {
  console.log("Request URL:", req.originalUrl, " - ", new Date());
  next();
});

// router 생성.
// express.Router() : express에 있는 Router 기능을 사용한다.
const router = express.Router();
// router 생성 후 해당 API를 구현했다.
router.get("/", (req, res) => {
  return res.json({ message: "Hi!" });
});

// 실제로 해당하는 router를 전역 미들웨어로 등록해서
// '/api' 이게 붙은 경우에만 해당하는 API로 접근 가능하게 만들었다.
// app.use("/api", router);
app.use("/api", [router, todosRouter]); // 미들웨어 5

// 에러 처리 미들웨어를 등록한다.
// 에러 처리 미들웨어는 Router 하단에 등록. 왜?!
// -> 왜냐하면 라우터에서 발생한 에러는 라우터 이후에 등록된 미들웨어로 전달되기 때문이다.
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
