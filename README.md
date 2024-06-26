# giveaway-cloudfunctions
Cloud functions related to giveaways

## No License

This repository and its contents, including but not limited to code, documentation, and any associated files, are the property of Upskins Ltd and are not licensed for any use, modification, distribution, or reproduction. Upskins Ltd reserves all rights to the materials contained herein.

Unauthorized use, reproduction, distribution, or modification of any part of this repository may violate the intellectual property rights of Upskins Ltd and may be subject to legal action.

## Local development

To execute locally, you will need:

* nvm
* Nodejs 18.x
* npm 9.x
* Google Cloud CLI
    * Install (https://cloud.google.com/sdk/docs/install-sdk)
    * Authorization to access the development project

### Auth
```bash
npm run auth
```

### Install Dependencies

```bash
npm ci
```

### Set env file

Create a `.env` file for dev, eg:

```bash
cat <<EOF > .env
GCLOUD_PROJECT=drm-apps-01-43b0
CF_BASE_URL=https://europe-west2-drm-apps-01-43b0.cloudfunctions.net
FLEX_URL=https://flex-dev.sknups.com
LOG_FORMAT=simple
EOF
```

### Development Server

The following command will start a local development server. The server will reload when source files are changed.

```
npm start
```

The cloud functions can now be accessed locally at `http://localhost:8080/giveaway-<function>`.

### Unit Testing

The unit tests can be run using the following command.

```bash
npm test
```

## Functions

### giveaway-get

Get by giveaway code (internal):

```bash
BASE_URL=http://localhost:8080
GIVEAWAY_CODE=cube-simple

curl $BASE_URL/giveaway-get/$GIVEAWAY_CODE
```

Get by giveaway code (retailer):

```bash
BASE_URL=http://localhost:8080
GIVEAWAY_CODE=cube-simple

curl $BASE_URL/giveaway-get/retailer/$GIVEAWAY_CODE
```

### giveaway-save

Create or update a giveaway (internal):

If creating a giveaway, the state will be active
If updating a giveaway. the state will be unchanged

```bash
BASE_URL=http://localhost:8080
GIVEAWAY_CODE=octahedron
GIVEAWAY_SKU=TEST-OCTAHEDRON-GIVEAWAY
GIVEAWAY_SECRET="00000000000000000000000000000000"

curl -X PUT -H 'Content-Type: application/json' $BASE_URL/giveaway-save/$GIVEAWAY_CODE -d '{"title":"SKNUPS Giveaway", "description": "Claim your free SKN now", "type": "SIMPLE", "config": "{\"skuEntries\":[{\"code\":\"'$GIVEAWAY_SKU'\",\"weight\":null}]}", "secret": "'$GIVEAWAY_SECRET'"}'
```

### giveaway-update-state

Update giveaway state (internal):

```bash
BASE_URL=http://localhost:8080
GIVEAWAY_CODE=cube-simple

curl -X PUT -H 'Content-Type: application/json' $BASE_URL/giveaway-update-state/$GIVEAWAY_CODE -d '{"state": "SUSPENDED"}'

curl -X PUT -H 'Content-Type: application/json' $BASE_URL/giveaway-update-state/$GIVEAWAY_CODE -d '{"state": "ACTIVE"}'
```

### giveaway-create-claim (v2)

Performs a claim on a given giveaway using a claim code (v2 droplink).

```bash
BASE_URL=http://localhost:8080
GIVEAWAY_CODE="premium-octahedron"

SECRET_KEY="00000000000000000000000000000000"
CLAIM_ID="0"
CLAIM=$(npx ts-node scripts/create-claim.ts $SECRET_KEY $GIVEAWAY_CODE $CLAIM_ID)
USER=devtesting

curl -X POST -H 'Content-Type: application/json' $BASE_URL/giveaway-create-claim -d '{"giveaway":"'$GIVEAWAY_CODE'","user":"'$USER'","claim":"'$CLAIM'"}'
```

## Test GCP Deployment

Deploy functions with `-tmp` suffix:

```bash
npm run deploy
```

Delete functions with `-tmp` suffix:

```bash
npm run delete
```
