import './fortnite-player.html';

Template.fortnitePlayer.onCreated(function() {

  this.subscribe('fortniteHistory');

});

Template.fortnitePlayer.onRendered(function() {

  if(this.data && this.data.platform && this.data.epicNickname)
    Meteor.call('fortnite', this.data.platform, this.data.epicNickname, function(err, msg) {
      if(err) return console.error(err);
      if(msg) console.log(msg);
    });
});

Template.fortnitePlayer.helpers({

  fortnite() {
    const tpl = Template.instance();
    if(!tpl.data) return console.error('fortnitePlayer: no data. Your route must return data with this.params');
    if(tpl.data.platform && tpl.data.epicNickname) {
      return FortniteHistory.findOne({"epicNickname": tpl.data.epicNickname}, {sort: {createdAt: -1}});
    }
  },

  stats(w) {
    const stats = this.data.stats[w];
    // console.log(stats);
    return getChildren(stats, 0);
  },

  group(g) {
    const groupText = {
      p2: "Solo",
      p10: "Duo",
      p9: "Squad"
    };

    this.data.stats[g].group = g;
    this.data.stats[g].groupText = groupText[g];
    return this.data.stats[g];
  }

});

getChildren = function(stats, lvl) {
  lvl = lvl + 1;
  let html = '';
  const keys = Object.keys(stats);
  for(let i = 0; i < keys.length; i++) {
    const key = keys[i];
    html = html + '<div class="m-l-' + lvl * 5 + '">' + key;
    if(typeof(stats[key]) === "object")
      html = html + "<br>" + getChildren(stats[key], lvl);
    else html = html + " : " + stats[key];
    html = html + '</div>'
  }
  return html;
};

Template.fortnitePlayerStats.helpers({

  isGroup(w) {
    return this.group === w;
  },

});
