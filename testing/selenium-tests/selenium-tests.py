import unittest
import test_config as config
from selenium import webdriver
import page
import sys
import os
import csv


class AgBaseSeleniumTest(unittest.TestCase):

    def setUp(self):

        self.driver = webdriver.Firefox()
        url = os.getenv('TEST_URL', config.url)
        self.driver.get(url) 

        self.__load_pages()
        
        # Sets up by redirecting to login page
        main_page = page.MainPage(self.driver)
        main_page.click_login_link()

    def tearDown(self):
        
        self.cleanup()                
        self.driver.close()

    def test_run(self):
        print "============================="
        print "         Run Tests"
        print "============================="

        # Start tests by attempting to setup a test farm.
        added_farm = self.setup_farm()        
        
        if added_farm == True:
           
            # If a test farm was created, create test accounts.
            added_users = self.create_accounts()

            if added_users == True:

                # If test accounts were created, perform user tests.
                if self.import_condition_scores() == False:
                    print "FAIL import condition scores."

                if self.submit_condition_score_app() == False:
                    print "FAIL submit condition score app."
            else:
                print "FAIL test account setup."

        else:
            print "FAIL test farm setup."
        
        # Test guest account.
        self.guest_account()        
        
    #===========================================================================
    # Removes all data that was created for the purpose of testing 
    # from the database.
    #===========================================================================  
    def cleanup(self):
        print ""
        print "============================="
        print "       Clean Test Data"
        print "============================="
        
        # Login as admin
        self.__login_user("username", "password")
        
        #navigate to farms admin page
        self.navigation.click_admin_dropdown()
        
        self.__cleanup_condition_scores()
        self.__cleanup_accounts()      
        self.__cleanup_farm()
        
        #Logout
        self.__logout()
        
    #===========================================================================
    # Initializes the pages needed to run tests.
    #===========================================================================  
    def __load_pages(self):
        self.farm_page = page.FarmPage(self.driver)
        self.login_page = page.LoginPage(self.driver)
        self.navigation = page.Navigation(self.driver)
        self.admin_users_page = page.AdminUsersPage(self.driver)
        self.admin_farms_page = page.AdminFarmsPage(self.driver)
        self.admin_paddocks_page = page.AdminPaddocksPage(self.driver)
        self.admin_herds_page = page.AdminHerdsPage(self.driver)
        self.admin_farm_permissions_page = page.AdminFarmPermissionsPage(self.driver)
        self.condition_scorer_page = page.ConditionScorerPage(self.driver)
        self.spatial_data_page = page.SpatialDataPage(self.driver)
        self.weight_page = page.WeightTrendPage(self.driver)
        self.admin_measurements_page = page.AdminMeasurementsPage(self.driver)
        self.condition_score_importer_page = page.ConditionScoreImporterPage(self.driver)      
        self.condition_scores_report_page = page.ConditionScoresReportPage(self.driver)


    #===========================================================================
    # Creates a test farm that contains a test paddock and herd (issue #15)
    #===========================================================================
    def setup_farm(self):
        print " "
        print "TEST setup farm"
        
        # Login as admin
        self.__login_user("username", "password")

        # Click admin dropdown menu
        self.navigation.click_admin_dropdown()
        
        # Create a test farm
        self.created_farm = self.__create_test_farm()    
        
        if self.created_farm == False:
            print "FAIL create test farm. Test aborted."
            return False        

        # Create a test paddock
        self.created_paddock = self.__create_test_paddock()
        
        if self.created_paddock == False:
            print "FAIL create test paddock.  Test aborted."
            return False

        # Create a test herd
        self.created_herd = self.__create_test_herd()
        
        if self.created_herd == False:
            print "FAIL create test herd.  Test aborted."
            return False

        self.__logout()

        return True

    #===========================================================================
    # Creates a test farm 
    #
    # Precondition: Must be logged in as an administrator.
    #
    #               The admin dropdown menu must be visible.
    #===========================================================================
    def __create_test_farm(self):       
        self.navigation.click_admin_farms()
        return self.admin_farms_page.add_farm(config.test_farm)
        
    #===========================================================================
    # Creates a test paddock
    #
    # Precondition: Must be logged in as an administrator.
    #
    #               The admin dropdown menu must be visible.
    #
    #               A test farm must have been created. 
    #===========================================================================
    def __create_test_paddock(self):        
        self.navigation.click_admin_paddocks()
        return self.admin_paddocks_page.add_paddock(config.test_paddock, config.test_farm)        

    #===========================================================================
    # Creates a test herd
    #
    # Precondition: Must be logged in as an administrator.
    #
    #               The admin dropdown menu must be visible.
    #
    #               A test paddock must have been created.
    #===========================================================================
    def __create_test_herd(self):
        self.navigation.click_admin_herds()
        return self.admin_herds_page.add_herd(config.test_herd, config.test_farm)

    #===========================================================================
    # Test guest login (issue #15)
    #
    # Precondition: The guest user must be able to view a farm with a name 
    #               equal to that of demo_farm in the config file.
    #
    #               The demo farm requires a paddock with the name equal to that
    #               of demo_farm in the config file.
    #
    #               The demo farm requires a herd with the name equal to that 
    #               of demo herd in the config file
    #===========================================================================
    def guest_account(self):
        print ""
        print "TEST guest account"
        
        # Login as a guest        
        self.login_page.click_guest_login_button()
        #TODO: this fixes issue with login not loading correctly at time of writing.
        self.driver.refresh()

        print ""
        print "VIEW demo farm"

        # Go to Demo Farm
        self.navigation.click_farms_dropdown()
        if self.navigation.click_farms_dropdown_farm(config.demo_farm) == False:
            print "FAIL guest view demo farm"

        print ""
        print "VIEW condition scores report"

        # View graph of condition scores for Herd 1
        self.navigation.click_reports_dropdown()
        self.navigation.click_reports_condition_scores()

        if self.condition_scores_report_page.select_farm(config.demo_farm) == False:
            print "FAIL guest select demo farm in condition scores report"

        if self.condition_scores_report_page.select_herd(config.demo_herd) == False:
            print "FAIL guest select demo herd in condition scores report"

        print ""
        print "VIEW graph of weight trends report"

        # View graph of Weights for Herd 1
        self.navigation.click_weight_trend()

        if self.weight_page.select_farm(config.demo_farm) == False:
            print "FAIL guest select demo farm in weight trends report"

        if self.weight_page.select_herd(config.demo_herd) == False:
            print "FAIL guest select demo herd in weight trends report"
        
        print ""
        print "VIEW pasture demo paddock spatial data"
        
        # View pasture Measurements for Paddock 1 (Aka dunedin paddock)
        self.navigation.click_apps_dropdown()
        self.navigation.click_spatial_data()
      
        if self.spatial_data_page.select_farm(config.demo_farm) == False:
            print "FAIL guest select demo farm in spatial data app"
    
        if self.spatial_data_page.select_paddock(config.demo_paddock) == False:
            print "FAIL guest select demo paddock in spatial data app"
        else:
            self.spatial_data_page.click_submit_button()

        # Logout
        self.__logout()

    #===========================================================================
    # Test importing condition scores (issue #16)
    #===========================================================================
    def import_condition_scores(self):
        print ""
        print "TEST import condition scores"  

        # Login as admin
        self.__login_user(config.test_farmer_email, config.test_password)

        # View condition score importer page
        self.navigation.click_apps_dropdown()
        self.navigation.click_condition_score_importer()

        # Choose condition score file
        csv_path = os.path.dirname(os.path.realpath(sys.argv[0])) + "/" + config.test_condition_score_csv

        self.scores_imported = self.condition_score_importer_page.upload_condition_score_csv(
            config.test_farm,
            config.test_herd,
            config.importer_measurement_type,
            csv_path)        

        # View uploaded condition scores as a report
        self.navigation.click_reports_dropdown()
        self.navigation.click_reports_condition_scores()

        if self.condition_scores_report_page.select_farm(config.test_farm) == False:
            print "FAIL farmer select test farm in condition scores report"

        if self.condition_scores_report_page.select_herd(config.test_herd) == False:
            print "FAIL farmer select test herd in condition scores report"

        # Logout
        self.__logout()
    
        return self.scores_imported        
       
    #===========================================================================
    # Test creation of new account (issue #17)
    #===========================================================================
    def create_accounts(self):
        print ""
        print "TEST create accounts"
               
        self.__login_user("username", "password")        
        created_users = self.__create_farmer_and_manager()
        self.__logout()
                
        if created_users == True:
            self.__login_user(config.test_farmer_email, config.test_password)
            added_manager_perm = self.__farmer_give_manager_permissions()
            self.__logout()

            if added_manager_perm == False:
                print "FAIL  give farm manager test farm management permissions."
                return False

        else:
            print "FAIL create accounts."
            return False

        return True

    #===========================================================================
    # Test use of Condition Scorer app
    #
    # Precondition: The farm manager account must have been created.
    #               
    #               The farm manager must have management permissions for test
    #               farm.
    #===========================================================================
    def submit_condition_score_app(self):
        print ""
        print "TEST condition score with app" 
        self.__login_user(config.test_manager_email, config.test_password)

        self.condition_score_added = self.__test_manager_add_data()        
        
        self.__logout()

        return self.condition_score_added
              
    #===========================================================================
    # Creates a farmer and a manger.  gives the farmer
    # management permissions for test farm.
    #
    # Precondition: Must be logged in as an administrator.
    #===========================================================================
    def __create_farmer_and_manager(self):
               
        #view administrate users page
        self.navigation.click_admin_dropdown()        
        self.navigation.click_admin_users()
        
        # Create new farmer account
        self.created_farmer = self.admin_users_page.create_user_account(
                            config.test_farmer_first,
                            config.test_farmer_last, 
                            config.test_farmer_email, 
                            config.test_password)

        if self.created_farmer == False:
            print "FAIL create test farmer account."
            return False
        
        # Create new farm manager account
        self.created_manager = self.admin_users_page.create_user_account(
                            config.test_manager_first, 
                            config.test_manager_last, 
                            config.test_manager_email, 
                            config.test_password)
        
        if self.created_manager == False:
            print "FAIL create test farm manager account."
            return False       
        
        # Give farmer permission to manage test farm
        self.navigation.click_admin_farm_permissions()
        farmer_has_management_perm = self.admin_farm_permissions_page.create_farm_permission(
                                        config.test_farm,
                                        config.test_farmer_first + " " + config.test_farmer_last,
                                        config.manager_permission)

        if farmer_has_management_perm == False:
            print "FAIL give farmer test farm management permissions."
            return False

        return True

    #===========================================================================
    # Logs in as test farmer.  Gives test farm manager
    # management permissions for test farm.
    #
    # Precondition: Test farm must have been created.
    #
    #               Test farmer must have management permissions for test farm.
    #===========================================================================
    def __farmer_give_manager_permissions(self):

        # Navigate to the test farm page
        self.navigation.click_farms_dropdown()
        self.navigation.click_farms_dropdown_farm(config.test_farm)

        # Give farm manager ability to add new data
        return self.farm_page.create_farm_permission(
           config.test_manager_first + " " + config.test_manager_last,
            config.manager_permission)
                
        # TODO: Confirm farm manager has manager permission for Test Farm
    
    #===========================================================================
    # Logs in as farm manager.  Enters new weight data for
    # some animals in test farm herd.
    #
    # Precondition: Must be logged in as farm manager.
    #
    #               Farm manager must have management permissions for test farm.
    #
    # TODO: Won't work until issue #61 gets resolved.
    #===========================================================================
    def __test_manager_add_data(self):

        # TODO: Add new weights data
        # just navigates to page and fills out without submitting till fixed
        self.navigation.click_apps_dropdown()
     
        return self.__add_condition_score()      

    #===========================================================================
    # Adds a condition score with the condition scorer app.
    #
    # Precondition: Must be logged in as a user with management permissions
    #               For test test farm.
    #
    #               Test farm must have been created.
    #               
    #               Test herd must have been created.
    #=========================================================================== 
    def __add_condition_score(self):
        
        self.navigation.click_condition_scorer()        
        
        return self.condition_scorer_page.add_condition_score(
            config.test_farm, 
            config.test_herd,
            config.vid,
            config.score)

    #===========================================================================
    # Deletes the condition scores that were created for the purpose of testing.
    #
    # Precondition: The navigation menu must be opened before calling this function.
    #===========================================================================
    def __cleanup_condition_scores(self):
        
        self.navigation.click_admin_measurements()
       
        if  hasattr(self, 'scores_imported') and self.scores_imported == True:

            # Delete each condition score submitted through the test csv file
            with open(os.path.dirname(os.path.realpath(sys.argv[0])) + "/" + config.test_condition_score_csv, 'r') as f:
                csv_reader = csv.reader(f)
                for row in csv_reader:
                    self.admin_measurements_page.select_farm(config.test_farm)
                    self.admin_measurements_page.select_herd(config.test_herd)
                    self.admin_measurements_page.delete_measurement(row[0])
                    self.navigation.click_admin_herds()
                    self.navigation.click_admin_measurements()

        # Delete the condition score submitted through the condition scorer app         
        if hasattr(self,'condition_score_added') and self.condition_score_added == True:      

            self.admin_measurements_page.select_farm(config.test_farm)
            self.admin_measurements_page.select_herd(config.test_herd)
            self.admin_measurements_page.delete_measurement(config.vid)
    #===========================================================================
    # Deletes the user accounts that were created for the purpose of 
    # testing.
    #  NOTE: The navigation menu must be opened before calling this function.
    #===========================================================================
    def __cleanup_accounts(self):
               
        self.navigation.click_admin_users()
        
        #delete test farmer account
        if hasattr(self, 'created_farmer') and self.created_farmer == True:
            self.admin_users_page.delete_user_account(config.test_farmer_email)
        
            #TODO delete test manager account without reloading user tables
            self.navigation.click_apps_dropdown()
            self.navigation.click_condition_score_importer()
            self.navigation.click_admin_dropdown()
            self.navigation.click_admin_users()
        
        #delete test manager account
        if hasattr(self,'created_manager') and self.created_manager == True:
            self.admin_users_page.delete_user_account(config.test_manager_email)

    #===========================================================================
    # Deletes the test farm, herd, and paddock that was created for 
    # the purpose of testing.
    #
    # Precondition: The navigation menu must be opened before calling this function.
    #===========================================================================
    def __cleanup_farm(self):
        
        # Delete test herd        
        if hasattr(self, 'created_herd') and self.created_herd == True:
            self.navigation.click_admin_herds()   
            self.admin_herds_page.delete_herd(config.test_herd)

        # Delete test paddock
        if hasattr(self, 'created_paddock') and self.created_paddock == True:
            self.navigation.click_admin_paddocks()
            self.admin_paddocks_page.delete_paddock(config.test_paddock)
        
        # Delete test farm
        if hasattr(self,'created_farm') and self.created_farm == True:
            self.navigation.click_admin_farms()
            self.admin_farms_page.delete_farm(config.test_farm)
     
    #===========================================================================
    # Logs into AgBase with the given user credentials.
    #===========================================================================
    def __login_user(self, email, password):
        self.login_page.submit_email(email)
        self.login_page.submit_password(password)
        self.login_page.click_login_button()        
        #TODO: this fixes issue with login not loading correctly at time of writing.
        self.driver.refresh() 
        
    #===========================================================================
    # Logs out of AgBase.
    #===========================================================================
    def __logout(self):
        self.navigation.click_user_dropdown()
        self.navigation.click_logout()
        #TODO: this fixes issue with login not loading correctly at time of writing.
        self.driver.refresh()

 
if __name__ == "__main__":
    unittest.main()
