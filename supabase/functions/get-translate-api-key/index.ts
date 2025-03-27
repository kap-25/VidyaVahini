
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // Securely retrieve the API key from Supabase secrets
    const apiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY')

    if (!apiKey) {
      console.error('API key not found in environment variables')
      return new Response(JSON.stringify({ 
        error: 'API key not found',
        message: 'Please set the GOOGLE_TRANSLATE_API_KEY in your Supabase project secrets'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    return new Response(JSON.stringify({ 
      apiKey,
      status: 'success' 
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error retrieving API key:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve API key',
      message: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})
