from mooglePy.moogle import Moogle as Moogle
from Animal import Animal

class ServerCom:
  def __init__(self):
    self.username = "<username>"
    self.password = "<password>"
    print "Connection to server"
    self.moogle = Moogle()
    self.moogle.set_logging_on(True)
    self.user = self.moogle.connect(self.username,self.password,"<server address>")
    if self.user is None:
      print "login error"
      return
    
    print('connected to mooogle with user: {} with id: {}'.format(self.user.email, self.user.id))
    
    
  def uploadData(self, animaldata):
    #animals = []
    farm = self.makeFarm()
    herd = self.makeHerd(farm)
    category = self.makeCatagory()
    algorithm = self.makeAlgorithm(category)
    print(str(farm))
    for a in animaldata:
      animal = self.moogle.create_animal(farm, a.eid)
      print(str(animal))
      #result = self.moogle.set_animal_herd(animal,herd)
      for m in a.measurements:
        measurement = self.moogle.create_measurement(animal, algorithm, self.user, m.timestamp.strftime("%c"), m.values[0], m.values[1], m.values[2])
     # animals.push(animal)
    
    
  def makeFarm(self):
    farm = self.moogle.create_farm("Demo Farm")    
    print('returnd farm: {} with id: {}'.format(farm.name, farm.id))
    return farm
  
  def makeHerd(self,farm):
    herd = self.moogle.create_herd(farm,"Demo Herd 2")
    print('returned herd: {} with id: {}'.format(herd.name, herd.id))
    #herds = self.moogle.get_herds(farm)    
    #if len(herds) <= 1:
      #herd = herds[0]
      #print('found herd: {} with id: {}'.format(herd.name, herd.id))
    #else:
      #herd = self.moogle.create_herd(farm, "Demo Herd 2")
      #print('returned herd: {} with id: {}'.format(herd.name, herd.id))
      
    return herd
  
  def makeCatagory(self):
    category = self.moogle.create_measurement_category('Demo Category')
    print('returnd measurement category: {} with id: {}'.format(category.name, category.id))
    return category
  
  def makeAlgorithm(self,category):
    algorithm = self.moogle.create_algorithm('Demo Algorithm', category)
    print('returnd algorithm: {} with id: {}'.format(algorithm.name, algorithm.id))
    return algorithm
  
  
  
  
