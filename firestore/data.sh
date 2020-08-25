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
		gsutil cp -r gs://common-daostack.appspot.com/backup $CURRENTDIR/$DIRNAME
	else
		echo "Backup $(tput setaf 2) Staging $(tput sgr0) Firestore ..."
		gcloud firestore export gs://common-staging-50741.appspot.com/backup/$Date
		gsutil cp -r gs://common-staging-50741.appspot.com/backup $CURRENTDIR/$DIRNAME
	fi
	
	exit
fi

if [[ $1 = "-update" ]]; then
	newestDATA=`ls $CURRENTDIR/$DIRNAME/backup | sort | tail -1`
	echo $newestDATA
	if echo "$ENV_String" | grep -q "$SOURCE"; then
		echo "Fetching $(tput setaf 2) Production $(tput sgr0) Firestore ..."
		gsutil cp -r gs://common-daostack.appspot.com/backup $CURRENTDIR/$DIRNAME
		cp -r -f $CURRENTDIR/$DIRNAME/backup/$newestDATA/all_namespaces $CURRENTDIR/$DIRNAME/data/firestore_export
	else
		echo "Fetching $(tput setaf 2) Staging $(tput sgr0) Firestore ..."	
		gsutil cp -r gs://common-daostack.appspot.com/backup $CURRENTDIR/$DIRNAME
		cp -r -f $CURRENTDIR/$DIRNAME/backup/$newestDATA/all_namespaces $CURRENTDIR/$DIRNAME/data/firestore_export
	fi
	exit
fi