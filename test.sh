docker compose down --remove-orphans
docker compose -f docker-compose.test.yml up -d pma_test
sleep 5
docker compose -f docker-compose.test.yml run test
docker compose down --remove-orphans
