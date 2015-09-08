from selenium.webdriver.support.ui import WebDriverWait, Select
from locators import *
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import logging
import time

# All page objects should inherit this class.
class BasePage(object):

    def __init__(self, driver):
        self.driver = driver
        
    def click_element(self, element):
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)        
        element.click()
        
    def is_element_present(self, element):
        try:
            self.driver.find_element(*element)
        except:
            return False
        return True
# All sub page objects should inherit this class instead of BasePage.
# A sub page is defined as the page element that a user can interact
# with to view data or perform a task once they are have logged in
# e.g. a Farms page, Condition Importer, Condition Scores etc...
class SubPage(BasePage):
    
    def get_page_header_text(self):
        WebDriverWait(self.driver,60).until(EC.presence_of_element_located(SubPageLocators.PAGE_HEADER))
        element = self.driver.find_element(*SubPageLocators.PAGE_HEADER)
        return element.text
    
    def click_page_header(self):
        try:
            WebDriverWait(self.driver,60).until(EC.presence_of_element_located(SubPageLocators.PAGE_HEADER))
            element = self.driver.find_element(*SubPageLocators.PAGE_HEADER)
            self.click_element(element)            
        except:            
            return

class MainPage(BasePage):

    def click_login_link(self):        
        WebDriverWait(self.driver, 60).until(EC.element_to_be_clickable(MainPageLocators.LOGIN_LINK))
        element = self.driver.find_element(*MainPageLocators.LOGIN_LINK)
        self.click_element(element)

#========================================================================= 
# Login page
#=========================================================================
class LoginPage(BasePage):

    def submit_email(self, emailStr):
        try:
            WebDriverWait(self.driver, 60).until(EC.element_to_be_clickable(LoginPageLocators.LOGIN_EMAIL_INPUT))

            element = self.driver.find_element(*LoginPageLocators.LOGIN_EMAIL_INPUT)
            element.send_keys(emailStr)
        except Exception as ex:            
            print "\nunable to enter email address in Login page"
            raise

    def submit_password(self, passwordStr):
        try:
            WebDriverWait(self.driver, 60).until(EC.element_to_be_clickable(LoginPageLocators.LOGIN_PASSWORD_INPUT))

            element = self.driver.find_element(*LoginPageLocators.LOGIN_PASSWORD_INPUT)
            element.send_keys(passwordStr)
        except Exception as ex:
            print "\nunable to enter password in Login page"            
            raise

    def click_login_button(self):
        try:
            WebDriverWait(self.driver, 60).until(EC.element_to_be_clickable(LoginPageLocators.LOGIN_BTN))

            element = self.driver.find_element(*LoginPageLocators.LOGIN_BTN)
            self.click_element(element)
        except Exception as ex:
            print "unable to click Login button in Login page"
            raise

    def click_guest_login_button(self):
        try:
            WebDriverWait(self.driver, 60).until(EC.element_to_be_clickable(LoginPageLocators.GUEST_LOGIN_BTN))

            element = self.driver.find_element(*LoginPageLocators.GUEST_LOGIN_BTN)
            self.click_element(element)
        except Exception as ex:
            print "unable to click Guest Login button in Login page"
            raise

#========================================================================= 
# Navigation 
# Allows user interaction with the side menu and user dropdown.
#=========================================================================
class Navigation(BasePage):
    
    #depreciated: use click_farms_dropdown_farm instead
    def click_farms_dropdown(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.FARMS))
            element = self.driver.find_element(*NavigationLocators.FARMS)
            self.click_element(element)
        except:
            return False

        return True
    
    def click_farms_dropdown_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable( (By.LINK_TEXT, farm) ))
            element = self.driver.find_element_by_link_text(farm)
            self.click_element(element)
        except:
            return False

        return True
           
    def click_demo_farm(self):                    
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.FARMS_DEMO_FARM))
        element = self.driver.find_element(*NavigationLocators.FARMS_DEMO_FARM)
        self.click_element(element)
    
    def click_reports_dropdown(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.REPORTS))
        element = self.driver.find_element(*NavigationLocators.REPORTS)
        self.click_element(element)
  
    def click_reports_condition_scores(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.REPORTS_CONDITION_SCORES))
        element = self.driver.find_element(*NavigationLocators.REPORTS_CONDITION_SCORES)
        self.click_element(element)
 
    def click_reports_pasture_analysis(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.REPORTS_PASTURE_ANALYSIS))
        element = self.driver.find_element(*NavigationLocators.REPORTS_PASTURE_ANALYSIS)
        self.click_element(element)
 
    def click_weight_trend(self):                    
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.REPORTS_WEIGHT_TREND))
        element = self.driver.find_element(*NavigationLocators.REPORTS_WEIGHT_TREND)
        self.click_element(element)
        
    def click_apps_dropdown(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.APPS))
        element = self.driver.find_element(*NavigationLocators.APPS)
        self.click_element(element)

    def click_spatial_data(self):                    
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.APPS_SPATIAL_DATA))
        element = self.driver.find_element(*NavigationLocators.APPS_SPATIAL_DATA)
        self.click_element(element)
        
    def click_condition_scorer(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.APPS_CONDITION_SCORER))
        element = self.driver.find_element(*NavigationLocators.APPS_CONDITION_SCORER)
        self.click_element(element)
        
    def click_condition_score_importer(self):                
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.APPS_CONDITION_SCORE_IMPORTER))
        element = self.driver.find_element(*NavigationLocators.APPS_CONDITION_SCORE_IMPORTER)
        self.click_element(element)
        
    def click_user_dropdown(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.USER))
        element = self.driver.find_element(*NavigationLocators.USER)
        self.click_element(element)
        
    def click_admin_dropdown(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.ADMIN))
        element = self.driver.find_element(*NavigationLocators.ADMIN)
        self.click_element(element)

    def click_admin_users(self):                    
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.ADMIN_USERS))
        element = self.driver.find_element(*NavigationLocators.ADMIN_USERS)       
        self.click_element(element)

    def click_admin_farm_permissions(self):        
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.ADMIN_FARM_PERMISSIONS))
        element = self.driver.find_element(*NavigationLocators.ADMIN_FARM_PERMISSIONS)
        self.click_element(element)
        
    def click_admin_farms(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.ADMIN_FARMS))
        element = self.driver.find_element(*NavigationLocators.ADMIN_FARMS)
        self.click_element(element)
    
    def click_admin_paddocks(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.ADMIN_PADDOCKS))
        element = self.driver.find_element(*NavigationLocators.ADMIN_PADDOCKS)
        self.click_element(element)
    
    def click_admin_herds(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.ADMIN_HERDS))
        element = self.driver.find_element(*NavigationLocators.ADMIN_HERDS)
        self.click_element(element)

    def click_admin_measurements(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.ADMIN_MEASUREMENTS))
        element = self.driver.find_element(*NavigationLocators.ADMIN_MEASUREMENTS)
        self.click_element(element)

    def click_admin_categories(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.ADMIN_CATEGORIES))
        element = self.driver.find_element(*NavigationLocators.ADMIN_CATEGORIES)
        self.click_element(element)

    def click_logout(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(NavigationLocators.USER_LOGOUT))
        element = self.driver.find_element(*NavigationLocators.USER_LOGOUT)
        self.click_element(element)

