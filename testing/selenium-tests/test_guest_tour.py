from end_to_end_test import EndToEndTest
import test_config as config

#================================================================
# This test checks that the guest account has access to the 
# allowed areas of the website.
#================================================================
class GuestTourTest(EndToEndTest):

    def test(self):
        print "\nTEST guest tour"

        self.login_page.click_guest_login_button()

        print ""
        print "VIEW demo farm"

        # Go to Demo Farm
        self.navigation.click_farms_dropdown_farm(config.demo_farm)

        print ""
        print "VIEW condition scores report"

        # View graph of condition scores for Herd 1
        self.navigation.click_reports_dropdown()
        self.navigation.click_reports_condition_scores()

        self.condition_scores_report_page.select_farm(config.demo_farm)
        self.condition_scores_report_page.select_herd(config.demo_herd)

        print ""
        print "VIEW graph of weight trends report"

        # View graph of Weights for Herd 1
        self.navigation.click_weight_trend()

        self.weight_page.select_farm(config.demo_farm)
        self.weight_page.select_herd(config.demo_herd)
        
        print ""
        print "VIEW pasture demo paddock spatial data"
        
        # View pasture Measurements for Paddock 1
        self.navigation.click_apps_dropdown()
        self.navigation.click_spatial_data()

        self.spatial_data_page.select_farm(config.demo_farm)
        self.spatial_data_page.select_paddock(config.demo_paddock)
        self.spatial_data_page.click_submit_button()