#
# A simple AgBase session to upload some animal weights
#
import json
import requests

api = "<server address>/api/"

session = requests.Session()
session.verify = False
session.headers.update({'content-type': 'application/json'})

def authenticate_user(sess, email, passwd):
  user_details = {"email": email, "password": passwd}

  response = sess.post(api + "auth/", data=json.dumps(user_details))
  if response.status_code != 200:
    print ("Authentication Failed!")
    exit(0)

  token = response.json()[u'token']

  sess.headers.update({'Authorization': 'Bearer ' + token})

authenticate_user(session, "guest@user.com", "user")

resp = session.get(api + "farms/").json()
print resp
farm_id = resp['farms'][0][u'id']

resp = session.get(api + "farm-permissions/").json()
print resp

resp = session.get(api + "measurements/", data=json.dumps({"farm": farm_id}))
print resp.json()

resp = session.get(api + "farm-roles/")
print json.dumps(resp.json(),sort_keys=True, indent=4, separators=(',', ': '))
