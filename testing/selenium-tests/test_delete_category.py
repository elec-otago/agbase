from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This test deletes a category.  Requires test category to
# be created first.
#=============================================================
class DeleteCategoryTest(EndToEndTest):
    
    def test(self):
        print "\nTEST delete category"
        
        # Login as admin
        self.login_user(config.test_admin_email, config.test_admin_password)
        self.navigation.click_admin_dropdown()
        self.navigation.click_admin_categories()
        
        self.admin_categories_page.delete_category(config.test_category)
        
        self.driver.implicitly_wait(5)
        deleted_category = self.admin_categories_page.category_exists(config.test_category)
        
        self.assertFalse(deleted_category)