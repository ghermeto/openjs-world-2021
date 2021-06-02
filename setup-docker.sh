#!/bin/sh

#cleanup stuff
docker stop prom || echo "prometheus container not found"
docker stop graf || echo "grafana container not found" 
docker stop pgdb || echo "postgres container not found" 

docker rm prom || echo "prometheus container not found"
docker rm graf || echo "grafana container not found"
docker rm pgdb || echo "postgres container not found"

#setting up the shared bridge netwrok
docker network rm openjsworld || echo "network openjsworld not found"
docker network create -d bridge openjsworld

#setup prometheus
docker pull prom/prometheus
docker run -d \
	-p 9091:9090 \
	-v "${PWD}/config/prometheus.yml:/etc/prometheus/prometheus.yml" \
	--network="openjsworld" \
	--name="prom" \
	prom/prometheus

#setup grafana
docker pull grafana/grafana
docker run -d \
	-p 3001:3000 \
	--network="openjsworld" \
	--name="graf" \
	grafana/grafana

#configure grafana
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

#setup postgres db
docker pull postgres
docker run -d \
    -p 5433:5432 \
    --network="openjsworld" \
    --name="pgdb" \
    -v "${PWD}/config/db.sql:/usr/local/etc/db.sql" \
    -e POSTGRES_PASSWORD=supersecret \
    -e POSTGRES_DB=openjs \
    postgres
  
#configure postgres  
docker run --rm \
    --network="openjsworld" \
    -e PGPASSWORD=supersecret \
    -v "${PWD}/config/db.sql:/usr/local/etc/db.sql" \
    postgres psql -h pgdb -U postgres -d openjs -f /usr/local/etc/db.sql
