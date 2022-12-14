
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'; // import ec2 library 
import { InstanceClass, InstanceSize } from 'aws-cdk-lib/aws-ec2';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as managedblockchain from 'aws-cdk-lib/aws-managedblockchain';
import * as iam from 'aws-cdk-lib/aws-iam'; // import iam library for permissions
import { Construct } from 'constructs';
//import * as aws from "aws-sdk";

import * as fs from 'fs'
import { Tags } from 'aws-cdk-lib';
import * as os from 'os';
//import { SelfDestruct } from 'cdk-time-bomb';


interface Config {
  stackName: string,
  ec2Name: string,
  nickName: string,
  ec2Class: string,
  ec2Size: string,
  keyName: string,
  keyFile: string,
  userDataFile: string
  cdkOut: string,
  timeBomb: string,
  awsConfig: string,
  Mnemonic: string
}

const config: Config = require('../configs/config.json');
//const defaultUserData: string = "./userdata/startup_user.sh";
config.userDataFile = config.userDataFile.replace(/^~/, os.homedir());
console.log("using configuration: ", config);

export class BlogGoerliStack extends cdk.Stack {
  public  acID: string;
  public  BillingToken: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    console.log("keyName: ", config.keyName);
    console.log("ec2Name: ", config.ec2Name);

    const role = new iam.Role(
      this,
      config.ec2Name + '-role',
      { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') }
    );

   const ssmPolicyDoc = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ssm:UpdateInstanceInformation",
            "ssmmessages:CreateControlChannel",
            "ssmmessages:CreateDataChannel",
            "ssmmessages:OpenControlChannel",
            "ssmmessages:OpenDataChannel"],
          resources: ["*"],
        }),
      ],
    });
    
    const ssmPolicy = new iam.Policy(this, 'ssmPolicy', {
      document: ssmPolicyDoc
    });

    role.attachInlinePolicy(ssmPolicy);


    const vpc = new ec2.Vpc(this, "Vpc", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });


    // OPTIONAL self destruct - disabled if config.timeBomb is 0, otherwise in minutes
    /*if (config.timeBomb != "0") {

      const selfDestruct = new SelfDestruct(this, "selfDestructor", {
          timeToLive: cdk.Duration.minutes(Number(config.timeBomb))
        });
  
        vpc.node.addDependency(selfDestruct);
      }*/
  
    const securityGroup = new ec2.SecurityGroup(this, config.ec2Name + 'sg',
      {
        vpc: vpc,
        allowAllOutbound: true, // will let your instance send outboud traffic
        securityGroupName: config.ec2Name + '-sg',
      }
    )

    // open the SSH port
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
    )


    const cfnNode = new managedblockchain.CfnNode(this, "MyBCNode" , {
      networkId: "n-ethereum-goerli",
      nodeConfiguration: {
        availabilityZone: process.env.CDK_DEFAULT_REGION + "a",
        instanceType: "bc.t3.large"
      }
    });

    const createAccessor = new cr.AwsCustomResource(this, 'createAccessor', {
      onCreate: { // will be called for a CREATE event
        service: 'ManagedBlockchain',
        action: 'createAccessor',
        parameters: {
          AccessorType: 'BILLING_TOKEN'
        },
        physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString()), // Update physical id to always fetch the latest version
      },
      installLatestAwsSdk:true,
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    this.acID = createAccessor.getResponseField('AccessorId');
    this.BillingToken= createAccessor.getResponseField('BillingToken');
    const AMB_URL: string = "https://"+ cfnNode.attrNodeId + ".t.ethereum.managedblockchain." + process.env.CDK_DEFAULT_REGION + ".amazonaws.com?billingtoken=" + this.BillingToken;
    
    const deleteAccessor = new cr.AwsCustomResource(this, 'deleteAccessor', {
      onDelete: { 
        service: 'ManagedBlockchain',
        action: 'deleteAccessor',
        parameters: {
          AccessorId: createAccessor.getResponseField('AccessorId'),
        },
      },
      installLatestAwsSdk:true,
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    const instance = new ec2.Instance(this, config.ec2Name as string, {
      vpc: vpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: config.ec2Name,
      instanceType: ec2.InstanceType.of(
        config.ec2Class as InstanceClass,
        config.ec2Size as InstanceSize,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: config.keyName,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(100),
        },
      ],
    });
    const arn: string = "arn:aws:ec2:" + process.env.CDK_DEFAULT_REGION + ":" + process.env.CDK_DEFAULT_ACCOUNT + ":instance/" + instance.instanceId;
    const tagPolicyDoc = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ec2:DescribeTags"], // needed to pass env variables to teh instance
          resources: ["*"],
          //resources: [arn],
        }),
      ],
    });
    const tagPolicy = new iam.Policy(this, 'tagPolicy', {
      document: tagPolicyDoc
    });
    role.attachInlinePolicy(tagPolicy);


    // add all our configs as tags
    Tags.of(instance).add('ec2Name', config.ec2Name);
    Tags.of(instance).add('nickName', config.nickName);
    Tags.of(instance).add('keyName', config.keyName);
    Tags.of(instance).add('keyFile', config.keyFile);
    Tags.of(instance).add('Mnemonic', config.Mnemonic);
    Tags.of(instance).add('AMB_TokenAccess_URL', AMB_URL);

    new cdk.CfnOutput(this, 'ec2-instance-ip-address', {
      value: instance.instancePublicIp
    })
    new cdk.CfnOutput(this, 'ec2-instance-id', {
      value: instance.instanceId
    })

    new cdk.CfnOutput(this, 'Accessor ID', {
      value: this.acID
    })

    new cdk.CfnOutput(this, 'Billing Token', {
      value: this.BillingToken
    })
    new cdk.CfnOutput(this, 'AMB NoDE ID', {
      value: cfnNode.attrNodeId
    })

    var userData: string = "";
    if (config.userDataFile) {
      userData = fs.readFileSync(config.userDataFile, 'utf8');
    }
    console.log("creating userdata script: ");
    console.log(userData);
    instance.addUserData(userData);
  }
};

//AMB region as per variable
