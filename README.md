# giveaway-cloudfunctions
Cloud functions related to giveaways

## Local development

To execute locally, you will need:

* nvm
* Nodejs 16.x
* npm 8.x
* Google Cloud CLI
    * Install (https://cloud.google.com/sdk/docs/install-sdk)
    * Authorization to access the development project

### Install Dependencies

```bash
npm ci
```

### Set env file

Create a `.env` file for dev, eg:

```bash
cat <<EOF > .env
GCLOUD_PROJECT=drm-apps-01-43b0
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
GIVEAWAY_CODE=octahedron

curl $BASE_URL/giveaway-get/GIVEAWAY_CODE
```

Get by giveaway code (retailer):

```bash
BASE_URL=http://localhost:8080
GIVEAWAY_CODE=octahedron

curl $BASE_URL/giveaway-get/retailer/GIVEAWAY_CODE
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
