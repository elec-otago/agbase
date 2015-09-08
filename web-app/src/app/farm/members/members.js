/**
 * Farm Overview Sub view for displaying farm members
 */

var module = angular.module( 'ngMoogle.farm.members', [
    'ui.router', 'ngTable'
]);


module.config(function config( $stateProvider ) {
    $stateProvider.state( 'home.farm.members', {
        url: '/members',
        views: {
            "farm-tab-content": {
                controller: 'FarmMemberCtrl',
                templateUrl: 'farm/members/members.tpl.html'
            }
        }
    });
});


function loadPermissions($scope, FarmPermissionService){

    // find(userId, farmId, includeFarms, includeUser, includeRoles, callback){

    FarmPermissionService.find(null, $scope.farmId, false, true, true, function (err, permissions) {

        $("#farmMemberSpinner").hide();

        if (err) {
            console.log(err);
            return;
        }

        $scope.farmPermissions = permissions;
    });
}


module.controller( 'FarmMemberCtrl', function FarmMemberCtrl( $scope, $state, UserService, FarmPermissionService, FarmRoleService) {

    //perform initial load of permissions for the current farm
    loadPermissions($scope, FarmPermissionService);


    FarmRoleService.find(function(err, roles){
        if(err){
            console.log(err);
            return;
        }

        $scope.roles = roles;

    });


    UserService.findAll(function(err, data){
        if(err){
            console.log(err);
            return;
        }

        for(var i =0; i < data.users.length; i++){
            data.users[i].fullName = data.users[i].firstName + " " + data.users[i].lastName;
        }

        $scope.users = data.users;
    });


    $scope.createPermission = function createPermission(farm, user, role){

        FarmPermissionService.create(farm.id, user.id, role.id, function(err, data){
            if(err){
                console.log(err);
                return;
            }
            $("#addUserModal").modal('hide');
            var current = UserService.getCurrentUser();
            if(current.id == user.id) {
                $scope.userFarms[$scope.userFarms.length] = farm;
            }
            loadPermissions($scope, FarmPermissionService);
        });
    };


    $scope.openDeletePermission = function(permission){
        $scope.editUser = permission;
        $("#deletePermissionModal").modal('show');
    };


    $scope.deletePermission = function(permission){

        FarmPermissionService.remove(permission.id, function(err, data){
            if(err){
                console.log(err);
                return;
            }

            $("#deletePermissionModal").modal('hide');

            var currentUser = UserService.getCurrentUser();
            if(currentUser.id == permission.user.id){
                var index =  -1;
                for(var i = 0; i < $scope.userFarms.length; i++){
                    if(permission.farm.id == $scope.userFarms[i].id){
                        index = i;
                        break;
                    }
                }
                if(index > -1){
                    $scope.userFarms.splice(index, 1);
                }
                $state.go("home.dashboard");
            }

            loadPermissions($scope, FarmPermissionService);
        });
        $scope.editUser = null;
    };


    $scope.openPermissionEditModal = function(permission){
        $("#editPermissionModal").modal('show');
        $scope.editUser = permission;
        var unselectedElem;
        $("#roleSelector").children().each(function(){
            if($(this).val() == "?"){
                unselectedElem = $(this);
            }else if(parseInt($(this).val(), 10) == $scope.editUser.role.id){
                $(this).prop('selected', true);
                if(unselectedElem){
                    unselectedElem.remove();
                }
            }
        });
    };


    $scope.saveEditedUser = function(permission, permissionLevel){

        $("#editPermissionModal").modal('hide');

        FarmPermissionService.update(permission, permissionLevel.id, function(err, data){
            if(err){
                console.log("Update Permission Error");
                console.log(err);
                return;
            }

            loadPermissions($scope, FarmPermissionService);
        });

        $scope.editUser = null;
    };
});