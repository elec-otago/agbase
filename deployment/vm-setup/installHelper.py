#!/usr/bin/python
#installHelper.py
"""Contains methods to aid in the install for the dag server. This script has only been tested on Debian Wheezy."""
__author__ = 'Jesse Teat'

import pwd
import subprocess
import logging as log
import os

failed = 1
#select the required packages
"""Set the required packages rsync is a dependency for git but lets include it anyway"""
packages = 'curl git nodejs redis-server postgresql postgresql-client postgresql-contrib rsync python-psycopg2 apache2 apache2.2-common'

#------------------------------------------------------------------------------
#get *nix user info for 'name'
#------------------------------------------------------------------------------
def get_userinfo(name):
    '''get all the required userinfo for username'''
    if is_nix_user(name):
        pw_record = pwd.getpwnam(name)
        user_name = pw_record.pw_name
        # user may not have a home dir
        # user_home_dir  = pw_record.pw_dir
        user_uid = pw_record.pw_uid
        user_gid = pw_record.pw_gid
        env = os.environ.copy()
        # env['HOME'] = user_home_dir
        env['LOGNAME'] = user_name
        # env['PWD'] = cwd
        env['USER'] = user_name
        return env, user_name, user_uid, user_gid
    else:
        # there is no nix user so send the username as failed
        return "No env", failed, 0,0


#------------------------------------------------------------------------------
#demote user to the uid and gid
#------------------------------------------------------------------------------
def demote(user_uid, user_gid):
    def result():
        report_ids('starting demotion')
        os.setgid(user_gid)
        os.setuid(user_uid)
        report_ids('finished demotion')
    return result


#------------------------------------------------------------------------------
#print msg with user id and group id
#------------------------------------------------------------------------------
def report_ids(msg):
    print 'uid, gid = %d, %d; %s' % (os.getuid(), os.getgid(), msg)


#------------------------------------------------------------------------------
#check *nix user exists
#------------------------------------------------------------------------------
def is_nix_user(nixuser):
    try:
        pwd.getpwnam(nixuser)
    except KeyError:
        print('User ', nixuser, ' does not exist')
        return False
    return True


#------------------------------------------------------------------------------
#run subprocess as user
#------------------------------------------------------------------------------
def subprocess_demote_cmd(command, user):
    (env, user_name, user_uid, user_gid) = get_userinfo(user)
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, preexec_fn=demote(user_uid, user_gid))
    (proc_stdout, proc_stderr) = process.communicate()
    process_status = process.wait()
    print 'result', process_status
    return process_status, proc_stdout, proc_stderr


#------------------------------------------------------------------------------
#run subprocess
#------------------------------------------------------------------------------
def subprocess_cmd(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True,)
    (proc_stdout, proc_stderr) = process.communicate()
    while process.poll() == None:
	line = process.stdout.readline()
	if line :
		print " {}".format(line.rstrip())

    process_status = process.wait()
    print 'result', process_status
    return process_status, proc_stdout, proc_stderr


#------------------------------------------------------------------------------
# apt_get_install(  ):
#------------------------------------------------------------------------------
def apt_get_install():
    cmd_line = 'apt-get -y install -qq ' + packages
    (install_status, install_stdout, install_stderr) = subprocess_cmd(cmd_line)
    if install_status == failed:
        print "Dependency install failed!!!"
        log.error("Dependency install failed." , install_stdout, install_stderr)
    else:
        print "Dependency install successful"
        log.info("Dependency install successful", install_stdout)
        log.info("The following dependencies were installed", packages)

    return install_status


#------------------------------------------------------------------------------
# apt_get_update():  refresh the apt-cache
#------------------------------------------------------------------------------
def apt_get_update():
    (update_status, update_stdout, update_stderr) = subprocess_cmd("apt-get update")
    if update_status == failed:
        print "Update process failed"
        print update_stderr
        log.error("Update process failed", update_stdout, update_stderr)
    else:
        print "Update process successful"
        log.info("Update successful", update_stdout)

    return update_status


#------------------------------------------------------------------------------
#check the nodejs executable exists
#------------------------------------------------------------------------------
def check_node_js():
    '''Nodejs is installed as node so we create a symlink to nodejs'''
    cmd_line = "update-alternatives --install /usr/bin/node nodejs /usr/bin/nodejs 100"
    if  os.path.exists("/usr/bin/nodejs"):
        print "Nodejs symlink created and path configured"
        log.info("Nodejs symlink created and path configured")
        return 0
    else:
        (prepare_status, prepare_stdout, prepare_stderr) = subprocess_cmd(cmd_line)
        if prepare_status == failed:
            print "Nodejs symlink creation failed"
            print prepare_stderr
            log.error("Nodejs symlink creation failed", prepare_stdout, prepare_stderr)
        else:
            print "Nodejs symlink created"
            log.info("Nodejs symlink created", prepare_stdout)

        return prepare_status


#------------------------------------------------------------------------------
#install npm for nodejs
#------------------------------------------------------------------------------
def install_npm():
    '''Npm has no installable package for Debian Wheezy so we use the script from www.npmjs.org'''
    filename = "https://www.npmjs.org/install.sh"
    if os.path.exists("/usr/bin/npm"):
        print "Npm is installed"
        log.info("Npm is installed")
        return 0
    else:
        cmd_line = "curl " + filename + " | sudo sh"
        (install_npm_status, install_npm_stdout, install_npm_stderr) = subprocess_cmd(cmd_line)
        if install_npm_status == failed:
            print "Npm install failed!!!"
            log.error("Npm install failed.", install_npm_stdout, install_npm_stderr)
            print install_npm_stderr
        else:
            print "Npm install successful"
            log.error("Npm install successful.", install_npm_stdout)

        return install_npm_status





