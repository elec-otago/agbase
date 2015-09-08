test:
	export TEST_URL=<server address> && python suite_tests.py

# create_test_data sets up all the data required to run individual tests.
create_test_data:
	export TEST_URL=<server address> && python -m unittest test_create_farm test_create_paddock test_create_herd test_create_test_users test_change_user_permission

# delete_test_data removes all the data created by create_test_data.
delete_test_data:
	export TEST_URL=<server address> && python -m unittest test_delete_test_users test_delete_herd test_delete_paddock test_delete_farm

install:
	sudo pip install -U selenium

