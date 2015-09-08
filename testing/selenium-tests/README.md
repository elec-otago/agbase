#Selenium Tests

## Installation

**Install selenium 2.45.0 for python**

    sudo pip install -U selenium

**Get chromedriver**

    download chromedriver zip file $ wget http://chromedriver.storage.googleapis.com/2.15/chromedriver_linux64.zip
    and extract to moogle/testing/selenium-tests $ unzip chromedriver_linux64.zip 
    $ rm chromedriver_linux64.zip
## Running Selenium Tests

**Testing on localhost**

    make test

**Testing on Production server**

    make test_production

**Testing On Test server**

    make test_remote

## Tests

**test_create_farm**
Tests that an administrator can create a farm.

**test_delete_farm**
Tests that an administrator can delete a farm.  Deletes the farm created by test_create_farm.

**test_create_paddock**
Tests that an administrator can create a paddock.  Creates paddock in the farm created by test_create_farm.

**test_delete_paddock**
Tests that an administrator can delete a paddock.  Deletes the paddock created by test_create_paddock.

**test_create_herd**
Tests that an administrator can create a herd.  Creates herd in the farm created by test_create_farm.

**test_delete_herd**
Tests that an administrator can delete a herd.  Deletes the herd created by test_create_herd.

**test_create_test_users**
Tests that an administrator can create a user account.  Creates a farmer and farm manager account.

**test_delete_test_users**
Tests that an administrator can delete a user account.  Deletes the accounts created with test_create_test_users.

**test_change_user_permission**
Tests that an administrator can give a user management permissions.

**test_user_change_farm_permission**
Tests that an account with permission to manage a farm can give another account management permissions.

**test_condition_scorer_app**
Tests that an account with farm manager permissions can use the condition scorer app.

**test_condition_score_importer**
Tests that an account with farm manager permissions can use the condition score importer.

**test_view_condition_scores**
Tests that an account can view the condition scores created with condition_score importer and app.

**test_delete_condition_scores**
Tests that condition scores can be deleted.

**test_guest_login_walkthrough**
Tests that the guest login can access the areas of the website that it needs to.
