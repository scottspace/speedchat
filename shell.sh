#!/bin/bash

kubectl run peerjs-server --image=gcr.io/octo-news/peerjs-server --port 9000 --expose -- --port 9000 --path /myapp
gcloud compute addresses create peerjs-server-ip --global