#========================================================================= 
# Condition Score Importer App page
#=========================================================================
class ConditionScoreImporterPage(SubPage):
    
    def select_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoreImporterLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*ConditionScoreImporterLocators.FARM_DROPDOWN))
            farm_option = ConditionScoreImporterLocators.get_farm_option_locator(farm)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(farm_option))
            select.select_by_visible_text(farm)
        except:
            print "\nfailed to select farm " + farm + " on Condition Score Importer app page"
            raise
        
    def select_herd(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoreImporterLocators.HERD_DROPDOWN))
            select = Select(self.driver.find_element(*ConditionScoreImporterLocators.HERD_DROPDOWN))
            herd_option = ConditionScoreImporterLocators.get_herd_option_locator(herd)        
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(herd_option))
            select.select_by_visible_text(herd)
        except:
            print "\nfailed to select herd " + herd + " on Condition Score Importer app page"
            raise
        
    def select_date(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoreImporterLocators.DATE_PICKER))
            element = self.driver.find_element(*ConditionScoreImporterLocators.DATE_PICKER)
            element.click()
        except:
            print "\nfailed to select date picker on Condition Score Importer app page"
            raise
        
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoreImporterLocators.DATE_PICKER_DATE))
            element = self.driver.find_element(*ConditionScoreImporterLocators.DATE_PICKER_DATE)
            element.click()
        except:
            print "\nfailed to select date in date picker on Condition Score Importer app page"
            raise
        
    def select_measurement_type(self, measurement_type):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoreImporterLocators.MEASUREMENT_DROPDOWN))
            select = self.driver.find_element(*ConditionScoreImporterLocators.MEASUREMENT_DROPDOWN)
            measurement_option = ConditionScoreImporterLocators.get_measurement_option_locator(measurement_type)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(measurement_option))
            self.driver.find_element(*measurement_option).click()
        except:
            print "\nfailed to select measurement type " + measurement_type + " on Condition Score Importer app page"
            raise
        
    def click_browse_btn(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoreImporterLocators.BROWSE_BTN))
        element = self.driver.find_element(*ConditionScoreImporterLocators.BROWSE_BTN)
        self.click_element(element)
        
    def click_add_to_database(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoreImporterLocators.ADD_BTN))
            element = self.driver.find_element(*ConditionScoreImporterLocators.ADD_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Add to Database button on Condition Score Importer app page"
            raise

    def put_csv(self, csv_path):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoreImporterLocators.BROWSE_BTN))
            element = self.driver.find_element(*ConditionScoreImporterLocators.BROWSE_BTN)
            element.send_keys(csv_path)
        except:
            print "\nfailed to define csv file path on Condition Score Importer app page"
            raise

    def upload_condition_score_csv(self, farm, herd, measurement_type, file_path):
        try:
            self.select_farm(farm)
            self.select_herd(herd)
            self.select_date()
            self.select_measurement_type(measurement_type)
            self.put_csv(file_path)
            self.click_add_to_database()         
        except:
            return False

        try:
            WebDriverWait(self.driver,60).until(EC.visibility_of_element_located(ConditionScoreImporterLocators.UPLOAD_RESULT)) 
        except:
            print "\nfailed to upload  csv file to database on Condition Score Importer app page"
            return False

        return True

#========================================================================= 
# Condition Scorer App page
#=========================================================================
class ConditionScorerPage(SubPage):
    
    def select_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScorerPageLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*ConditionScorerPageLocators.FARM_DROPDOWN))        
            farm_option_locator = ConditionScorerPageLocators.get_farm_option_locator(farm)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(farm_option_locator))
            select.select_by_visible_text(farm)
        except:
            print "\nfailed to select farm " + farm + " on Condition Scorer app page"
            raise
    
    def select_herd(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScorerPageLocators.HERD_DROPDOWN))
            select = Select(self.driver.find_element(*ConditionScorerPageLocators.HERD_DROPDOWN))        
            herd_option_locator = ConditionScorerPageLocators.get_herd_option_locator(herd)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(herd_option_locator))
            select.select_by_visible_text(herd)
        except:
            print "\nfailed to select herd " + herd + " on Condition Scorer app page"
            raise
    
    def select_measurement_type(self, measurement_type):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScorerPageLocators.MEASUREMENT_DROPDOWN))
            select = self.driver.find_element(*ConditionScorerPageLocators.MEASUREMENT_DROPDOWN)
            measurement_option = ConditionScoreImporterLocators.get_measurement_option_locator(measurement_type)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(measurement_option))
            self.driver.find_element(*measurement_option).click()
        except:
            print "\nfailed to select measurement type " + measurement_type + " on Condition Scorer app page"
            raise
    
    def add_vid(self, vid):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScorerPageLocators.VID_INPUT))
            element = self.driver.find_element(*ConditionScorerPageLocators.VID_INPUT)
            element.clear()
            element.send_keys(vid)
        except:
            print "\nfailed to enter vid " + vid + " on Condition Scorer app page"
            raise
    
    def add_score(self, score):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScorerPageLocators.SCORE_INPUT))
            element = self.driver.find_element(*ConditionScorerPageLocators.SCORE_INPUT)
            element.clear()
            element.send_keys(score)
        except:
            print "\nfailed to enter score " + score + " on Condition Scorer app page"
            raise
        
    def click_submit(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScorerPageLocators.SUBMIT_BTN))
            element = self.driver.find_element(*ConditionScorerPageLocators.SUBMIT_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click submit button on Condition Scorer app page"
            raise
    
    def click_reset(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScorerPageLocators.RESET_BTN))
            element = self.driver.find_element(*ConditionScorerPageLocators.RESET_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click reset button on Condition Scorer app page"
            raise

    def add_condition_score(self, farm, herd, measurement, vid, score):
        try:
            self.select_farm(farm)
            self.select_herd(herd)
            self.add_vid(vid)
            self.select_measurement_type(measurement)
            self.add_score(score)
            self.click_submit()
        except:
            return False

        return True

#========================================================================= 
# Spatial Data App page
#=========================================================================
class SpatialDataPage(SubPage):
   
    def select_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(SpatialDataPageLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*SpatialDataPageLocators.FARM_DROPDOWN))
            farm_option_locator = SpatialDataPageLocators.get_farm_option_locator(farm)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(farm_option_locator))
            select.select_by_visible_text(farm)
        except:
            return False

        return True
   
    def select_paddock(self, paddock):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(SpatialDataPageLocators.PADDOCK_DROPDOWN))
            select = Select(self.driver.find_element(*SpatialDataPageLocators.PADDOCK_DROPDOWN))        
            paddock_option_locator = SpatialDataPageLocators.get_paddock_option_locator(paddock)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(paddock_option_locator))                 
            select.select_by_visible_text(paddock)
        except:
            return False

        return True
        
    def click_submit_button(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(SpatialDataPageLocators.SUBMIT_BTN))
        element = self.driver.find_element(*SpatialDataPageLocators.SUBMIT_BTN)
        self.click_element(element)

