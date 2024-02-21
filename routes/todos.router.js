// express 가져오기
import express from "express";

// todoSchema 사용을 위해 가져오기
import Todo from "../schemas/todo.schema.js";

// router 생성 가능
const router = express.Router();

//----------------------------------------------------------------------------
/** * 할일 등록 API * **/
// API를 구현할 때는 해당 라우터로 구현 시작.
router.post("/todos", async (req, res, next) => {
    // 1. 클라이언트로부터 받아온 value 데이터를 가져온다.
    const { value } = req.body;

    // 1-2. 만약 클라이언트가 value 데이터를 전달하지 않았을 때, 클라이언트에게 에러 메세지를 전달한다.
    if (!value) {
        return res.status(400).json({
            errorMessage: "해야할 일(value) 데이터가 존재하지 않습니다.",
        });
    }

    // 2. 해당하는 마지막 order 데이터를 조회한다.
    /* 		Todo 라고 하는 것을 가져와야한다. 이건 그 전에 todo.schema.js 에서 구현한 것을 확인할 수 있다.
			export default mongoose.model('Todo', todoSchema);
			-> todoSchema를 mongoose의 model에 만들어서 외부에 전달하고 있는 것.
    		===> Todo란 todoSchema에 있는 mongoose.model 이다. */
    // findOne = 1개의 데이터만 조회한다.
    // sort : 정렬한다. -> 어떤 컬럼을? order 라는 컬럼을! 어떤 데이터베이스? No! 컬렉션! Todo라는 컬렉션에서 찾는다.
    // order 앞에 마이너스(-)를 붙여 내림차순으로 정렬할 수 있게 만든다.
    // 	exec() 메서드
    //	mongoose에서 exec()는 결과를 반환하기 위해 쿼리를 실행하고, 이 결과로 Promise를 반환.
    //	===> mongoose 조회할 때는 .exec() 메서드를 무조건 붙이는걸로!
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();

    // 3. 만약 존재한다면 현재 해야 할 일을 +1 하고, order 데이터가 존재하지 않다면, 1로 할당한다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. 해야할 일 등록
    const todo = new Todo({ value, order }); // todo 라고 하는 것을 실제 인스턴스로 만들었다.
    await todo.save(); // 실제 데이터베이스에 저장한다.

    // 5. 해야할 일을 클라이언트에게 반환한다.
    return res.status(201).json({ todo: todo });
});

//----------------------------------------------------------------------------
/** * 해아할 일 목록 조회 API * **/
router.get("/todos", async (req, res, next) => {
    // next는 안 넣어줘도 되지만 나중에 리팩토링할 때를 위해 넣어둔 것.
    // 1. 해야할 일 목록 조회를 진행한다.
    //	await 을 사용해서 데이터베이스가 데이터 조회할 때까지 기다린 다음에 코드를 수행한다.
    const todos = await Todo.find().sort("-order").exec();

    // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
    return res.status(200).json({ todos });
});

