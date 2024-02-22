// schemas/index.js

// mongoose 가져오기
// mongoose : Node.js 환경에서 MongoDB와 상호작용하기 위한 라이브러리.
import mongoose from 'mongoose';

// MongoDB와의 연결을 설정
const connect = () => {
  mongoose
    .connect(
      // 빨간색으로 표시된 부분은 대여한 ID, Password, 주소에 맞게끔 수정해주세요!
      'mongodb+srv://kwj2712:aaaa4321!@express-mongo.7fzr9ge.mongodb.net/?retryWrites=true&w=majority',
      {
        dbName: 'todo_memo', // todo_memo 데이터베이스명을 사용합니다.
      },
    )
    .then(() => console.log('MongoDB 연결에 성공하였습니다.'))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 에러', err);
});

// export default 라는 명령어를 이용하여 connect함수를 외부로 보내지도록 구현하고 있다.
// 외부 : app.js -> app.js에서 사용한다.
// ===> 이 함수를 다른 파일에서 불러와서 MongoDB와의 연결을 설정하고 데이터베이스 작업을 수행할 수 있다.
export default connect;
