docker compose -f docker-compose.test.yml up -d pma_test
docker compose -f docker-compose.test.yml run test
docker compose down --remove-orphans