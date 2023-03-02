#!/usr/bin/env bash

common_args="--project=drm-apps-01-43b0 --region=europe-west2 --quiet"

gcloud functions delete giveaway-get-tmp $common_args
gcloud functions delete giveaway-save-tmp $common_args
gcloud functions delete giveaway-update-state-tmp $common_args
gcloud functions delete giveaway-create-claim-tmp $common_args
