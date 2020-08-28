<template>
    <div>
        <div>
            <el-dialog title="提示" :visible.sync="dialogVisible" width="30%" center>
                <span style=" text-align: center; display:block;"><i class="el-icon-warning" style="margin-right: 5px;"></i>与服务器断开连接</span>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                </span>
            </el-dialog>
        </div>

        <div class="scrollbar" :style="{height: inner.height + 'px' }">
            <!-- @open="handleOpen" @close="handleClose" -->
            <el-menu class="el-menu-vertical-demo" :collapse="isCollapse">
                <el-submenu v-for="(name,i) in ['raw','mangle','nat','filter']" :key="i" :index=" calculatorIndex(i) ">
                    <template slot="title">
                        <i class="el-icon-menu"></i>
                        <span slot="title">{{ name }}</span>
                    </template>
                    <el-menu-item-group>
                        <el-menu-item :index="calculatorIndex(i,1)" @click="Listwork(undefined,name)">查看全部</el-menu-item>
                    </el-menu-item-group>

                    <el-submenu :index="calculatorIndex(i,2) ">
                        <span slot="title">原生链</span>
                        <el-menu-item v-for="(val,u) in table[name]['Built']" :key="u" :index=" calculatorIndex(i,2,u) " @click="Listwork(val,name)">{{ val.name }}</el-menu-item>
                    </el-submenu>
                    <el-submenu :index=" calculatorIndex(i,3)">
                        <span slot="title">自定义链</span>
                        <el-menu-item v-for="(val,u) in table[name]['Custom']" :key="u" :index=" calculatorIndex(i,3,u) " @click=" Listwork(val,name) ">
                            <el-tooltip :content="val.name" :disabled="!val.disabled" class="item" effect="dark" placement="right">
                                <span class="targetA" @mouseenter="mouseenter($event,val)" @mouseleave="mouseleave($event,val)">{{ val.name }}</span>
                            </el-tooltip>
                        </el-menu-item>
                    </el-submenu>

                </el-submenu>

            </el-menu>
        </div>

        <div class="table" :style="{height: inner.height + 'px' }" Tagname="tableData">
            <el-container>
                <el-header style="text-align: center; ">
                    <span style="text-align: right">规则</span>
                </el-header>
                <el-main v-for="(tableData,index) in tableDataList" :key="index" :Tagname="tableData.name" style="padding: 10px 20px;">
                    <div class="StatusBar clearfix" :StatusBar="tableData.name">

                        <div style="display: inline-block; float:left;">
                            <el-popover width="1000" v-model="tableData.visible[0]">
                                <div class="el-message-box__content" style="padding: 10px 0px;">
                                    <el-input placeholder="请输入规则" v-model="rules.target">
                                        <template slot="prepend">{{rules.append}}</template>
                                    </el-input>
                                </div>
                                <div style="text-align: right; margin: 0">
                                    <el-button type="text" size="mini" @click=" OpenAdd($event,tableData,0,false,false)">取消</el-button>
                                    <el-button type="primary" size="mini" @click="OpenAdd($event,tableData,0,false,true)">确定</el-button>
                                </div>
                                <el-button class="OPButton" slot="reference" type="info" size="mini" icon="el-icon-sort" @click="OpenAdd($event,tableData,0,true)">插入</el-button>
                            </el-popover>

                            <el-popover width="1000" v-model="tableData.visible[1]">
                                <div class="el-message-box__content" style="padding: 10px 0px;">
                                    <el-input placeholder="请输入规则" v-model="rules.target">
                                        <template slot="prepend">{{rules.append}}</template>
                                    </el-input>
                                </div>
                                <div style="text-align: right; margin: 0">
                                    <el-button type="text" size="mini" @click="OpenAdd($event,tableData,1,false,false)">取消</el-button>
                                    <el-button type="primary" size="mini" @click="OpenAdd($event,tableData,1,false,true)">确定</el-button>
                                </div>
                                <el-button class="OPButton" slot="reference" type="primary" size="mini" icon="el-icon-edit" @click="OpenAdd($event,tableData,1,true)">添加</el-button>
                            </el-popover>
                            <el-popover v-model="tableData.visible[2]">
                                <div class="el-message-box__content">
                                    <div class="el-message-box__status el-icon-error"></div>
                                    <div class="el-message-box__message" style="padding-right:0px;">
                                        <p>此操作将清空当前链规则并且无法恢复，是否继续?</p>
                                    </div>
                                </div>
                                <div style="text-align: right; margin: 0">
                                    <el-button type="text" size="mini" @click=" OpenEmpty($event,tableData,2,false,true)  ">取消</el-button>
                                    <el-button type="primary" size="mini" @click=" OpenEmpty($event,tableData,2,false,true) ">确定</el-button>
                                </div>
                                <el-button class="OPButton" slot="reference" type="danger" size="mini" icon="el-icon-delete" :disabled=" tableData.chain.length == 0 " @click="OpenEmpty($event,tableData,2,true)">清空</el-button>
                            </el-popover>
                            <el-button class="OPButton" type="success" size="mini" icon="el-icon-refresh" @click="OpenRefresh($event,tableData)">刷新</el-button>

                        </div>
                        <div style=" text-align: center;">
                            <span>{{NameForma(tableData) }}</span>
                        </div>
                    </div>
                    <table>
                        <colgroup>
                            <col width="70">
                            <col width="100">
                            <col width="100">
                            <col width="250">
                            <col width="50">
                            <col width="50">
                            <col width="100">
                            <col width="100">
                            <col width="100">
                            <col width="150">
                        </colgroup>
                        <thead>
                            <tr>
                                <th>
                                    <div class="tdDiv">num</div>
                                </th>
                                <th>
                                    <div class="tdDiv">pkts</div>
                                </th>
                                <th>
                                    <div class="tdDiv">bytes</div>
                                </th>
                                <th>
                                    <div class="tdDiv">target</div>
                                </th>
                                <th>
                                    <div class="tdDiv">prot</div>
                                </th>
                                <th>
                                    <div class="tdDiv">opt</div>
                                </th>
                                <th>
                                    <div class="tdDiv">in</div>
                                </th>
                                <th>
                                    <div class="tdDiv">out</div>
                                </th>
                                <th>
                                    <div class="tdDiv">source</div>
                                </th>
                                <th>
                                    <div class="tdDiv">destination</div>
                                </th>
                                <th>
                                    <div class="tdDiv">action</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for=" (rules,index) in tableData.chain" :key="index">
                                <td>
                                    <div class="tdDiv">{{ rules.num }}</div>
                                </td>
                                <td>
                                    <div class="tdDiv">{{ rules.pkts }}</div>
                                </td>
                                <td>
                                    <div class="tdDiv">{{ rules.bytes }}</div>
                                </td>
                                <td>
                                    <div class="tdDiv target">
                                        <el-tooltip :content="rules.target" :disabled="!rules.disabled" class="item" effect="dark" placement="right">
                                            <span class="targetA" :class='{ light: !rules.builtIn}' @click="click($event,rules)" @mouseenter="mouseenter($event,rules)" @mouseleave="mouseleave($event,rules)">{{ rules.target }}</span>>
                                        </el-tooltip>
                                    </div>
                                </td>
                                <td>
                                    <div class="tdDiv">{{ rules.prot }}</div>
                                </td>
                                <td>
                                    <div class="tdDiv">{{ rules.opt }}</div>
                                </td>
                                <td>
                                    <div class="tdDiv">{{ rules.in }}</div>
                                </td>
                                <td>
                                    <div class="tdDiv">{{ rules.out }}</div>
                                </td>
                                <td>
                                    <div class="tdDiv">{{ rules.source }}</div>
                                </td>
                                <td>
                                    <div class="tdDiv">{{ rules.destination }}</div>
                                </td>
                                <td>
                                    <div class="tdDiv">{{ rules.action }}</div>
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </el-main>
            </el-container>
        </div>
    </div>
