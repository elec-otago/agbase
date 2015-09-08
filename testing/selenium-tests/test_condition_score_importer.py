from end_to_end_test import EndToEndTest
import test_config as config
import os
import sys
#=============================================================
# This tests that an account with permission to manage a farm 
# can  upload a condition score csv file.
#
# Precondition: Requires test_create_farm to have passed
#               Requires test_create_test_users to have passed
#               Requires test_user_change_farm_permission
#               to have passed?
#=============================================================
class ConditionScoreImporterTest(EndToEndTest):
           
    def test(self):
        print "\nTEST condition score importer"
        
        # Login as admin
        self.login_user(config.test_manager_email, config.test_password)
    
        self.navigation.click_apps_dropdown()
        self.navigation.click_condition_score_importer()

        # Choose condition score file
        csv_path = os.path.dirname(os.path.realpath(sys.argv[0])) + "/" + config.test_condition_score_csv

        scores_imported = self.condition_score_importer_page.upload_condition_score_csv(
            config.test_farm,
            config.test_herd,
            config.importer_measurement_type,
            csv_path)
        
        self.assertTrue(scores_imported)