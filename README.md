# AgBase: Open-source Database for Agritech Analytics.

AgBase is an online database for agritech measurements. It provides an API for 
retrieving and uploading data, as well as a web interface for managing that data,
allowing users to share data, as well as controlling on-farm decisions such as drafting
animals.

The source-code for AgBase is licensed under the Mozilla Public License 2.0. The primary AgBase
server can be reached at http://agbase.elec.ac.nz or http://agbase.nz.

## Developing for AgBase

AgBase is currently deployed an an AWS elastic compute cloud. However you could choose to install
an AgBase instance on your own machine. Indeed, if you type 
    make run
from the top-level directory, AgBase will execute on your local system, and runs the node 
server at https://localhost:8443/

As AgBase is open-souce, you are free to modify and use this code, provided your modifications
are also made available under the same license.

### Unit Testing

AgBase has plenty of unit tests that you can run using 

    make test 
    
## Uploading Data to AgBase

There are several example of how to do this. A python library is available from a separate
repository. This library makes the job of uploading measurements using the restful API and
also mining the data within the AgBase server relatively easy.