</template>

<script>
import HTTP from "axios";
var ws = null;
function open() {
    this.wsState = true;
    this.dialogVisible = false;
    ws.send(JSON.stringify({ type: "list" }));
}

function close() {
    this.wsState = false;
    console.log("close事件");
}
function error() {
    this.wsState = false;
    this.dialogVisible = true;
    console.log("error事件");
}
/** WebSocket收到消息通知 */
function message(data) {
    try {
        data = JSON.parse(data.data);
        console.log("WS数据", data);
        if (data.code == 200) {
            switch (data.type) {
                case "raw":
                case "mangle":
                case "nat":
                case "filter":
                    this.table[data.type].Built = data.Built;
                    this.table[data.type].Custom = data.Custom;
                    break;
                case "refresh":
                    data = data.data;
                    var index = FindIndex(this.table[data.table], data.chain);

                    var table = this.table[data.table][data.type][index],
                        key;
                    for (key in table) {
                        this.table[data.table][data.type][index][key] =
                            data.rules[key];
                    }
                    break;
                case "AddCommand":
                    this.$message({
                        message: "添加命令成功！",
                        type: "success",
                        duration: 1000,
                    });
                    break;
                case "InsertCommand":
                    this.$message({
                        message: "插入命令成功！",
                        type: "success",
                        duration: 1000,
                    });
                    break;
                case "Empty":
                    this.$message({
                        message: "清空成功！",
                        type: "success",
                        duration: 1000,
                    });
                    break;
                default:
                    break;
            }
        }
    } catch (error) {}
}
/** WebSocket发送JSON消息 */
function WsSendJSON(Data) {
    return ws.send(JSON.stringify(Data));
}
function perform(Command) {
    ws.send(JSON.stringify({ type: "perform", Command }));
}

