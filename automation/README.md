# Automation
## Setup

Install cron, ssmtp, mpack

* sudo aptitude install cron ssmpt mpack

Setup ssmtp following http://www.howtogeek.com/51819/how-to-setup-email-alerts-on-linux-using-gmail/
Add the cronjob using 

* sudo crontab -e

This Needs to be a sudo cron as ssmtp needs sudo to send emails.