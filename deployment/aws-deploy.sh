#!/bin/bash

AWS_SERVER="<server_ip_address>"
AWS_USER="<server_admin>"
AWS_KEY="<path_to_key>"

ssh -i $AWS_KEY $AWS_USER@$AWS_SERVER /bin/sh <<EOT
    echo "Killing current server..."
    sudo killall -9 node
    echo "Updating Server from Moogle Repository..."
    cd ~/WoW/backend/node/wow/
    git pull
    echo "Installing dependencies..."
    cd ng/
    npm install
    bower install
    echo "Compiling Web App..."
    grunt build-no-test
    cd ..
    echo "Starting Server..."
    nohup npm start >/dev/null 2>&1 &
    cat nohup.out
    exit 0
EOT

echo 'Done'
exit 0
