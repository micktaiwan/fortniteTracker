import {Meteor} from "meteor/meteor";

// Meteor.publish('fortniteHistory', function() {
//   return FortniteHistory.find({});
// });

Meteor.publish('fortniteHistoryPlayer', function(platform, nick) {
  console.log(platform, nick);
  return FortniteHistory.find({platform: platform, epicNickname: nick});
});

Meteor.publish('fortnitePlayers', function() {
  return FortnitePlayers.find({});
});
