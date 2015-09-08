from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test deletes the two test users created by 
# the  create test users test
#=============================================================
class DeleteTestUsersTest(EndToEndTest):
           
    def test(self):
        print "\nTEST delete test users"
        
        # Login as admin
        self.login_user(config.test_admin_email, config.test_admin_password)
        
        # delete test farmer
        self.navigation.click_admin_dropdown()      
        self.navigation.click_admin_users()
        self.admin_users_page.delete_user_account(config.test_farmer_email)
        

        # delete test manager
        self.driver.refresh()
        self.navigation.click_admin_dropdown()
        self.navigation.click_admin_users()
        self.admin_users_page.delete_user_account(config.test_manager_email)
        
        # refresh page before checking if user exists
        self.driver.refresh()
        self.navigation.click_admin_dropdown()
        self.navigation.click_admin_users()
        
        farmer_exists = self.admin_users_page.is_user_in_table(config.test_farmer_email)
        self.assertFalse(farmer_exists)
        
        manager_exists = self.admin_users_page.is_user_in_table(config.test_manager_email)
        self.assertFalse(manager_exists)