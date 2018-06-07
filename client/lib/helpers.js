import moment from 'moment';

Template.registerHelper("formatDate", function(date, format, lang) {
  if(!date) return '';
  if(typeof(format) === "object") throw new Meteor.Error('formatDate needs a format');

  const DateFormats = {
    short: "DD MMMM YYYY",
    long: "dddd DD/MM/YYYY HH:mm",
    dh: "DD-MMM-YYYY HH:mm",
    hour: "HH:mm"
  };

  format = DateFormats[format] || format;
  if(_.isString(lang) && !_.isEmpty(lang)) {
    return moment(date).locale(lang).format(format);
  }
  return moment(date).format(format);
});

$.getScript("https://www.gstatic.com/charts/loader.js", function() {
  Session.set('googleChartsOK', true);
});
