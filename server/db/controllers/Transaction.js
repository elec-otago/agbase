var orm = null;
var cls = require('continuation-local-storage');

module.exports = {
    begin: function(f) {
        return orm.sequelize.transaction(f);
    },

    currentTransaction: function() {
        var context = cls.getNamespace('agdatabase');
        return context.get('transaction');
    },

    setup: function(_orm, Sequelize) {
        orm = _orm;
        var databaseNamespace = cls.createNamespace('agdatabase');
        Sequelize.cls = databaseNamespace;
    }
};