#========================================================================= 
# Weight Trend Report page
#=========================================================================
class WeightTrendPage(SubPage):
        
    def select_farm(self, farm):
        try: 
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(WeightTrendPageLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*WeightTrendPageLocators.FARM_DROPDOWN))        
            farm_option_locator = WeightTrendPageLocators.get_farm_option_locator(farm)        
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(farm_option_locator))
            select.select_by_visible_text(farm)
        except:
            print "\nunable to select farm in Weight Trend report page"
            raise  
           
    def select_herd(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(WeightTrendPageLocators.HERD_DROPDOWN))
            select = Select(self.driver.find_element(*WeightTrendPageLocators.HERD_DROPDOWN))
            herd_option_locator = WeightTrendPageLocators.get_herd_option_locator(herd)        
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(herd_option_locator))
            select.select_by_visible_text(herd)
        except:
            print "\nunable to select herd in Weight Trend report page"
            raise

#========================================================================= 
# Condition Scores Report page
#=========================================================================
class ConditionScoresReportPage(SubPage):

    def select_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoresReportLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*ConditionScoresReportLocators.FARM_DROPDOWN))
            farm_option_locator = ConditionScoresReportLocators.get_farm_option_locator(farm)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(farm_option_locator))
            select.select_by_visible_text(farm)
        except:
            print "\nunable to select farm in Condition Scores report page"
            raise
        
    def select_herd(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(ConditionScoresReportLocators.HERD_DROPDOWN))
            select = Select(self.driver.find_element(*ConditionScoresReportLocators.HERD_DROPDOWN))
            herd_option_locator = ConditionScoresReportLocators.get_herd_option_locator(herd)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(herd_option_locator))
            select.select_by_visible_text(herd)
            # TODO: Give the graph some time to load           
            return True
        except:
            print "\nunable to select herd in Condition Scores report page"
            return False # We have to return false here instead of raising an exception
                         # because this function's result is used for the test
        

#========================================================================= 
# Pasture Analysis Report Page
#=========================================================================
class PastureAnalysisReportPage(SubPage):
    
    def select_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(PastureAnalysisReportLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*PastureAnalysisReportLocators.FARM_DROPDOWN))
            farm_option_locator = PastureAnalysisReportLocators.get_farm_option_locator(farm)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(farm_option_locator))
            select.select_by_visible_text(farm)
        except:
            return False
        
        return True
    
    def select_paddock(self, paddock):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(PastureAnalysisReportLocators.PADDOCK_DROPDOWN))
            select = Select(self.driver.find_element(*PastureAnalysisReportLocators.PADDOCK_DROPDOWN))        
            paddock_option_locator = PastureAnalysisReportLocators.get_paddock_option_locator(paddock)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(paddock_option_locator))                 
            select.select_by_visible_text(paddock)
        except:
            return False

        return True
    
    def click_data_view_show(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(PastureAnalysisReportLocators.DATA_VIEW_SHOW_BTN))
            element = self.driver.find_element(*PastureAnalysisReportLocators.DATA_VIEW_SHOW_BTN)
            element.click()
        except:
            return False
        
        return True
    
    def click_spreader_map_calculate(self):
        WebDriverWait(self.driver,60).until(EC.presence_of_element_located( (By.CLASS_NAME, "angular-google-map") ))
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(PastureAnalysisReportLocators.CALCULATE_SPREADER_BTN))
        element = self.driver.find_element(*PastureAnalysisReportLocators.CALCULATE_SPREADER_BTN)
        self.click_element(element)
    
    def select_spreader_resolution(self, conc):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(PastureAnalysisReportLocators.METER_RES_DROPDOWN))
            select = Select(self.driver.find_element(*PastureAnalysisReportLocators.METER_RES_DROPDOWN))
            res_option_locator = PastureAnalysisReportLocators.get_resolution_option_locator(conc)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(res_option_locator))
            select.select_by_visible_text(conc)
            self.click_dialog_calculate()
        except:
            return False

        return True
    
    # Clicks the calculate button in the spreader map select resolution modal dialog.
    def click_dialog_calculate(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(PastureAnalysisReportLocators.MODAL_CALCULATE_SPREADER_BTN))
        element = self.driver.find_element(*PastureAnalysisReportLocators.MODAL_CALCULATE_SPREADER_BTN)
        self.click_element(element)
    
    def input_spreader_map_file_name(self, file_name):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(PastureAnalysisReportLocators.CSV_FILENAME_INPUT))
        element = self.driver.find_element(*PastureAnalysisReportLocators.CSV_FILENAME_INPUT)
        element.send_keys(file_name)
    
    def click_download_csv(self):                
        # Click download btn
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(PastureAnalysisReportLocators.DOWNLOAD_CSV_BTN))
        element = self.driver.find_element(*PastureAnalysisReportLocators.DOWNLOAD_CSV_BTN)
        self.click_element(element)

    def click_download_shapefile(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(PastureAnalysisReportLocators.DOWNLOAD_SHAPEFILE_BTN))
        element = self.driver.find_element(*PastureAnalysisReportLocators.DOWNLOAD_SHAPEFILE_BTN)
        self.click_element(element)

