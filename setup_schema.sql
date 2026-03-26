-- 1. Create the `routes` table
CREATE TABLE public.routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    status TEXT DEFAULT 'pending'::text NOT NULL,
    path_coordinates JSONB NOT NULL,
    submitter_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the `stops` table
CREATE TABLE public.stops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    order_index INTEGER NOT NULL,
    fare_from_previous NUMERIC DEFAULT 0
);

-- 3. Set up Row Level Security (RLS)
-- Enable RLS on both tables
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for `routes`
-- Policy 1: Anyone can read approved routes (Commuter App)
CREATE POLICY "Admin Delete Approved Routes" 
  ON public.routes FOR DELETE 
  USING (status = 'approved');

-- Enable realtime functionality for the routes table so CommuterApp instantly removes deleted routes
alter publication supabase_realtime add table routes;


-- Policy 2: Anyone can insert a new pending route (Contributor App)
CREATE POLICY "Anyone can insert pending routes" ON public.routes
    FOR INSERT WITH CHECK (status = 'pending');

-- Policy 3: Admins can do everything (Admin Dashboard)
-- (For this hackathon, we allow all selects/updates so our Admin UI works easily without setting up full Auth)
CREATE POLICY "Admins can update routes" ON public.routes
    FOR UPDATE USING (true);
CREATE POLICY "Admins can read all pending routes" ON public.routes
    FOR SELECT USING (true);

-- 5. Create Policies for `stops`
-- Policy 1: Anyone can read stops
CREATE POLICY "Anyone can read stops" ON public.stops FOR SELECT USING (true);

-- Policy 2: Anyone can insert stops
CREATE POLICY "Anyone can insert stops" ON public.stops FOR INSERT WITH CHECK (true);

-- Policy 3: Allow updates/deletes for admin edits
CREATE POLICY "Anyone can update stops" ON public.stops FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete stops" ON public.stops FOR DELETE USING (true);
