-- Function to upgrade user plan
CREATE OR REPLACE FUNCTION upgrade_user_plan(user_id_input UUID, plan_name_input TEXT)
RETURNS void AS $$
BEGIN
  -- Get the plan ID for the requested plan
  WITH plan_id_query AS (
    SELECT id FROM plans WHERE name = plan_name_input
  )
  -- Update the user's subscription
  UPDATE user_subscriptions
  SET 
    plan_id = (SELECT id FROM plan_id_query),
    updated_at = NOW()
  WHERE user_id = user_id_input;

  -- If no subscription exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (user_id, plan_id, generations_used)
    VALUES (
      user_id_input,
      (SELECT id FROM plans WHERE name = plan_name_input),
      0
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upgrade_user_plan TO authenticated;

-- Create policy to allow users to execute the function
CREATE POLICY "Users can upgrade their own plan"
ON user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 