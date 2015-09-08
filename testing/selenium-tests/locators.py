from selenium.webdriver.common.by import By

#===============================
# Main page (landing)
#===============================
class MainPageLocators(object):
    LOGIN_LINK = (By.LINK_TEXT, 'Login')

#===============================
# Sub pages (reports, apps etc...)
#===============================
class SubPageLocators(object):    
    PAGE_HEADER = (By.CLASS_NAME, "page-header")

#===============================
# Login page
#===============================
class LoginPageLocators(object):
    LOGIN_BTN = (By.CLASS_NAME, 'btn-success')
    LOGIN_EMAIL_INPUT = (By.ID, 'inputEmail')
    LOGIN_PASSWORD_INPUT = (By.ID, 'inputPassword')
    GUEST_LOGIN_BTN = (By.CLASS_NAME, 'btn-warning')

#===============================
# Navigation
#===============================
class NavigationLocators(object):

    # Farms dropdown and links
    FARMS = (By.LINK_TEXT, "Farms")

    # Reports dropdown and links
    REPORTS = (By.LINK_TEXT, "Reports")
    REPORTS_WEIGHT_TREND = (By.LINK_TEXT, "Weight Trend")
    REPORTS_CONDITION_SCORES = (By.LINK_TEXT, "Condition Scores")
    REPORTS_PASTURE_ANALYSIS = (By.LINK_TEXT, "Pasture Analysis")

    # Apps dropdown and links
    APPS = (By.LINK_TEXT, "Apps")
    APPS_SPATIAL_DATA = (By.LINK_TEXT, "Spatial Data")
    APPS_CONDITION_SCORE_IMPORTER = (By.LINK_TEXT, "Condition Score Importer")
    APPS_CONDITION_SCORER = (By.LINK_TEXT, "Condition Scorer")

    # User dropdown and links
    USER = (By.CLASS_NAME, "dropdown-toggle")
    USER_LOGOUT = (By.LINK_TEXT, "Logout")

    # Administration dropdown and links
    ADMIN = (By.LINK_TEXT, "Administration")
    ADMIN_USERS = (By.XPATH, "//a[@ui-sref='home.admin-users']")
    ADMIN_FARM_PERMISSIONS = (By.XPATH, "//a[@ui-sref='home.admin-farmPermissions']")
    ADMIN_FARMS = (By.XPATH, "//a[@ui-sref='home.admin-farms']")
    ADMIN_HERDS = (By.XPATH, "//a[@ui-sref='home.admin-herds']")
    ADMIN_PADDOCKS = (By.XPATH, "//a[@ui-sref='home.admin-paddocks']")
    ADMIN_MEASUREMENTS = (By.XPATH, "//a[@ui-sref='home.admin-measurements']")
    ADMIN_CATEGORIES = (By.XPATH, "//a[@ui-sref='home.admin-categories']")


#===============================
# Weight Trend report
#===============================
class WeightTrendPageLocators(object):

    FARM_DROPDOWN = (By.ID, "selectFarm")
    HERD_DROPDOWN = (By.ID, "selectHerd")

    @staticmethod
    def get_farm_option_locator(farm):
        return (By.XPATH, "//select[@id='selectFarm']/option[@label='" + farm + "']")

    @staticmethod
    def get_herd_option_locator(herd):
        return (By.XPATH, "//select[@id='selectHerd']/option[@label='" + herd + "']")

#===============================
# Condition Scores report
#===============================
class ConditionScoresReportLocators(object):

    FARM_DROPDOWN = (By.ID, "selectFarm")
    HERD_DROPDOWN = (By.ID, "selectHerd")

    @staticmethod
    def get_farm_option_locator(farm):
        return (By.XPATH, "//select[@id='selectFarm']/option[@label='" + farm + "']")

    @staticmethod
    def get_herd_option_locator(herd):
        return (By.XPATH, "//select[@id='selectHerd']/option[@label='" + herd + "']")

