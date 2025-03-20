import { ChatGroq } from '@langchain/groq'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { AIMessageChunk } from '@langchain/core/messages'

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile',
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a language teacher.'],
  ['human', '{input}'],
])
const chain = prompt.pipe(model)

export async function getDefinition(word: string): Promise<AIMessageChunk> {
  const response = await chain.invoke({
    input: `What does "${word}" mean (in no more than 10 words)?`,
  })
  return response
}
