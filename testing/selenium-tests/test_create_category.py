from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test creates a test category
#=============================================================
class CreateCategoryTest(EndToEndTest):

    def test(self):
        print "\nTEST create category"
        
        self.login_user(config.test_admin_email, config.test_admin_password)
    
        self.navigation.click_admin_dropdown()
        self.navigation.click_admin_categories()
        
        # Create a fake category type
        self.admin_categories_page.add_category(config.test_category, config.test_category_is_spatial)
        
        added_category = self.admin_categories_page.category_exists(config.test_category)
        
        self.assertTrue(added_category)