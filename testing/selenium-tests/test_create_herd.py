from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test deletes a herd.  
#
# Precondition: Requires test_create_farm to have passed
#=============================================================
class CreateHerdTest(EndToEndTest):
           
    def test(self):
        print "\nTEST create herd"
        
        # Login as admin
        self.login_user(config.test_admin_email, config.test_admin_password)
        self.navigation.click_admin_dropdown()
    
        self.navigation.click_admin_herds()
        self.admin_herds_page.add_herd(config.test_herd, config.test_farm)

        added_herd = self.admin_herds_page.herd_exists(config.test_herd)
        self.assertTrue(added_herd)