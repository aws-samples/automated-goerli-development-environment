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

Using the AWS console, you will need to create an Amazon EC2 Key Pair PEM file and download the pem file. Save it to a to the ./Key directory and run:

_chmod 0400 on the key file_

## 8. Configuration

Copy the file 'configs/config.json.template' to 'configs/config.json and edit it with your favorite editor:

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

Make sure you are in automated-goerli-development-environment directory and run:

_cdk deploy_

Will take about 3 minutes, but AMB node will not be usable for 35 minutes, till the Blockchain data is copied

## 9. Connecting to the EC2 instance

Use the command below to connect to EC2 instance:

ssh -i ./Key/YOURKEYNAME.pem ec2-user@INSTANCE\_IP\_ADDRESS

INSTANCE\_IP\_ADDRESS is printed as a output to the cdk deploy command.

Once logged into the EC@ instance run the following commands to perform some sample operations on the Goerli Blockchain:

_cd NodeDAPP_

_node demo_

Code for these operations is with the .js files within the directory.

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

This command will delete the resources we just created .

_cdk destroy_

Be patient as this may take a few minutes.

##
