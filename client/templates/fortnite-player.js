import './fortnite-player.html';


const update_chart = function(platform, nickname) {

  Meteor.setTimeout(function() {
    console.log('updating chart...');
    if(!$('#chart_div').get(0)) return console.error('no div');

    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages': ['corechart']});

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    function drawChart() {

      const history = FortniteHistory.find({epicNickname: nickname, platform: platform}, {sort: {createdAt: 1}}).fetch();
      // Create the data table.
      const data = new google.visualization.DataTable();
      data.addColumn('datetime', 'Date');
      data.addColumn('number', 'K/d');
      let value = 0;
      let i = 0;
      const nb = history.length;
      _.each(history, function(h) {
        i++;
        if(i < nb && h.data.stats.p2.kd.valueDec === value) return; // skipping same consecutive value, except the last one
        value = h.data.stats.p2.kd.valueDec;
        data.addRows([
          [h.createdAt, value],
        ]);
      });
      // Set chart options
      const options = {
        'title': 'Kills per death in Solo',
        // curveType: 'function',
        lineWidth: 3,
        pointSize: 10,
        // pointShape: 'square',
        pointColor: '#fff',
        'width': '100%',
        'height': 300
      };

      // Instantiate and draw our chart, passing in some options.
      const chart = new google.visualization.LineChart($('#chart_div').get(0));
      chart.draw(data, options);
    }

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);
  }, 1000);
};

Template.fortnitePlayer.onCreated(function() {


});

Template.fortnitePlayer.onRendered(function() {

  const that = this;
  this.autorun(function() {
    if(!Session.get('googleChartsOK')) return;

    if(that.data && that.data.platform && that.data.epicNickname)
      Meteor.call('fortnite', that.data.platform, that.data.epicNickname, function(err, msg) {
        if(err) return console.error(err);
        if(msg) console.log(msg);
        that.subscribe('fortniteHistoryPlayer', that.data.platform, that.data.epicNickname, function() {
          update_chart(that.data.platform, that.data.epicNickname);
        });
      });
    else that.subscribe('fortniteHistoryPlayer', that.data.platform, that.data.epicNickname, function() {
      update_chart(that.data.platform, that.data.epicNickname);
    });

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
