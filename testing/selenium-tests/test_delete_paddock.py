from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test deletes a paddock.  Requires test paddock to
# be created first.
#=============================================================
class DeletePaddockTest(EndToEndTest):
           
    def test(self):
        print "\nTEST delete paddock"
        
        # Login as admin
        self.login_user(config.test_admin_email, config.test_admin_password)
        self.navigation.click_admin_dropdown()
    
        self.navigation.click_admin_paddocks()
        self.admin_paddocks_page.delete_paddock(config.test_paddock)
        
        paddock_exists = self.admin_paddocks_page.paddock_exists(config.test_paddock)
        self.assertFalse(paddock_exists)