#===============================
# Pasture Analysis report
#===============================
class PastureAnalysisReportLocators(object):

    FARM_DROPDOWN = (By.ID, "selectFarm")
    PADDOCK_DROPDOWN = (By.ID, "selectPaddock")
    METER_RES_DROPDOWN = (By.ID, "selectResolution")
    DOWNLOAD_CSV_BTN = (By.ID, "downloadBtn")
    DOWNLOAD_SHAPEFILE_BTN = (By.ID, "downloadShapefileBtn")

    CSV_FILENAME_INPUT = (By.XPATH, "//input[@ng-model='fileName']")

    DATA_VIEW_SHOW_BTN = (By.XPATH, '//button[@ng-click="searchPastureMeasurements(import.paddock)"]')
    CALCULATE_SPREADER_BTN = (By.ID, 'calculateVRAMapBtn')
    MODAL_CALCULATE_SPREADER_BTN = (By.XPATH, '//button[@ng-click="calculateVRAMapBtnClick(import)"]')

    @staticmethod
    def get_resolution_option_locator(conc):
        return (By.XPATH, "//select[@id='selectResolution']/option[@label='" + conc + "']")

    @staticmethod
    def get_farm_option_locator(farm):
        return (By.XPATH, "//select[@id='selectFarm']/option[@label='" + farm + "']")

    @staticmethod
    def get_paddock_option_locator(paddock):
        return (By.XPATH, "//select[@id='selectPaddock']/option[@label='" + paddock + "']")

#===============================
# Spatial Data app
#===============================
class SpatialDataPageLocators(object):

    SUBMIT_BTN = (By.CLASS_NAME, 'btn-success')

    FARM_DROPDOWN = (By.ID, "selectFarm")
    PADDOCK_DROPDOWN = (By.ID, "selectPaddock")

    @staticmethod
    def get_farm_option_locator(farm):
        return (By.XPATH, "//select[@id='selectFarm']/option[@label='" + farm + "']")

    @staticmethod
    def get_paddock_option_locator(paddock):
        return (By.XPATH, "//select[@id='selectPaddock']/option[@label='" + paddock + "']")
    
#===============================
# Condition Score Importer app
#===============================
class ConditionScoreImporterLocators(object):
    
    FARM_DROPDOWN = (By.ID, "selectFarm")
    HERD_DROPDOWN = (By.ID, "selectHerd")
    MEASUREMENT_DROPDOWN = (By.ID, "selectAlgorithm")

    BROWSE_BTN = (By.ID, "file-input")
    ADD_BTN = (By.CLASS_NAME, 'btn-success')

    UPLOAD_RESULT = (By.XPATH, "//div[@ng-show='comment.length']/label[text()='Finished uploading condition scores.']")
    
    DATE_PICKER = (By.XPATH, "//input[@data-ng-model='formatedDate']")
    DATE_PICKER_DATE = (By.XPATH, "//tbody/tr[1]/td[1]")

    @staticmethod
    def get_farm_option_locator(farm):
        return (By.XPATH, "//select[@id='selectFarm']/option[@label='" + farm + "']")
    
    @staticmethod
    def get_herd_option_locator(herd):
        return (By.XPATH, "//select[@id='selectHerd']/option[@label='" + herd + "']")

    @staticmethod
    def get_measurement_option_locator(measurement):
        return (By.XPATH, "//select[@id='selectAlgorithm']/option[@label='" + measurement + "']")
  
#===============================
# Condition Scorer app
#===============================
class ConditionScorerPageLocators(object):
    
    SUBMIT_BTN = (By.XPATH, '//button[@ng-click="importData(import)"]')
    RESET_BTN = (By.CLASS_NAME, 'btn-danger')
    
    FARM_DROPDOWN = (By.ID, "selectFarm")
    HERD_DROPDOWN = (By.ID, "selectHerd") 
    MEASUREMENT_DROPDOWN = (By.ID, "selectAlgorithm")

    VID_INPUT = (By.XPATH, "//input[@ng-model='import.vid']")
    SCORE_INPUT = (By.XPATH, "//input[@ng-model='import.score']")
    
    @staticmethod
    def get_farm_option_locator(farm):
        return (By.XPATH, "//select[@id='selectFarm']/option[@label='" + farm + "']")
    
    @staticmethod
    def get_herd_option_locator(herd):
        return (By.XPATH, "//select[@id='selectHerd']/option[@label='" + herd + "']")
   
 
    @staticmethod
    def get_measurement_option_locator(measurement):
        return (By.XPATH, "//select[@id='selectAlgorithm']/option[@label='" + measurement + "']")

