-- Description: Sets up subscription system with plans and user management
-- Created: [Current Date]

-- Step 1: Create plans table
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  max_generations INT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert the plan tiers
INSERT INTO plans (name, max_generations, price) VALUES
  ('Free', 50, 0),
  ('Pro', 200, 29.99),
  ('Enterprise', NULL, 99.99); -- NULL means unlimited 

-- Step 2: Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  generations_used INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for user_subscriptions
CREATE POLICY "Users can view their own subscription"
ON user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 3: Create function to handle generation counts
CREATE OR REPLACE FUNCTION increment_generation_count(user_id_input UUID)
RETURNS void AS $$
BEGIN
  -- Insert new subscription for new users
  INSERT INTO user_subscriptions (user_id, plan_id, generations_used)
  SELECT 
    user_id_input,
    (SELECT id FROM plans WHERE name = 'Free'),
    1
  WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = user_id_input
  );

  -- Update existing subscription
  UPDATE user_subscriptions
  SET 
    generations_used = generations_used + 1,
    updated_at = NOW()
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Enable RLS and create policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans table policies
CREATE POLICY "Plans are viewable by all authenticated users"
ON plans
FOR ALL
TO authenticated
USING (true);

-- User subscriptions policies
CREATE POLICY "Users can view their own subscription"
ON user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create trigger for new users
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_id, generations_used)
  VALUES (
    NEW.id,
    (SELECT id FROM plans WHERE name = 'Free'),
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription();

-- Step 6: Create function to upgrade plans
CREATE OR REPLACE FUNCTION upgrade_user_plan(user_id_input UUID, plan_name_input TEXT)
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    plan_id = (SELECT id FROM plans WHERE name = plan_name_input),
    updated_at = NOW()
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql; 