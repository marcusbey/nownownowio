-- Check if Widget table exists and its structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Widget';
