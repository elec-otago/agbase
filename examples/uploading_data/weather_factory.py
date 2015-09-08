from mongo_models import Weather

import example_config as example_config
import string
import datetime
import random

class WeatherFactory:

    def build_demo_weather(self, farm_id, created_timestamp, location, algorithm_id):
        
        #(self, farm_id, temperature, humidity, created, wind_direction,
        #wind_speed, rain_1_hr, rain_24_hr, rain_1_min, atmospheric_pressure)
        
        temperature = self.__create_temperature()
        humidity = self.__create_humidity()
        wind_direction = self.__create_wind_direction()
        wind_speed = self.__create_wind_speed()
        atmospheric_pressure = self.__create_atmospheric_pressure()
        rain_1_min = self.__create_rain_1_min()
        rain_1_hr = self.__create_rain_1_hr(rain_1_min)
        rain_24_hr = self.__create_rain_24_hr(rain_1_hr)
        
        if created_timestamp == None:
            created_timestamp = datetime.datetime.now()
        
        if location == None:
            location = self.__create_location()
        
        if algorithm_id == None:
            algorithm_id = -1
        
        weather = Weather(farm_id, temperature, humidity, created_timestamp, location, wind_direction, 
                          wind_speed, rain_1_hr, rain_24_hr, rain_1_min, atmospheric_pressure, algorithm_id)
        
        return weather
    
    def build_weather (self, farm_id, temperature, humidity, created_timestamp, location, wind_direction,
               wind_speed, rain_1_hr, rain_24_hr, rain_1_min, atmospheric_pressure, algorithm_id):
        
        weather = Weather(farm_id, temperature, humidity, created_timestamp, location, wind_direction,
               wind_speed, rain_1_hr, rain_24_hr, rain_1_min, atmospheric_pressure, algorithm_id)
        
        return weather
    
    def __create_temperature(self):
        return random.randint(-5, 30)
    
    def __create_humidity(self):
        return random.randint(10, 70)
    
    def __create_wind_direction(self):
        return random.randrange(0, 3375, 225) / 10 # returns wind direction in azimuth degrees
                                                # http://en.wikipedia.org/wiki/Azimuth#True_north-based_azimuths
    def __create_wind_speed(self):
        return random.randint(0, 100)
    
    def __create_atmospheric_pressure(self):
        return random.randint(980, 1040)
    
    def __create_rain_1_min(self):
        return random.random()
    
    def __create_rain_1_hr(self, rain_1_min):
        
        if rain_1_min == None:
            rain_1_min = 0.0
        return rain_1_min + random.random()
    
    def __create_rain_24_hr(self, rain_1_hr):
        
        if rain_1_hr == None:
            rain_1_hr = 0.0
            
        return rain_1_hr + random.random()
    
    def __create_location(self):
        
        return [
            random.uniform(-180, 180),
            ranomd.randrange(-90, 90)
            ]
