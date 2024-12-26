-- Test queries
-- Check if plans were created
SELECT * FROM plans;

-- Check if policies are in place
SELECT * FROM pg_policies WHERE tablename IN ('plans', 'user_subscriptions');

-- Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_schema = 'public'; 