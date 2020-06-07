import { AsyncDataset } from "../esnext/index.js"
import { DefaultDataFactory } from "@opennetwork/rdf-data-model"

const dataset = new AsyncDataset();

(async () => {
  for await (const [writes, deletes] of dataset) {
    console.log("Changes", writes.size, deletes.size)
  }
})()
  .then(() => console.log("Completed listening"))

const aNameMatch = {
  subject: DefaultDataFactory.blankNode("a"),
  predicate: DefaultDataFactory.namedNode("http://xmlns.com/foaf/0.1/name"),
  graph: DefaultDataFactory.defaultGraph()
}

const aMatcher = dataset.match(aNameMatch)

dataset.add({
  ...aNameMatch,
  object: DefaultDataFactory.literal(`"A"@en`)
})

dataset.add({
  subject: DefaultDataFactory.blankNode("s"),
  predicate: DefaultDataFactory.namedNode("http://xmlns.com/foaf/0.1/name"),
  object: DefaultDataFactory.literal(`"s"@en`),
  graph: DefaultDataFactory.defaultGraph()
})

console.log({ a: aMatcher.size, total: dataset.size })

dataset.add({
  ...aNameMatch,
  object: DefaultDataFactory.literal(`"B"@en`)
})

console.log({ a: aMatcher.size, total: dataset.size })

dataset.add({
  ...aNameMatch,
  object: DefaultDataFactory.literal(`"C"@en`)
})

console.log({ a: aMatcher.size, total: dataset.size })
console.log({ aObjects: aMatcher.toArray().map(({ object }) => object) })

dataset.delete(aNameMatch)

console.log({ a: aMatcher.size, total: dataset.size })
console.log({ aObjects: aMatcher.toArray().map(({ object }) => object) })
