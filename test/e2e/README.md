## E2E Test Guide for Deriva-webapps.
This document explains step-by-step procedure for E2E testing of heatmaps and boolean-search. This E2E tests will simulate a user interacting with the app and check if the app render correctly.

### Setup
To run tests on your machine, make sure that you have the following packages installed.

* **JDK 1.8**
* **Node.js**
* **Chrome Binary**
* **Protractor**
* **Jasmine-spec-reporter**


### How to Run Tests

Test suite can be run for dev, staging and production environments separately. Before running the test suite, you need to fetch the latest deriva-webapps repository.
```
$ git clone https://github.com/informatics-isi-edu/deriva-webapps.git
$ cd deriva-webapps
```
Install protractor and jasmine-spec-reporter packages by running following command
```
$ make install
```

To execute all test cases in non-production environments run the following command
```sh
# dev
$ make test env=dev

# staging
$ make test env=staging
```

To execute all test cases in production environment run **one** of the following command
```sh
$ make test
```

