/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenSearchService } from '../services';

export class DocumentStore {
  private documentsByIndex: { [index: string]: { [id: string]: string } } = {};

  constructor(private opensearchService: OpenSearchService) {}

  public async getDocuments(index: string, ids: string[]): Promise<{ [id: string]: string }[]> {
    if (!this.documentsByIndex[index]) {
      this.documentsByIndex[index] = {};
    }

    const documentById: any = {};
    const docIdsToFetch: string[] = [];

    ids.forEach(async (id) => {
      if (!this.documentsByIndex[index][id]) {
        docIdsToFetch.push(id);
      } else {
        documentById.push({
          [id]: this.documentsByIndex[index][id],
        });
      }
    });

    const fetchedDocuments = await this.fetchDocuments(index, docIdsToFetch);
    fetchedDocuments.forEach((doc) => {
      documentById.push({ [doc.id]: doc });
      this.documentsByIndex[index][doc.id] = JSON.stringify(doc);
    });

    return documentById;
  }

  public async getDocument(index: string, id: string): Promise<string> {
    if (!this.documentsByIndex[index]) {
      this.documentsByIndex[index] = {};
    }

    if (!this.documentsByIndex[index][id]) {
      const documents = await this.fetchDocuments(index, [id]);
      this.documentsByIndex[index][id] = JSON.stringify(documents[0] || '');
    }

    return this.documentsByIndex[index][id];
  }

  private async fetchDocuments(index: string, ids: string[]) {
    return this.opensearchService.getDocuments(index, ids);
  }
}