#===============================
# Farms administration
#===============================
class AdminFarmsLocators(object):
    
    ADD_FARM_BTN = (By.LINK_TEXT, "Add Farm")
    CREATE_FARM_BTN = (By.CLASS_NAME, 'btn-primary')
    CONFIRM_FARM_DELETE_BTN = (By.XPATH, "//button[@ng-click='deleteFarm()']")
    INPUT_FARM_NAME = (By.XPATH, "//input[@ng-model='farm.name']")
    
    FARM_TABLE = (By.ID, "dataTables-example")
    
    @staticmethod
    def get_row_delete_btn(farm):
            locatorStrPre =  "//table[@id='dataTables-example']/tbody/tr[td//text()[contains(., '"
            locatorStrPost = "')]]/td[3]/button[@class='btn btn-danger btn-xs']"    
            return (By.XPATH, locatorStrPre + farm + locatorStrPost)

#===============================
# Paddocks administration
#===============================
class AdminPaddocksLocators(object):
    
    ADD_PADDOCK_BTN = (By.XPATH, "//a[@data-target='#addPaddockModal']")
    CREATE_PADDOCK_BTN = (By.CLASS_NAME, 'btn-primary')
    INPUT_PADDOCK_NAME = (By.XPATH, "//input[@ng-model='paddock.name']")
    FARMS_DROPDOWN = FARM_DROPDOWN = (By.ID, "selectFarm")
    
    CONFIRM_PADDOCK_DELETE_BTN = (By.XPATH, "//button[@ng-click='deletePaddock()']")
    
    PADDOCK_TABLE = (By.ID, "dataTables-example")
    
    @staticmethod
    def get_row_delete_btn(paddock):
            locatorStrPre =  "//table[@id='dataTables-example']/tbody/tr[td//text()[contains(., '"
            locatorStrPost = "')]]/td[3]/button[@class='btn btn-danger btn-xs']"    
            return (By.XPATH, locatorStrPre + paddock + locatorStrPost)
    
#===============================
# Herds administration
#===============================
class AdminHerdsLocators(object):
    
    ADD_HERD_BTN = (By.LINK_TEXT, "Add Herd")
    CREATE_HERD_BTN = (By.CLASS_NAME, 'btn-primary')    
    INPUT_HERD_NAME = (By.XPATH, "//input[@ng-model='herd.name']")
    FARMS_DROPDOWN = FARM_DROPDOWN = (By.ID, "selectFarm")
    CONFIRM_DELETE_HERD_BTN = (By.XPATH, "//button[@ng-click='deleteHerd()']")
    HERD_TABLE = (By.ID, "dataTables-example")
    
    @staticmethod
    def get_row_delete_btn(herd):
            locatorStrPre =  "//table[@id='dataTables-example']/tbody/tr[td//text()[contains(., '"
            locatorStrPost = "')]]/td[4]/button[@class='btn btn-danger btn-xs']"    
            return (By.XPATH, locatorStrPre + herd + locatorStrPost)
    
