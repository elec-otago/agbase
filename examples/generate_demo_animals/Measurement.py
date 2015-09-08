#value 1 - 5, timestamp, algid, animalid
from datetime import date, datetime, time, timedelta

class Measurement():
  def __init__(self,dt,value,offset):
    self.values = [-1,0,1,0,0]
    self.timestamp = dt
    self.setValues(value,offset)
    
  def printTime(self):
    print "{}".format(self.timestamp)
  
  def printValues(self):
    print "Values: [{},{},{},{},{}]".format(self.values[0],self.values[1],self.values[2],self.values[3],self.values[4])
  
  def toString(self):
    self.printTime()
    self.printValues()
    
    
  def setValues(self,value,offset):
    self.values[1] = value
    self.values[0] = value - offset
    self.values[2] = value + offset