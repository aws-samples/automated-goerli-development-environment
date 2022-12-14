#! /bin/bash -x
# install critial tools
sudo yum -y update
sudo yum remove -y awscli # remove v1 to make way to install v2
sudo yum -y install expect jq curl git
# install AWS CLI
wget "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -O "awscliv2.zip"
unzip -o awscliv2.zip
sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update
rm -Rf aws awscliv2.zip
# install NVM
export HOME=/usr/local/bin
cd /usr/local/bin
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
cat << "EOF" >> /etc/profile
NVM_DIR=/usr/local/bin/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
eval `ssh-agent -s`
for i in $HOME/.ssh/*.pem;
do
    [ -f "$i" ] || break
    ssh-add $i
done
INSTANCE_ID=$(wget -qO- http://instance-data/latest/meta-data/instance-id)
MY_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4/)
export AMB_TOKENACCESS_URL=`aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=AMB_TokenAccess_URL" | jq -r .Tags[].Value`
export MNEMONIC=`aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=Mnemonic" | jq -r .Tags[].Value`
EOF

export HOME=/root
cat << "EOF" >> $HOME/.bashrc
source /etc/profile
source $NVM_DIR/nvm.sh
EOF
source $HOME/.bashrc

nvm install 16
nvm use 16
npm install -g npm nodejs typescript aws-sdk aws-cdk yarn


#!/bin/bash
