export function choose<T>(arr: T[]): T {
  const i = Math.floor(Math.random() * arr.length)
  return arr[i]
}

export function chooseBackground(): string {
  const backgrounds = [
    'bocaccio', // Sunday
    'duel', // Monday
    'fish', // Tuesday
    'flowers', // Wednesday
    'foxes', // Thursday
    'hegoats', // Friday
    'siege', // Saturday
  ]
  const dayOfWeek = new Date().getDay() % backgrounds.length
  const daily = backgrounds[dayOfWeek]
  return `./backgrounds/${daily}.jpg`
}
