const generateRandomString = (length = 16) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let result = ''

  // Use Array.from for cleaner looping
  result = Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * charactersLength)),
  ).join('')

  return result
}

export { generateRandomString }
