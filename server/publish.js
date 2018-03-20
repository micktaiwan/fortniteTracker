import {Meteor} from "meteor/meteor";

Meteor.publish('fortniteHistory', function() {
  return FortniteHistory.find({});
});

Meteor.publish('fortnitePlayers', function() {
  return FortnitePlayers.find({});
});
