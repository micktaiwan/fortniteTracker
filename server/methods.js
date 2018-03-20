import {HTTP} from "meteor/http";

Meteor.methods({

  fortnite: function(platform, pseudo) {
    if(_.isEmpty(platform) || _.isEmpty(pseudo)) throw new Meteor.Error("fortnite method: Missing data");

    let diff = 0;
    const now = new Date();
    const last = FortniteHistory.findOne({"platform": platform, "epicNickname": pseudo}, {sort: {createdAt: -1}});

    // do not fetch if the last fetch was less than 5 min
    if(last) {
      const lastTime = last.createdAt.getTime();
      const nowTime = now.getTime();
      diff = nowTime / 1000 - lastTime / 1000;
      if(diff < 60 * 5) return pseudo + "'s data last fetched " + Math.round(diff) + 's ago';
    }

    const apikey = Meteor.settings.forniteAPIKey;
    HTTP.get("https://api.fortnitetracker.com/v1/profile/" + platform + "/" + pseudo + "", {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, PUT, DELETE, GET, OPTIONS',
        'Access-Control-Request-Method': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        "TRN-Api-Key": apikey
      }
    }, function(error, result) {
      if(error) {
        console.error('http get FAILED!');
        console.log(error);
      }
      else {
        // console.log(result);
        if(result.statusCode === 200 && !result.data.error) {
          FortniteHistory.insert({
            "platform": platform,
            "epicNickname": pseudo,
            createdAt: now,
            data: result.data
          });

          FortnitePlayers.update({
            "platform": platform,
            "epicNickname": pseudo
          }, {
            $set: {
              "platform": platform,
              "epicNickname": pseudo,
              updatedAt: now,
              last: result.data
            }
          }, {upsert: true});
        }
      }
    });
    return "Fetching data for " + pseudo + "..."
  }


});
