var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/flocking', function(req, res, next) {
    res.render('flocking_basic');
});

module.exports = router;