#========================================================================= 
# Farms Administration page
#=========================================================================   
class AdminFarmsPage(SubPage):
    
    def click_add_farm(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmsLocators.ADD_FARM_BTN))
            element = self.driver.find_element(*AdminFarmsLocators.ADD_FARM_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Add Farm button on Farms administration page"
            raise
    
    def add_farm_name(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmsLocators.INPUT_FARM_NAME))
            element = self.driver.find_element(*AdminFarmsLocators.INPUT_FARM_NAME)
            element.send_keys(farm)
        except:
            print "\nfailed to enter farm name " + farm + " in Create New Farm dialog on Farms administration page"
            raise

    def click_create_farm_btn(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmsLocators.CREATE_FARM_BTN))
            element = self.driver.find_element(*AdminFarmsLocators.CREATE_FARM_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Create button in Create New Farm dialog on Farms administration page"
            raise
 
    def add_farm(self, farm):
        try:
            self.click_add_farm()
            self.add_farm_name(farm)
            self.click_create_farm_btn()
        except:        
            return False    

        self.click_page_header()
        return True

    def delete_farm(self, farm):        
        #NOTE will most likely have to change implementation to deal with paged results
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmsLocators.FARM_TABLE))

        row_delete_btn = AdminFarmsLocators.get_row_delete_btn(farm)
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(row_delete_btn))       
        element = self.driver.find_element(*row_delete_btn)
        self.click_element(element)
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmsLocators.CONFIRM_FARM_DELETE_BTN))
        self.click_element(self.driver.find_element(*AdminFarmsLocators.CONFIRM_FARM_DELETE_BTN))

    def farm_exists(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmsLocators.FARM_TABLE))
            row_delete_btn = AdminFarmsLocators.get_row_delete_btn(farm)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(row_delete_btn))            
            return True
        
        except TimeoutException as e:
            return False
        
#========================================================================= 
# Categories Administration page
#=========================================================================        
class AdminCategoriesPage(SubPage):
    
    def modal_add_category_name(self, category_name):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminCategoriesLocators.CATEGORY_NAME_INPUT_MODAL))
            self.driver.find_element(*AdminCategoriesLocators.CATEGORY_NAME_INPUT_MODAL).send_keys(category_name)
        except:
            print "\nfailed to enter category name " + category_name
            raise
        
    def modal_add_category_spatial(self, category_spatial):
        try:
            if category_spatial == True:
                WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminCategoriesLocators.CATEGORY_SPATIAL_INPUT_MODAL))
                print "clicking"
                self.driver.find_element(*AdminCategoriesLocators.CATEGORY_SPATIAL_INPUT_MODAL).send_keys("\n")
        except:
            print "\nfailed to select category spatial value"
            raise
    
    def add_category(self, category_name, category_spatial):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminCategoriesLocators.ADD_CATEGORY_BTN))
            self.click_element(self.driver.find_element(*AdminCategoriesLocators.ADD_CATEGORY_BTN))
            self.modal_add_category_name(category_name)
            self.modal_add_category_spatial(category_spatial)
            self.click_element(self.driver.find_element(*AdminCategoriesLocators.MODAL_ADD_CATEGORY_BTN))
        except:
            print "\nfailed to add category " + category_name
            raise
    
    def delete_category(self, category_name):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminCategoriesLocators.CATEGORY_TABLE))
            delete_btn = self.driver.find_element(*AdminCategoriesLocators.get_row_delete_btn(category_name))
            self.click_element(delete_btn)            
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminCategoriesLocators.MODAL_DELETE_BTN))
            self.click_element(self.driver.find_element(*AdminCategoriesLocators.MODAL_DELETE_BTN))
        except:
            print "\nfailed to delete category"
            raise
    
    def category_exists(self, category_name):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminCategoriesLocators.CATEGORY_TABLE))
            row_delete_btn = AdminCategoriesLocators.get_row_delete_btn(category_name)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(row_delete_btn))
            return True        
        except:           
            return False

#========================================================================= 
# Paddocks Administration page
#=========================================================================
class AdminPaddocksPage(SubPage):
    
    def click_add_paddock(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminPaddocksLocators.ADD_PADDOCK_BTN))
            element = self.driver.find_element(*AdminPaddocksLocators.ADD_PADDOCK_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Add Paddock button on Paddocks administration page"
            raise
    
    def add_paddock_name(self, paddock):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminPaddocksLocators.INPUT_PADDOCK_NAME))
            element = self.driver.find_element(*AdminPaddocksLocators.INPUT_PADDOCK_NAME)
            element.send_keys(paddock)
        except:
            print "\nfailed to enter paddock name " + paddock + " in Create New Paddock dialog on Paddocks administration page"
            raise
    
    def select_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminPaddocksLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*AdminPaddocksLocators.FARM_DROPDOWN))
            select.select_by_visible_text(farm)
        except:
            print "\nfailed to select farm " + farm + " in Create New Paddock dialog on Paddocks administration page"
            raise
    
    def click_create_paddock_btn(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminPaddocksLocators.CREATE_PADDOCK_BTN))
            element = self.driver.find_element(*AdminPaddocksLocators.CREATE_PADDOCK_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Create button in Create New Paddock dialog on Paddocks administration page"
            raise

    #@depreciated use add_paddock_borders instead
    def add_paddock(self, paddock, farm):
        try:    
            self.click_add_paddock()
            self.add_paddock_name(paddock)
            self.select_farm(farm)
            self.click_create_paddock_btn()
        
        except:            
            return False

        self.click_page_header()
        return True
        
    def add_paddock_borders(self, paddock, farm, corners):
        try:
            self.click_add_paddock()
            self.add_paddock_name(paddock)
            self.select_farm(farm)
            self.add_paddock_corners(corners)
            self.click_create_paddock_btn()
        
        except:
            return False
        
        self.click_page_header()
        return True
    
    def add_paddock_corners(self, corners):
        try:
            for coords in corners: 
                WebDriverWait(self.driver,60).until(EC.element_to_be_clickable( (By.XPATH, "//div[@class='angular-google-map']") ))

                self.driver.execute_script(
                    "angular.element(document.getElementById('addPaddockMap')).scope().centerMap(arguments[0], arguments[1], 20);",
                    coords[0], coords[1])

                element = self.driver.find_element(*(By.XPATH, "//div[@class='angular-google-map']")) 
                element.click()
        except:
            print "\nfailed to add paddock borders in Create New Paddock dialog on Paddocks administration page"
            raise

    def delete_paddock(self, paddock):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminPaddocksLocators.PADDOCK_TABLE))
            row_delete_btn = AdminPaddocksLocators.get_row_delete_btn(paddock)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(row_delete_btn))
            self.click_element(self.driver.find_element(*row_delete_btn))
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminPaddocksLocators.CONFIRM_PADDOCK_DELETE_BTN))
            self.click_element(self.driver.find_element(*CONFIRM_PADDOCK_DELETE_BTN))
        except:
            print "\nunable to delete padddock " + paddock + " in Paddocks admin page"
        
    def paddock_exists(self, paddock):
        #NOTE It might be better to check for paddock and farm on same line...
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminPaddocksLocators.PADDOCK_TABLE))
            row_delete_btn = AdminPaddocksLocators.get_row_delete_btn(paddock)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(row_delete_btn))
            return True
        
        except:           
            return False
       
