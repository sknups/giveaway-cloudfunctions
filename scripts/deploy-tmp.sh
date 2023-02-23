#!/usr/bin/env bash

common_args="--project drm-apps-01-43b0"
common_args="${common_args} --trigger-http"
common_args="${common_args} --region=europe-west2"
common_args="${common_args} --security-level=secure-always"
common_args="${common_args} --runtime=nodejs16"
common_args="${common_args} --set-env-vars FLEX_URL=https://flex-dev.sknups.com"

npm run build

name=giveaway-get-tmp
if [[ -z "$1" || "$1" == "$name" ]]; then
  gcloud functions deploy $name \
    $common_args \
    --entry-point=getGiveaway \
    --memory=128MB \
    --service-account=giveaway-cf-read@drm-apps-01-43b0.iam.gserviceaccount.com
fi

name=giveaway-save-tmp
if [[ -z "$1" || "$1" == "$name" ]]; then
  gcloud functions deploy $name \
    $common_args \
    --entry-point=saveGiveaway \
    --memory=128MB \
    --service-account=giveaway-cf-write@drm-apps-01-43b0.iam.gserviceaccount.com
fi

name=giveaway-update-state-tmp
if [[ -z "$1" || "$1" == "$name" ]]; then
  gcloud functions deploy $name \
    $common_args \
    --entry-point=updateStateGiveaway \
    --memory=128MB \
    --service-account=giveaway-cf-write@drm-apps-01-43b0.iam.gserviceaccount.com
fi
