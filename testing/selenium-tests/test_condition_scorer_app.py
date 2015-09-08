from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can add condition scores using the condition scorer app.
#
# Precondition: Requires test_create_herd to have passed
#               Requires test_create_test_users to have passed
#               Requires test_user_change_farm_permission to
#               have passed?
#=============================================================
class ConditionScorerAppTest(EndToEndTest):
           
    def test(self):
        print "\nTEST condition scorer app"

        # Login as admin
        self.login_user(config.test_manager_email, config.test_password)

        self.navigation.click_apps_dropdown()

        self.navigation.click_condition_scorer()

        added_condition_score = self.condition_scorer_page.add_condition_score(
            config.test_farm, 
            config.test_herd,
            config.importer_measurement_type,
            config.vid,
            config.score)

        # this only checks if all the steps were performed 
        # in add_condition_score since their is no other way of
        # asserting true at the time of writing this test.
        self.assertTrue(added_condition_score)