/** 清楚当前组件焦点 */
function blurActive() {
    var active = document.activeElement;
    if (active) active.blur();
}
/** 锁定滚动条 */
function banWheel(data, index) {
    document.onmousewheel = function (event) {
        if (!data.visible[index]) {
            document.onmousewheel = undefined;
            return;
        }
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    };
}

function FindIndex(tables, name) {
    var index = tables.Built.findIndex((value) => {
        return value.name == name;
    });
    return index > -1
        ? index
        : tables.Custom.findIndex((value) => {
              return value.name == name;
          });
}

export default {
    // iptables -t nat -L -n --line-numbers -v

    data() {
        return {
            inner: {
                width: 0,
                height: 0,
            },
            rules: {
                /** 输入的规则 */
                target: "",
                /** 前置规则 */
                append: "",
            },
            CtrlState: false, // Ctrl键按下状态
            dialogVisible: false, // dialog层是否显示
            wsState: false, // Ws连接状态
            isCollapse: false, // 导航条是否收缩
            LookAll: false, // 是否查看全部
            tableName: "",
            table: {
                raw: {
                    Built: [],
                    Custom: [],
                },
                mangle: {
                    Built: [],
                    Custom: [],
                },
                nat: {
                    Built: [],
                    Custom: [],
                },
                filter: {
                    Built: [],
                    Custom: [],
                },
            },
            tableDataList: [],
        };
    },
    created() {
        ws = new WebSocket("ws://192.168.2.164");
        if (ws) {
            ws.onopen = open.bind(this);
            ws.onmessage = message.bind(this);
            ws.onclose = close.bind(this);
            ws.onerror = error.bind(this);
        }

        this.inner.width = window.innerWidth - 20;
        this.inner.height = window.innerHeight - 20;
    },
    methods: {
        /** 格式化索引 */
        calculatorIndex(a, b, c) {
            switch (arguments.length) {
                case 1:
                    return String(a + 1);
                    break;
                case 2:
                    return a + 1 + "-" + b;
                    break;
                case 3:
                    return a + 1 + "-" + b + "-" + (c + 1);
                    break;
            }
        },
        NameForma(data){
            if(!data.reference){
                return `${data.name} (策略：${data.policy}, 包: ${data.packets}, 字节：${data.bytes} )`
            }else{
                return `${data.name} (${data.reference} 引用)`
            }

            
        },
        /** 合并显示列表 */
        Listwork(list, name) {
            if ((this.LookAll = list == undefined)) {
                this.tableDataList = [].concat(
                    this.table[name].Built,
                    this.table[name].Custom
                );
            } else {
                this.tableDataList = [list];
            }
            this.tableName = name;
        },
        handleOpen(key, keyPath) {
            console.log(key, keyPath);
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        },
        /** 鼠标移入事件 */
        mouseenter(event, data) {
            // 文本宽度                     元素宽度
            if (event.target.scrollWidth > event.target.offsetWidth) {
                // 是否显示链名弹窗
                data.disabled = true;
            }
            
            var StatusBar = document.querySelector(
                `div[StatusBar=${data.target}]`
            );
            /** 检测一下当前引用的链是否存在，如果存在则判断一下是否刚添加进去。如果是刚添加进去，则不操作高亮。如果不是刚添加进去，则进行高亮操作 */
            if (StatusBar && !StatusBar.classList.contains("reminds")) {
                StatusBar.classList.add("remind");
            }
        },
        /** 鼠标移除事件 */
        mouseleave(event, data) {
            var StatusBar = document.querySelector(
                `div[StatusBar=${data.target}]`
            );
            if (StatusBar && !StatusBar.classList.contains("reminds")) {
                StatusBar.classList.remove("remind");
            }
        },
        /** 鼠标点击事件 */
        click(event, data) {
            if (!data.builtIn && this.CtrlState) {
                function remove() {
                    StatusBar.parentNode.onmouseenter = undefined;
                    StatusBar.classList.remove("remind");
                    StatusBar.classList.remove("reminds");

                    clearTimeout(TimeID);
                    TimeID = 0;
                }
                function addclass() {
                    if (StatusBar && !StatusBar.classList.contains("reminds")) {
                        // 给引用链状态栏添加个颜色高亮
                        StatusBar.classList.add("reminds");
                        StatusBar.classList.add("remind");

                        // 给状态栏父元素(整个链框架)添加个鼠标移入事件，去除高亮
                        TimeID = setTimeout(remove, 3000);
                        StatusBar.parentNode.onmouseenter = remove;
                    }
                }

                var Tag = document.querySelector(
                        `main[tagname=${data.target}]`
                    ),
                    Frame = document.querySelector(`[tagname='tableData']`),
                    StatusBar = document.querySelector(
                        `div[StatusBar=${data.target}]`
                    ),
                    offsetTop,
                    TimeID;

                if (this.LookAll || (Tag && StatusBar)) {
                    addclass();
                    offsetTop = Tag.offsetTop + 10;

                    //如果父框架可视高度小于引用链框架坐标 或者 父框架当前位置大于引用链框架坐标
                    if (
                        offsetTop > Frame.clientHeight ||
                        offsetTop < Frame.scrollTop
                    ) {
                        Frame.scrollTo(0, offsetTop);
                    }
                } else {
                    this.tableDataList.push(
                        this.table[this.tableName]["Custom"].find((value) => {
                            return data.target === value.name;
                        })
                    );

                    this.$nextTick(() => {
                        StatusBar = document.querySelector(
                            `div[StatusBar=${data.target}]`
                        );
                        addclass();
                    });
                }
            }
        },
        /** 刷新当前链 */
        OpenRefresh(event, data) {
            event.target.blur();
            WsSendJSON({
                type: "refresh",
                data: { table: this.tableName, chain: data.name },
            });
            blurActive();
        },
        OpenInsert(event, data, index, bool, state) {},
        /** 插入或者添加规则进当前链 */
        OpenAdd(event, data, index, bool, state) {
            event.target.blur();
            if (bool) {
                this.rules.append = `iptables -t ${this.tableName} ${
                    index ? "-A" : "-I"
                } ${data.name} `;
                data.visible[index] = true;
                banWheel(data, index);
            } else {
                data.visible = Array(3).fill(false);
                if (state) {
                    if (this.rules.target != "") {
                        WsSendJSON({
                            type: index ? "AddCommand" : "InsertCommand",
                            data: {
                                rules: this.rules.append + this.rules.target,
                                table: this.tableName,
                                chain: data.name,
                            },
                        });
                    } else {
                        this.$message({
                            message: "规则不能为空！",
                            type: "warning",
                            duration: 1000,
                        });
                    }
                }
                this.rules.target = "";
            }
            blurActive();
        },
        /** 清空当前链 */
        OpenEmpty(event, data, index, bool, state) {
            event.target.blur();
            if (bool) {
                data.visible[2] = true;
                banWheel(data, 2);
            } else {
                data.visible = Array(3).fill(false);
                if (state) {
                    WsSendJSON({
                        type: "Empty",
                        data: {
                            rules: `iptables -t ${this.tableName} -F ${data.name} `,
                            table: this.tableName,
                            chain: data.name,
                        },
                    });
                }
            }
        },
    },
    computed: {},
    mounted() {
        var self = this;
        /** 判断一下是否按下 Ctrl 键 */
        window.addEventListener("keydown", (event) => {
            if (event.which == 17) {
                self.CtrlState = true;
            }
        });
        window.addEventListener("keyup", (event) => {
            if (event.which == 17) {
                self.CtrlState = false;
            }
        });
    },
};
</script>

