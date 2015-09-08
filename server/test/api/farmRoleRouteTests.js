/**
 * Created by mark on 5/09/14.
 */

describe('Farm Role Rest API', function(){

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

    describe('#get farm roles', function(){

        it('should get all farm roles', function(done){
            api
                .get('/api/farm-roles')
                .set('Authorization', 'Bearer '+ token)
                .end(function(err, res){

                    should.not.exist(err);

                    res.statusCode.should.equal(200);

                    should.exist(res.body.roles);

                    var firstRole = res.body.roles[0];

                    should.exist(firstRole.id);

                    done();
                });
        });
    });
});