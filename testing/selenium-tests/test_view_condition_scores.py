from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account can view condition scores as a 
# report.
# Requires test farm, test farmer, test herd, and test 
# farm manager to be created first.
#=============================================================
class ViewConditionScoresTest(EndToEndTest):
           
    def test(self):
        print "\nTEST view condition scores"
        
        # Login as admin
        self.login_user(config.test_manager_email, config.test_password)
    
         # View uploaded condition scores as a report
        self.navigation.click_reports_dropdown()
        self.navigation.click_reports_condition_scores()

        self.condition_scores_report_page.select_farm(config.test_farm)

        has_condition_scores = self.condition_scores_report_page.select_herd(config.test_herd)
        
        self.assertTrue(has_condition_scores)