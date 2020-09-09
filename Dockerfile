FROM node:10.22

COPY . .

RUN add-apt-repository ppa:openjdk-r/ppa
RUN apt-get update
RUN apt-get -y install openjdk-11-jre-headless

RUN yarn
RUN yarn global add firebase-tools

RUN firebase use staging --token 1//03AnLmd_hpCJtCgYIARAAGAMSNwF-L9IrDLhVD3-Z_ew5ePZapEzzv48DMrXeOKk_zLaBEydJTvxE79PpNP--bVH8XCFSptVYf2s

# Firestore
EXPOSE 8080

# UI
EXPOSE 4000

# Functions
EXPOSE 5001

# Database
EXPOSE 9000

# PubSub
EXPOSE 5000


CMD ["yarn", "emulator:headless"]