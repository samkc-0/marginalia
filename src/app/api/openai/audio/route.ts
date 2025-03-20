import OpenAI from 'openai'
import { playAudio } from 'openai/helpers/audio'

const openai = new OpenAI()

const instructions =
  'Voice Affect: Calm, composed, and reassuring. Competent and in control, instilling trust.\n\nTone: Sincere, empathetic, with genuine concern for the customer and understanding of the situation.\n\nPacing: Slower during the apology to allow for clarity and processing. Faster when offering solutions to signal action and resolution.\n\nEmotions: Calm reassurance, empathy, and gratitude.\n\nPronunciation: Clear, precise: Ensures clarity, especially with key details. Focus on key words like "refund" and "patience." \n\nPauses: Before and after the apology to give space for processing the apology.'

export async function readTextAloud(text: string) {
  const response = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'nova',
    input: text,
    instructions,
  })

  await playAudio(response)
}
