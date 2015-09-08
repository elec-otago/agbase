/**
 * Created by mark on 5/09/14.
 */
var supertest = require('supertest');
var api = supertest('https://localhost:8443');
var app = require('../../app');
var forEachIn = require('../../utils/forEachIn');
var Promise = require('../../wowPromise');
var login = Promise.promisifyAll(require('./utils/login'));
var apiUrl = '/api/measurement-categories';

var categories = [];

describe('Measurement Category Rest API', function(){

    var dataSource = require('../dataSource');
    before(function(){
        return login.loginAsync(api).then(function () {
            return dataSource.setup().then(function() {
                 return login.postAsync(api, apiUrl, {
                     name: 'api-testing-category',
                     isSpatial: true
                 });
            });
        });

    });

    describe('#get categories', function(){

        it('should get all categories', function(){

            return login.getAsync(api, apiUrl).then(function(res) {
                res.statusCode.should.equal(200);
                should.exist(res.body);
                should.exist(res.body.categories);
                res.body.categories.should.not.be.empty;

                categories = res.body.categories;
            });
        });


        it('should contain correct json values', function(){

            return login.getAsync(api, apiUrl).then(function(res) {
                res.statusCode.should.equal(200);

                should.exist(res.body.categories);

                var firstCategory = res.body.categories[0];

                should.exist(firstCategory.id);
                should.exist(firstCategory.name);

            });
        });


        it('should get demo category and include algorithm', function(){
            var demoName = categories[0].name;

            return login.getAsync(api, apiUrl + '?name=' + demoName + '&include=algorithms')
                .then(function(res) {
                    res.statusCode.should.equal(200);

                    should.exist(res.body.categories);
                    res.body.categories.should.not.be.empty;

                    var category = res.body.categories[0];

                    category.should.have.property('name', demoName);
                    category.should.have.property('algorithms');
                });
        });

        it('should only get spatial categories and include algorithm', function(){

            return login.getAsync(api, apiUrl + '?isSpatial=true&include=algorithms')
                .then(function(res) {
                    res.statusCode.should.equal(200);

                    should.exist(res.body.categories);
                    res.body.categories.should.not.be.empty;

                    var result = res.body.categories[0];

                    should.exist(result);

                    should.exist(result.algorithms);

                    forEachIn(res.body.categories, function(category){

                        category.isSpatial.should.not.equal(false);
                    });
                });
        });

        it('should not include spatial categories', function(){

            return login.getAsync(api, apiUrl + '?isSpatial=false&include=algorithms')
                .then(function(res) {
                    res.statusCode.should.equal(200);

                    should.exist(res.body.categories);
                    res.body.categories.should.not.be.empty;

                    var result = res.body.categories[0];

                    should.exist(result);

                    should.exist(result.algorithms);

                    forEachIn(res.body.categories, function(category){

                        category.isSpatial.should.not.equal(true);
                    });
                });
        });
    });
});