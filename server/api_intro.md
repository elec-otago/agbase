# The AgBase Agritech Analytics API

The AgBase API allows measurement devices and analytics services to store and retrieve agritech
data. AgBase is a cloud-based system that provides a vendor-neutral way to share, store and analyze
data.

This document is aimed at any interested party who wants to integrate their measurement or analytics
systems to AgBase (and/or each other).

## Client-Server Architecture

AgBase uses JSON to communicate between client and server. All transfers are initiated by the client, who sends
JSON-formatted messages to the server using the HTTP protocol. 

A typical session, would use the API
to authenticate a client (a weighbridge). Then it would use its authentication token to upload a list of 
animal weight measurements.

The client is typically a measurement device or some system that displays data to a user, or analyzes this data. 

The AgBase
website [http://agbase.elec.ac.nz] is an example of a client system -- it uses this API to manage data.

Other types of client might include weighbridges, smartphone apps, pasture meters and other computer systems. Example
code is available for showing how to use the API in a variety of languages.

### Simple Example

Here is a simple example in Python. The  /version API call does not require any permissions to access.

    import json
    import requests

    session = requests.Session()
    response = session.get('https://agbase.elec.ac.nz/api/version')
    print response.json()

This will print out:
    {u'version': u'0.1.0', u'server': u'AgBase'}
    
### Example: Uploading animal weights to AgBase

Uploading data requires a user with permissions that allow creation of measurements on the farm. Here is a 
code snippet that shows how to upload data

    import json
    import requests

    api = "https://agbase.elec.ac.nz/api/"

    session = requests.Session()
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
    print resp.json(

### Server

The server's job is to handle requests via HTTP to the AgBase API. A typical session, would use the API
to authenticate a user (a weighbridge). Then it would use its authentication token to upload a list of 
animal weight measurements.

A typical response to an authenticated API call (/farms) in this case would be:

    {u'apiCallCount': 14, u'farms': [{u'id': 5, u'name': u'Demo Farm'}, {u'id': 12, u'name': u'Test Farm'}, {u'id': 13, u'name': u'Liquid Calcium Ltd'}]}


## API Call Limits

Each authenticated API call increments the 'apiCallCount' value for that user. If the daily API call for a user is exceeded, 
all subsequent API calls will fail. This is to prevent excessive use of the API, particularly by incorrectly operating
measurement equipment.

## AgBase Python library

A python library is available for simplifying upload and analysis of data in AgBase. The library is available from 
[https://github.com/elec-otago/python-agbase].