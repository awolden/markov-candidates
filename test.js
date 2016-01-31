'use strict';

//Opens up a command line for testing
const MarkovPeople = require('./MarkovPeople'),
  util = require('util');

let people = new MarkovPeople({
  people: ['hillaryclinton', 'berniesanders', 'donaldtrump']
});
let stdin = process.openStdin();

console.log('Seeding People: ', people.opts.people.join(', '));
people.seed().then(() => {
  console.log('seeding complete');
  util.print('Ready > ');

  stdin.on('data', function(input) {
    let randomPerson = people.opts.people[Math.round(Math.random() * people.opts.people.length)];
    people.respond(randomPerson, input.toString()).then(response => {
      console.log(randomPerson, response);
      util.print('Ready > ');
    }, err => {
      console.error('Error getting response', err);
    });

  });
}, err => {
  console.error('error seeding people', err, err.stack);
});
