var https = require('https');
var gitHubbard = require('github');
var async = require('async');
var _ = require('underscore');

var github = new gitHubbard({
  version: "3.0.0",
  protocol: "https",
  // debug: true,
  host: "api.github.com",
  timeout: 5000
});
github.authenticate({
  type: "oauth",
  token: "",
});

// Pulled from the Hacker School API.
var hsers = [
  "davidbalbert",
  "zachallaun",
  "rose",
  "fredantell",
  "mavant",
  "thomasballinger",
  "RalfMBecker",
  "nicholasbs",
  "laurita",
  "brannerchinese",
  "litacho",
  "maryrosecook",
  "deckman",
  "davidad",
  "adewes",
  "katrinae",
  "PaddyBadger",
  "andreafey",
  "JdotJdot",
  "urthbound",
  "mjzffr",
  "amygdalama",
  "rawrjustin",
  "vjuutilainen",
  "damiankao",
  "surajkapoor",
  "akaptur",
  "brainkim",
  "mirkoklukas",
  "slawrence",
  "paul-jean",
  "clin88",
  "rubydog",
  "wismer",
  "lord",
  "zacharym",
  "jesstess",
  "miclovich",
  "andreecmonette",
  "murphsp1",
  "lucasnewman11",
  "happy4crazy",
  "cicerojones",
  "pgayane",
  "yomimono",
  "plredmond",
  "christopherjamesryan",
  "marksamman",
  "stuartsan",
  "ginaschmalzle",
  "rileyjshaw",
  "jskelcy",
  "subsetpark",
  "rpsoko",
  "will-sommers",
  "jollysonali",
  "leahsteinberg",
  "ptn",
  "madhuvishy",
  "carljv",
  "neerajwahi",
  "adwhit",
  "bwigoder"
];

var repos = {};
var startDate = new Date(2014, 1, 10);

function getCommits(repoName, owner, cbk) {
  var payload = { user: owner, repo: repoName };
  var cleaned = [];
  github.repos.getCommits(payload, function(err, data) {
    if (err) { return cbk(err); }
    async.eachSeries(data, function(commit, nextCommit) {
      var date = new Date(commit.commit.author.date)
      var author = null;
      if (commit.author) {
        author = commit.author.login;
      }
      if(date > startDate) {
        cleaned.push({
          author: author,
          message: commit.commit.message,
          date: date
        });
      }
      nextCommit();
    }, function(err) {
      cbk(err, cleaned);
    });
  });
};

function getLanguages(repoName, owner, cbk) {
  var payload = { user: owner, repo: repoName };
  github.repos.getLanguages(payload, function(err, data) {
    if (err) { return cbk(err); }

    var languages = Object.keys(data);
    var index = languages.indexOf('meta');
    if (index > -1) {
      languages.splice(index, 1);
    }

    cbk(err, languages);
  });
};

function findStreak(commits) {
  var longest = 1;
  for (var i = 1; i < commits.length; i++) {
    if (commits[i].date.getDay() !== commits[i-1].date.getDay()) {
      longest += 1;
    } else {
      longest = 1;
    }
  }
  return longest;
};

function formatRepo(raw, owner, cbk) {
  if (raw.fork) {
    return cbk(null);
  }

  var pushDate = new Date(raw.pushed_at);
  if(pushDate <= startDate){
    return cbk(null);
  }

  getCommits(raw.name, owner, function(err, commits) {
    if (err) { return cbk(err); }
    getLanguages(raw.name, owner, function(err, languages) {
      if (err) { return cbk(err); }

      var collabs = _.uniq(_.map(commits, function(c) { return c.author; }));
      var days = _.uniq(_.map(commits, function(c) { return c.date; }));
      var cleaned = {
        name: raw.name,
        collabs: collabs,
        commits: commits,
        languages: languages,
        days: days,
        streak: findStreak(commits),
      };

      cbk(err, cleaned);
    });
  });
};

function addToLanguages(repo) {
  for (var i = 0; i < repo.languages.length; i++) {
    if (repos[repo.languages[i]] === undefined) {
      repos[repo.languages[i]] = [];
    }
    repos[repo.languages[i]].push(repo);
  }
};

async.eachSeries(hsers, function(user, nextUser) {
  github.repos.getFromUser({user: user}, function(err, res) {
    if(err) {
      console.log('repos of user ' + user + ' could not be fetched');
      console.log(err);
      nextUser(err);
    }
    async.eachSeries(res, function(repo, nextRepo) {
      var repoName = repo.name;
      formatRepo(repo, user, function(err, repo) {
        if (err) {
          console.log("could not clean repo " + user + "/" + repoName);
          console.log(err);
        } else if (repo) {
          addToLanguages(repo);
        }
        nextRepo();
      });
    }, function(err) {
      if(err) {
        console.log('error while iterating over repos of user ' + user);
        console.log(err);
      }
      nextUser();
    });
  });
}, function(err) {
  if(err) {
    console.log('error while iterating over users');
    console.log(err);
  } else {
    console.log(JSON.stringify(repos));
  }
});