#========================================================================= 
# Herds Administration page
#=========================================================================
class AdminHerdsPage(SubPage):
    
    def click_add_herd(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminHerdsLocators.ADD_HERD_BTN))
            element = self.driver.find_element(*AdminHerdsLocators.ADD_HERD_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Add Herd button on Herds administration page"
            raise
        
    def add_herd_name(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminHerdsLocators.INPUT_HERD_NAME))
            element = self.driver.find_element(*AdminHerdsLocators.INPUT_HERD_NAME)
            element.send_keys(herd)
        except:
            print "\nfailed to enter herd name " + herd + " in Create New Herd dialog on Herds administration page"
            raise
    
    def select_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminHerdsLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*AdminHerdsLocators.FARM_DROPDOWN))        
            select.select_by_visible_text(farm) 
        except:
            print "\nfailed to select farm " + farm + " in Create New Herd dialog on Herds administration page"
            raise
    
    def click_create_herd_btn(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminHerdsLocators.CREATE_HERD_BTN))
            element = self.driver.find_element(*AdminHerdsLocators.CREATE_HERD_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Create button in Create New Herd dialog on Herds administration page"
            raise
    
    def add_herd(self, herd, farm):
        try:
            self.click_add_herd()
            self.add_herd_name(herd)
            self.select_farm(farm)
            self.click_create_herd_btn()

        except:
            return False

        self.click_page_header()
        return True
        
    def delete_herd(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminHerdsLocators.HERD_TABLE))
            row_delete_btn = AdminHerdsLocators.get_row_delete_btn(herd)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(row_delete_btn))
            element = self.driver.find_element(*row_delete_btn)
            self.click_element(element)
            
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminHerdsLocators.CONFIRM_DELETE_HERD_BTN))
            self.click_element(self.driver.find_element(*AdminHerdsLocators.CONFIRM_DELETE_HERD_BTN))
        except:
            print "\nunable to delete herd " + herd + " in Herds admin page"
            raise

    def herd_exists(self, herd):
        try:
            self.driver.implicitly_wait(5)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminHerdsLocators.HERD_TABLE))
            row_delete_btn = AdminHerdsLocators.get_row_delete_btn(herd)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(row_delete_btn))            
            return True        
        except TimeoutException as e:
            return False
#========================================================================= 
# 
#=========================================================================
class AdminAnimalsPage(SubPage):
    def placeholder_function(self):
        return True

#========================================================================= 
#  Users Administration page
#=========================================================================
class AdminUsersPage(SubPage):
    
    def click_add_user_btn(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.ADD_USER_BTN))
            self.click_page_header()
            element = self.driver.find_element(*AdminUsersLocators.ADD_USER_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Add User button on Users administration page"
            raise
    
    def add_user_first_name(self, first_name):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.FIRST_NAME_INPUT))
            element = self.driver.find_element(*AdminUsersLocators.FIRST_NAME_INPUT)
            element.clear()
            element.send_keys(first_name)
        except:
            print "\nfailed to enter first name " + first_name + " in Create New User dialog on Users administration page"
            raise
    
    def add_user_last_name(self, last_name):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.LAST_NAME_INPUT))
            element = self.driver.find_element(*AdminUsersLocators.LAST_NAME_INPUT)
            element.clear()
            element.send_keys(last_name)
        except:
            print "\nfailed to enter last name " + last_name + " in Create New User dialog on Users administration page"
            raise
    
    def add_user_email(self, email):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.EMAIL_INPUT))
            element = self.driver.find_element(*AdminUsersLocators.EMAIL_INPUT)
            element.clear()
            element.send_keys(email)
        except:
            print "\nfailed to enter email " + email + " in Create New User dialog on Users administration page"
            raise
    
    def add_user_password(self, password):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.PASSWORD_INPUT))
            element = self.driver.find_element(*AdminUsersLocators.PASSWORD_INPUT)
            element.clear()
            element.send_keys(password)
        except:
            print "\nfailed to enter password in Create New User dialog on Users administration page"
            raise
    
    #TODO: add a parameter to define the user role
    def add_user_role_user(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.ROLE_DROPDOWN))
            select = Select(self.driver.find_element(*AdminUsersLocators.ROLE_DROPDOWN))
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.ROLE_DROPDOWN_USER))
            select.select_by_visible_text("user")
        except:
            print "\nfailed to select user role in Create New User dialog on Users administration page"
            raise
    
    def add_user_click_create_btn(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.CREATE_BTN))
            element = self.driver.find_element(*AdminUsersLocators.CREATE_BTN)
            element.click()
        except:
            print "\nfailed to click Create button in Create New User dialog on Users administration page"
            raise

    def create_user_account(self, first_name, last_name, email, password):
        try:
            self.click_add_user_btn()
            self.add_user_first_name(first_name)
            self.add_user_last_name(last_name)
            self.add_user_email(email)
            self.add_user_password(password)
            self.add_user_role_user()
            self.get_page_header_text()
            self.add_user_click_create_btn()
        except:
            return False

        self.click_page_header() # This is used to focus the browser after interacting with modal dialog
        return True

    def delete_user_account(self, email):        
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.USER_TABLE))
            row_delete_btn = AdminUsersLocators.get_row_delete_btn(email)            
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(row_delete_btn))            
            element = self.driver.find_element(*row_delete_btn)
            self.click_element(element)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.CONFIRM_DELETE_USER_BTN))
            self.click_element(self.driver.find_element(*AdminUsersLocators.CONFIRM_DELETE_USER_BTN))
        except:            
            print "\nunable to click delete " + email + " button in Users admin page"
            raise

    def is_user_in_table(self, email):
        try:
            WebDriverWait(self.driver, 60).until(EC.element_to_be_clickable(AdminUsersLocators.USER_TABLE))            
            member_row = AdminUsersLocators.get_member_row(email)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(member_row))            
            return True
        except:
            return False

