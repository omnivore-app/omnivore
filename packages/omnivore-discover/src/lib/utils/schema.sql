CREATE TABLE article_embeddings (slug varchar, author varchar, description varchar, img varchar, publishedDate TIMESTAMP, title varchar, embedding vector(1536));
CREATE unique index slug_embed on article_embeddings (slug);

create table label_embeddings (label varchar, embedding vector(1536));
create unique index label_embed on label_embeddings(label);


export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_DB=omnivore
export PG_POOL_MAX=20