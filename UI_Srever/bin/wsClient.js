const { promises } = require("fs");

var Parsing = require("./parsing.js");




function message(message){
    //打印客户端监听的消息
    console.log(message);
    try {
        var Data = JSON.parse(message);
        if(Data){
            switch (Data.type) {
                case "list":
                    Parsing.sendList.call(this);
                    break;
                case "perform":
                    Parsing.perform.call(this,Data.Command);
                    break;
                case "refresh":
                    Parsing.refresh.call(this,Data.data);
                    break;
                case "AddCommand":
                case "InsertCommand":
                    Parsing.AddCommand.call(this,Data);
                    break;
                case "Empty":
                    Parsing.Empty.call(this,Data.data);
                    break;
                default:
                    break;
            }
        }
    } catch (error) {
        
    }
    


}
function close(err){
    console.log("close",err)

}
function err(err){
    console.log("err",err)

}


function createCallback(ws){
    ws.on("message",message);
    ws.on("err",err);
    ws.on("close",close);
    ws.sendJSON = function(data){
        this.send(JSON.stringify(data));
      };

    ws.send(JSON.stringify({code:200,data:""}));
}

module.exports = createCallback;