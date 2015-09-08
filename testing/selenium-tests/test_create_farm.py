from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test creates a test farm
#=============================================================
class CreateFarmTest(EndToEndTest):

    def test(self):
        print "\nTEST setup farm"        
       
        self.login_user(config.test_admin_email, config.test_admin_password)      
        
        self.navigation.click_admin_dropdown()
        self.navigation.click_admin_farms()
        
        # Create a test farm
        self.admin_farms_page.add_farm(config.test_farm)        
        self.driver.implicitly_wait(5)
        added_farm = self.admin_farms_page.farm_exists(config.test_farm)

        self.assertTrue(added_farm)
