from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test checks that an admin can give a user management 
# permissions.  
#
# Precondition: Requires test_create_farm to have passed
#               Requires test_create_test_users to have passed
#=============================================================
class ChangeUserPermissionTest(EndToEndTest):
           
    def test(self):
        print "\nTEST admin change account permissions"
        
        # Login as admin
        self.login_user(config.test_admin_email, config.test_admin_password)
        self.navigation.click_admin_dropdown()        
        self.navigation.click_admin_farm_permissions()
        
        self.admin_farm_permissions_page.create_farm_permission(
            config.test_farm,
            config.test_farmer_first + " " + config.test_farmer_last,
            config.manager_permission)
        
        has_management_perm = self.admin_farm_permissions_page.is_permission_in_table(
            config.test_farm,
            config.test_farmer_first + " " + config.test_farmer_last,
            config.manager_permission)
            
        self.assertTrue(has_management_perm)