#===============================
# Users administration
#===============================
class AdminUsersLocators(object):
    
    ADD_USER_BTN = (By.LINK_TEXT, "Add User")
    CREATE_BTN = (By.XPATH, "//button[@class='btn btn-primary']")
    CONFIRM_DELETE_USER_BTN = (By.XPATH, "//button[@ng-click='deleteUser()']")
    FIRST_NAME_INPUT = (By.XPATH, "//input[@ng-model='user.fname']")
    LAST_NAME_INPUT = (By.XPATH, "//input[@ng-model='user.lname']")
    EMAIL_INPUT = (By.XPATH, "//input[@ng-model='user.email']")
    PASSWORD_INPUT = (By.XPATH, "//input[@ng-model='user.pass']")
    
    ROLE_DROPDOWN = (By.XPATH, "//select[@ng-model='user.role']")
    ROLE_DROPDOWN_USER = (By.XPATH, "//select[@ng-model='user.role']/option[@label='user']")
    
    USER_TABLE = (By.ID, "dataTables-example")
    
    @staticmethod
    def get_row_delete_btn(email):
            locatorStrPre =  "//table[@id='dataTables-example']/tbody/tr[td//text()[contains(., '"
            locatorStrPost = "')]]/td[6]/button[@class='btn btn-danger btn-xs']"    
            return (By.XPATH, locatorStrPre + email + locatorStrPost)
   
    @staticmethod
    def get_member_row(email):
            locatorStrPre =  "//table[@id='dataTables-example']/tbody/tr[td//text()[contains(., '"
            locatorStrPost = "')]]"    
            return (By.XPATH, locatorStrPre + email + locatorStrPost)
    
#===============================
# Farm Permissions administration
#===============================
class AdminFarmPermissionsLocators(object):
    
    CREATE_PERMISSION_BTN = (By.LINK_TEXT, "Create Permission")
    
    FARM_DROPDOWN = (By.ID, "selectFarm")
    USER_DROPDOWN = (By.ID, "selectUser")
    ROLE_DROPDOWN = (By.ID, "selectRoles")

    CREATE_BTN = (By.XPATH, "//button[@class='btn btn-primary']")

    PERMISSIONS_TABLE = (By.XPATH, "//table[@class='table table-condensed table-hover']")

    @staticmethod
    def get_permission_row(user, farm, role):

        locator_1 = "//tr[td[2][contains(text(),'"   # user
        locator_2 = "')] and td[3][contains(text(),'" # farm
        locator_3 = "')] and td[4][contains(text(),'" # role
        locator_4 = "')]]"
        path = locator_1 + user + locator_2 + farm + locator_3 + role  + locator_4
        return (By.XPATH, path)
       
