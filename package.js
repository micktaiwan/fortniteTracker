Package.describe({
  name: 'fortnite',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Playing with fortnite API',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  "moment": "2.19.1",
});

Package.onUse(function(api) {
  api.versionsFrom('1.6.1');
  api.use([
    'ecmascript',
    'meteor-platform',
    'templating',
    'pcel:serialize',
    'fortawesome:fontawesome'
  ]);

  api.add_files([
    'server/methods.js'
  ], 'server');

  api.add_files([
    'client/lib/helpers.js',
    'client/templates/fortnite.js',
    'client/templates/fortnite-player.js',
  ], 'client');

  api.add_files([
    'lib/collections.js',
  ], ['client', 'server']);

});
