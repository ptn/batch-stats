var https = require('https');
var gitHubbard = require('github');
var async = require('async');

var github = new gitHubbard({
    // required
    version: "3.0.0",
    // optional
    protocol: "https",
    debug: true,
    host: "api.github.com",
    //   pathPrefix: "/api/v3", // for some GHEs
    timeout: 5000
});
github.authenticate({
    type: "basic",
    username: "ptn",
});



var userList = [
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
    "mchua",
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
    "gnprice",
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
    "bwigoder"]

    var repos =[];
    var startDate = new Date(2014,1,9);

    async.eachSeries(userList, function(user, nextUser) {
        github.repos.getFromUser({user: user}, function(err, res) {
            if(err){
                nextUser(err);
            }
            async.eachSeries(res, function(repo, nextRepo) {
                if (!repo.fork) {
                    var pushDate = new Date(repo.pushed_at);
                    if(pushDate > startDate){
                        repos.push(repo.full_name);
                    }
                }
                nextRepo();
            }, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    nextUser();
                }
            });
        });
    }, function(err) {
        if(err) {
            console.log('stupid github');
            console.log(err);
        } else {
            console.log('repos');
            console.log(repos);
        }
    });
