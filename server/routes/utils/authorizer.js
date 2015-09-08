var permissions = require('./permissions');
var FarmRoleController = agquire('ag/db/controllers/FarmRoleController');

var findFarmRole = function(farmId, farmPermissions) {
    var farmRole = null;
    for (var x = 0; x < farmPermissions.length; x++) {
        if (farmPermissions[x].farmId == farmId) {
            farmRole = farmPermissions[x].farmRole;
            break;
        }
    }
    return farmRole;
};

/**
 * Convert the set of input permissions to the most restrictive
 * single permission.
 * i.e. permissionA = permissionA_f1 && permissionsA_f2 && ...
 * @param farmPermissions user's permissions on each farm (from the token)
 */
var restrictRoles = function(farmPermissions) {
    if (farmPermissions.length === 0) {
        return null;
    }

    var restrictedRole = {};
    var permissionNames = FarmRoleController.getPermissionNames();

    for (var x = 0; x < permissionNames.length; x++) {

        var permission = permissionNames[x];
        var value = true;

        for (var roleIndex = 0; roleIndex < farmPermissions.length; roleIndex++) {
            var role = farmPermissions[roleIndex].farmRole;
            value = value && role[permission];
            if (!value) {
                break;
            }
        }

        restrictedRole[permission] = value;
    }

    return restrictedRole;
};

module.exports = {

    /*
        This function always executes synchronously but provides authorizedCallback
        and errorCallback for convenience.
        Returns true if the user is authorized, false otherwise.
     */
  authenticate: function(user, access, errorCallback) {
      // Any exceptions should cause the request to be rejected
      try {
          if (!access.requiredPermissions) {
              access.requiredPermissions = [];
          }

          var farmRole = null;
          var farmSpecified = false;

          // If they require a permission set for each of their farms then
          // checking access.farm is redundant (it must be in their allowed set)
          if (access.requiredForEachFarm) {

              farmRole = restrictRoles(user.permissions);

          } else if (access.farm) {

              var farmId = access.farm.id;
              if (farmId) {
                  farmSpecified = true;
                  farmRole = findFarmRole(farmId, user.permissions);
              }
          }

          if (access.user) {
              // We want != instead of !== because we want string conversion
              if (access.user.id != user.id) {
                  // user permissions first
                  access.requiredPermissions = access.user.requiredPermissions.concat(access.requiredPermissions);
              }
          }

          for (var x = 0; x < access.requiredPermissions.length; x++) {
              var permission = access.requiredPermissions[x];
              var allowed = permissions.verifyPermission(permission, farmRole, user.role);
              if (allowed !== true) {
                  var desc = permissions.permissionName(permission);
                  var msg = 'You do not have permission to ' + desc;
                  if (access.requiredForEachFarm) {
                      msg = msg + ' on all of your farms';
                  } else if (farmSpecified) {
                      msg = msg + ' on this farm';
                  }
                  errorCallback(msg);
                  return false;
              }
          }

      } catch (err) {
          console.log('ERROR: user permission check failed! ' + err.message);
          errorCallback('Failed to verify permissions');
          return false;
      }

      return true;

  }
};