# starting number, max step size. ?max/min?
import random as r

class Walker:
  def __init__(self,start,step):
    self.walk = start
    self.stepsize = step
    
  def takeStep(self):
    if(r.random() < 0.5):
      self.walk += (self.stepsize * r.random())
    else:
      self.walk -= (self.stepsize * r.random())
    return self.walk
  
  def startWalking(self):
    self.path = []
    for x in range(0, 500):
      self.path.append(self.takeStep())
      
    return self.path