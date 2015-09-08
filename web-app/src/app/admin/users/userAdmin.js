

//give the module a name
var module = angular.module( 'ngMoogle.admin.users', [
    'ui.router'
]);


module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.admin-users', {
        views: {
            "home-content": {
                controller: 'UserAdminCtrl',
                templateUrl: 'admin/users/userAdmin.tpl.html'
            }
        },
        data:{ pageTitle: 'User Admin' }
    })
    ;
});


module.controller( 'UserAdminCtrl', function UserAdminController( $scope, $state, $stateParams, UserService, FarmService, FarmPermissionService, GlobalRoleService, FarmRoleService, UsageTierService ) {

    $scope.$state = $state;

    var loadUsers = function(){

        UserService.findAll(function(err, data){
            if(err){
                console.log(err);
                return;
            }
            $scope.users = data.users;
            
        });
    };
    
    var loadFarms = function()
    {
        FarmService.findAll(true,true,true,function(err,farms){          
          if(err)
          {
             console.log(err);
             return;
          } 
            $scope.farms = farms;
        });       
          
    };
    
    var loadRoles = function(){
        GlobalRoleService.findAll().success(function(data){


            $scope.roles = data.roles;
          }).error(function(data, status){

            console.log(status);
            console.log(data);
        });
    };


    var loadTiers = function(){

        UsageTierService.findAll().then(function(tiers){

            $scope.tiers = tiers;
        });
    };


    $scope.createUser = function(user){
      
        if (user !== undefined) {
             UserService.create(user.fname, user.lname, user.email, user.pass, user.role , function(err, data) {
                 if(err){
                     console.log(err);
                     return;
                 }
                 $('#addUserModal').modal('hide');
                 loadUsers();
                 var farmId;
                 var roleId;
                 var userId = data.user.id;

                 if(user.addToDemoFarm) {
                     FarmService.findFarm("Demo Farm", null, function (err, farm) {

                         if (err) {
                             console.log(err);
                             return;
                         }

                         farmId = farm.farms[0].id;

                         FarmRoleService.find(function (err, roles) {

                             if (err) {
                                 console.log(err);
                                 return;
                             }

                             for (var i = 0; i < roles.roles.length; i++) {
                                 var role = roles.roles[i];
                                 if (role.name == "Viewer") {
                                     roleId = role.id;
                                     break;
                                 }
                             }
                             FarmPermissionService.create(farmId, userId, roleId, function (perErr, perData) {
                                 if (perErr) {
                                     console.log(perErr);
                                     return;
                                 }
                             });

                         });


                     });
                 }
            });
            loadUsers();
        }
    };
    
    $scope.openDeleteUserModal = function(user) {       
        $scope.userToDelete = user;
    };
    
    $scope.deleteUser = function(){
      if($scope.userToDelete.id !== undefined)
      {
        UserService.remove($scope.userToDelete.id, function(err, data){
            if(err){
                console.log(err);
            }
            loadUsers();
            $('#deleteUserModal').modal('hide');
        });
      }
    };
    loadFarms();
    loadUsers();
    loadRoles();
    loadTiers();
});

