function calcVectorSize(vec: number[]) {
  return Math.sqrt(vec.reduce((accum, curr) => accum + Math.pow(curr, 2), 0))
}

export function cosineSimilarity(vec1: number[], vec2: number[]) {
  const dotProduct = vec1
    .map((val, i) => val * vec2[i])
    .reduce((accum, curr) => accum + curr, 0)
  const vec1Size = calcVectorSize(vec1)
  const vec2Size = calcVectorSize(vec2)

  return dotProduct / (vec1Size * vec2Size)
}

export function normalize(embedding: Array<number>) {
  return embedding.map((x) =>  (1 / Math.hypot(...embedding)) * x)
}

export function normalizeMinMax(val: number, min: number, max: number) {
  return (val - min) / (max - min)
}
