Steps to Install and Deploy the Automated Goerli Development Environment on AWS, using AMB with Token Based Access

**1. AWS CLI**

The AWS CLI allows you to interact with AWS services from a terminal session. Make sure you have the latest version of the AWS CLI installed on your system.

- Windows: [MSI installer (64-bit) ](https://s3.amazonaws.com/aws-cli/AWSCLI64PY3.msi)
- Linux, macOS or Unix: [Bundled installer ](https://docs.aws.amazon.com/cli/latest/userguide/awscli-install-bundle.html#install-bundle-other)

**2. AWS Account**

To complete the setup, you will need to have access to an AWS Account with a IAM User with appropriate Accessor IAM Role with an Administrator Access policy.

**Configure Your Credentials**

Open a terminal window and use aws configure to set up your environment. Type the access key ID and secret key and choose a default region (you can use us-east-1, eu-west-1, us-west-2 for example

_aws configure_

And fill in the information from the console:

_AWS Access Key ID [None]: \<type key ID here\>_

_AWS Secret Access Key [None]: \<type access key\>_

_Default region name [None]: \<choose region (e.g. "us-east-1", "eu-west-1")\>_

_Default output format [None]: \<leave blank\>_

**3. NodeJS**

To install Node.js visit the [Node.js website ](https://nodejs.org/)

. Make sure you use Node.js \>=8.12.0

_node --version_

**5. AWS CDK Toolkit**

Next, we'll install the AWS CDK Toolkit. The toolkit is a command-line utility which allows you to work with CDK apps. Open a terminal session and run the following command:

_npm install -g aws-cdk_

- Windows: you'll need to run this as an Administrator
- POSIX: on some systems you may need to run this with sudo

You can check the toolkit version with:

_cdk –version_

**6. Clone the Git Repo**

_git clone https://gitlab.aws.dev/amb-blockchain-sa/automated-goerli-development-environment.git_

Change directory to automated-goerli-development-environment

_cd_ _automated-goerli-development-environment_

**7. Create and Download an EC2 Key Pair/PEM file**

Using the AWS console, you will need to create an Amazon EC2 Key Pair PEM file and download the pem file. The key needs to be created in the region configured in step 2. Save it to the ./Key directory and run:

_chmod 0400 on the key file_


## 8. Configuration

Copy the file 'configs/config_template.json' to 'configs/config.json and edit it with your favorite editor:

_{_

_"stackName": "BlogGoerliStack",_

_"ec2Name": "AMB\_Dev",_

_"nickName": "AMB\_Dev",_

_"ec2Class": "t3",_

_"ec2Size": "xlarge",_

_"keyName": "YOUR KEY NAME HERE",_

_"keyFile": "./Key/YOURKEY.pem",_

_"userDataFile": "./Scripts/startup\_user.sh",_

_"cdkOut": "cdk-outputs.json",_

_"timeBomb": "30",_

_"awsConfig": "~/.aws",_

_"Mnemonic": "Mnemonic from a Wallet like Metamask, will need Goerli ETH_

_from a faucet"_

_}_

The cdkOut file can be named anything, but it should have a json extension since it will be a json data file. CDK writes data there that we use to automate other operations.

## 9. Deployment

Make sure you are in automated-goerli-development-environment directory

if you are setting this project up for the <u>**first time**</u> on your machine run these two commands:   
_npm install_   
_cdk bootstrap_   

Deploy the environment using this command:
_cdk deploy_

Will take about 3 minutes, but **AMB node will not be usable for 40 minutes**, till the Blockchain data is synched

Once the Deployment is completed, An EC2 instance with the tools and encvironment to develop,test,compile and deploy Smart Contract will be available. Other resources to access the Blockchain which include the VPC, Amazon Managed Blockchain(AMB) node, Accessor Token, security policies will be created.

## 9. Connecting to the EC2 instance

Use the command below to connect to EC2 instance:

ssh -i ./Key/YOURKEYNAME.pem ec2-user@INSTANCE\_IP\_ADDRESS

INSTANCE\_IP\_ADDRESS is printed as a output to the cdk deploy command.

Once logged into the EC2 instance, there is bolierplate solidity code for a simple Smart-Contract and also node.js code to access the blockchain, compile/deploy the smart-contract and access the smart-contract using the required transactions.  
 _Hardhat_ is already installed with a sample script for testing the smart-contract.

This will be the directory structure created:  
  
NodeDAPP: Parent Directory  
    artifacts: Directory used by compiler  
    cache:Directory used by compiler  
    contracts: Solidity code of Smart-Contract  
        CountPerAccount.sol  
    DemoApps: node.js code for Blockchain and Smart-Contract Access  
    test: Script to run some sample tests on Smart-Contract using Hardhat  


Run the following command to run the tests on Smart-Contract

_cd NodeDAPP_

_npx hardhat test_

Other Hardhat tools and Commands are available to use in this directory

To run node.js based applications which have pre-provided as bolierplate code you can perform the following commands.

_cd DemoApps_

_node demoBlockChainAccess_  

This is to access the blockchain, get the balances on the 10 accounts based on the Mnemonic, and also perform a transaction to transfer gEth from an account to another.

_node demoContract_  

This is to compile and deploy the smart-contract, the address of the deployed smart-contract is automatically configured to the environment for smart-contract access

_node demoContractAccess_  

This is to access the smart-contract, the transactions are signed and sent to the Blockchain and result printed

## 10. Remote Connection for VS Code

1. Go to [https://code.visualstudio.com/download ](https://code.visualstudio.com/download)site and download the Visual Studio Code for your appropriate environment. Detail instruction for the installation of Visual Studio can be found at:

- macOS [https://code.visualstudio.com/docs/setup/mac ](https://code.visualstudio.com/docs/setup/mac)

- Windows [https://code.visualstudio.com/docs/setup/windows ](https://code.visualstudio.com/docs/setup/windows)

2. Install Remote Development Extension for Visual Studio Code by going to [Remote Development Extension ](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
3.Configure ssh config file by going to VS Code Command Palette by clicking **Shift + Command + P** (macOS) and **Ctrl + Shift + P** (Windows) and start typing **remote** to see Remote-SSH: Open SSH Configuration File. Click on Remote-SSH: Open SSH Configuration File
4.VS will present few location for the configuration file, select the one in your **/Users** (macOS) **C:\Users** (windows) folder
5. Enter the following in the ssh config file

_Host AMB\_DEV\_ENV_

_HostName_ _INSTANCE\_IP\_ADDRESS

_User ec2-user_

_IdentityFile [location where the pem file you downloaded] (whole path like: "/users/…/Key/YOURKEY.pem"_

6. Once the ssh configuration is saved, connect to EC2 instance by clicking on the **Green Icon** at the bottom left hand side of the VS Code screen.
7. Select **Connect to Host** and pick **AMB\_DEV\_ENV** from the dropdown

## 11. Cleaning up

This command will delete the AWS resources we created. Please storethe code updates you may have made before running this command.

_cdk destroy_

Be patient as this may take a few minutes.

##
