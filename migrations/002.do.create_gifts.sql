CREATE TABLE gifts (
  id INTEGER primary key generated by default as identity,
  gift_name text NOT NULL,
  person INTEGER REFERENCES people(id) NOT NULL
);