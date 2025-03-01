const http = require('http');
//node.js內部原有的
const { v4: uuidv4 } = require('uuid');
//npm套件等
const errorHandle = require('./errorHandle');
//自己建立的module
const todos = [];

const requestListener = ((req, res)=>{
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
        "Content-Type": "application/json"
    }

    let body = "";
    //用let body宣告控制
    //(let body和on('data')是接收資料用的)
    req.on('data', chunk=>{
        console.log(chunk)
        body+=chunk;
    })
    //持續加封包傳進來的資料
    //node.js的語法，當網頁傳送指令時接收body資訊會使用此語法(會是已各個TCP封包一塊一塊傳過來)

    // req.on('end',()=>{
    //     console.log(JSON.parse(body).title);
    // })
    //結束後可獲得body加起來的資訊
    //結束後會抓end的函式

    console.log(req.url);
    console.log(req.method);
    if(req.url=="/todos" && req.method == "GET"){
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            "data": todos,
        }));
        res.end();
    }else if(req.url=="/todos" && req.method == "POST"){
        req.on('end',()=>{
            try {
                const title = JSON.parse(body).title;
                console.log(title);
                if(title !== undefined){
                    const todo = {
                        "title":title,
                        "id":uuidv4()
                    };
                    todos.push(todo);
                    console.log(todo);
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                    "status":"success",
                    "data": todos,
                    }));
                    res.end();  
                }else{
                    errorHandle(res)
                };
              
            } catch (error) {
                errorHandle(res)
            }

        })


    }else if(req.url=="/todos" && req.method == "DELETE"){
        todos.length = 0;
        //全部刪除
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            "data": todos,
        }));
        res.end();
        //res.end()才會把資料回傳回去
    }else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
        //單筆刪除
        const id = req.url.split('/').pop();
        //首先先抓出request的url 才可篩選出後面的uuiv出來//split:拆出斜線的資料//pop:抓最後一筆資訊
        const index = todos.findIndex(element => element.id == id);
        //從前端傳來的id,我要從todos這個陣列去查有沒有這個資訊,所以用findIndex去查詢有無這筆資料。
        // element就是抓元素,這邊element是物件{"title":"今天.."},
        // 要在抓"id"的值，並跟request的url過來的id進行比對,如果有比對正確,index就會吃到資料
        //todos.findIndex(element => element.id == id)僅為抓索引值
        if(index!==-1){
            //比對不符者會回傳-1
            todos.splice(index,1);
            //如索引為-1 ,則刪除
            res.writeHead(200,headers);
            res.write(JSON.stringify({
                "status":"success",
                "data": todos,
            }));
            res.end();
        }else{
            errorHandle(res);
        }

    }else if(req.url.startsWith("/todos/") && req.method == "PATCH"){
        req.on('end',()=>{
            try{
                const todo = JSON.parse(body).title
                const id = req.url.split('/').pop();
                const index= todos.findIndex(element => element.id == id);
                //element.id是從todos找id //id為request來的
                if(todo !== undefined && index !== -1){
                    todos[index].title = todo;
                      //title做修改
                      res.writeHead(200,headers);//回傳成功
                      res.write(JSON.stringify({
                          "status":"success",
                          "data": todos,
                      }));
                      res.end();//寫了才會respond回去  
                }else{
                   errorHandle(res); 
                }
                console.log(todo,id);
                res.end();
            }catch{
                errorHandle(res);
            }
        })
    }else if(req.method == "OPTIONS"){
            res.writeHead(200,headers);
            res.end();
    }else{
            res.writeHead(404,headers);
            res.write(JSON.stringify({
                "status":"false",
                "message": "無此網站路由",
            }));
            res.end();
        }
    // }else if(req.url=="/" && req.method == "DELETE"){
    //     res.writeHead(200,headers);
    //     res.write("delete");
    //     res.end();

   
});
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);