-- ============================================================
-- Seed Data — 12 sample items for demo
-- Run AFTER schema.sql and AFTER creating a test user in Auth
-- Replace 'YOUR_USER_ID' with an actual UUID from auth.users
-- ============================================================

-- You can get a user ID by running: SELECT id FROM auth.users LIMIT 1;
-- Or insert a user through the Auth dashboard first

DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Get the first user in the system (or create one via dashboard first)
  SELECT id INTO demo_user_id FROM auth.users LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Please create a user in Supabase Auth first, then re-run this seed.';
    RETURN;
  END IF;

  INSERT INTO items (type, title, description, category, location, date_occurred, status, posted_by) VALUES
  ('lost', 'Black leather wallet', 'Contains student ID, debit card, and about 500 rupees. Has a small tear on the right corner.', 'wallet', 'Main Library, 2nd Floor', CURRENT_DATE - 2, 'open', demo_user_id),
  ('found', 'Blue wallet with ID card inside', 'Found a wallet near the vending machine. Has a college ID inside for Mechanical dept.', 'wallet', 'Canteen Building', CURRENT_DATE - 1, 'open', demo_user_id),
  ('lost', 'iPhone 13 Black', 'Lost my black iPhone 13 with a cracked screen protector. Has a blue case.', 'phone', 'Sports Ground', CURRENT_DATE - 3, 'open', demo_user_id),
  ('found', 'Android phone — Samsung', 'Found a Samsung phone near the basketball court. Screen is locked.', 'phone', 'Sports Ground', CURRENT_DATE - 3, 'open', demo_user_id),
  ('lost', 'College ID Card — CSE Dept', 'Lost my college ID card. Name: Rahul Kumar, Roll No: 21CSE045', 'id_card', 'Lecture Hall Block B', CURRENT_DATE - 1, 'open', demo_user_id),
  ('found', 'ID Card — found in parking lot', 'Found an ID card in the parking lot near Gate 2. Belongs to someone from ECE dept.', 'id_card', 'Parking Lot Gate 2', CURRENT_DATE, 'open', demo_user_id),
  ('lost', 'Dell laptop charger', '65W Dell charger, black, USB-C. Left it in Lab 204 yesterday.', 'laptop', 'Computer Lab 204', CURRENT_DATE - 1, 'open', demo_user_id),
  ('found', 'Laptop charger — white Apple', 'Found a MacBook charger in the library reading room. No name on it.', 'laptop', 'Main Library Reading Room', CURRENT_DATE - 2, 'open', demo_user_id),
  ('lost', 'Keys with red keychain', 'Set of 3 keys on a red Minions keychain. One of them is a bike key.', 'keys', 'Hostel Block C', CURRENT_DATE, 'open', demo_user_id),
  ('found', 'Blue backpack left behind', 'Found a blue Wildcraft backpack in the seminar hall after yesterday''s event. Has some books inside.', 'bag', 'Seminar Hall', CURRENT_DATE - 1, 'open', demo_user_id),
  ('lost', 'Spectacles — round frame', 'Black round-frame glasses. Power: -2.5 both eyes. Lost somewhere between the cafeteria and main block.', 'glasses', 'Main Block Corridor', CURRENT_DATE - 4, 'open', demo_user_id),
  ('found', 'Water bottle — blue Hydro Flask', 'Found a blue Hydro Flask near the gym entrance. Has a sticker of a mountain on it.', 'other', 'Gymnasium Entrance', CURRENT_DATE - 1, 'open', demo_user_id);

  RAISE NOTICE 'Seeded 12 items for user %', demo_user_id;
END $$;
