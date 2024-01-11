docker compose down --remove-orphans
# docker compose -f docker-compose.test.yml up -d db_test
docker compose -f docker-compose.test.yml run test
docker compose down --remove-orphans
