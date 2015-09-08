#eid, vid, herdid, farmid,
from walker import Walker
from Measurement import Measurement
import random as r
from datetime import date, datetime, time, timedelta

class Animal:
  def __init__(self,eid,vid,herdid,farmid):
    self.eid = eid
    self.vid = vid
    self.herdid = herdid
    self.farmid = farmid
    self.measurements = []
    self.makeMeasurements()
    
  def makeMeasurements(self):
    w = Walker(r.randint(350,450),2)
    path = w.startWalking()
    ts = datetime(2015,02,13,6)
    for x in path:
      ts = ts - timedelta(days=1)
      self.measurements.append(Measurement(ts,x,r.random()*5))
      
  def toString(self):
    print "eid: {}, vid: {}, herdid: {}, farmid: {}".format(self.eid,self.vid,self.herdid,self.farmid)
    for m in self.measurements:
      m.toString()
    