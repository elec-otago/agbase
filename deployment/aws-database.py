import boto.rds
import time
import pprint

conn = boto.rds.connect_to_region("<region>",aws_access_key_id='<aws_access_key_id>',aws_secret_access_key='<aws_secret_access_key>')

print conn

instances = conn.get_all_dbinstances()
for dbi in instances:
    pprint(dbi)
