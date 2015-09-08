from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test creates a test paddock.  
#
# Precondition: Requires test_create_farm to have passed
#=============================================================
class CreatePaddockTest(EndToEndTest):

    def test(self):
        print "\nTEST create paddock"
        
        # Login as admin
        self.login_user(config.test_admin_email, config.test_admin_password)
 
        self.navigation.click_admin_dropdown()    
        self.navigation.click_admin_paddocks()
        self.admin_paddocks_page.add_paddock_borders(config.test_paddock, config.test_farm, config.test_paddock_spreader_map_coords)   
        
        paddock_added = self.admin_paddocks_page.paddock_exists(config.test_paddock)
        
        self.assertTrue(paddock_added)