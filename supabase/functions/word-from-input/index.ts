// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { corsHeaders } from '../_shared/cors.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'


type Config = {
  onlyRealWords: boolean
  supabaseClient: SupabaseClient
}
console.log("word-from-input init!")

// Only for test case
// const realWordList = [
//   'a',
//   'abilities',
//   'ability',
//   'ability',
//   'able',
//   'about',
//   'hello',
//   'car',
// ];

const keyToLetter: Record<string, string[]> = {
  '1': [],
  '2': ['a', 'b', 'c'],
  '3': ['d', 'e', 'f'],
  '4': ['g', 'h', 'i'],
  '5': ['j', 'k', 'l'],
  '6': ['m', 'n', 'o'],
  '7': ['p', 'q', 'r', 's'],
  '8': ['t', 'u', 'v'],
  '9': ['w', 'x', 'y', 'z'],
  '0': [' ']
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )

  const { input, inputConfig } = await req.json()

  const defaultConfig: Partial<Config> = {
    onlyRealWords: true,
    supabaseClient
  }

  const config: Config = { ...inputConfig, ...defaultConfig }
  const data = await getWordFromInput(input, config)

  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
})

async function getWordFromInput(input: string, config: Config) {
  const combinations: string[] = [];
  const words: string[] = [];

  if (input.length > 0) {
    backtrack(input, 0, [], combinations);
  }

  if (config.onlyRealWords) {
    const realWordList = await getWordList(config.supabaseClient, combinations)
    words.push(...realWordList)

    // local find match with combinations <-> real words
    // combinations.map((word, index) => {
    //   if (realWordList.indexOf(word) > -1) {
    //     words.push(word);
    //   }
    // });
  }

  return { combinations, words }
}

const backtrack = (input: string, index: number, currentCombination: string[], combinations: string[]) => {
  if (index === input.length) {
    combinations.push(currentCombination.join(''));
    return;
  }

  const digit = input[index];
  const letters = keyToLetter[digit] || [];

  for (const letter of letters) {
    currentCombination.push(letter);
    backtrack(input, index + 1, currentCombination, combinations);
    currentCombination.pop();
  }
}

async function getWordList(supabaseClient: SupabaseClient, combinations: string[] = []) {
  const {
    data: wordsCollection,
    error
  } = await supabaseClient.from('wordlist').select('word').textSearch('word', `${combinations.join('|')}`)
  if (error) {
    throw error
  }

  return wordsCollection.map(i => i.word)
}
