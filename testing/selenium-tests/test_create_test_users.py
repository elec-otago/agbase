from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test creates two test users: a farmer and a farm manager
#=============================================================
class CreateTestUsersTest(EndToEndTest):
           
    def test(self):
        print "\nTEST create test users"
        
        # Login as admin
        self.login_user(config.test_admin_email, config.test_admin_password)
        self.navigation.click_admin_dropdown()        
        self.navigation.click_admin_users()
        
        # Create new farmer account
        created_farmer = self.admin_users_page.create_user_account(
                            config.test_farmer_first,
                            config.test_farmer_last, 
                            config.test_farmer_email, 
                            config.test_password)

        added_farmer = self.admin_users_page.is_user_in_table(config.test_farmer_email)
        
        self.assertTrue(added_farmer)

        # Create new farm manager account
        created_manager = self.admin_users_page.create_user_account(
                            config.test_manager_first, 
                            config.test_manager_last, 
                            config.test_manager_email, 
                            config.test_password)
        
        added_manager = self.admin_users_page.is_user_in_table(config.test_manager_email)
        
        self.assertTrue(added_manager)
