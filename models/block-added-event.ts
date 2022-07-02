import { JSONEventType } from "@eventstore/db-client";

export type BlockAddedEvent = JSONEventType<
  "block-added",
  {
    block: string;
  }
>;