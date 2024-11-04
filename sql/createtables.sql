CREATE TYPE reply AS (
    body text,
    posted_at date,
    author integer,
    likes integer
);

CREATE TABLE IF NOT EXISTS apphysics1 (
    id SERIAL PRIMARY KEY,
    resolved boolean,
    title VARCHAR(50),
    body text,
    posted_at date,
    reply reply,
    author integer,
    likes integer
);

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    pass TEXT,
    email VARCHAR(100),
    creation_date DATE
);


