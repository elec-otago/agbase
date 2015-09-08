from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test deletes a herd.  Requires test herd to
# be created first.
#=============================================================
class DeleteHerdTest(EndToEndTest):
           
    def test(self):
        print "\nTEST delete herd"
        
        # Login as admin
        self.login_user(config.test_admin_email, config.test_admin_password)
        self.navigation.click_admin_dropdown()
    
        self.navigation.click_admin_herds()   
        self.admin_herds_page.delete_herd(config.test_herd)
        
        herd_exists = self.admin_herds_page.herd_exists(config.test_herd)
        self.assertFalse(herd_exists)