# M7011E-project

Since we are using docker, docker is pretty much the only thing needed to run the project. 
Find how you install docker on [their official website](https://docs.docker.com/engine/install/)

## Run using docker & docker compose

<s>Use `docker compose up -d` to run the docker containers in the background. 
This runs both the server and the client side.</s>

Use `docker compose up -d pma server` to run the docker containers in the background. This compared to the above does not run the client side. 

Stop containers with `docker compose down`.

Run tests by running the script called `test.sh` in the project root directory.
