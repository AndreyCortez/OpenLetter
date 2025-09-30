FROM postgres:15-alpine

ENV POSTGRES_USER=openletters_user
ENV POSTGRES_PASSWORD=sua_senha_segura
ENV POSTGRES_DB=openletters

COPY ./db/schema.sql /docker-entrypoint-initdb.d/1_schema.sql
COPY ./db/seeds.sql /docker-entrypoint-initdb.d/2_seeds.sql

EXPOSE 5432