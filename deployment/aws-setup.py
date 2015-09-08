import boto.ec2
import time

conn = boto.ec2.connect_to_region("<region>",aws_access_key_id='<aws_access_key_id>',aws_secret_access_key='<aws_secret_access_key>')

#reservations = conn.get_all_reservations()

#print reservations

#instances = []

#for r in reservations:
  #instances.append(r.instances[0])
  
  
#for i in instances:
  #if(i.tags['Name']):
    #print "instance:{} ip-address:{} name: {} ".format(i, i.ip_address, i.tags['Name'])
  #else:
    #print "instance:{} ip-address:{}".format(i, i.ip_address)

res = conn.run_instances(
        '<ami_image_id>',                        
        key_name='<key_name>',
        instance_type='<image_type>',
        security_groups=['<security_group>'])

print res

inst = res.instances[0]
while inst.update() != "running":
    time.sleep(5)
    
inst.tags['Name'] = "<server_name_tag>"
print "create ip address = {} name = {}".format(inst.ip_address, inst.tags['Name'])


