CREATE TABLE people (
  id INTEGER primary key generated by default as identity,
  first_name text NOT NULL,
  last_name text,
  birthday date NOT NULL
);