#========================================================================= 
# Farm page
#
# This page contains 4 tab panes:
#
#   1. Farm Members
#   2. Herds
#   3. Animals
#   4. Paddocks
#=========================================================================
class FarmPage(SubPage): 
   
    def click_dialog_cancel(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.CANCEL_BTN))
            element = self.driver.find_element(*FarmLocators.CANCEL_BTN)
            self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
            element.click()
        except Exception as e:
            logging.exception("something didn't work!")
       
    #==========================
    # Tab selection
    #==========================
    def click_members_tab(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.MEMBER_TAB))
            element = self.driver.find_element(*FarmLocators.MEMBER_TAB)
            self.click_element(element)
        except:
            print "\nunable to click Farm Members tab in Farm page"
            raise

    def click_herds_tab(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.HERD_TAB))
            element = self.driver.find_element(*FarmLocators.HERD_TAB)
            self.click_element(element)
        except:
            print "\nunable to click Herds tab in Farm page"
            raise

    def click_animals_tab(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ANIMAL_TAB))
            element = self.driver.find_element(*FarmLocators.ANIMAL_TAB)
            self.click_element(element)
        except:
            print "\nunable to click Animals tab in Farm page"
            raise
 
    def click_paddocks_tab(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.PADDOCK_TAB))
            element = self.driver.find_element(*FarmLocators.PADDOCK_TAB)
            self.click_element(element)
        except:
            print "\nunable to click Paddocks tab in Farm page"
            raise

    #==========================
    # Farm Members
    #==========================
    def click_add_user_btn(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ADD_USER_BTN))
            element = self.driver.find_element(*FarmLocators.ADD_USER_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Add User button in Farm Members tab on Farm page"
            raise

    def select_user(self, user):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.USER_DROPDOWN))
            select = Select(self.driver.find_element(*FarmLocators.USER_DROPDOWN))
            select.select_by_visible_text(user)
        except:
            print "\nunable to select user" + user + " in Edit User Role dialog in Farm Members tab on Farm page"
            raise

    #@depreciated use select_role instead
    def select_dialog_member_permission(self, permission):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_PERMISSION_DROPDOWN))
            select = Select(self.driver.find_element(*FarmLocators.DIALOG_PERMISSION_DROPDOWN))
            select.select_by_visible_text(permission)
        except:
            print "\nunable to select " + permission + " from dropdown in Edit User Role dialog in Farm Members tab on Farm page"
            raise
    
    def click_dialog_edit_permission(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_EDIT_MEMBER_BTN))
            element = self.driver.find_element(*FarmLocators.DIALOG_EDIT_MEMBER_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Update button in Edit User Role dialog in Farm Members tab on Farm page"
            raise

    def select_role(self, role):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ROLE_DROPDOWN))
            select = Select(self.driver.find_element(*FarmLocators.ROLE_DROPDOWN))
            select.select_by_visible_text(role)
        except:
            print "\nunable to select " + permission + " from dropdown in Edit User Role dialog in Farm Members tab on Farm page"
            raise

    def click_invite_btn(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.INVITE_BTN))
            element = self.driver.find_element(*FarmLocators.INVITE_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Invite User button in Add User dialog in Farm Members tab on Farm page"
            raise

    def create_farm_permission(self, user, role):        
        try:
            self.click_add_user_btn()
            self.select_user(user)
            self.select_role(role)
            self.click_invite_btn()
        except:
            return False
        self.click_page_header()
        return True

    def delete_member(self, first_name, last_name):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.MEMBER_TABLE))
            member_row = FarmLocators.get_member_row(first_name, last_name)
            self.driver.find_element(*member_row).find_element(*FarmLocators.DELETE_MEMBER_ACTION).click()
            self.click_dialog_delete_member()
        except:
            print "\nunable to click Delete Member button in Farm Members tab on Farm page"
            raise
    
    def edit_farm_member_permission(self, first_name, last_name, permission):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.MEMBER_TABLE))
            member_row = FarmLocators.get_member_row(first_name, last_name)
            self.driver.find_element(*member_row).find_element(*FarmLocators.EDIT_MEMBER_ACTION).click()
            self.select_dialog_member_permission(permission)
            self.click_dialog_edit_permission()
        except:
            print "\nunable to click Edit Permissions button in Farm Members tab on Farm page"
            raise
    
    def click_dialog_delete_member(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_DELETE_MEMBER_BTN))
            element = self.driver.find_element(*FarmLocators.DIALOG_DELETE_MEMBER_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Ok button in Delete Farm Member dialog on Farm Members tab on Farm page"
            raise
        
    def is_member_in_table(self, first_name, last_name, permission):        
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.MEMBER_TABLE))
            member_row = FarmLocators.get_member_row(first_name, last_name, permission)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(member_row))
        except:
            return False
        return True

    #==========================
    # Herds
    #==========================
    def click_create_herd(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.CREATE_HERD_BTN))
            element = self.driver.find_element(*FarmLocators.CREATE_HERD_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Create Herd button in Herds tab on Farm page"
            raise

    def click_dialog_create_herd(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_CREATE_HERD_BTN))
            element = self.driver.find_element(*FarmLocators.DIALOG_CREATE_HERD_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Create Herd button in Create Herd dialog in Herds tab on Farm page"
            raise

    def dialog_enter_herd_name(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.CREATE_HERD_NAME_INPUT))
            element = self.driver.find_element(*FarmLocators.CREATE_HERD_NAME_INPUT)
            element.send_keys(herd)
        except:
            print "\nunable to enter herd name in Create Herd dialog in Herds tab on Farm page"
            raise

    def click_delete_herd_btn(self, herd):
        try:
            print "finding herd table"
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.HERD_TABLE))
            delete_btn = FarmLocators.get_herd_delete_btn(herd)
            print "finding delete button"
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(delete_btn))
            element = self.driver.find_element(*delete_btn)
            self.click_element(element)
        except:
            print "\nunable to click Delete herd button in Herds tab on Farm page"
            raise

    def click_dialog_delete_herd(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_DELETE_HERD_BTN))
            element = self.driver.find_element(*FarmLocators.DIALOG_DELETE_HERD_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Delete Herd button in Delete Herd dialog in Herds tab on Farm page"
            raise

    def edit_herd_name(self, old_name, new_name):
        try:
            print "finding table"
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.HERD_TABLE))
            print "finding herd row"
            herd_row = FarmLocators.get_herd_row(old_name)
            element = self.driver.find_element(*herd_row)
            print "clicking edit action"
            element.find_element(*FarmLocators.EDIT_HERD_ACTION).click()
            #element.click()
        except:
            print "\nunable to click Edit herd button in Herds tab on Farm page"
            raise
        
        self.input_dialog_herd_name(new_name)
        self.click_dialog_edit_herd_name()

    def input_dialog_herd_name(self, name):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_HERD_NAME_INPUT))
            name_input = self.driver.find_element(*FarmLocators.DIALOG_HERD_NAME_INPUT)
            name_input.clear()        
            name_input.send_keys(name)
        except:
            print "\nunable to enter herd name in Edit Herd dialog in Herds tab on Farm page"
            raise
        
    def click_dialog_edit_herd_name(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_EDIT_HERD_BTN))
            element = self.driver.find_element(*FarmLocators.DIALOG_EDIT_HERD_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Save Herd button in Edit Herd dialog in Herds tab on Farm page"
            raise
        
    def is_herd_in_table(self, herd):        
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.HERD_TABLE))
            herd_row = FarmLocators.get_herd_row(herd)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(herd_row))
        except:
            return False
        return True

    #==========================
    # Animals
    #==========================
    def click_create_animal(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.CREATE_ANIMAL_BTN))
            element = self.driver.find_element(*FarmLocators.CREATE_ANIMAL_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Add Animal button in Animals tab on Farm page"
            raise
            
    def click_delete_animals(self):        
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DELETE_ANIMAL_BTN))
            element = self.driver.find_element(*FarmLocators.DELETE_ANIMAL_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Delete Animals button in Animals tab on Farm page"
            raise        
        
    def dialog_enter_animal_eid(self, eid):
        try:
            WebDriverWait(self.driver, 60).until(EC.element_to_be_clickable(FarmLocators.ADD_ANIMAL_EID_INPUT))
            element = self.driver.find_element(*FarmLocators.ADD_ANIMAL_EID_INPUT)
            element.send_keys(eid)
        except:
            print "\nunable to enter animal eid in Create Animal dialog in Animals tab on Farm page"
            raise

    def dialog_enter_animal_vid(self, vid):
        try:
            WebDriverWait(self.driver, 60).until(EC.element_to_be_clickable(FarmLocators.ADD_ANIMAL_VID_INPUT))
            element = self.driver.find_element(*FarmLocators.ADD_ANIMAL_VID_INPUT)
            element.send_keys(vid)
        except:
            print "\nunable to enter animal vid in Create Animal dialog in Animals tab on Farm page"
            raise
    
    def dialog_enter_animal_herd(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ANIMAL_HERD_DROPDOWN))        
            select = Select(self.driver.find_element(*FarmLocators.ANIMAL_HERD_DROPDOWN))        
            select.select_by_visible_text(herd)
        except:
            print "\nunable to select animal herd in Create Animal dialog in Animals tab on Farm page"
            raise
    
    def click_dialog_create_animal(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_CREATE_ANIMAL_BTN))
            element = self.driver.find_element(*FarmLocators.DIALOG_CREATE_ANIMAL_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Create Animal button in Create Animal dialog in Animals tab on Farm page"
            raise
    
    def click_dialog_delete_animals(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_DELETE_ANIMAL_BTN))
            element = self.driver.find_element(*FarmLocators.DIALOG_DELETE_ANIMAL_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Delete button in Delete Animal dialog in Animals tab on Farm page"
            raise
    
    def create_animal(self, eid, vid, herd):
        self.click_create_animal()
        self.dialog_enter_animal_eid(eid)
        self.dialog_enter_animal_vid(vid)
        self.dialog_enter_animal_herd(herd)
        self.click_dialog_create_animal()
        self.click_dialog_cancel()

    def delete_animal(self, eid, vid, herd):        
        # wait for table to load
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ANIMAL_TABLE))        
        
        # get animal row
        animal_row = FarmLocators.get_animal_row(eid, vid, herd)
        
        # if animal row is in table, run delete operation
        if self.is_element_present(animal_row):         
            self.driver.find_element(*animal_row).find_element(*FarmLocators.ANIMAL_ROW_CHECKBOX).click()       
            self.click_delete_animals()
            self.click_dialog_delete_animals()
        # if not, click display 100 rows
        else:
            show_100_btn = self.driver.find_element(*FarmLocators.TABLE_100_ROWS)
            self.click_element(show_100_btn)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ANIMAL_TABLE)) 
            
            # if animal row is in table, run delete operation                            
            if self.is_element_present(animal_row):
                self.driver.find_element(*animal_row).find_element(*FarmLocators.ANIMAL_ROW_CHECKBOX).click()       
                self.click_delete_animals()
                self.click_dialog_delete_animals()
            else:
                next_page_number = 2
                next_page_element = FarmLocators.page_button(next_page_number)
                is_found = False
       
                WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(next_page_element))
                while is_found == False and self.is_element_present(next_page_element):                    
                    
                    # click on next table page
                    WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(next_page_element))                    
                    self.click_element(self.driver.find_element(*next_page_element))                    
                    WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ANIMAL_TABLE)) 
                    
                    # if animal row is in table, run delete operation                            
                    if self.is_element_present(animal_row):                   
                        is_found = True
                        self.driver.find_element(*animal_row).find_element(*FarmLocators.ANIMAL_ROW_CHECKBOX).click()       
                        self.click_delete_animals()
                        self.click_dialog_delete_animals()
                    # if not, get next page element
                    else:
                        next_page_number += 1
                        next_page_element = FarmLocators.page_button(next_page_number)
                        
    def edit_animal_herd(self, eid, vid, old_herd, new_herd):
        try:
            print "finding animal table"
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ANIMAL_TABLE))
            print "finding animal row"
            animal_row = FarmLocators.get_animal_row(eid, vid, old_herd)
            print "clicking checkbox"
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(animal_row))
            self.driver.find_element(*animal_row).find_element(*FarmLocators.ANIMAL_ROW_CHECKBOX).click()
        except:
            print "\nunable to find animal row " + eid + " " + vid + " " + old_herd + " in Animals tab on Farm page"
            raise
        
        self.click_animal_change_herd()
        self.select_dialog_change_herd_name(new_herd)
        self.click_dialog_change_herd()
        
    def click_animal_change_herd(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ANIMAL_CHANGE_HERD_BTN))
            element = self.driver.find_element(*FarmLocators.ANIMAL_CHANGE_HERD_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Change Herd button in Animals tab on Farm page"
            raise
    
    def select_dialog_change_herd_name(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_ANIMAL_HERD_DROPDOWN))
            select = Select(self.driver.find_element(*FarmLocators.DIALOG_ANIMAL_HERD_DROPDOWN))
            select.select_by_visible_text(herd)
        except:
            print "\nunable to select herd " + herd + " in Change Herd dialog in Animals tab on Farm page"
            raise
    
    def click_dialog_change_herd(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_ANIMAL_CHANGE_HERD_BTN))
            element = self.driver.find_element(*FarmLocators.DIALOG_ANIMAL_CHANGE_HERD_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Apply button in Change Herd dialog in Animals tab on Farm page"
            raise

    #TODO This function will eventually need updated to deal with paged results    
    def is_animal_in_table(self, eid, vid, herd):
        try:          
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.ANIMAL_TABLE))
            animal_row = FarmLocators.get_animal_row(eid, vid, herd)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(animal_row))
            
        except:
            return False
        return True
    
    #==========================
    # Paddocks
    #==========================

    def add_paddock(self, paddock, corners, gmap):
       
        self.click_add_paddock()
        self.add_paddock_name(paddock)
        self.add_paddock_corners(corners, gmap)
        self.click_dialog_create_paddock()
        self.click_page_header()
        
    def click_add_paddock(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.CREATE_PADDOCK_BTN))
            element = self.driver.find_element(*FarmLocators.CREATE_PADDOCK_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Add A Paddock button in Paddocks tab on Farm page"
            raise
    
    def add_paddock_name(self, name):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.CREATE_PADDOCK_NAME_INPUT))
            element = self.driver.find_element(*FarmLocators.CREATE_PADDOCK_NAME_INPUT)
            element.clear()
            element.send_keys(name)
        except:
            print "\nunable to enter paddock name in Create Paddock dialog in Paddocks tab on Farm Page"
            raise

    def add_paddock_corners(self, corners, gmap):
        try:
            for coords in corners:
                WebDriverWait(self.driver,60).until(EC.element_to_be_clickable( (By.XPATH, "//div[@class='angular-google-map']") ))
                #self.driver.execute_script("angular.element(document.getElementById(arguments[0])).scope().centerMap(arguments[1], arguments[2], 20, arguments[0]);", gmap, coords[0], coords[1])
                element = self.driver.find_element(*(By.XPATH, "//div[@class='angular-google-map']"))                
                element.click()
        except:
            print "\nunable to add paddock corners in Create Paddock dialog in Paddocks tab on Farm page"
            raise
    
    def click_dialog_create_paddock(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_CREATE_PADDOCK_BTN))
            element = self.driver.find_element(*FarmLocators.DIALOG_CREATE_PADDOCK_BTN)
            self.click_element(element)
        except:
            print "\nunable to click Create button in Create Paddock dialog  in Paddocks tab on Farm page"
            raise

    def is_paddock_in_table(self, paddock_name):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.PADDOCK_TABLE))
            paddock_row = FarmLocators.get_paddock_row(paddock_name)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(paddock_row))            
        except:
            return False
        return True

    def edit_paddock_name(self, old_name, new_name):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.PADDOCK_TABLE))
        paddock_row = FarmLocators.get_paddock_row(old_name)
        self.driver.find_element(*paddock_row).find_element(*FarmLocators.EDIT_PADDOCK_ACTION).send_keys(Keys.ENTER)
        self.edit_dialog_add_paddock_name(new_name)
        self.click_edit_dialog_update_paddock()

    def edit_dialog_add_paddock_name(self, paddock_name):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.EDIT_PADDOCK_NAME_INPUT))
        element = self.driver.find_element(*FarmLocators.EDIT_PADDOCK_NAME_INPUT)
        element.clear()
        element.send_keys(paddock_name)

    def click_edit_dialog_update_paddock(self):
        WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(FarmLocators.DIALOG_EDIT_PADDOCK_BTN))
        element = self.driver.find_element(*FarmLocators.DIALOG_EDIT_PADDOCK_BTN)
        self.click_element(element)

