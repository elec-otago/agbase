# #!/bin/bash -ex

# declarations
moogle="/home/john/moogle"
automation="$moogle/automation"
today=$(date +"%m-%d-%y::%H:%M")
subject="Automated Server Tests $today"

# uncomment to specify email addresses that should recieve test results
#declare -a emailList=()
#emailCount=${#emailList[@]}

#git 
whoami
rm -rf $automation/git.log
cd $moogle
git pull origin master > $automation/git.log
cd $automation

#build
cd $moogle
make build

#server tests
cd $moogle/server
rm -rf $automation/automatedServerTest.log
make test-db > $automation/automatedServerTest.log
failing=$(grep 'failing' $automation/automatedServerTest.log) # these need to be here as they dont seem to work
passing=$(grep 'passing' $automation/automatedServerTest.log) # in the text body builder


#selenium test #these wont work because ccron cants run ui elements and thise need chrome to run
# cd $moogle/testing/selenium-tests/
# rm -rf $automation/seleniumTests.log


# compressing logs for email
cd $automation
rm testLogs.tar
find . -name "*.log" | tar -cvf testLogs.tar -T -

# body builder
#echo "" >> $automation/testBodyText.txt
rm $automation/testBodyText.txt

echo "Server Tests:" > $automation/testBodyText.txt
echo "  $passing" >> $automation/testBodyText.txt
echo "  $failing" >> $automation/testBodyText.txt


#send emails
for((i=0;i<$emailCount;i++)); do
    mpack -s "$subject" -d "$automation/testBodyText.txt" "$automation/testLogs.tar" ${emailList[${i}]}
    #echo ${emailList[${i}]}
done


echo 'Done'
exit 0
