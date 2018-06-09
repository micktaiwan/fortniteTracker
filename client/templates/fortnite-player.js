import './fortnite-player.html';

let platform, nickname, mode, stat, skipvalues, smooth, zoom;

const update_chart = function() {

  // $('#chart_div').text('Displaying chart in 1s...');
  Meteor.setTimeout(function() {
    console.log('updating chart', mode, stat, zoom, '...');
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
      data.addColumn('number', 'Number');
      let newValue = 0, oldValue = 0;
      const nb = history.length;
      let i = 0;
      _.each(history, function(h) {
        i++;
        if(i < zoom) return;
        if(mode === 'global') {
          newValue = h.data.lifeTimeStats;
          console.log(h.data, newValue);
          newValue.kd = {valueDec: parseFloat(newValue[11].value)};
          newValue.kills = {valueInt: parseInt(newValue[10].value)};
          newValue.matches = {valueInt: parseInt(newValue[7].value)};
          newValue.score = {valueInt: parseInt(newValue[6].value.replace(/\,/g, ''))};
          newValue.winRatio = {valueDec: parseFloat(newValue[9].value)};
          newValue.top1 = {valueInt: parseInt(newValue[8].value)};

          /*
                    <tr>
                    <th width="16%">Kills</th>
                      <th width="16%">K/d</th>
                      <th width="16%">Matches Played</th>
                    <th width="16%">Wins</th>
                      <th width="16%">Win%</th>
                      <th width="16%">Score</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr>
                      <td>{{data.lifeTimeStats.[10].value}}</td>
                    <td>{{data.lifeTimeStats.[11].value}}</td>
                    <td>{{data.lifeTimeStats.[7].value}}</td>
                    <td>{{data.lifeTimeStats.[8].value}}</td>
                    <td>{{data.lifeTimeStats.[9].value}}</td>
                    <td>{{data.lifeTimeStats.[6].value}}</td>
          */


        }
        else if(mode === 'solo') newValue = h.data.stats.p2;
        else if(mode === 'duos') newValue = h.data.stats.p10;
        else if(mode === 'squads') newValue = h.data.stats.p9;

        console.log(newValue);

        if(stat === 'kd') newValue = newValue.kd.valueDec;
        else if(stat === 'winsp') newValue = newValue.winRatio.valueDec;
        else if(stat === 'score') newValue = newValue.score.valueInt;
        else if(stat === 'kills') newValue = newValue.kills.valueInt;
        else if(stat === 'matches') newValue = newValue.matches.valueInt;
        else if(stat === 'wins') newValue = newValue.top1.valueInt;

        if(skipvalues && i < nb && newValue === oldValue) return; // skipping same consecutive value, except the last one
        oldValue = newValue;
        data.addRows([
          [h.createdAt, newValue],
        ]);
      });
      // Set chart options
      const options = {
        // 'title': 'Kills per death in Solo',
        lineWidth: 3,
        // pointShape: 'square',
        'width': '100%',
        'height': 300
      };
      if(smooth)
        options.curveType = 'function';
      else
        options.pointSize = 10;

      // Instantiate and draw our chart, passing in some options.
      const chart = new google.visualization.LineChart($('#chart_div').get(0));
      chart.draw(data, options);
      // slider
      $("#zoom").get(0).max = nb;
    }

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

  }, 200);
};

Template.fortnitePlayer.onCreated(function() {


});

Template.fortnitePlayer.onRendered(function() {

  mode = 'global';
  stat = 'kd';
  skipvalues = true;
  smooth = false;
  zoom = 1;

  const that = this;
  this.autorun(function() {
    if(!Session.get('googleChartsOK')) return;

    if(that.data && that.data.platform && that.data.epicNickname) {
      platform = that.data.platform;
      nickname = that.data.epicNickname;
      Meteor.call('fortnite', that.data.platform, that.data.epicNickname, function(err, msg) {
        if(err) return console.error(err);
        if(msg) console.log(msg);
        that.subscribe('fortniteHistoryPlayer', that.data.platform, that.data.epicNickname, function() {
          update_chart(that.data.platform, that.data.epicNickname);
        });
      });
    }
    else
      that.subscribe('fortniteHistoryPlayer', that.data.platform, that.data.epicNickname, function() {
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

Template.fortnitePlayer.events({

  'change #mode'() {
    mode = $('#mode').val();
    update_chart()
  },

  'change #stat'() {
    stat = $('#stat').val();
    update_chart()
  },

  'change #skipvalues'() {
    skipvalues = $('#skipvalues').prop('checked');
    update_chart()
  },

  'change #smooth'() {
    smooth = $('#smooth').prop('checked');
    update_chart()
  },

  'input #zoom'() {
    zoom = $('#zoom').get(0).value;
    update_chart()
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