#===============================
# Farm page
#===============================
class FarmLocators(object):
 
    @staticmethod
    def page_button(page_number):
        ret_str = "//a[@ng-click='selectPage(page.number, $event)' and text()[contains(.,'" + str(page_number) +"')]]"
        return (By.XPATH, ret_str)
 
    CANCEL_BTN = (By.XPATH, "//div[@id='addAnimalModal']//div[@class='modal-footer']/button[@data-dismiss='modal']")    
    
    # Farm Members tab 
    MEMBER_TAB = (By.XPATH, "//a[@ui-sref='home.farm.members']") 

    MEMBER_TABLE = (By.ID, "farmMemberTable")

    ADD_USER_BTN = (By.LINK_TEXT, "Add User")
    INVITE_BTN = (By.XPATH, "//button[@class='btn btn-primary']")
    
    DELETE_MEMBER_ACTION = (By.XPATH, ".//button[@ng-click='openDeletePermission(member)']")
    DIALOG_DELETE_MEMBER_BTN = (By.XPATH, "//div[@id='deletePermissionModal']//div[@class='modal-footer']/button[@ng-click='deletePermission(editUser)']")
    
    EDIT_MEMBER_ACTION = (By.XPATH, ".//button[@ng-click='openPermissionEditModal(member)']")
    DIALOG_EDIT_MEMBER_BTN = (By.XPATH, "//div[@id='editPermissionModal']//div[@class='modal-footer']/button[@ng-click='saveEditedUser(editUser, permission.role)']")
    DIALOG_PERMISSION_DROPDOWN = (By.ID, "roleSelector")

    USER_DROPDOWN = (By.ID, "selectUser")
    ROLE_DROPDOWN= (By.ID, "selectRoles")

    @staticmethod
    def get_permission_option_locator(permission):
        return (By.XPATH, "//select[@id='roleSelector']/option[@label='" + permission + "']")

    @staticmethod
    def get_member_row(first_name, last_name, permission=None):
        locator_1 = "//tr[td[1][text()='"   # first name
        locator_2 = "'] and td[2][text()='" # last name
        locator_3 = "'] and td[3][text()='" # permission
        locator_4 = "']]"
        
        if permission == None:        
            return (By.XPATH, locator_1 + first_name + locator_2 + last_name + locator_4)
        
        return (By.XPATH, locator_1 + first_name + locator_2 + last_name + locator_3 + permission + locator_4)

    # Herds tab
    HERD_TAB = (By.XPATH, "//a[@ui-sref='home.farm.herds']")
    
    CREATE_HERD_BTN = (By.XPATH, "//a[@data-target='#createHerdModal']")    
    CREATE_HERD_NAME_INPUT = (By.XPATH, "//input[@ng-model='herd.name']") 
    DIALOG_CREATE_HERD_BTN = (By.XPATH, "//button[@ng-click='createHerd(herd.name)']")
    
    DIALOG_DELETE_HERD_BTN = (By.XPATH, "//button[@ng-click='deleteSelectedHerd(editHerd, deleteHerdAnimals)']")
    
    EDIT_HERD_ACTION = (By.XPATH, ".//button[@ng-click='openHerdEdit(herd)']")
    DIALOG_HERD_NAME_INPUT = (By.ID, "editHerdInputName")
    DIALOG_EDIT_HERD_BTN = (By.XPATH, "//button[@ng-click='saveEditedHerd(editHerd, herd.name)']")
    
    HERD_TABLE = (By.ID, "herdTable")
    
    @staticmethod
    def get_herd_row(herd):
            locatorStrPre =  "//tr[td//text()[contains(., '"
            locatorStrPost = "')]]" 
            return (By.XPATH, locatorStrPre + herd + locatorStrPost)

    @staticmethod
    def get_herd_delete_btn(herd):
        locatorStrPre =  "//tr[td//text()[contains(., '"
        locatorStrPost = "')]]/td[3]/button[@ng-click='openDeleteHerd(herd)']"    
        return (By.XPATH, locatorStrPre + herd + locatorStrPost)

    # Animals tab
    ANIMAL_TAB = (By.XPATH, "//a[@ui-sref='home.farm.animals']")

    #CREATE_ANIMAL_BTN = (By.XPATH, "//a[@data-target='#addAnimalModal']")
    CREATE_ANIMAL_BTN = (By.XPATH, "//button[contains(., 'Add Animal')]")
    DIALOG_CREATE_ANIMAL_BTN = (By.XPATH, "//button[@ng-click='createAnimal(newAnimal.herdId, newAnimal.eid, newAnimal.vid)']")
    ADD_ANIMAL_EID_INPUT = (By.XPATH, "//input[@ng-model='newAnimal.eid']")
    ADD_ANIMAL_VID_INPUT = (By.XPATH, "//input[@ng-model='newAnimal.vid']")
    
    CONFIRM_ADD_ANIMAL_BTN = (By.LINK_TEXT, "Create Animal")

    ANIMAL_HERD_DROPDOWN = (By.XPATH, "//select[@ng-model='newAnimal.herdId']")
    DIALOG_ANIMAL_HERD_DROPDOWN = (By.XPATH, "//div[@id='editAnimalHerdModal']//select[@ng-model='herdName']")
    DIALOG_ANIMAL_CHANGE_HERD_BTN= (By.XPATH, "//div[@id='editAnimalHerdModal']//div[@class='modal-footer']/button[@ng-click='saveEditedAnimals(herdName)']")

    ANIMAL_ROW_CHECKBOX = (By.XPATH, ".//input[@ng-change='selectionChanged(rowModel)']")

    #DELETE_ANIMAL_BTN = (By.XPATH, "//div[@id='animalsTopBar']/a[text()='Delete Animals']")
    DELETE_ANIMAL_BTN = (By.XPATH, "//button[contains(., 'Delete Animals')]")
    DIALOG_DELETE_ANIMAL_BTN = (By.XPATH, "//div[@id='deleteAnimalModal']//div[@class='modal-footer']/button[@ng-click='deleteAnimals()']")

    ANIMAL_CHANGE_HERD_BTN = (By.XPATH, "//div[@id='animalsTopBar']/a[text()='Change Herd']")

    ANIMAL_TABLE = (By.XPATH, "//table")
    TABLE_100_ROWS = (By.XPATH, "//button[@ng-click='setMaxRows(100)']")

    @staticmethod
    def get_animal_row(eid, vid, herd):
        
        ret_xpath = "//tr["
        
        if eid:
            ret_xpath += "td[2][text()[contains(.,'" + eid + "')]]"
        
        if vid:
            if eid:
                ret_xpath += " and "
            ret_xpath += "td[3][text()[contains(.,'" + vid + "')]]"
            
        if herd:
            if vid:
                ret_xpath += " and "
            ret_xpath += "td[4][text()[contains(.,'" + herd + "')]]"
        
        ret_xpath += "]"
        
        return (By.XPATH, ret_xpath)
    
    # Paddocks tab
    PADDOCK_TAB = (By.XPATH, "//a[@ui-sref='home.farm.paddocks']")
 
    CREATE_PADDOCK_BTN = (By.XPATH, "//a[@data-target='#addPaddockModal']")
    CREATE_PADDOCK_NAME_INPUT = (By.XPATH, "//input[@ng-model='paddock.name']")
    DIALOG_CREATE_PADDOCK_BTN = (By.XPATH, "//div[@id='addPaddockModal']//div[@class='modal-footer']/button[@ng-click='createPaddock(paddock.name, farm.id)']")

    EDIT_PADDOCK_ACTION = (By.XPATH, "//button[@data-target='#editPaddockModal']")
    EDIT_PADDOCK_NAME_INPUT = (By.XPATH, "//input[@ng-model='dialogPaddock.name']")
    DIALOG_EDIT_PADDOCK_BTN = (By.XPATH, "//div[@id='editPaddockModal']//div[@class='modal-footer']/button[@ng-click='updatePaddock(dialogPaddock)']")

    PADDOCK_TABLE = (By.XPATH, "//table[@id='paddockTable']")

    @staticmethod
    def get_paddock_row(paddock_name):
        locator_prefix = "//tr[td[1][text()='"
        locator_suffix = "']]"
        return (By.XPATH, locator_prefix + paddock_name + locator_suffix)

