var agent = require('superagent')
  , q     = require('q')
  , _     = require('lodash')
  , baseUrl     = 'https://slack.com/api/'
;

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var datas   = step.inputObject({'user':'user_id'})
          , api_key = dexter.provider('slack').credentials('access_token')
          , self    = this
        ;

        q.all(_.map(datas
          , function(data) {
            var deferred = q.defer();

            agent.post(baseUrl + 'users.info')
              .send(_.extend(data, { token: api_key }))
              .type('form')
              .end(deferred.makeNodeResolver())
            ;

            return deferred
                     .promise
                     .then(function(response) {
                        return _.get(response, 'body.user');
                     });
          })
        )
          .then(this.complete.bind(this))
          .catch(this.fail.bind(this));
    }
};
