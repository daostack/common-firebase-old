FROM node:10.22

COPY . .

# Install OpenJDK-8
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean;

# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

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