//----------------------------------------------------------------------------
/** * 해아할 일 순서 변경 API * **/
// 목록중에 어떤 것을 수정해야할지 알기 위해서 todoId 사용
// 데이터베이스를 사용할 것이기 때문에 비동기적인 처리를 동기적으로 수정할 수 있도록 구현해야 하기 때문에 async 사용.
router.patch("/todos/:todoId", async (req, res) => {
    //	=> 값 가져오기
    // 어떤 할일을 변경해야 할지 알아야 한다.
    const { todoId } = req.params;
    // 순서 변경 : 실제로 클라이언트가 해당하는 값을 몇 번 순서로 변경할건지에 대한 내용 가져오기
    const { order, done } = req.body;

    // 실제 로직
    // 현재 나의 order가 무엇인지 알아야한다.
    // findById : Id에 따른 특정한 값 찾기
    const currentTodo = await Todo.findById(todoId).exec();
    if (!currentTodo) {
        // 선택 코드 404 : 클라이언트가 발생시킨 에러.
        return res
            .status(404)
            .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
    }

    // 실제로 해야할 일의 순서 변경
    // 1. order라고 하는 데이터가 조회되었는지 확인 : order라는 값이 있을 때만 비즈니스로직 수행.
    // ex. 3번을 2번으로 변경하려고 할 때, 2번 데이터가 현재 존재하고 있는가? 에 대한 조건 검사
    if (order) {
        // 3번(currentTodo)을 2번(targetTodo)으로 변경하려고 할 때, order 2번 조회.
        // find() : 목록 조회, findOne() : 목록 중 하나만 조회.
        // 객체 구조 분해 할당으로 인해서 ({order}) 만 사용 가능
        // const targetTodo = await Todo.findOne({ order: order }).exec();
        const targetTodo = await Todo.findOne({ order }).exec();
        // 3번을 2번으로 변경하려고 할 때, order 2번 데이터가 존재하지 않는다면???
        // 현재 이미 존재하는 데이터(3번)을 변경할 필요가 없어진다. (어차피 2번으로 땡겨지니까?)
        //	===> 따라서, targetTodo(2번)이 존재했을 때만 비즈니스로직을 수행할 수 있도록 조건을 한 번 더 건다.
        if (targetTodo) {
            // 데이터 순서를 바꾼다.
            // 해야할 일의 순서를 내가 가지고 있는 값의 order값으로 변경한다.
            targetTodo.order = currentTodo.order;
            await targetTodo.save();
        }

        // 현재 값의 order 또한 실제 데이터베이스와 똑같이 변경한 order 값으로 변경.
        // 변경하려는 '해야할 일'의 order 값을 변경합니니다.
        currentTodo.order = order;
    }
    //----------------------------------------------------------------------------
    /** * 해아할 일 순서 변경, 완료 / 해제 API * **/
    // done의 값을 전달 받았지만, done이 null이나 true일때만 조건문 실행
    // done의 값만 있게 되면 true가 있을 때 들어오지만,
    // 해야할 일을 해제할 때 즉, false 값을 줄 때는 조건문을 실행하지 않게된다는 오류가 있다.
    // ===> 그래서 undefined가 아닐 때만 조건문 실행.
    if (done !== undefined) {
        // done 값이 존재했을 때는 현재 시간 넣어주고, 존재하지 않았을 때는 null 넣어준다.
        currentTodo.doneAt = done ? new Date() : null;
        console.log("Done value:", done);
    }

    // 최종적으로 실제 데이터베이스에 저장한다.
    // 내가 전달받은 todoId에 해당하는 해야할 일 또한 데이터베이스에 저장한다.
    // 변경된 '해야할 일'을 저장합니다.
    await currentTodo.save();

    return res.status(200).json({});
});

//----------------------------------------------------------------------------
/** * 할 일 삭제 API * **/
router.delete("/todos/:todoId", async (req, res, next) => {
    const { todoId } = req.params;

    const todo = await Todo.findById(todoId).exec();
    if (!todo) {
        return res
            .status(404)
            .json({ errorMessage: "존재하지 않는 해야할 일 정보입니다." });
    }

    // 기본키를 삭제하게 된다. -> _id 로 작성한다.
    //  => _id 로 작성하게 되면 어떤 값을 기준으로 해당하는 데이터 일치했을 때 삭제할 수 있을지 정할 수 있다.
    //  ===> 기본적으로 mongoDB는 _id 라고 하는 값이, 내가 전달받은 todoId 에 해당한다.
    await Todo.deleteOne({ _id: todoId });

    return res.status(200).json({});
});

// 생성한 라우터를 실제 외부로 보내줄 수 있도록 만들어줘야한다.
// -> todos.router.js 의 router를 외부로 보내줄 수 있게 된다.
// => 외부로 보내준 라우터를 실제 우리가 사용하는 express에 적용시켜줘야한다.
// ===> app.js 로 가자!
export default router;
