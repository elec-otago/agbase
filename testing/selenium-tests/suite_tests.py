import unittest
from test_create_farm import CreateFarmTest
from test_delete_farm import DeleteFarmTest
from test_create_paddock import CreatePaddockTest
from test_delete_paddock import DeletePaddockTest
from test_create_herd import CreateHerdTest
from test_delete_herd import DeleteHerdTest
from test_condition_scorer_app import ConditionScorerAppTest
from test_condition_score_importer import ConditionScoreImporterTest
from test_view_condition_scores import ViewConditionScoresTest
from test_delete_condition_scores import DeleteConditionScoresTest
from test_create_test_users import CreateTestUsersTest
from test_change_user_permission import ChangeUserPermissionTest
from test_user_change_farm_permission import UserChangeFarmPermissionTest
from test_delete_test_users import DeleteTestUsersTest
from test_farm_add_herd import UserAddFarmHerdTest
from test_farm_delete_herd import UserDeleteFarmHerdTest
from test_farm_add_animal import UserAddFarmAnimalTest
from test_farm_delete_animal import UserDeleteFarmAnimalTest
from test_farm_delete_member import UserDeleteFarmPermissionTest
from test_edit_farm_member_permissions import EditFarmMemberPermissionTest
from test_farm_edit_herd import EditFarmHerdNameTest
from test_farm_create_paddock import CreateFarmPaddockTest
from test_farm_edit_paddock import EditFarmPaddockTest
from test_farm_change_animal_herd import UserEditFarmAnimalHerdTest
from test_guest_tour import GuestTourTest
from test_guest_download_vra_map import GuestDownloadVRAMap
from test_create_category import CreateCategoryTest
from test_delete_category import DeleteCategoryTest
test_suite = unittest.TestSuite()


# Guest user test TODO: enable these tests at some point!
#test_suite.addTest(unittest.makeSuite(GuestTourTest))
#test_suite.addTest(unittest.makeSuite(GuestDownloadVRAMap))

#=====
# Init
#=====

# Create farm
test_suite.addTest(unittest.makeSuite(CreateFarmTest))

# Create paddock 
test_suite.addTest(unittest.makeSuite(CreatePaddockTest))

# Create herd 
test_suite.addTest(unittest.makeSuite(CreateHerdTest))

# Create test farmer and manager
test_suite.addTest(unittest.makeSuite(CreateTestUsersTest))

# Create test measurement category
test_suite.addTest(unittest.makeSuite(CreateCategoryTest))

#==========
# Run tests 
#==========

# Give test farmer permission to manage test farm
test_suite.addTest(unittest.makeSuite(ChangeUserPermissionTest))

# Use farmer to give test manager permission to manage test farm.
test_suite.addTest(unittest.makeSuite(UserChangeFarmPermissionTest))

# Submit condition score with condition scorer app.
test_suite.addTest(unittest.makeSuite(ConditionScorerAppTest))

# Submit condition scores with condition score importer
test_suite.addTest(unittest.makeSuite(ConditionScoreImporterTest))

# View condition scores report.
test_suite.addTest(unittest.makeSuite(ViewConditionScoresTest))

# Add test herd 2 to test farm from test farm page
test_suite.addTest(unittest.makeSuite(UserAddFarmHerdTest))

# Add test animal to test farm from test farm page
test_suite.addTest(unittest.makeSuite(UserAddFarmAnimalTest))

# Edit an accounts farm permissions with an account that holds farm management permission
test_suite.addTest(unittest.makeSuite(EditFarmMemberPermissionTest))

# Edit the name of test herd in farm page
test_suite.addTest(unittest.makeSuite(EditFarmHerdNameTest))

# Create a paddock through the farm page
test_suite.addTest(unittest.makeSuite(CreateFarmPaddockTest))

# Edit the paddock created in the last test
test_suite.addTest(unittest.makeSuite(EditFarmPaddockTest))

# Change the herd that an animal belongs to
test_suite.addTest(unittest.makeSuite(UserEditFarmAnimalHerdTest))

#=========
# Cleanup
#=========

# Delete test manager's Test Farm management permissions with test farmer
test_suite.addTest(unittest.makeSuite(UserDeleteFarmPermissionTest))

# Delete test animal from test farm in test farm page
test_suite.addTest(unittest.makeSuite(UserDeleteFarmAnimalTest))

# Delete test herd 2 from test farm in test farm page
test_suite.addTest(unittest.makeSuite(UserDeleteFarmHerdTest))

# Delete condition scores.
test_suite.addTest(unittest.makeSuite(DeleteConditionScoresTest))

# Delete test farmer and manager
test_suite.addTest(unittest.makeSuite(DeleteTestUsersTest))

# Delete test herd
test_suite.addTest(unittest.makeSuite(DeleteHerdTest))

# Delete test paddock 
test_suite.addTest(unittest.makeSuite(DeletePaddockTest))

# Delete test farm 
test_suite.addTest(unittest.makeSuite(DeleteFarmTest))

# Delete test measurement category
test_suite.addTest(unittest.makeSuite(DeleteCategoryTest))

runner = unittest.TextTestRunner()
runner.run(test_suite)

