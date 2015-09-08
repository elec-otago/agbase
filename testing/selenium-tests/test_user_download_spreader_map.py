from end_to_end_test import EndToEndTest
import test_config as config

#================================================================
# This test checks that a farm user can download a spreader
# map csv file from the Pasture Analysis Report page.
# Requires test farmer, and Demo Farm to exist.
# TODO: write another test to check dates working as intended
#================================================================
class UserDownloadSpreaderMap(EndToEndTest):
    
    def test(self):
        print "\nTEST user download spreader map csv"
        
        # Login as test farmer
        self.login_page.click_guest_login_button()
    
        # Navigate to Pasture Analysis Report page
        self.navigation.click_reports_dropdown()
        self.navigation.click_reports_pasture_analysis()
        
        # Select farm and paddock
        self.pasture_analysis_report_page.select_farm(config.demo_farm)
        self.pasture_analysis_report_page.select_paddock(config.demo_paddock)
        
        # Get pasture measurements from data view form
        self.pasture_analysis_report_page.click_data_view_show()
        
        # Calculate spreader map.
        self.pasture_analysis_report_page.click_spreader_map_calculate()
        self.pasture_analysis_report_page.select_spreader_resolution(config.demo_spreader_conc)
        
        # Download csv file.
        self.pasture_analysis_report_page.input_spreader_map_file_name(config.demo_spreader_csv_name)
        self.pasture_analysis_report_page.click_download_spreader_map()
        
        