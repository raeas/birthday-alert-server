CREATE TABLE gifts (
  id INTEGER primary key generated by default as identity,
  gift_name text NOT NULL,
  checked BOOLEAN DEFAULT false,
  person INTEGER REFERENCES people(id) ON DELETE CASCADE NOT NULL
);