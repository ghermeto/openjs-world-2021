#!/bin/sh

#cleanup stuff
echo "cleaning up any previous setup..."
docker stop prom || echo "prometheus container not found"
docker stop graf || echo "grafana container not found" 
docker stop pgdb || echo "postgres container not found" 

docker rm prom || echo "prometheus container not found"
docker rm graf || echo "grafana container not found"
docker rm pgdb || echo "postgres container not found"

docker network rm openjsworld || echo "network openjsworld not found"
echo "cleaning up any previous setup... done!"

#setting up the shared bridge netwrok
echo "setting up docker bridge network..."
docker network create -d bridge openjsworld
echo "setting up docker bridge network... done!"


#setup prometheus
echo "setting up prometheus container..."
docker pull prom/prometheus
docker run -d \
	-p 9091:9090 \
	-v "${PWD}/config/prometheus.yml:/etc/prometheus/prometheus.yml" \
	--network="openjsworld" \
	--name="prom" \
	prom/prometheus
echo "setting up prometheus container... done!"

#setup grafana
echo "setting up grafana container..."
docker pull grafana/grafana
docker run -d \
	-p 3001:3000 \
	--network="openjsworld" \
	--name="graf" \
	grafana/grafana
echo "setting up grafana container... done!"

echo "waiting for grafana service..."
until curl http://localhost:3001/api/health; do
    >&2 echo "grafana is unavailable - sleeping"
    sleep 1
done
echo "waiting for grafana service... done!"

#configure grafana
echo "configuring grafana..."
curl -X POST \
    -H 'Content-Type: application/json' \
	-d '{"name": "prometheus_data", "type": "prometheus", "url": "http://prom:9090", "access": "proxy"}' \
    --user admin:admin \
	http://localhost:3001/api/datasources

curl -X POST \
    -H 'Content-Type: application/json' \
    -d @config/grafana-dashboard.json \
    --user admin:admin \
    http://localhost:3001/api/dashboards/db
echo "configuring grafana... done!"

#setup postgres db
echo "setting up postgres container..."
docker pull postgres
docker run -d \
    -p 5433:5432 \
    --network="openjsworld" \
    --name="pgdb" \
    -v "${PWD}/config/db.sql:/usr/local/etc/db.sql" \
    -e POSTGRES_PASSWORD=supersecret \
    -e POSTGRES_DB=openjs \
    postgres
echo "setting up postgres container... done!"

echo "waiting for postgres service..."
until docker run \
    --network="openjsworld" \
    -e PGPASSWORD=supersecret \
    -v "${PWD}/config/db.sql:/usr/local/etc/db.sql" \
    postgres psql -h pgdb -U postgres -d openjs -c '\q'; do
        >&2 echo "postgres is unavailable - sleeping"
        sleep 1
done
echo "waiting for postgres service... done!"

echo "creating postgres database..."
#configure postgres  
docker run --rm \
    --network="openjsworld" \
    -e PGPASSWORD=supersecret \
    -v "${PWD}/config/db.sql:/usr/local/etc/db.sql" \
    postgres psql -h pgdb -U postgres -d openjs -f /usr/local/etc/db.sql
echo "creating postgres database... done!"
