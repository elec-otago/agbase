/**
 * Created by mark on 14/11/14.
 */

var supertest = require('supertest');
var api = supertest('https://localhost:8443');
var app = require('../../app');
var Promise = require('../../wowPromise');
var login = Promise.promisifyAll(require('./utils/login'));

describe('Algorithm Rest API', function(){

    var dataSource = require('../dataSource');
    before(function () {

        return login.loginAsync(api).then(function () {
            return dataSource.setup();
        });
    });

    describe('#get algorithms', function(){

        it('should get all algorithms', function(){
            return login.getAsync(api, '/api/algorithms').then(function(res){

                res.statusCode.should.equal(200);
                should.exist(res.body.algorithms);

                res.body.algorithms.should.all.have.property('id');
                res.body.algorithms.should.all.have.property('name');
                res.body.algorithms.should.all.have.property('measurementCategoryId');
            });
        });

        it('should get all algorithms and include measurement category', function(){

            return login.getAsync(api, '/api/algorithms/?include=category').then(function(res){


                res.statusCode.should.equal(200);
                should.exist(res.body.algorithms);

                res.body.algorithms.should.all.have.property('id');
                res.body.algorithms.should.all.have.property('name');
                res.body.algorithms.should.all.have.property('measurementCategoryId');
                res.body.algorithms.should.all.have.property('measurementCategory');

                forEach(res.body.algorithms, function(algorithm) {
                    algorithm.measurementCategory.id.should.equal(algorithm.measurementCategoryId);
                });

            });
        });
    });


    describe('#get algorithms as Guest', function(){

        before(function () {
            return login.guest_loginAsync(api);
        });

        it('should get all algorithms', function(){
            return login.getAsync(api, '/api/algorithms').then(function(res){

                res.statusCode.should.equal(200);
                should.exist(res.body.algorithms);

                res.body.algorithms.should.all.have.property('id');
                res.body.algorithms.should.all.have.property('name');
                res.body.algorithms.should.all.have.property('measurementCategoryId');
            });
        });
    });
});