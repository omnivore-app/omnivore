import { EmbeddedOmnivoreLabel } from './embedding'

export type PredefinedEmbeds = Partial<
  EmbeddedOmnivoreLabel & {
    children?: EmbeddedOmnivoreLabel[]
    parent?: EmbeddedOmnivoreLabel
  }
>

// const importedEmbeddedLabels = fs
//   .readFileSync(`${__dirname}/../../resources/embeddings.json`)
//   .toString("utf-8");
// const embeddedLabels: PredefinedEmbeds[] = JSON.parse(importedEmbeddedLabels);
//
// export const getRelatedConcepts = async (label: Label): Promise<Label[]> => {
//   const labelEmbedding = await client.getEmbeddings(label.name.toLowerCase());
//
//   const predefined = (it: PredefinedEmbeds) => {
//     console.log(label.name, it.label.name);
//     const cosineSim = cosineSimilarity(it.embedding, labelEmbedding);
//     console.log(cosineSim);
//     return { sim: cosineSim, ...it };
//   };
//
//   const parentComparisons = embeddedLabels.reduce((acc, prev) => {
//     return { ...acc, [prev.label.name]: predefined(prev) };
//   }, {});
//
//   const mostRelated = embeddedLabels
//     .flatMap((parent) => {
//       return parent.children.map((child) => ({
//         ...predefined(child),
//         parent: parentComparisons[parent.label.name],
//       }));
//     })
//     .sort((a, b) => b.sim - a.sim)
//     .slice(0, 2);
//
//   return mostRelated.flatMap((it) => {
//     return [
//       {
//         ...label,
//         name: `article is about ${label.name.toLowerCase()} in the category ${it.parent.label.name.toLowerCase()}`,
//       },
//       { ...label, name: `article is about ${label.name.toLowerCase()}` },
//       {
//         ...label,
//         name: `${it.parent.label.name.toLowerCase()}: ${label.name.toLowerCase()}`,
//       },
//       {
//         ...label,
//         name: `${it.parent.label.name.toLowerCase()}: ${label.name.toLowerCase()}, ${it.label.name.toLowerCase()}`,
//       },
//       {
//         ...label,
//         name: `article is about ${label.name.toLowerCase()} in the category ${it.parent.label.name.toLowerCase()} related to ${it.label.name.toLowerCase()}`,
//       },
//       {
//         ...label,
//         name: `article is about ${label.name.toLowerCase()} in the category ${it.label.name.toLowerCase()}`,
//       },
//     ];
//   });
// };
//
// export const createRelatedConceptsIfNoDescription = (
//   observable: Observable<Label>,
// ) => {
//   return observable.pipe(
//     switchMap((label: Label) => {
//       if (label.description) {
//         return observable;
//       }
//
//       return observable.pipe(
//         rateLimiting,
//         mergeMap((it: Label) => fromPromise(getRelatedConcepts(it))),
//         mergeMap((it: Label[]) => it),
//       );
//     }),
//   );
// };
