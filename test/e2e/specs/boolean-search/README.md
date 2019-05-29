## E2E Test Guide for Deriva Webapps project.
This document explains step-by-step procedure for E2E testing of Deriva Webapps Project. E2E tests are automation tests that simulate a user interacting with the app and assert or expect the app would act correctly accordingly.

### Setup
To run tests on your machine, make sure that you've following stuff installed.

* **JDK 1.8**
* **Node.js**
* **Chrome Binary**
* **Protractor**
* **Jasmine-spec-reporter**

_**JDK, Node.js** and **Chrome binary** shall be installed manually or using commands listed below in Setup Installation section. **Protractor** and **Jasmine-spec-reporter** will be installed through Makefile script (Listed in How to Run Tests section)._
#### Setup Installation for Fedora
Login as root and run these commands.
```sh
# Install JDK
$ yum install java-1.8.0-openjdk
# Install nodejs
$ yum -y install nodejs
#Install Chrome Binary
$ echo "[google-chrome]" >> /etc/yum.repos.d/google-chrome.repo
$ echo "name=google-chrome" >> /etc/yum.repos.d/google-chrome.repo
$ echo "baseurl=http://dl.google.com/linux/chrome/rpm/stable/$basearch"  >> /etc/yum.repos.d/google-chrome.repo
$ echo "enabled=1"  >> /etc/yum.repos.d/google-chrome.repo
$ echo "gpgcheck=1"  >> /etc/yum.repos.d/google-chrome.repo
$ echo "gpgkey=https://dl-ssl.google.com/linux/linux_signing_key.pub"  >> /etc/yum.repos.d/google-chrome.repo
$ yum install google-chrome-stable
```
#### Setup Installation for Mac OS
Login as root and run these commands.
```sh
# Install brew installer if you don't have it preinstalled.
$ /usr/bin/ruby -e “$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)
$ brew update
$ brew tap caskroom/cask
# Install JDK
$ brew cask install java
# Install Node.js
$ brew install node
# Install Chrome
$ brew cask install google-chrome
```
### How To Run Tests


Test suite can be run for dev. Before running the test suite you need to fetch the latest deriva webapp repository.
```sh
$ git clone https://github.com/informatics-isi-edu/deriva-webapps.git
$ cd deriva-webapps
```
Install protractor and jasmine-spec-reporter packages by running following command
```sh
$ make install
```
Run the test cases in dev environment by running following command
```sh
# dev
$ make test env=dev   
```
