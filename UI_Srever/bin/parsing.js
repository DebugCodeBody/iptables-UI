var exec = require("child_process").exec;

function TextSlice(value, Text) {
    return value.slice(Text.length, value.length).trim();
}
function builtInJudge(policy, index) {
    if (index == 0) {
        return ["PREROUTING", "INPUT", "FORWARD", "OUTPUT", "POSTROUTIONG"].indexOf(policy) != -1;
    } else {
        return ['ACCEPT', 'REJECT', 'REDIRECT', 'DROP', 'MASQUERADE', 'LOG', 'SNAT', 'DNAT', 'MIRROR', 'QUEUE', 'RETURN', 'MARK', 'TCPMSS'].indexOf(policy) != -1;
    }
}



// 格式化表
function ForDeal(tableName, text) {
    var table = {
        type: tableName,
        Built: [],
        Custom: []
    };

    var index = 0, Chain = { "chain": [], disabled: false, visible: Array(3).fill(false) }, name = "";

    text.split("\n").forEach((value) => {
        if (index == 0) {
            var patt = /Chain\s(.*?)\s+\(policy\s+(.*?)\s+(\d+[a-zA-z]?)\s+packets,?\s+(\d+[a-zA-z]?)\s+bytes/g;
            if (patt.exec(value)) {
                name = "Built";
                Chain.name = RegExp.$1;
                Chain.policy = RegExp.$2;
                Chain.packets = RegExp.$3;
                Chain.bytes = RegExp.$4;

            } else {
                patt = /Chain\s+(.*?)\s+\((\d+)\s+references\)/g;
                if (patt.exec(value)) {
                    name = "Custom";
                    Chain.name = RegExp.$1;
                    Chain.reference = RegExp.$2;
                }
            }
        } else if (index >= 2 && value != "") {
            var patt = /(\d+|\w+|.*?)\s+/g,
                mat = value.match(patt).slice(0, 10),
                action = TextSlice(value, mat.join(""));

            mat = mat.map((data) => {
                return data.trim();
            });
            Chain.chain.push({
                num: mat[0],
                pkts: mat[1],
                bytes: mat[2],
                target: mat[3],
                prot: mat[4],
                opt: mat[5],
                in: mat[6],
                out: mat[7],
                source: mat[8],
                destination: mat[9],
                action: action,
                disabled: false,
                builtIn: builtInJudge(mat[3], 1)
            })

        } else {
            if (value == "") {
                if (name != "") {
                    table[name].push(Chain);
                } else {
                    console.log("name为空")
                }
                Chain = { "chain": [], disabled: false, visible: Array(3).fill(false) };
                return (index = 0)
            };
        }
        index++;

    });
    return table;
}

function getTable(name) {
    return new Promise((resolve, reject) => {
        try {
            exec("/sbin/iptables -t " + name + " -L -n --line-numbers -v", function (err, stdout, stderr) {
                if (!err) {
                    resolve(ForDeal(name, stdout));
                } else {
                    reject(stderr)
                }
            });
        } catch (error) {
            console.log("cuowu:", error);
            reject(error);
        }
    })
}

function perform(Command) {
    return new Promise((resolve, reject) => {
        exec("/sbin/" + Command, function (err, stdout, stderr) {
            if (!err) {
                resolve(stdout);
            } else {
                reject(stderr);
            }
        });
    })
}

/** 刷新指定表 */
function refresh(data) {
    var self = this;
    if (data.table) {
        perform(`iptables -t ${data.table} -L ${data.chain} -n --line-numbers -v`).then(res => {
            res = ForDeal(data.table, res);
            var rules, type;
            if (builtInJudge(data.chain, 0)) {
                type = "Built"
                rules = res.Built[0]
            } else {
                type = "Custom"
                rules = res.Custom[0]
            }


            self.sendJSON({
                code: 200,
                type: "refresh",
                data: {
                    rules,
                    type,
                    table: data.table,
                    chain: data.chain
                }
            });
        }).catch(err => {

        })
    }


}
/** 插入命令或者添加 */
function AddCommand(data) {
    var self = this;
    if (data.data.table) {
        perform(data.data.rules).then(res => {
            self.sendJSON({
                code: 200,
                type: data.type
            });

            refresh.call(self,data.data);
        }).catch(err => {
            self.sendJSON({
                code: 200,
                type: data.type,
                data: err
            });
        })
    }

}
/** 删除指定表指定链 */
function Empty(data){
    var self = this;
    if (data.table) {
        perform(`iptables -t ${data.table} -F ${data.chain} `).then(res => {
            self.sendJSON({
                code: 200,
                type: "Empty"
            });

            refresh.call(self,data);
        }).catch(err => {
            self.sendJSON({
                code: 200,
                type: data.type,
                data: err
            });
        })
    }

}

function sendList() {
    var self = this;

    ['raw', 'mangle', 'nat', 'filter'].forEach((name) => {
        getTable(name).then(res => {
            self.send(JSON.stringify(Object.assign({ code: 200 }, res)));
        }).catch(err => {
            console.log("iptables执行失败");
        })
    })
}

module.exports = {
    sendList,
    perform,
    refresh,
    AddCommand,
    Empty
};


// new Promise((resolve, reject) => {
//     exec("/sbin/iptables -t " + name + " -L -n --line-numbers -v", function (err, stdout, stderr) {
//         if (!err) {
//             resolve(stdout);
//         } else {
//             reject(stderr)
//         }
//     });
// }).then(res => {
//     ForDeal(res)
// }).catch(err => {
//     console.log(err)
// })