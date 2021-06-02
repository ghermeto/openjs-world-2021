# Observing Node.js: Using Metrics to Improve Your Application Performance

This is a test application used to genearte data for the talk at the OpenJS World 2021.

**Disclaimer**: It can be used as a guideline for setting up metrics and dev envirnoment with Prometheus and Grafana, but this service does not have many of the characteristics you want in a production-ready service. Please **DO NOT use it in production**.

## Usage

This setup was made to work with MacOS and only tested on MacOS Catalina.

### Setting up containers

1. make sure you have docker desktop installed and on the latest version
2. run the `./setup-docker.sh` script (**WARN** this script will remove existing containers)

### Running the server

1. `cd app`
2. `npm install`
3. `npm start`

### Server commands

Within the `app` folder, the following `npm` scripts are available:

- `npm start`: starts the server
- `npm restart`: restarts the server
- `npm stop`: stops the server
- `npm baseline-load`: uses autocannon to send a baseline load to the `/echo` endpoint
- `npm load`: short for autocannon (you should use autocannon parameters)

### Visualizing the metrics

**Please notice:** 
- The metrics might take a coupe minutes to show once the server is started.
- Some metrics will require the baseline-load to run for a couple minutes before they appear.

**Steps:** 
1. Go to Grafana (http://localhost:3001)
2. login with credentials `admin:admin`
3. select the OpenJS World Dashboard from the Dashboards panel

## Troubleshooting

1. `npm install` fails: 
    - maybe you need XCode command line tools installed?
2. `./setup-docker.sh` fails:
   - open the file and try to execute each command independently on your shell.
