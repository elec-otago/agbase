import string
import decimal
import datetime
import json

#==============================================
# 		Paddock model
#==============================================
class Paddock:

    def __init__(self, farm_id, name, create_time, update_time, coordinates):
        self.name = name
        self.farm_id = farm_id
        self.created = create_time
        self.updated = update_time
        self.coordinates = coordinates

    # sets this model's object id (the primary key returned from the database)      
    def set_oid(self, object_id):
        self.oid = object_id

    def set_id(self, id):
        self.id = id

    # returns an instance of this model encoded as json
    def to_json(self):
      return json.dumps(self.to_dict())

    def to_dict(self):
        return {
        "name": self.name,
        "id": self.id,
        "farm_id": str(self.farm_id),
        "loc": { 
            "type": "Polygon",
            "coordinates": self.coordinates
        },
        "created": str(self.created),
        "updated": str(self.updated)
        }
  
#==============================================  
#		Reading model
#==============================================
class Reading:
  
    def __init__(self, paddock_oid, user_id, algorithm_id, length, 
                 location,altitude, create_time, update_time):       
        self.paddock_oid = paddock_oid
        self.algorithm_id = algorithm_id
        self.length = length
        self.location = location
        self.altitude = altitude
        self.created = create_time
        self.updated = update_time
        self.user_id = user_id

        
    # sets this models object
    def set_oid(self, object_id):
        self.oid = object_id
      
    # returns an instance of this model encoded as json
    def to_json(self):
        return json.dumps(self.to_dict())

    def to_dict(self):
        return  {	  
	  "paddock_oid": self.paddock_oid,
      "user_id": self.user_id,
      "algorithm_id": self.algorithm_id,
	  "length": str(self.length),
	  "location": [str(self.location[0]), str(self.location[1])],
	  "altitiude": str(self.altitude),
	  "created": str(self.created),
	  "updated": str(self.updated)
	  }
#==============================================  
#               Weather model
#==============================================
class Weather:
    
    def __init__(self, farm_id, temperature, humidity, created, location, wind_direction,
               wind_speed, rain_1_hr, rain_24_hr, rain_1_min, atmospheric_pressure, algorithm_id):
        self.farm_id = farm_id
        self.temperature = temperature
        self.humidity = humidity
        self.wind_direction = wind_direction
        self.wind_speed = wind_speed
        self.rain_1_hr = rain_1_hr
        self.rain_24_hr = rain_24_hr
        self.rain_1_min = rain_1_min
        self.atmospheric_pressure = atmospheric_pressure
        self.location = location
        self.created = created
        self.algorithm_id = algorithm_id
        
    def set_oid(self, object_id):
        self.oid = object_id
        
    def to_json(self):
        return json.dumps(self.to_dict())
    
    def to_dict(self):
        return {
            "farm_id": self.farm_id,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "wind_direction": self.wind_direction,
            "wind_speed": self.wind_speed,
            "rain_1_hr": self.rain_1_hr,
            "rain_24_hr": self.rain_24_hr,
            "rain_1_min": self.rain_1_min,
            "atmospheric_pressure": self.atmospheric_pressure,
            "location": self.location,
            "created": str(self.created),
            "algorithm_id": self.algorithm_id
            }