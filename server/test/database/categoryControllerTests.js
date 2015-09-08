var AlgorithmController = agquire('ag/db/controllers/AlgorithmController');
var CategoryController = agquire('ag/db/controllers/MeasurementCategoryController');

describe('MeasurementCategoryController', function(){

    var categoryToRemove;
    var testCategory;

    var dataSource = require('../dataSource');
    var errors = agquire('ag/db/controllers/Errors');

    before(function(){
        return dataSource.setup().then(function() {
            categoryToRemove = dataSource.measurementCategory1;
        });
    });

    describe('#createMeasurementCategory()', function(){

        it('should create the specified category', function(){

            var name = dataSource.randomString(10);
            return CategoryController.createMeasurementCategory(name, false).then(function(category){

                should.exist(category);
                category.name.should.equal(name);
                category.isSpatial.should.be.false;

                testCategory = category;
            });
        });

        it('should not create the specified category with the same name', function(){

            return CategoryController.createMeasurementCategory(testCategory.name,false).then(function(category) {
                testCategory.id.should.equal(category.id);
            });
        });


        it('should not create the specified category with null name', function(){

            return CategoryController.createMeasurementCategory(null,false)
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create the specified category with bad isSpatial', function(){

            return CategoryController.createMeasurementCategory(null,"yes")
                .should.be.rejectedWith(errors.ValidationError);
        });

        it('should not create the specified category as bad name provided', function(){

            return CategoryController.createMeasurementCategory({this_is_not_a_name:""},false)
                .should.be.rejectedWith(errors.ValidationError);
        });
    });


    describe('#getMeasurementCategories()', function(){

        it('should retrieve all categories and contain the one we created', function(){

            return CategoryController.getMeasurementCategories().then(function(categories) {

                should.exist(categories);
                categories.should.not.be.empty;
                categories.should.contain.an.item.with.property('id', testCategory.id);

            });

        });
    });


    describe('#getMeasurementCategory()', function(){

        it('should retrieve the category we created by id', function(){
            return CategoryController.getMeasurementCategory(testCategory.id)
                .should.eventually.have.property('id').equal(testCategory.id);
        });

        it('should retrieve the category we created by name', function(){
            return CategoryController.getMeasurementCategory({where: {name: testCategory.name}})
                .should.eventually.have.property('id').equal(testCategory.id);
        });
    });


    describe('#updateMeasurementCategory()', function(){

        it('should update the name of the category we created', function(){

            var details = {name: dataSource.randomString(10)};

            return CategoryController.updateMeasurementCategory(testCategory.id, details).then(function(category) {

                should.exist(category);
                category.name.should.equal(details.name);
                return CategoryController.getMeasurementCategory(testCategory.id);
            }).then(function(category) {
                should.exist(category);
                category.name.should.equal(details.name);

                testCategory = category;
            });
        });
    });


    describe('#removeMeaurementCategory()', function(){

        var algorithm;

        it('should remove the specified category', function() {

            algorithm = categoryToRemove.algorithm1;

            return CategoryController.removeMeasurementCategory(categoryToRemove.id).then(function() {
                return CategoryController.getMeasurementCategories();
            }).then(function(categories) {
                categories.should.not.be.empty;
                categories.should.not.contain.an.item.with.property('id', categoryToRemove.id);
            });
        });


        it('should have removed associated algorithm', function(){
            return AlgorithmController.getAlgorithm(algorithm.id)
                .should.be.rejectedWith(errors.NoResultError);
        });
    });
});