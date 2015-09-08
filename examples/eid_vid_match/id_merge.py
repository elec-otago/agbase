#
# Merge animal records when
# data has been added by both EID and VID (visual ID)
#
# Author: Tim Molteno. tim@elec.ac.nz
# License: MPL2
#
# sudo pip install xlrd
#
import xlrd
from xlrd.sheet import ctype_text

from agbase.farm import FarmAPI
from agbase.animal import AnimalAPI
from agbase.measurement import MeasurementAPI
from agbase.agbase import AgBase

def find_or_create_animal(a_eid):
  global agAnimal
  global farm
  print "agAnimal.get_animal_by_eid(%s, %s)" % (farm, a_eid)
  animal = agAnimal.get_animal_by_eid(farm, a_eid)
  if (animal == None):
    print "agAnimal.create_animal(%s, %s)" % (farm, a_eid)
    animal = agAnimal.create_animal(farm, a_eid)
  return animal

def delete_animal(a_id):
  global ab

'''
  Do all the logic for merging two animals here.
'''
def eid_vid_merge(vid, eid):
  global agAnimal
  global agMeasurement
  print "%i -> %s" % (vid, eid)
  # Find the animal by EID (create if it doesn't exist)
  animal = find_or_create_animal(eid)

  if (animal.vid == vid):
    print "VID is correct"
    return

  if (animal.vid != None):
    print ("Animal has existing VID (%s) that clashes" % animal.vid)
    # Could be changing tags, so update
    agAnimal.update_animal_vid(animal, vid) 

  # Find by VID/farm/herd (don't create). This must happen
  # BEFORE we update the eid_animal vid.
  vid_animal = agAnimal.get_animal_by_vid(farm, vid)
  
  if (animal.vid == None):
    # Changing the VID.
    agAnimal.update_animal_vid(animal, vid) 
  
  if (vid_animal == None):
    print "VID animal doesn't exist. No measurement merge needed"
    return
  
  print "Vid Animal %s" % vid_animal
  if (animal.id == vid_animal.id):
    print "ERROR Animals have same ID"
    return

  agAnimal.merge_animals(animal,vid_animal)
    
import argparse

if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('--user', required=True, help="AgBase Username")
  parser.add_argument('--passwd', required=True, help="AgBase Password")
  parser.add_argument('--farm', required=True, help="AgBase Farm Name")
  parser.add_argument('--server', required=True, help="AgBase Server")
  parser.add_argument('--excel-file', required=True, help="Spreadsheet exported from LIC protrack")
  args = parser.parse_args()

  workbook = xlrd.open_workbook(filename = args.excel_file)
  print workbook.sheet_names()
  worksheet = workbook.sheet_by_name(u'Sheet 1')
  num_rows = worksheet.nrows - 1
  curr_row = -1
  
  matches = []
  
  while curr_row < num_rows:
    curr_row += 1
    row = worksheet.row(curr_row)
      
    n0 = row[0]
    eid0 = row[2]
    cell_type_str = ctype_text.get(n0.ctype, 'unknown type')
    if (cell_type_str == 'number'):
      matches.append([int(n0.value), eid0.value])
      
    n0 = row[5]
    eid0 = row[7]
    cell_type_str = ctype_text.get(n0.ctype, 'unknown type')
    if (cell_type_str == 'number'):
      matches.append([int(n0.value), eid0.value])
  
  # Connect to AgBase
  ab = AgBase() 
  ab.set_logging_on(True)
  user = ab.connect(args.user, args.passwd , args.server)
  if user is None:
    print("ERROR: Login failed.")
    exit(1)
    
  agFarm = FarmAPI(ab)
  # Find farm ID
  farm = agFarm.get_farm_by_name(user, args.farm)  
  if farm is None:
    print("ERROR: No such farm: %s" % args.farm)
    exit(1)

  agAnimal = AnimalAPI(ab)
  agMeasurement = MeasurementAPI(ab)
  # Merge animals
  for m in matches:
    # Now match up the EID-VID pair
    vid, eid = m
    eid_vid_merge(vid, eid)
    
    
