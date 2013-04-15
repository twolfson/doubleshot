module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.{js,json}']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,

        strict: false
      },
      globals: {
        // Mocha functions
        describe: true,
        before: true,
        beforeEach: true,
        after: true,
        afterEach: true,
        it: true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint');

};