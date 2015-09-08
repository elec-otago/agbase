import os
import sys

url= "<server address>"

# Demo data intended for use by guest account
demo_farm = "Demo Farm"
demo_paddock = "Paddock 1"
demo_herd = "Demo Herd 1"

# Test data.  This should be created at the start 
# of the tests, and removed at the end.
test_farm = "Test Farm"
test_herd = "Test Herd"
test_paddock = "Test Paddock"
test_condition_score_csv = "test.csv"

test_farmer_first = "testFarmerFirst"
test_farmer_last = "testFarmerLast"
test_farmer_email = "testfarmer@moogle.elec.ac.nz"

test_manager_first = "testManagerFirst"
test_manager_last = "testManagerLast"
test_manager_email = "testmanager@moogle.elec.ac.nz"

test_password = "password"

test_admin_email = "<test admin email>"
test_admin_password = "<test admin password>"

manager_permission = "Manager"
viewer_permission = "Viewer"
condition_score_upload_success = "Condition Score Uploading Finished"

# Values for entering condition score
vid = '7777'
score = '73579'

importer_measurement_type = "DairyNZ BCS"

test_paddock_spreader_map = "Spreader Map Paddock"
test_paddock_spreader_map_coords = [    
    [-46.1186182514288, 168.9642333984375],
    [-46.11860895441762, 168.96482348442078],
    [-46.11891386579009, 168.96483421325684 ],
    [-46.118928739472416, 168.96435141563416 ] ]

# Values for downloading spreader map
demo_spreader_conc = "50m"
demo_spreader_csv_name = "spreader_map_testing"    
download_file_path = os.path.dirname(os.path.realpath(sys.argv[0])) + "/test_downloaded/"

# Name of test herd created through farm page
test_herd_2 = "Test Herd 2"

# Name of updated herd
test_herd_two = "Test Herd Two"

# Name of test paddock created through farm page
test_paddock_2 = "Test Paddock 2"

# Name of updated paddock created through farm page
test_paddock_two = "Test Paddock Two"

# ID of the google map in the farm page's create paddock modal dialog
farm_create_paddock_gmap_id = "createPaddockMap"

# Details of animal entered through farm page
animal_vid = '9999'
animal_eid = '735701'

# Test category
test_category = "Test Category"
test_category_is_spatial = True