#========================================================================= 
# 
#=========================================================================
class AdminGlobalRolesPage(SubPage):
    def placeholder_function(self):
        return True

#========================================================================= 
# 
#=========================================================================
class AdminFarmRolesPage(SubPage):
    def placeholder_function(self):
        return True

#========================================================================= 
# Farm Permissions Administration page
#=========================================================================
class AdminFarmPermissionsPage(SubPage):
    
    def click_create_permission_btn(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmPermissionsLocators.CREATE_PERMISSION_BTN))
            element = self.driver.find_element(*AdminFarmPermissionsLocators.CREATE_PERMISSION_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Create Permission button on Farm Permissions administration page"
            raise
    
    def select_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmPermissionsLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*AdminFarmPermissionsLocators.FARM_DROPDOWN))
            select.select_by_visible_text(farm)
        except:
            print "\nfailed to select farm " + farm + " in Create Permission dialog on Farm Permissions administration page"
            raise
    
    def select_user(self, user):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmPermissionsLocators.USER_DROPDOWN))
            select = Select(self.driver.find_element(*AdminFarmPermissionsLocators.USER_DROPDOWN))
            select.select_by_visible_text(user)
        except:
            print "\nfailed to select user " + user + " in Create Permission dialog on Farm Permissions administration page"
            raise

    def select_role(self, role):
        try:        
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmPermissionsLocators.ROLE_DROPDOWN))
            select = Select(self.driver.find_element(*AdminFarmPermissionsLocators.ROLE_DROPDOWN))
            select.select_by_visible_text(role)
        except:
            print "\nfailed to select role " + role + " in Create Permission dialog on Farm Permission administration page"
            raise

    def click_create_btn(self):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminUsersLocators.CREATE_BTN))
            element = self.driver.find_element(*AdminUsersLocators.CREATE_BTN)
            self.click_element(element)
        except:
            print "\nfailed to click Create Permission button in Create Permission dialog on Farm Permission administration page"
            raise

    def create_farm_permission(self, farm, user, role):
        try:
            self.click_create_permission_btn()
            self.select_farm(farm)            
            self.select_user(user)
            self.select_role(role)
            self.click_create_btn()
        except:
            return False

        self.click_page_header() 
        return True

    def is_permission_in_table(self, farm, user, role):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminFarmPermissionsLocators.PERMISSIONS_TABLE))
            permission_row = AdminFarmPermissionsLocators.get_permission_row(user, farm, role)
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(permission_row))
        except:
            return False

        return True