#===============================
# Admin measurements page
#===============================
class AdminMeasurementLocators(object):

    FARM_DROPDOWN = (By.ID, "selectFarm")
    HERD_DROPDOWN = (By.ID, "selectHerd")

    MEASUREMENT_TABLE = (By.XPATH, "//table")

    @staticmethod
    def get_row_delete_btn(vid):
            locator_prefix =  "//table/tbody/tr[td[3][text()='"
            locator_suffix = "']]/td[4]/button[@class='btn btn-danger btn-xs']"
            return (By.XPATH, locator_prefix + vid + locator_suffix)
        
#===============================
# Admin categoriess page
#===============================
class AdminCategoriesLocators(object):
    
    CATEGORY_NAME_INPUT_MODAL = (By.XPATH, "//input[@ng-model='category.name']")
    CATEGORY_SPATIAL_INPUT_MODAL = (By.ID, "isSpatial")
    ADD_CATEGORY_BTN = (By.XPATH, "//a[@data-target='#addMeasurementCategoriesModal']")
    MODAL_ADD_CATEGORY_BTN =(By.XPATH, "//button[@ng-click='createCategory(category)']")
    CATEGORY_TABLE = (By.ID, "measurementCategoryTable")
    MODAL_DELETE_BTN = (By.XPATH, "//button[@ng-click='deleteCategory()']")
    
    @staticmethod
    def get_row_delete_btn(category):
        locator_prefix = "//table/tbody/tr[td[2][text()[contains(., '"
        locator_suffix = "')]]]/td[4]/button[@ng-click='openDeleteCategoryModal(cat)']"
        return (By.XPATH, locator_prefix + category + locator_suffix)
