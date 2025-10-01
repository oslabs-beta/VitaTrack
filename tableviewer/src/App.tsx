// src/App.tsx

import { Admin, Resource, ListGuesser } from "react-admin";
import { supabaseDataProvider } from "ra-supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const dataProvider = supabaseDataProvider({
  instanceUrl: import.meta.env.VITE_SUPABASE_URL,
  apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  supabaseClient,
});

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="food_logs" list={ListGuesser} />
    <Resource name="goals" list={ListGuesser} />
    <Resource name="users" list={ListGuesser} />
    <Resource name="workouts" list={ListGuesser} />
  </Admin>
);

export default App;
