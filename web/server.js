'use strict';

const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  MarkovPeople = require('../MarkovPeople');

let people = new MarkovPeople({
  people: ['hillaryclinton', 'berniesanders', 'donaldtrump']
});

/* configure express */
app.use(bodyParser());
app.use(morgan('dev'));

app.post('/chat/:person', function(req, res) {
  people.respond(req.params.person, req.body.message).then(function(result) {
    res.send(result);
  });
});

app.use(express.static('./web/public'));

console.log('Seeding People: ', people.opts.people.join(', '));
people.seed().then(() => {
  app.listen(3001, function() {
    console.log('Example app listening on port 3000!');
  });
}, err => {
  console.error('error seeding people', err, err.stack);
});
