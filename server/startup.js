const update = function() {
  _.each(FortnitePlayers.find({}, {fields: {epicNickname: 1, platform: 1, updatedAt: 1}}).fetch(), function(p) {

    // do not fetch if the last fetch was less than 3 days
    if(p.updatedAt) {
      const now = new Date();
      const lastTime = p.updatedAt.getTime();
      const nowTime = now.getTime();
      diff = nowTime / 1000 - lastTime / 1000;
      if(diff < 60 * 60 * 24 * 3) {
        // console.log(p.epicNickname + "'s data last fetched " + Math.round(diff / 60 / 60) + ' hours ago (less than 3 days, so not fetched)');
        return;
      }
    }

    console.log('cron: updating ', p.epicNickname, '...');
    Meteor.call('fortnite', p.platform, p.epicNickname, function(err, msg) {
      if(err) return console.error(err);
      if(msg) console.log(msg);
    });

  });

};

Meteor.startup(function() {

  //  update at app start
  update();

  // update every day
  if(!SyncedCron)
    console.error('Package SyncedCron not installed');
  else {

    SyncedCron.add({
      name: 'Data fetching',
      schedule: function(parser) { return parser.recur().on('06:00:00').time(); },
      job: function() {

        update();
      }
    });
    SyncedCron.start();
  }

});
