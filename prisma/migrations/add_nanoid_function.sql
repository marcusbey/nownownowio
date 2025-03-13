-- Create the nanoid function in PostgreSQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION nanoid(size integer DEFAULT 21)
RETURNS text AS $$
DECLARE
  id text := '';
  i integer := 0;
  alphabet text := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  bytes bytea := gen_random_bytes(size);
  byte integer;
  pos integer;
BEGIN
  WHILE i < size LOOP
    byte := get_byte(bytes, i);
    pos := (byte & 63) + 1; -- Limit to 0-63 (alphabet length)
    id := id || substr(alphabet, pos, 1);
    i := i + 1;
  END LOOP;
  RETURN id;
END
$$ LANGUAGE plpgsql VOLATILE;
