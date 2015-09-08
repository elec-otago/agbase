# Deployment Script

Generate a new AWS instance.

    sh aws-deploy.sh
    

to create and AWS instance with python
first read tutorial at: http://boto.readthedocs.org/en/latest/ec2_tut.html

run the following commands:

sudo pip install boto

>>> import boto.ec2
>>> conn = boto.ec2.connect_to_region("us-west-2",
...    aws_access_key_id='<aws access key>',
...    aws_secret_access_key='<aws secret key>')

"us-west-2" is the location of the server you can find a list here: 
http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html

aws access key and aws secret key are created when you create your login details for the aws console

so now you have connected to aws use the folling command to create a new aws instance

>>> conn.run_instances(
        '<ami-image-id>',
        key_name='myKey',
        instance_type='c1.xlarge',
        security_groups=['your-security-group-here'])

'<ami-image-id>' is the image amazon uses to make your instance.

you can find a list here of debian images here:
https://wiki.debian.org/Cloud/AmazonEC2Image/Jessie

instance type envolves the size of the instance being created.

you can find a list here :
http://aws.amazon.com/ec2/previous-generation/

security_groups=['your-security-group-here']) you can find these in your security groups list

#process to start new server
ssh -i ./ssl_key/myKey.pem admin@<ipaddress>
<ipaddress> will be given when you make an aws instance with the aws-deploy.py

install get with:

sudo apt-get install git

clone git repository:
git clone https://github.com/elec-otago/agbase.git
