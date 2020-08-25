#!/bin/bash

CURRENTDIR=`pwd`
DIRNAME=`dirname "$0"`

ENV_String=`yarn env`
Date=`date +"%FT%T%z(%Z)"`
SOURCE="Production"

if [[ $1 == "-backup" ]]; then
	
	if echo "$ENV_String" | grep -q "$SOURCE"; then
		echo "Backup $(tput setaf 2) Production $(tput sgr0) Firestore ..."
		gcloud firestore export gs://common-daostack.appspot.com/backup/$Date
		gsutil cp -r gs://common-daostack.appspot.com/backup/* $CURRENTDIR/$DIRNAME/backup/production
	else
		echo "Backup $(tput setaf 2) Staging $(tput sgr0) Firestore ..."
		gcloud firestore export gs://common-staging-50741.appspot.com/backup/$Date
		gsutil cp -r gs://common-staging-50741.appspot.com/backup/* $CURRENTDIR/$DIRNAME/backup/staging
	fi
	
	exit
fi

if [[ $1 = "-update" ]]; then
	if echo "$ENV_String" | grep -q "$SOURCE"; then
		newestDATA=`ls $CURRENTDIR/$DIRNAME/backup/production | sort | tail -1`
		echo "Fetching $(tput setaf 2) Production $(tput sgr0) Firestore ..."
		gsutil cp -r gs://common-daostack.appspot.com/backup/* $CURRENTDIR/$DIRNAME/backup/production
		cp -r -f $CURRENTDIR/$DIRNAME/backup/production/$newestDATA/all_namespaces $CURRENTDIR/$DIRNAME/data/firestore_export
	else
		newestDATA=`ls $CURRENTDIR/$DIRNAME/backup/staging | sort | tail -1`
		echo "Fetching $(tput setaf 2) Staging $(tput sgr0) Firestore ..."	
		gsutil cp -r gs://common-staging-50741.appspot.com/backup/* $CURRENTDIR/$DIRNAME/backup/staging
		cp -r -f $CURRENTDIR/$DIRNAME/backup/staging/$newestDATA/all_namespaces $CURRENTDIR/$DIRNAME/data/firestore_export
	fi
	exit
fi