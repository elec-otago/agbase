/**
 * Created by mark on 5/09/14.
 */

describe('Global Role Rest API', function(){

    var supertest = require('supertest');
    var api = supertest('https://localhost:8443');
    var app = require('../../app');

    var token;

    before(function(done){

        api
            .post('/api/auth')
            .set('Accept', 'application/json')
            .send({
                email: 'unittest@agbase.elec.ac.nz',
                password: 'test'
            })
            .end(function(err, res){

                token = res.body.token;

                console.log("got token " + token);

                done();
            });
    });


    describe('#get global roles', function(){

        it('should get all global roles', function(done){
            api
                .get('/api/global-roles')
                .set('Authorization', 'Bearer '+ token)
                .end(function(err, res){

                    should.not.exist(err);

                    res.statusCode.should.equal(200);

                    should.exist(res.body);

                    console.log("Global Roles:")

                    console.log(res.body);

                    done();
                })
        });
    });
});