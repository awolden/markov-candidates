'use strict';

const childProcess = require('child_process'),
  Promise = require('bluebird'), //jshint ignore:line
  crypto = require('crypto');


module.exports = function MarkovPeople(opts) {
  const self = this;
  self.opts = opts || {};
  self.workers = {};

  if (!self.opts.people || !self.opts.people.length) {
    throw new Error('MarkovPeople requires a list of people');
  }

  self.seed = () => {
    return Promise.map(opts.people, (person) => {
      return new Promise((resolve, reject) => {
        self.workers[person] = childProcess.fork('./markov-worker.js', [`-c ${person}`]);

        self.workers[person].on('error', (data) => {
          reject(data);
        });

        let startupListener = (data) => {
          if (data.seeded) {
            resolve();
            self.workers[person].removeListener('message', startupListener);
          }
        };
        self.workers[person].on('message', startupListener);
      });
    });
  };

  self.random = (person) => {
    return self.respond(person, '');
  };

  self.respond = (person, input) => {
    return new Promise((resolve, reject) => {
      let worker = self.workers[person];
      let id = crypto.randomBytes(20).toString('hex');

      if (!worker) reject('Person Not Found');

      worker.send({
        input,
        id
      });

      let listener = (data) => {
        if (data.id === id) {
          resolve(data.response);
          worker.removeListener('message', listener);
        }
      };
      worker.on('message', listener);

    });
  };

};
