#
# A simple AgBase session
#
import json
import requests

session = requests.Session()
response = session.get('<server address>/api/version')
print response.json()
