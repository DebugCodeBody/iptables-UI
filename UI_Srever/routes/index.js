var express = require('express');
var router = express.Router();
var exec = require("child_process").exec;

/* GET home page. */
router.get('/', function (req, res, next) {
  exec("/sbin/iptables -t nat -L -n --line-numbers -v", function (err, stdout, stderr) {
    res.json({code:(err?0:200),data:stdout}).end()
  });
});

module.exports = router;
