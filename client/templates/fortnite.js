import './fortnite.html';

Template.fortnite.onCreated(function() {

  this.subscribe('fortnitePlayers');

});

Template.fortnite.helpers({

  players() {
    const players = FortnitePlayers.find({}).fetch();
    return _.sortBy(players, function(p) {return -parseFloat(_.find(p.last.lifeTimeStats, function(e) {return e.key === "K/d"}).value)});
  }

});

Template.fortnite.events({

  'submit': function(e, tpl) {
    e.preventDefault();

    const form = tpl.$('form').serializeJSON();
    if(_.isEmpty(form.platform) || _.isEmpty(form.epicNickname)) return;
    // console.log(form);
    Router.go('fortnitePlayer', {platform: form.platform.toLowerCase(), epicNickname: form.epicNickname.toLowerCase()});
  }

});
