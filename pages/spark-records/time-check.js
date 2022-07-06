import { serve } from "https://deno.land/std/http/server.ts";
serve(() => new Response(Date.now()));
console.log("http://localhost:8000/");