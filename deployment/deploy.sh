#!/bin/bash

echo "Type the deployment target (test/production), followed by [ENTER]:"

read target

echo "Deploying to $target.."

if [ "$target" == "test" ]; then
    ./deploy-test.sh
elif [ "$target" == "production" ]
then
    ./deploy-production.sh
else
	echo "Unknown target"
fi

echo 'Done'
exit 0
