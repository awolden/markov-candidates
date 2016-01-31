'use strict';

const fs = require('fs'),
  markov = require('markov'),
  m = markov(3),
  _ = require('lodash'),
  mergeStream = require('merge-stream'),
  pos = require('pos'),
  args = require('minimist')(process.argv.slice(2));

if (!args.c) {
  console.error('Must Specify a candidate using -c');
  process.exit(1);
} else {
  args.c = args.c.toLowerCase().replace(/[^a-zA-Z]*/g, '');
}

let streams = [],
  files = [],
  fileDir = `${__dirname}/people/${args.c}/`,
  uncap = ['CC', 'CD', 'DT', 'EX', 'IN', 'JJ', 'JJR', 'JJS', 'LS', 'MD', 'PDT', 'MD', 'RB', 'RP', 'UH', 'VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'WDT', 'WP', 'WRB'];

files = fs.readdirSync(fileDir);

files.forEach(file => {
  streams.push(fs.createReadStream(fileDir + file));
});

let allStreams = mergeStream(...streams);

//seed and confirm seeding with parent process
m.seed(allStreams, function() {
  process.send({
    seeded: 'true'
  });
});

//listen for incoming request
//process and send back
process.on('message', request => {
  if (request.id) {
    let response = getMessage(m, request.input);
    process.send({
      id: request.id,
      response
    });
  }
});

//generate markov sentence
function getMessage(m, input) {
  input = input || '';
  let res = m.respond(input.toString());

  res = res.map(words => {
    return words.split(/\s+/);
  });
  res = _.flatten(res);

  return normalizeSentence(res).join(' ');
}

//normalize sentence's puncutation
function normalizeSentence(sentence) {
  //remove any falsey values
  sentence = sentence.filter(word => word);
  //console.log(new pos.Tagger().tag(sentence));

  let tags = new pos.Tagger().tag(sentence).map((tag) => {
    return tag[1];
  });
  return sentence.map((word, index) => {
    let tag = tags[index];

    //Uncap if it is a normal part of speech
    if (_.includes(uncap, tag)) {
      word = word.charAt(0).toLowerCase() + word.slice(1);
    }

    //Capitalize first word in sentence
    if (index === 0 || /[\?\.!]$/.test(sentence[index - 1])) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    //remove any trailing commas
    if (index === sentence.length - 1 && /[,]$/.test(sentence[index - 1])) {
      word = word.substring(0, word.length - 1);
    }

    //add period at end of sentence
    if (index === sentence.length - 1 && !/[\?\.!]$/.test(sentence[index - 1])) {
      word = word + '.';
    }

    return word;
  });
}