#========================================================================= 
# 
#=========================================================================
class AdminMeasurementsPage(SubPage):
    
    def select_farm(self, farm):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminMeasurementLocators.FARM_DROPDOWN))
            select = Select(self.driver.find_element(*AdminMeasurementLocators.FARM_DROPDOWN))
            select.select_by_visible_text(farm)
        except:
            print "\nunable to select farm " + farm + " in Farm Measurements admin page"
            raise            

    def select_herd(self, herd):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminMeasurementLocators.HERD_DROPDOWN))
            select = Select(self.driver.find_element(*AdminMeasurementLocators.HERD_DROPDOWN))
            select.select_by_visible_text(herd) #NOTE if this breaks create a locator and wait for it to load first
        except:
            print "\nunable to select herd " + herd + " in Farm Measurements admin page"
            raise

    def delete_measurement(self, vid):
        try:
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(AdminMeasurementLocators.MEASUREMENT_TABLE))
            row_delete_btn = AdminMeasurementLocators.get_row_delete_btn(vid)
            print row_delete_btn
            WebDriverWait(self.driver,60).until(EC.element_to_be_clickable(row_delete_btn))       
            element = self.driver.find_element(*row_delete_btn)
            self.click_element(element)
        except:
            return False

        return True

#=========================================================================
# 
#=========================================================================
class AdminAlgorithmsPage(SubPage):
    def placeholder_function(self):
        return True