<style>
.el-header {
    background-color: #b3c0d1;
    color: #333;
    line-height: 60px;
}

.el-aside {
    color: #333;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
}
.scrollbar {
    float: left;
    overflow: auto;

    border: 1px solid #409eff;
    border-right: none;
}

.scrollbar::-webkit-scrollbar {
    width: 0;
}
.table {
    overflow: auto;
    border: 1px solid #409eff;
}

.clearfix::before,
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
a {
    text-decoration: none;
}
a:link,
a:visited,
a:hover,
a:active,
p:hover,
p:active {
    color: #0000ff;
}

.el-header {
    background-color: #b3c0d1;
    color: #333;
    line-height: 60px;
}

.el-aside {
    color: #333;
}
.el-container {
    overflow: auto;
}

table {
    width: 100%;
    border-spacing: 100px;
    border-collapse: collapse;
}

td,
th {
    border: 1px solid #e6e6e6;
}

tr:hover {
    background-color: #f2f2f2;
}

thead > tr > th {
    font-weight: normal;
    min-height: 20px;
    line-height: 20px;
    font-size: 14px;
    padding: 5px 0;
    background-color: #f2f2f2;
}
tbody > tr > td {
    padding: 5px 0;
    text-align: center;
}
.tdDiv {
    height: 28px;
    line-height: 28px;
    margin: 0px auto;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.target {
    width: 200px;
}
.targetA {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.targetA.light {
    color: #0000ff;
    cursor: pointer;
}
.StatusBar {
    /* 引用链状态栏 */
    background-color: #e6e6e6;

    padding: 5px 5px;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    position: relative;
}
.remind {
    /* 引用链状态栏高亮 */
    background-color: #84c7ff;
}
.OPButton {
    /* 添加按钮 */
    padding: 5px;
}
</style>

