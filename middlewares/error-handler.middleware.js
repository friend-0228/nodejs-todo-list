export default (err, req, res, next) => {
  console.log('에러 처리 미들웨어가 실행되었습니다.');
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ errorMessage: error.message });
  }
  // 500 : 서버의 에러 때문에 문제 발생.
  return res
    .status(500)
    .json({ errorMessage: '서버에서 에러가 발생했습니다.' });
};
