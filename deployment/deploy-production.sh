#!/bin/bash

ssh pi@172.16.1.61 /bin/sh <<EOT
    cd ~/agbase/
    git pull origin master
    make deploy-production
    exit 0
EOT

echo 'Done'
exit 0
