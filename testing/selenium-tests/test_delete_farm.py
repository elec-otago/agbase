from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test creates a test farm
#=============================================================
class DeleteFarmTest(EndToEndTest):

    def test(self):
        print "\nTEST delete farm"
        
        self.login_user(config.test_admin_email, config.test_admin_password)       
        self.navigation.click_admin_dropdown()
        self.navigation.click_admin_farms()
        
        self.admin_farms_page.delete_farm(config.test_farm)
                
        farm_exists = self.admin_farms_page.farm_exists(config.test_farm)
        self.assertFalse(farm_exists)

if __name__ == "__main__":
    EndToEndTest.main()