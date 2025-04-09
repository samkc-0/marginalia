import { ChatGroq } from '@langchain/groq'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { AIMessageChunk } from '@langchain/core/messages'

const apiKey = process.env.GROQ_API_KEY

async function reportMissingApiKey(word: string): Promise<AIMessageChunk> {
  return {
    content: `Error looking up "${word}": GROQ_API_KEY is not configured`,
    name: 'Error',
    additional_kwargs: {},
    response_metadata: {},
    toJSON: () => ({}),
    lc_serializable: true,
    lc_kwargs: {},
    lc_namespace: ['langchain_core', 'messages'],
    _getType: () => 'ai',
  } as AIMessageChunk
}

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile',
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a language teacher.'],
  ['human', '{input}'],
])
const chain = prompt.pipe(model)

export async function fetchDefinition(word: string): Promise<AIMessageChunk> {
  const response = await chain.invoke({
    input: `What does "${word}" mean (in no more than 10 words)?`,
  })

  return response as AIMessageChunk
}

export const getDefinition = apiKey ? fetchDefinition : reportMissingApiKey
