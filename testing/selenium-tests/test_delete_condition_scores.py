from end_to_end_test import EndToEndTest
import test_config as config
import os
import sys
import csv

#=============================================================
# This tests that an administrator can delete condition scores.
# Requires the condition scores created by condition score
# importer and condition scorer app.
#=============================================================
class DeleteConditionScoresTest(EndToEndTest):
           
    def test(self):
        print "\nTEST delete condition scores"
        
        # Login as admin
        self.login_user(config.test_admin_email, config.test_admin_password)
    
        self.navigation.click_admin_dropdown()
        self.navigation.click_admin_measurements()

        # Delete each condition score submitted through the test csv file
        with open(os.path.dirname(os.path.realpath(sys.argv[0])) + "/" + config.test_condition_score_csv, 'r') as f:
            csv_reader = csv.reader(f)
            for row in csv_reader:
                self.admin_measurements_page.select_farm(config.test_farm)
                self.admin_measurements_page.select_herd(config.test_herd)
                
                if self.admin_measurements_page.delete_measurement(row[0]) is False:
                    print "failed to delete condition score with vid " + row[0]
                    
                self.navigation.click_admin_herds()
                self.navigation.click_admin_measurements()

        # Delete the condition score submitted through the condition scorer app
        self.admin_measurements_page.select_farm(config.test_farm)
        self.admin_measurements_page.select_herd(config.test_herd)

        if self.admin_measurements_page.delete_measurement(config.vid) is False:
            print "failed to delete condition score with vid " + vid + "\nthis condition score entered with condition scorer app"