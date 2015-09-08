from end_to_end_test import EndToEndTest
import test_config as config
import time

#================================================================
# This test checks that the guest account has the ability to 
# download vra map files for the demo farm.
#================================================================
class GuestDownloadVRAMap(EndToEndTest):

    def test(self):
        print "\nTEST guest download vra map files"
        
        self.login_page.click_guest_login_button()
        
        # Go to Pasture Analysis page
        self.navigation.click_reports_dropdown()
        self.navigation.click_reports_pasture_analysis()
        
        # Select Demo Farm
        self.pasture_analysis_report_page.select_farm(config.demo_farm)
        
        # Select Paddock 1
        self.pasture_analysis_report_page.select_paddock(config.demo_paddock)
        time.sleep(1)
        self.pasture_analysis_report_page.click_data_view_show()
        time.sleep(5)
        # Calculate VRA map with 50 meter spread
        self.pasture_analysis_report_page.click_spreader_map_calculate()
        self.pasture_analysis_report_page.select_spreader_resolution(config.demo_spreader_conc)
        self.pasture_analysis_report_page.click_dialog_calculate()
        time.sleep(10)
        # Download shapefile
        self.pasture_analysis_report_page.click_download_shapefile()
        
        #TODO: check that the files downloaded correctly