import { Dataset, ReadonlyDataset } from "@opennetwork/rdf-dataset"
import {DefaultDataFactory, isQuad, Quad, QuadLike} from "@opennetwork/rdf-data-model"
import { source, TransientAsyncIteratorSource } from "iterable"
import { QuadFind } from "@opennetwork/rdf-dataset/src/match"

export type AsyncDatasetChange = [
  // Inserts
  ReadonlyDataset<Quad>,
  // Deletes
  ReadonlyDataset<Quad>
]

export interface AsyncDataset extends Dataset, AsyncIterable<AsyncDatasetChange> {

}

export class AsyncDataset extends Dataset implements AsyncDataset {

  readonly #source: TransientAsyncIteratorSource<AsyncDatasetChange> = source()

  add(value: Quad | QuadLike): Dataset {
    const quad = isQuad(value) ? value : DefaultDataFactory.fromQuad(value)
    super.add(quad)
    this.#source.push([
      new ReadonlyDataset([quad]),
      new ReadonlyDataset([])
    ])

    return this
  }

  addAll(dataset: Iterable<Quad | QuadLike>): Dataset {
    const quadDataset = quads()
    for (const value of quadDataset) {
      super.add(value)
    }
    this.#source.push([
      new ReadonlyDataset(quadDataset),
      new ReadonlyDataset([])
    ])
    return this

    function *quads() {
      for (const value of dataset) {
        yield isQuad(value) ? value : DefaultDataFactory.fromQuad(value)
      }
    }
  }

  delete(quad: Quad | QuadLike | QuadFind): Dataset {
    // Terminate the iterable because these values are going to be removed and no longer available
    const quads = this.match(quad).toArray()
    quads.forEach(quad => super.deleteSource(quad))
    this.#source.push([
      new ReadonlyDataset([]),
      new ReadonlyDataset(quads)
    ])
    return this
  }

  [Symbol.asyncIterator]() {
    return this.#source[Symbol.asyncIterator]()
  }

}
