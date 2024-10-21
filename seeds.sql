-- Create users table
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create selections table
CREATE TABLE public.selections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    selector_id UUID NOT NULL REFERENCES public.users(id),
    selected_id UUID NOT NULL REFERENCES public.users(id),
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_selections_updated_at
BEFORE UPDATE ON public.selections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selections ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Allow public read access" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert access" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for selections table
CREATE POLICY "Allow authenticated read access" ON public.selections
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access" ON public.selections
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own selections" ON public.selections
    FOR UPDATE USING (auth.uid() = selector_id);