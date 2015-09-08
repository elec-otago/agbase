/**
 * Created by mark on 5/09/14.
 */
var supertest = require('supertest');
var api = supertest('https://localhost:8443');
var app = require('../../app');

describe('Auth Rest API', function(){

    var dataSource = require('../dataSource');
    before(function () {
        return dataSource.setup();
    });

    describe('#authenticate user', function(){

        it('should authenticate test user', function(done){
            api
                .post('/api/auth')
                .send({
                    email: 'unittest@agbase.elec.ac.nz',
                    password: 'test'
                })
                .end(function(err, res){
                    // console.log(res.body)
                    should.not.exist(err);

                    should.exist(res.body);

                    res.statusCode.should.equal(200);

                    done();
                });
        });


        it('should not authenticate test user with bad password', function(done){
            api
                .post('/api/auth')
                .send({
                    email: 'unittest@agbase.elec.ac.nz',
                    password: 'testing'
                })
                .end(function(err, res){

                    should.exist(err);
                    res.statusCode.should.equal(401);

                    done();
                })
        });


        it('should not crash when bad things sent to route', function(done){
            api
                .post('/api/auth')
                .send({
                    email: 5,
                    passw: 'testing'
                })
                .end(function(err, res){
                    // console.log(res.body)
                    should.exist(err);
                    res.statusCode.should.equal(422);

                    done();
                })
        });
    });
});