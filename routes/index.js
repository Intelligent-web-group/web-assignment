var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

/**
 * it receives the content of the form and returns errors if any of the fields is not set
 * (note: the checks on validity of the fields is generally done on client side before calling Ajax.
 * It is inserted here to show how to identify and return an error in Ajax
 */
router.post('/', function(req, res, next) {
  let userData = req.body
  if (userData == null) {
    res.setHeader('Content-Type', 'application/json');
    res.status(403).json({error: 403, reason: 'no user data provided'});
  } else if (!userData.name) {
    res.setHeader('Content-Type', 'application/json');
    res.status(403).json({error: 403, reason: 'Name is invalid'});
  } else if (!userData.roomNo) {
    res.setHeader('Content-Type', 'application/json');
    res.status(403).json({error: 403, reason: 'Room number  is invalid'});
  }
  res.setHeader('Content-Type', 'application/json');
  res.json(userData);
});

module.exports = router;
