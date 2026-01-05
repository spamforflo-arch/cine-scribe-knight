import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tmdbId, mediaType } = await req.json();
    const apiKey = Deno.env.get('WATCHMODE_API_KEY');

    if (!apiKey) {
      console.error('WATCHMODE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured', sources: [] }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching streaming sources for ${mediaType} with TMDB ID: ${tmdbId}`);

    // First, get the Watchmode title ID from TMDB ID
    const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${apiKey}&search_field=tmdb_${mediaType === 'movie' ? 'movie' : 'tv'}_id&search_value=${tmdbId}`;
    
    console.log('Searching Watchmode for title...');
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.error('Watchmode search failed:', searchResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to search Watchmode', sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    console.log('Watchmode search result:', JSON.stringify(searchData));

    if (!searchData.title_results || searchData.title_results.length === 0) {
      console.log('No title found in Watchmode');
      return new Response(
        JSON.stringify({ error: 'Title not found', sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const titleId = searchData.title_results[0].id;
    console.log('Found Watchmode title ID:', titleId);

    // Get streaming sources for this title
    const sourcesUrl = `https://api.watchmode.com/v1/title/${titleId}/sources/?apiKey=${apiKey}`;
    const sourcesResponse = await fetch(sourcesUrl);

    if (!sourcesResponse.ok) {
      console.error('Watchmode sources fetch failed:', sourcesResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sources', sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sourcesData = await sourcesResponse.json();
    console.log('Streaming sources found:', sourcesData.length);

    // Filter to get free/subscription streaming sources
    const streamingSources = sourcesData
      .filter((source: any) => source.type === 'sub' || source.type === 'free')
      .map((source: any) => ({
        name: source.name,
        url: source.web_url,
        type: source.type,
        format: source.format,
        price: source.price,
        quality: source.format || 'HD',
      }));

    return new Response(
      JSON.stringify({ sources: streamingSources, titleId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in streaming-sources function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, sources: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
