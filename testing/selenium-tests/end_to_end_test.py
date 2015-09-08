import unittest
import test_config as config
from selenium import webdriver
import selenium.webdriver.chrome.webdriver
from selenium.webdriver.chrome.options import Options
import page
import os

class EndToEndTest(unittest.TestCase):

    def setUp(self):

        chromium_path = '/usr/bin/chromium'
        chromedriver_path = './chromedriver'
        
        opts = Options()
        opts.binary_location = chromium_path
        opts.add_experimental_option("prefs", {
            "download.default_directory": "./test_downloaded", 
            "helperApps.neverAsk.saveToDisk": "octet/stream", 
            "directory_upgrade": True,
            "profile": {"default_content_settings": {"multiple-automatic-downloads": 1}}
            })
        
        self.driver = webdriver.Chrome(chrome_options=opts, executable_path=chromedriver_path)

        #self.driver = webdriver.Firefox()        
        url = os.getenv('TEST_URL', config.url)
        self.driver.get(url)

        self.__load_pages()

        # Sets up by redirecting to login page
        main_page = page.MainPage(self.driver)
        main_page.click_login_link()

    def tearDown(self):
        try:
            self.__logout()
        except:
            print "couldn't logout"
        finally:
            self.driver.close()

    def login_user(self, email, password):
        self.login_page.submit_email(email)
        self.login_page.submit_password(password)
        self.login_page.click_login_button()

    def __logout(self):
        self.navigation.click_user_dropdown()
        self.navigation.click_logout()

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
        self.pasture_analysis_report_page = page.PastureAnalysisReportPage(self.driver)
        self.admin_categories_page = page.AdminCategoriesPage(self.driver)