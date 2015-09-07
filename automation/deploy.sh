#!/bin/bash -ex

moogle="/home/john/moogle";
cd $moogle/deployment
bash deploy-test.sh > $moogle/automation/deployment.log