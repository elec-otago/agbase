#made by John Harborne 12/02/15
from Animal import Animal
from ServerCom import ServerCom


class Main:
  def __init__(self):
    self.animals = []
    for x in range(0, 10):
      a = Animal(str(123456789-x),"{}".format(x),1,1)
      self.animals.append(a)
      #a.toString()
      #print "{}/10".format(x)
      
    sc = ServerCom()
    sc.uploadData(self.animals)  
  
m = Main()